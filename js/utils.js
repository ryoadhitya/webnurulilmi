/* ==========================================================================
   UTILITAS BERSAMA — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Dipakai bersama oleh halaman publik dan dashboard admin.

   slugify() sengaja meniru perilaku Laravel Str::slug (spasi -> '-',
   lowercase, tanda baca dibuang) agar slug yang tersimpan di MySQL tetap
   sama saat dipindah ke Supabase.
   ========================================================================== */
(function (window, document) {
  'use strict';

  /* Transliterasi yang PERSIS sama dengan Illuminate\Support\Str::ascii()
     (voku/portable-ascii, bahasa "en"). Format ringkas: "k:v,k:v,...". */
  var ASCII_PAIRS = ' : ,¢:c,£:PS,¤:$?,¥:YEN,ª:a,«:<<,²:2,³:3,¹:1,º:o,»:>>,À:A,Á:A,Â:A,Ã:A,Ä:A,Å:A,Æ:AE,Ç:C,È:E,É:E,Ê:E,Ë:E,Ì:I,Í:I,Î:I,Ï:I,Ð:D,Ñ:N,Ò:O,Ó:O,Ô:O,Õ:O,Ö:O,Ø:O,Ù:U,Ú:U,Û:U,Ü:U,Ý:Y,Þ:TH,ß:ss,à:a,á:a,â:a,ã:a,ä:a,å:a,æ:ae,ç:c,è:e,é:e,ê:e,ë:e,ì:i,í:i,î:i,ï:i,ð:d,ñ:n,ò:o,ó:o,ô:o,õ:o,ö:o,ø:o,ù:u,ú:u,û:u,ü:u,ý:y,þ:th,ÿ:y,Ā:A,ā:a,Ă:A,ă:a,Ą:A,ą:a,Ć:C,ć:c,Ĉ:C,ĉ:c,Ċ:C,ċ:c,Č:C,č:c,Ď:D,ď:d,Đ:D,đ:d,Ē:E,ē:e,Ĕ:E,ĕ:e,Ė:E,ė:e,Ę:E,ę:e,Ě:E,ě:e,Ĝ:G,ĝ:g,Ğ:G,ğ:g,Ġ:G,ġ:g,Ģ:G,ģ:g,Ĥ:H,ĥ:h,Ħ:H,ħ:h,Ĩ:I,ĩ:i,Ī:I,ī:i,Ĭ:I,ĭ:i,Į:I,į:i,İ:I,ı:i,Ĳ:IJ,ĳ:ij,Ĵ:J,ĵ:j,Ķ:k,ķ:k,ĸ:k,Ĺ:L,ĺ:l,Ļ:L,ļ:l,Ľ:L,ľ:l,Ŀ:L,ŀ:l,Ł:L,ł:l,Ń:N,ń:n,Ņ:N,ņ:n,Ň:N,ň:n,ŉ:n,Ŋ:N,ŋ:n,Ō:O,ō:o,Ŏ:O,ŏ:o,Ő:O,ő:o,Œ:OE,œ:oe,Ŕ:R,ŕ:r,Ŗ:R,ŗ:r,Ř:R,ř:r,Ś:S,ś:s,Ŝ:S,ŝ:s,Ş:S,ş:s,Š:S,š:s,Ţ:T,ţ:t,Ť:T,ť:t,Ŧ:T,ŧ:t,Ũ:U,ũ:u,Ū:U,ū:u,Ŭ:U,ŭ:u,Ů:U,ů:u,Ű:U,ű:u,Ų:U,ų:u,Ŵ:W,ŵ:w,Ŷ:Y,ŷ:y,Ÿ:Y,Ź:Z,ź:z,Ż:Z,ż:z,Ž:Z,ž:z,ſ:s,Ɓ:B,Ə:E,ƒ:f,Ɨ:I,ƚ:l,Ɵ:O,Ơ:O,ơ:o,Ư:U,ư:u,Ʊ:U,Ƶ:Z,ƶ:z,Ǉ:LJ,ǈ:Lj,ǉ:lj,Ǌ:NJ,ǋ:Nj,ǌ:nj,Ǎ:A,ǎ:a,Ǐ:I,ǐ:i,Ǒ:O,ǒ:o,Ǔ:U,ǔ:u,Ǖ:U,ǖ:u,Ǘ:U,ǘ:u,Ǚ:U,ǚ:u,Ǜ:U,ǜ:u,Ǫ:O,ǫ:o,ǰ:j,Ǳ:DZ,ǲ:Dz,ǳ:dz,Ǹ:N,ǹ:n,Ǻ:A,ǻ:a,Ǽ:AE,ǽ:ae,Ǿ:O,ǿ:o,Ș:S,ș:s,Ț:T,ț:t,Ȧ:A,ȧ:a,Ȩ:E,ȩ:e,Ȯ:O,ȯ:o,Ȳ:Y,ȳ:y,ȸ:db,ȹ:qp,Ⱥ:A,Ȼ:C,ȼ:c,Ƚ:L,Ⱦ:T,Ʉ:U,Ɇ:E,ɇ:e,Ɉ:J,ɉ:j,Ɏ:Y,ɏ:y,ə:e,ɨ:i,ɮ:lezh,ɵ:o,ʉ:u,ʊ:u,ʣ:dz,ʤ:dezh,ʥ:dz,ʦ:ts,ʧ:tesh,ʨ:tc,ʩ:feng,ʪ:ls,ʫ:lz,˚:0,Ά:A,Έ:E,Ή:I,Ί:I,Ό:O,Ύ:Y,Ώ:W,ΐ:i,Α:A,Β:B,Γ:G,Δ:D,Ε:E,Ζ:Z,Η:H,Θ:Th,Ι:I,Κ:K,Λ:L,Μ:M,Ν:N,Ξ:Ks,Ο:O,Π:P,Ρ:R,Σ:S,Τ:T,Υ:Y,Φ:F,Χ:X,Ψ:Ps,Ω:O,Ϊ:I,Ϋ:Y,ά:a,έ:e,ή:i,ί:i,ΰ:y,α:a,β:v,γ:gh,δ:d,ε:e,ζ:z,η:i,θ:th,ι:i,κ:k,λ:l,μ:m,ν:n,ξ:ks,ο:o,π:p,ρ:r,ς:s,σ:s,τ:t,υ:i,φ:f,χ:kh,ψ:ps,ω:o,ϊ:i,ϋ:y,ό:o,ύ:y,ώ:w,ϐ:v,ϑ:th,ϒ:Y,Ё:E,Ђ:Dj,Ѓ:Gj,Є:Je,Ѕ:Dz,І:I,Ї:Yi,Ј:j,Љ:Lj,Њ:Nj,Ћ:C,Ќ:Kj,Џ:Dz,А:A,Б:B,В:V,Г:G,Д:D,Е:E,Ж:Z,З:Z,И:I,Й:i,К:K,Л:L,М:M,Н:N,О:O,П:P,Р:R,С:S,Т:T,У:U,Ф:F,Х:X,Ц:C,Ч:C,Ш:S,Щ:Shh,Ъ:Ie,Ы:Y,Э:E,Ю:Iu,Я:Ia,а:a,б:b,в:v,г:g,д:d,е:e,ж:z,з:z,и:i,й:i,к:k,л:l,м:m,н:n,о:o,п:p,р:r,с:s,т:t,у:u,ф:f,х:x,ц:c,ч:c,ш:s,щ:shh,ъ:ie,ы:y,э:e,ю:iu,я:ia,ё:e,ђ:dj,ѓ:gj,є:je,ѕ:dz,і:i,ї:yi,ј:j,љ:lj,њ:nj,ћ:c,ќ:kj,џ:dz,Ѡ:O,ѡ:o,Ѣ:E,ѣ:e,Ѥ:Je,ѥ:je,Ѧ:Ja,ѧ:ja,Ѩ:Ja,ѩ:Ja,Ѫ:U,ѫ:u,Ѭ:Ju,ѭ:ju,Ѯ:Ks,ѯ:ks,Ѱ:Ps,ѱ:ps,Ѳ:F,ѳ:f,Ѵ:I,ѵ:i,Ѿ:Ot,ѿ:ot,Ґ:G,ґ:g,Ғ:G,ғ:g,Қ:Q,қ:q,Ң:N,ң:n,Ү:U,ү:u,Ұ:U,ұ:u,Һ:H,һ:h,Ә:A,ә:a,Ө:O,ө:o,Ա:A,Բ:B,Գ:G,Դ:D,Ե:E,Զ:Z,Է:E,Ը:Y,Թ:Th,Ժ:Zh,Ի:I,Լ:L,Խ:Kh,Ծ:Ts,Կ:K,Հ:H,Ձ:Dz,Ղ:Gh,Ճ:Tch,Մ:M,Յ:Y,Ն:N,Շ:Sh,Ո:Vo,Չ:Ch,Պ:P,Ջ:J,Ռ:R,Ս:S,Վ:V,Տ:T,Ր:R,Ց:C,Ւ:u,Փ:Ph,Ք:Q,Օ:O,Ֆ:F,ա:a,բ:b,գ:g,դ:d,ե:e,զ:z,է:e,ը:y,թ:th,ժ:zh,ի:i,լ:l,խ:kh,ծ:ts,կ:k,հ:h,ձ:dz,ղ:gh,ճ:tch,մ:m,յ:y,ն:n,շ:sh,ո:vo,չ:ch,պ:p,ջ:j,ռ:r,ս:s,վ:v,տ:t,ր:r,ց:c,ւ:u,փ:ph,ք:q,օ:o,ֆ:f,և:ev,֏:AMD,؋:AFN,ء:aa,آ:a,أ:a,ؤ:o,إ:a,ئ:y,ا:a,ب:b,ت:t,ث:th,ج:g,ح:h,خ:kh,د:d,ذ:th,ر:r,ز:z,س:s,ش:sh,ص:s,ض:d,ط:t,ظ:th,ع:aa,غ:gh,ف:f,ق:k,ك:k,ل:l,م:m,ن:n,ه:h,و:o,ي:y,٠:0,١:1,٢:2,٣:3,٤:4,٥:5,٦:6,٧:7,٨:8,٩:9,پ:p,چ:ch,ژ:zh,ک:k,گ:g,ی:y,अ:a,आ:aa,इ:i,ई:ii,उ:u,ऊ:uu,ऋ:Ri,ऌ:Li,ऍ:ei,ऎ:ae,ए:e,ऐ:ai,ऑ:oi,ऒ:oii,ओ:o,औ:ou,क:Ka,ख:Kha,ग:Ga,घ:Gha,ङ:Na,च:Ca,छ:Chha,ज:Ja,झ:Jha,ञ:Nia,ट:Ta,ठ:Tha,ड:Da,ढ:Dha,ण:Nae,त:Ta,थ:Tha,द:Tha,ध:Thha,न:Na,ऩ:Ni,प:Pa,फ:Fa,ब:B,भ:Bha,म:Ma,य:Ya,र:Ra,ऱ:Ri,ल:L,ळ:Li,ऴ:Lii,व:Va,श:Sha,ष:Shha,स:Sa,ह:Ha,ॐ:oms,ॠ:Ri,ॡ:Lii,।:.,ঁ:nn,ং:ng,অ:o,আ:a,ই:i,ঈ:ee,উ:u,ঊ:uu,ঋ:rri,এ:e,ঐ:OI,ও:oo,ঔ:OU,ক:k,খ:kh,গ:g,ঘ:Gh,ঙ:Ng,চ:c,ছ:ch,জ:j,ঝ:jh,ঞ:NG,ট:T,ঠ:Th,ড:D,ঢ:Dh,ণ:N,ত:t,থ:th,দ:d,ধ:dh,ন:n,প:p,ফ:f,ব:b,ভ:v,ম:m,য:z,র:r,ল:l,শ:S,ষ:Sh,স:s,হ:h,া:a,ি:i,ী:ee,ু:u,ূ:uu,ৃ:rri,ে:e,ৈ:OI,ো:O,ৌ:OU,ৎ:tt,ড়:R,ঢ়:Rh,য়:y,০:0,১:1,২:2,৩:3,৪:4,৫:5,৬:6,৭:7,৮:8,৯:9,৳:BDT,૱:Rs,௦:0,௧:1,௨:2,௩:3,௪:4,௫:5,௬:6,௭:7,௮:8,௯:9,௰:10,௱:100,௲:1000,௹:Rs,฿:THB,က:k,ခ:kh,ဂ:g,ဃ:ga,င:ng,စ:s,ဆ:sa,ဇ:z,ဉ:u,ည:ny,ဋ:t,ဌ:ta,ဍ:d,ဎ:da,ဏ:na,တ:t,ထ:ta,ဒ:d,ဓ:da,န:n,ပ:p,ဖ:pa,ဗ:b,ဘ:ba,မ:m,ယ:y,ရ:ya,လ:l,ဝ:w,သ:th,ဟ:h,ဠ:la,အ:a,ဣ:i,ဤ:-i,ဦ:-u,ဧ:e,ဩ:aw,ဪ:aw,ါ:a,ာ:a,ိ:i,ီ:i,ု:u,ူ:u,ေ:e,ဲ:e,ံ:an,်:at,ျ:ya,ြ:y,ွ:w,ှ:h,၀:0,၁:1,၂:2,၃:3,၄:4,၅:5,၆:6,၇:7,၈:8,၉:9,၌:hnaik,၍:ywae,၏:-e,ა:a,ბ:b,გ:g,დ:d,ე:e,ვ:v,ზ:z,თ:t,ი:i,კ:k,ლ:l,მ:m,ნ:n,ო:o,პ:p,ჟ:zh,რ:r,ს:s,ტ:t,უ:u,ფ:f,ქ:q,ღ:gh,ყ:y,შ:sh,ჩ:ch,ც:ts,ძ:dz,წ:ts,ჭ:ch,ხ:kh,ჯ:j,ჰ:h, : ,៛:KR,ᵫ:ue,Ḷ:L,ḷ:l,Ṅ:N,ṅ:n,Ṇ:N,ṇ:n,Ṡ:S,ṡ:s,Ṣ:S,ṣ:s,Ṫ:T,ṫ:t,Ṭ:T,ṭ:t,Ẁ:W,ẁ:w,Ẃ:W,ẃ:w,Ẅ:W,ẅ:w,Ẏ:Y,ẏ:y,Ẑ:Z,ẑ:z,Ẓ:Z,ẓ:z,ẗ:t,ẞ:SS,Ạ:A,ạ:a,Ả:A,ả:a,Ấ:A,ấ:a,Ầ:A,ầ:a,Ẩ:A,ẩ:a,Ẫ:A,ẫ:a,Ậ:A,ậ:a,Ắ:A,ắ:a,Ằ:A,ằ:a,Ẳ:A,ẳ:a,Ẵ:A,ẵ:a,Ặ:A,ặ:a,Ẹ:E,ẹ:e,Ẻ:E,ẻ:e,Ẽ:E,ẽ:e,Ế:E,ế:e,Ề:E,ề:e,Ể:E,ể:e,Ễ:E,ễ:e,Ệ:E,ệ:e,Ỉ:I,ỉ:i,Ị:I,ị:i,Ọ:O,ọ:o,Ỏ:O,ỏ:o,Ố:O,ố:o,Ồ:O,ồ:o,Ổ:O,ổ:o,Ỗ:O,ỗ:o,Ộ:O,ộ:o,Ớ:O,ớ:o,Ờ:O,ờ:o,Ở:O,ở:o,Ỡ:O,ỡ:o,Ợ:O,ợ:o,Ụ:U,ụ:u,Ủ:U,ủ:u,Ứ:U,ứ:u,Ừ:U,ừ:u,Ử:U,ử:u,Ữ:U,ữ:u,Ự:U,ự:u,Ỳ:Y,ỳ:y,Ỵ:Y,ỵ:y,Ỷ:Y,ỷ:y,Ỹ:Y,ỹ:y,ἀ:a,ἁ:a,ἂ:a,ἃ:a,ἄ:a,ἅ:a,ἆ:a,ἇ:a,Ἀ:A,Ἁ:A,Ἂ:A,Ἃ:A,Ἄ:A,Ἅ:A,Ἆ:A,Ἇ:A,ᾰ:a,ᾱ:a,ᾲ:a,ᾳ:a,ᾴ:a,ᾶ:a,ᾷ:a,Ᾰ:A,Ᾱ:A,Ὰ:A,Ά:A,ᾼ:A, : , : , : , : , : , : , : , : , : , : , : ,​: ,–:-,—:-,‘:\',’:\',‚:\',‛:\',“:",”:",„:",‟:",…:..., : , : , : ,‹:\',›:\', : ,⁴:4,⁵:5,⁶:6,⁷:7,⁸:8,⁹:9,₀:0,₁:1,₂:2,₃:3,₄:4,₅:5,₆:6,₇:7,₈:8,₉:9,₠:ECU,₡:CL,₢:Cr,₣:Fr.,₤:L.,₥:mil,₦:N,₧:Pts,₨:Rs,₩:W,₪:NS,₫:D,€:EUR,₭:K,₮:T,₯:Dr,₲:PYG,₳:ARA,₴:UAH,₵:GHS,₸:KZT,₹:Rs,₺:TL,₼:AZN,₽:RUB,₾:GEL,ℳ:M,ⱥ:a,ⱦ:t,　: ,元:CNY,円:JPY,Ꙋ:U,ꙋ:u,Ꙗ:Ja,ꙗ:ja,Ꜩ:TZ,ꜩ:tz,Ꜳ:AA,ꜳ:aa,Ꜵ:AO,ꜵ:ao,Ꜷ:AU,ꜷ:au,Ꜹ:AV,ꜹ:av,Ꜻ:av,ꜻ:av,Ꜽ:AY,ꜽ:ay,Ꝏ:OO,ꝏ:oo,Ꞥ:N,ꞥ:n,Ꞩ:S,ꞩ:s,ﬀ:ff,ﬁ:fi,ﬂ:fl,ﬃ:ffi,ﬄ:ffl,ﬅ:st,ﬆ:st,﷼:SAR,ﾠ: ,🙰:et';

  var ASCII_MAP = null;

  /** Peta karakter -> ASCII, dibangun sekali saat pertama dipakai. */
  function asciiMap() {
    if (ASCII_MAP) return ASCII_MAP;

    ASCII_MAP = {};

    var pairs = ASCII_PAIRS.split(',');

    for (var i = 0; i < pairs.length; i++) {
      var separator = pairs[i].indexOf(':');

      if (separator === -1) continue;

      ASCII_MAP[pairs[i].slice(0, separator)] = pairs[i].slice(separator + 1);
    }

    return ASCII_MAP;
  }

  /**
   * Setara Laravel Str::slug().
   *
   * @param {string} value
   * @param {string} [separator]
   * @returns {string}
   */
  function slugify(value, separator) {
    var sep = separator === undefined ? '-' : separator;
    var text = String(value == null ? '' : value).trim();

    if (!text) return '';

    // ASCII: transliterasi persis seperti Str::ascii() Laravel.
    // Karakter yang tidak punya padanan ASCII dibuang (sama seperti Laravel).
    text = text.replace(/[^\x00-\x7F]/g, function (char) {
      var map = asciiMap();

      return Object.prototype.hasOwnProperty.call(map, char) ? map[char] : '';
    });

    // Lowercase.
    text = text.toLowerCase();

    // Separator yang berurutan diratakan.
    var flip = sep === '-' ? '_' : '-';
    text = text.split(flip).join(sep);

    // Dictionary Laravel: '@' menjadi 'at' dan dikelilingi separator.
    text = text.split('@').join(sep + 'at' + sep);

    // Buang semua karakter selain separator, huruf, angka, dan spasi.
    text = text.replace(new RegExp('[^' + escapeRegExp(sep) + 'A-Za-z0-9\\s]', 'g'), '');

    // Ganti separator + spasi berurutan dengan satu separator.
    text = text.replace(new RegExp('[' + escapeRegExp(sep) + '\\s]+', 'g'), sep);

    return text.replace(new RegExp('^' + escapeRegExp(sep) + '|' + escapeRegExp(sep) + '$', 'g'), '');
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /** Setara Laravel Str::upper(). Nama tag disimpan dalam huruf kapital. */
  function upperTag(value) {
    return String(value == null ? '' : value).trim().toUpperCase();
  }

  /** Escape HTML agar aman disisipkan ke innerHTML. */
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Buang tag HTML dari teks (dipakai untuk ringkasan artikel). */
  function stripTags(value) {
    var node = document.createElement('div');
    node.innerHTML = String(value == null ? '' : value);
    return (node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  /** Potong teks pada panjang tertentu, ditambah elipsis. */
  function limit(value, length) {
    var text = stripTags(value);
    var max = length || 130;

    if (text.length <= max) return text;

    return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  /* ------------------------------------------------------------------ */
  /*  Tanggal & waktu (zona waktu Asia/Jakarta / WIB)                   */
  /* ------------------------------------------------------------------ */

  /* Semua tanggal di website memakai zona waktu Asia/Jakarta (WIB, UTC+7)
     supaya tanggal yang dipilih admin tampil persis sama di seluruh
     halaman, tanpa bergeser satu hari karena konversi timezone. */
  var SITE_TIMEZONE = 'Asia/Jakarta';

  var dateFormatter = null;
  var dateTimeFormatter = null;

  function dateFormat() {
    if (!dateFormatter) {
      dateFormatter = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: SITE_TIMEZONE
      });
    }

    return dateFormatter;
  }

  function dateTimeFormat() {
    if (!dateTimeFormatter) {
      dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: SITE_TIMEZONE
      });
    }

    return dateTimeFormatter;
  }

  /** Format tanggal 'd M Y' (contoh: 5 Nov 2026) dalam zona WIB. */
  function formatDate(value) {
    if (!value) return '—';

    var date = new Date(value);
    if (isNaN(date.getTime())) return '—';

    return dateFormat().format(date);
  }

  /** Tanggal sebagai bagian terpisah (hari/bulan/tahun), untuk kartu artikel. */
  function formatDateParts(value) {
    if (!value) return { day: '', month: '', year: '' };

    var date = new Date(value);
    if (isNaN(date.getTime())) return { day: '', month: '', year: '' };

    var parts = dateFormat().format(date).split(' ');

    if (parts.length < 3) return { day: '', month: '', year: '' };

    return { day: parts[0], month: parts[1], year: parts[2] };
  }

  /** Format tanggal + waktu 'd M Y, H.i' dalam zona WIB. */
  function formatDateTime(value) {
    if (!value) return '—';

    var date = new Date(value);
    if (isNaN(date.getTime())) return '—';

    return dateTimeFormat().format(date);
  }

  /** Nilai untuk <input type="date">: 'YYYY-MM-DD' menurut kalender WIB. */
  function dateInputValue(value) {
    if (!value) return '';

    var date = new Date(value);
    if (isNaN(date.getTime())) return '';

    var text = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: SITE_TIMEZONE
    }).format(date);

    return text === 'Invalid Date' ? '' : text;
  }

  /** Tanggal hari ini menurut kalender WIB, format 'YYYY-MM-DD'. */
  function todayInputValue() {
    return dateInputValue(new Date());
  }

  /**
   * Ubah 'YYYY-MM-DD' (tanggal kalender WIB) menjadi waktu tayang yang
   * disimpan di database. Tanggal yang dipilih disimpan sebagai tengah
   * malam WIB (+07:00) supaya tanggal yang sama tampil di seluruh halaman.
   */
  function publicationTimestamp(value) {
    var text = String(value == null ? '' : value).trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;

    return text + 'T00:00:00+07:00';
  }

  /** Jumlah komentar artikel dari relasi comments(count). */
  function commentCount(article) {
    var rows = (article && article.comments) || [];

    if (!rows.length) return 0;

    return Number(rows[0].count || 0);
  }

  /** Format angka dengan pemisah ribuan. */
  function formatNumber(value) {
    var number = Number(value || 0);
    if (!isFinite(number)) return '0';

    return new Intl.NumberFormat('id-ID').format(number);
  }

  /** Pembatas pemanggilan (untuk pencarian klien). */
  function debounce(fn, wait) {
    var timer = null;

    return function () {
      var context = this;
      var args = arguments;
      var delay = wait || 200;

      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  /** Class ikon Font Awesome yang valid. */
  var ICON_PREFIXES = ['fas', 'far', 'fab', 'fa-solid', 'fa-regular', 'fa-brands'];

  /** Sama persis dengan App\Models\Facility::isValidIcon(). */
  function isValidIcon(value) {
    var icon = String(value == null ? '' : value).trim();

    if (!icon) return false;

    return ICON_PREFIXES.some(function (prefix) {
      return new RegExp('^' + prefix + ' fa-[a-z0-9-]+$').test(icon);
    });
  }

  /** Nama acak untuk path file baru di bucket Storage. */
  function randomPath(extension) {
    var uuid = window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : String(Date.now()) + '-' + Math.random().toString(16).slice(2);

    var ext = String(extension || '').replace(/^\./, '').toLowerCase();

    return uuid + (ext ? '.' + ext : '');
  }

  /** Nama file acak tanpa folder (dipakai untuk unggahan media). */
  function randomFileName(file) {
    return randomPath(file && file.name ? file.name.split('.').pop() : '');
  }

  window.NIUtils = {
    slugify: slugify,
    upperTag: upperTag,
    escapeHtml: escapeHtml,
    stripTags: stripTags,
    limit: limit,
    formatDate: formatDate,
    formatDateParts: formatDateParts,
    commentCount: commentCount,
    formatDateTime: formatDateTime,
    dateInputValue: dateInputValue,
    todayInputValue: todayInputValue,
    publicationTimestamp: publicationTimestamp,
    formatNumber: formatNumber,
    debounce: debounce,
    isValidIcon: isValidIcon,
    randomPath: randomPath,
    randomFileName: randomFileName
  };
})(window, document);
