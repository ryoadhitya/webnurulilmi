$filePath = "c:\Users\Lenovo\Documents\webnurulilmi-main\webnurulilmi-main\galeri-fasilitas.html"

# Read existing file
$content = Get-Content $filePath -Raw

# Extract part before corrupted script
$beforeScript = $content.Substring(0, $content.IndexOf('<script>'))

# Extract part after corrupted script (including closing tags)
$afterScriptStart = $content.IndexOf('</script>') + 9
$afterScript = $content.Substring($afterScriptStart)

# New vanilla JavaScript (no jQuery, no $ characters)
$newScript = @'
  <script>
    (function() {
      var galleryItems = document.querySelectorAll('.gallery-card');
      var currentIndex = 0;
      var lightbox = document.getElementById('lightbox');
      var lightboxImage = document.getElementById('lightbox-image');
      var lightboxCaption = document.getElementById('lightbox-caption');

      function showImage(index) {
        var item = galleryItems[index];
        var imgSrc = item.querySelector('img').getAttribute('src');
        var captionText = item.querySelector('h4').textContent;
        lightboxImage.setAttribute('src', imgSrc);
        lightboxCaption.textContent = captionText;
      }

      galleryItems.forEach(function(item, index) {
        item.addEventListener('click', function() {
          currentIndex = index;
          showImage(currentIndex);
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        });
      });

      document.getElementById('lightbox-close').addEventListener('click', function() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      });

      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
          lightbox.classList.remove('active');
          document.body.style.overflow = '';
        }
      });

      document.getElementById('lightbox-prev').addEventListener('click', function(e) {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        showImage(currentIndex);
      });

      document.getElementById('lightbox-next').addEventListener('click', function(e) {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % galleryItems.length;
        showImage(currentIndex);
      });

      document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
          lightbox.classList.remove('active');
          document.body.style.overflow = '';
        } else if (e.key === 'ArrowLeft') {
          currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
          showImage(currentIndex);
        } else if (e.key === 'ArrowRight') {
          currentIndex = (currentIndex + 1) % galleryItems.length;
          showImage(currentIndex);
        }
      });

      if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
      }
    })();
  </script>
'@

# Combine and save
$newContent = $beforeScript + $newScript + $afterScript
$newContent | Set-Content $filePath -Encoding UTF8
Write-Host "Gallery page fixed successfully!"
