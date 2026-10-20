$filePath = "c:\Users\Lenovo\Documents\webnurulilmi-main\webnurulilmi-main\galeri-fasilitas.html"

# Read the current corrupted file and keep everything except the script tag
$content = Get-Content $filePath -Raw

# Find and replace the corrupted script section
$oldScriptPattern = '<script>[\s\S]*?\$\(document\)\.ready[\s\S]*?</script>'
$newScript = @'
  <script>
    // Lightbox functionality
    (function() {
      const galleryItems = document.querySelectorAll('.gallery-card');
      let currentIndex = 0;
      const lightbox = document.getElementById('lightbox');
      const lightboxImage = document.getElementById('lightbox-image');
      const lightboxCaption = document.getElementById('lightbox-caption');
      const body = document.body;

      function showImage(index) {
        const item = galleryItems[index];
        const imgSrc = item.querySelector('img').getAttribute('src');
        const caption = item.querySelector('h4').textContent;
        lightboxImage.setAttribute('src', imgSrc);
        lightboxCaption.textContent = caption;
      }

      // Open lightbox
      galleryItems.forEach(function(item, index) {
        item.addEventListener('click', function() {
          currentIndex = index;
          showImage(currentIndex);
          lightbox.classList.add('active');
          body.style.overflow = 'hidden';
        });
      });

      // Close lightbox
      document.getElementById('lightbox-close').addEventListener('click', function() {
        lightbox.classList.remove('active');
        body.style.overflow = 'auto';
      });

      // Close on background click
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
          lightbox.classList.remove('active');
          body.style.overflow = 'auto';
        }
      });

      // Previous image
      document.getElementById('lightbox-prev').addEventListener('click', function(e) {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        showImage(currentIndex);
      });

      // Next image
      document.getElementById('lightbox-next').addEventListener('click', function(e) {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % galleryItems.length;
        showImage(currentIndex);
      });

      // Keyboard navigation
      document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
          lightbox.classList.remove('active');
          body.style.overflow = 'auto';
        } else if (e.key === 'ArrowLeft') {
          currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
          showImage(currentIndex);
        } else if (e.key === 'ArrowRight') {
          currentIndex = (currentIndex + 1) % galleryItems.length;
          showImage(currentIndex);
        }
      });

      // Initialize AOS
      if (typeof AOS !== 'undefined') {
        AOS.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true
        });
      }
    })();
  </script>
'@

# Replace the corrupted script with the new one
$newContent = $content -replace $oldScriptPattern, $newScript

# Save the fixed file
$newContent | Set-Content $filePath -Encoding UTF8
Write-Host "JavaScript fixed successfully!"
