/* ==========================================================================
   THUMBNAIL VIDEO OTOMATIS — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Mengambil satu frame representatif dari berkas video memakai
   HTMLVideoElement + canvas, tanpa pustaka tambahan.

   Cara kerja:
     1. Video dimuat dari object URL berkas lokal (tidak ada permintaan
        jaringan, jadi canvas tidak pernah "tainted").
     2. Tunggu metadata selesai, lalu coba beberapa posisi waktu
        (1 detik, 2 detik, 3 detik, lalu 25% durasi).
     3. Setiap posisi di-seek dan digambar ke canvas.
     4. Frame yang seluruhnya gelap atau kosong dibuang, frame pertama yang
        berisi gambar yang dipakai.
     5. Hasil disimpan sebagai JPEG.

   Modul ini hanya dipakai di browser. Di Node tidak ada
   HTMLVideoElement, jadi pemanggilnya harus memeriksa keberadaan
   window.NIVideoThumb lebih dulu.

   Sumber data: tidak ada — modul ini berdiri sendiri.
   ========================================================================== */
(function (window, document) {
  'use strict';

  /* Lebar maksimum thumbnail. Video 4K tetap disimpan sebagai gambar kecil
     supaya tidak membebani halaman. */
  var MAX_WIDTH = 1280;

  var QUALITY = 0.82;

  /* Batas waktu untuk satu operasi (memuat + seek). */
  var TIMEOUT = 15000;

  /* Kandidat waktu (detik) yang dicoba berurutan. */
  var CANDIDATES = [1, 2, 3];

  /** Wait for event with timeout. */
  function waitFor(target, eventName, timeout) {
    return new Promise(function (resolve, reject) {
      var timer = null;

      function cleanup() {
        if (timer) clearTimeout(timer);
        target.removeEventListener(eventName, onEvent);
        target.removeEventListener('error', onError);
      }

      function onEvent() {
        cleanup();
        resolve();
      }

      function onError() {
        cleanup();
        reject(new Error('Gagal memuat media: ' + eventName));
      }

      target.addEventListener(eventName, onEvent);
      target.addEventListener('error', onError);

      timer = setTimeout(function () {
        cleanup();
        reject(new Error('Waktu tunggu habis saat memuat media.'));
      }, timeout || TIMEOUT);
    });
  }

  /** Ubah canvas menjadi Blob JPEG (dengan fallback data URL). */
  function canvasToBlob(canvas) {
    return new Promise(function (resolve) {
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob(function (blob) {
          if (blob) {
            resolve(blob);
            return;
          }

          resolve(dataUrlToBlob(canvas.toDataURL('image/jpeg', QUALITY)));
        }, 'image/jpeg', QUALITY);

        return;
      }

      resolve(dataUrlToBlob(canvas.toDataURL('image/jpeg', QUALITY)));
    });
  }

  function dataUrlToBlob(dataUrl) {
    var parts = String(dataUrl).split(',');
    var mime = (parts[0].match(/data:(.*?);/) || [])[1] || 'image/jpeg';
    var binary = atob(parts[1] || '');
    var bytes = new Uint8Array(binary.length);

    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    return new Blob([bytes], { type: mime });
  }

  /**
   * Apakah frame ini layak dipakai sebagai thumbnail?
   * Frame hitam (gelap total) dan frame kosong (warna seragam) dibuang.
   */
  function isUsableFrame(imageData) {
    var data = imageData.data;

    if (!data || !data.length) return false;

    var total = 0;
    var min = 255;
    var max = 0;
    var count = 0;

    for (var i = 0; i < data.length; i += 4) {
      var luminance = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];

      total += luminance;

      if (luminance < min) min = luminance;
      if (luminance > max) max = luminance;

      count += 1;
    }

    if (!count) return false;

    var average = total / count;

    /* Terlalu gelap = frame hitam. */
    if (average < 14) return false;

    /* Terlalu datar = frame kosong (misalnya layar polos). */
    if (max - min < 6) return false;

    return true;
  }

  /** Daftar kandidat posisi seek yang valid untuk durasi video. */
  function candidateTimes(duration) {
    var times = [];
    var limit = isFinite(duration) && duration > 0 ? duration * 0.9 : Infinity;

    CANDIDATES.forEach(function (second) {
      if (second < limit) times.push(second);
    });

    if (isFinite(duration) && duration > 0) {
      var quarter = Math.max(0.5, duration * 0.25);

      if (quarter < limit && times.indexOf(quarter) === -1) times.push(quarter);
    }

    if (!times.length) times.push(0);

    return times;
  }

  /** Gambar frame video saat ini ke canvas, lalu ukur kelayakannya. */
  function capture(video, canvas, context) {
    var width = video.videoWidth;
    var height = video.videoHeight;

    if (!width || !height) return Promise.resolve(null);

    var scale = Math.min(1, MAX_WIDTH / width);
    var targetWidth = Math.max(1, Math.round(width * scale));
    var targetHeight = Math.max(1, Math.round(height * scale));

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    try {
      context.drawImage(video, 0, 0, targetWidth, targetHeight);
    } catch (error) {
      return Promise.resolve(null);
    }

    /* Penilaianframe memakai gambar kecil supaya cepat. */
    var probe = document.createElement('canvas');
    probe.width = 32;
    probe.height = 32;

    var probeContext = probe.getContext('2d');
    probeContext.drawImage(canvas, 0, 0, 32, 32);

    var data;

    try {
      data = probeContext.getImageData(0, 0, 32, 32).data;
    } catch (error) {
      /* Canvas tercemar (tainted) — frame tidak bisa dinilai. */
      return Promise.resolve(null);
    }

    if (!isUsableFrame({ data: data })) return Promise.resolve(null);

    return canvasToBlob(canvas);
  }

  /**
   * Ambil thumbnail dari video.
   *
   * @param {Blob} blob  berkas video
   * @returns {Promise<Blob|null>}  JPEG thumbnail, atau null bila tidak ada
   *                                frame yang bisa dipakai.
   */
  function extract(blob) {
    return new Promise(function (resolve) {
      if (!blob) {
        resolve(null);
        return;
      }

      var url = URL.createObjectURL(blob);
      var video = document.createElement('video');
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');

      var settled = false;

      function finish(result) {
        if (settled) return;
        settled = true;

        URL.revokeObjectURL(url);
        video.removeAttribute('src');
        video.load();

        resolve(result);
      }

      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.crossOrigin = 'anonymous';
      video.src = url;

      waitFor(video, 'loadeddata')
        .then(function () {
          var times = candidateTimes(video.duration);

          return times.reduce(function (chain, time) {
            return chain.then(function (found) {
              if (found) return found;

              return new Promise(function (resolve) {
                var onSeeked = function () {
                  video.removeEventListener('seeked', onSeeked);
                  resolve(true);
                };

                video.addEventListener('seeked', onSeeked);

                try {
                  video.currentTime = time;
                } catch (error) {
                  video.removeEventListener('seeked', onSeeked);
                  resolve(false);
                }

                /* Kalau seek tidak selesai, jangan menggantung. */
                setTimeout(function () {
                  if (video.currentTime >= time - 0.05) {
                    video.removeEventListener('seeked', onSeeked);
                    resolve(true);
                  }
                }, 1200);
              });
            }).then(function (seeked) {
              if (!seeked) return null;

              return capture(video, canvas, context);
            });
          }, Promise.resolve(null));
        })
        .then(function (result) {
          finish(result || null);
        })
        .catch(function () {
          finish(null);
        });
    });
  }

  /** Ambil thumbnail dari berkas video yang dipilih pengguna. */
  function extractFromFile(file) {
    if (!file) return Promise.resolve(null);
    return extract(file);
  }

  /**
   * Ambil thumbnail dari video yang sudah tersimpan di Storage.
   *
   * Berkas diunduh lebih dulu supaya bisa dibaca sebagai blob lokal;
   *canvas lalu tidak tercemar dan frame bisa dianalisis.
   */
  function extractFromUrl(url) {
    if (!url) return Promise.resolve(null);

    return fetch(url, { mode: 'cors' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);

        return response.blob();
      })
      .then(function (blob) {
        return extract(blob);
      })
      .catch(function () {
        return null;
      });
  }

  window.NIVideoThumb = {
    extract: extract,
    extractFromFile: extractFromFile,
    extractFromUrl: extractFromUrl,
    isUsableFrame: isUsableFrame
  };
})(window, document);
