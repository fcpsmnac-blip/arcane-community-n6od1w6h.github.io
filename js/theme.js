// ===== Dark Mode =====
(function initTheme() {
  const saved = localStorage.getItem('arcane-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  document.addEventListener('DOMContentLoaded', () => {
    updateThemeIcon(theme);
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
  });
})();

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  icon.className = theme === 'dark' ? 'lucide-sun' : 'lucide-moon';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('arcane-theme', next);
  updateThemeIcon(next);

  // Re-trigger semua efek visual setelah ganti theme
  setTimeout(() => {
    // 1. Re-render kalender (warna FullCalendar ikut berubah)
    if (typeof loadEvents === 'function' && window._arcaneCalendar) {
      loadEvents();
    }

    // 2. Re-observe reveal animation (elemen yang belum muncul)
    if (typeof observeReveal === 'function') {
      // Reset class visible biar animasi muncul lagi
      document.querySelectorAll('.reveal.visible').forEach(el => {
        el.classList.remove('visible');
      });
      // Re-observe
      setTimeout(observeReveal, 100);
    }

    // 3. Update status lazy image (kalau ada yang belum loaded)
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        img.classList.add('loaded');
        img.parentElement?.classList.add('loaded');
      }
    });

    // 4. Re-trigger lazy load gambar (kalau ada yang belum ke-load)
    if (typeof lazyLoadImages === 'function') {
      const newsImgs = document.querySelectorAll('#newsGrid img[data-src]');
      const galleryImgs = document.querySelectorAll('#galleryGrid img[data-src]');
      if (newsImgs.length) lazyLoadImages(newsImgs);
      if (galleryImgs.length) lazyLoadImages(galleryImgs);
    }
  }, 50);
}