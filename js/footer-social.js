/* ==========================================================================
   SOSIAL MEDIA — YPI NURUL ILMI
   --------------------------------------------------------------------------
   Satu-satunya sumber daftar akun resmi YPI Nurul Ilmi. Seluruh footer
   website memakai komponen ini, jadi tidak ada kumpulan ikon sosial media
   yang berbeda-bedanya di tiap halaman.

   Akun resmi (URL tidak diubah dari sumber resmi):
     - X (Twitter) : https://x.com/YPINurulIlmi
     - TikTok      : https://www.tiktok.com/@ypinurulilmibekasi
     - YouTube     : https://youtube.com/@ypinurulilmibekasinew
     - Facebook    : https://www.facebook.com/share/1HXtPToTWg/
     - Instagram   : https://www.instagram.com/ypi_nurulilmi

   Elemen target: <ul data-footer-social></ul>
   ========================================================================== */
(function (window, document) {
  'use strict';

  var SOCIAL_LINKS = [
    {
      name: 'X (Twitter)',
      url: 'https://x.com/YPINurulIlmi',
      icon: 'fab fa-x-twitter'
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@ypinurulilmibekasi?_r=1&_t=ZS-9BV1zn7ZS6u',
      icon: 'fab fa-tiktok'
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/@ypinurulilmibekasinew?si=vawu11YIMzGWkNC7',
      icon: 'fab fa-youtube'
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1HXtPToTWg/',
      icon: 'fab fa-facebook-f'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/ypi_nurulilmi?gwpx=c3plbjZrOWtuZXQ5',
      icon: 'fab fa-instagram'
    }
  ];

  function buildItem(link) {
    var item = document.createElement('li');

    /* `ftco-animate` disembunyikan CSS sampai waypoint di main.js menandai
       elemennya. Ikon ini disisipkan setelah waypoint terpasang, jadi ikon
       tidak akan pernah ditanda: `fadeInUp ftco-animated` memunculkannya
       dengan animasi, tanpa bergantung pada posisi scroll. */
    item.className = 'fadeInUp ftco-animated';

    var anchor = document.createElement('a');
    anchor.setAttribute('href', link.url);
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
    anchor.setAttribute('aria-label', link.name + ' YPI Nurul Ilmi Bekasi');

    var icon = document.createElement('span');
    icon.className = link.icon;

    anchor.appendChild(icon);
    item.appendChild(anchor);

    return item;
  }

  function render(container) {
    container.innerHTML = '';

    SOCIAL_LINKS.forEach(function (link) {
      container.appendChild(buildItem(link));
    });
  }

  function load() {
    var containers = document.querySelectorAll('[data-footer-social]');

    for (var i = 0; i < containers.length; i++) {
      render(containers[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})(window, document);
