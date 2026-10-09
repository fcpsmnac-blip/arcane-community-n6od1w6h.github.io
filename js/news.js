// ===== News dari Firestore =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadNews() {
  try {
    const snap = await getDocs(collection(db, 'news'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort by date desc
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderNews(items);
  } catch (err) {
    console.error('Gagal memuat berita:', err);
  }
}

function renderNews(items) {
  const grid = document.getElementById('newsGrid');
  if (!grid) return;
  const lang = window.currentLang || 'id';

  grid.innerHTML = items.length ? items.map(item => {
    const dateStr = new Date(item.date).toLocaleDateString(
      lang === 'id' ? 'id-ID' : 'en-US',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
    const title = item['title_' + lang] || item.title_id || '';
    const excerpt = item['excerpt_' + lang] || item.excerpt_id || '';
    return `
      <article class="news-card reveal">
        <div class="news-thumb lazy-wrap">
          <img data-src="${item.thumbnail || ''}" alt="${title}"
               loading="lazy"
               onload="this.parentElement.classList.add('loaded');this.classList.add('loaded')" />
        </div>
        <div class="news-body">
          <span class="news-date">${dateStr}</span>
          <h3>${title}</h3>
          <p>${excerpt}</p>
          <a href="${item.url || '#'}" class="news-link" data-i18n="news.readmore">Baca selengkapnya →</a>
        </div>
      </article>
    `;
  }).join('') : '<p style="color:var(--text-mute);text-align:center;grid-column:1/-1;">Belum ada berita.</p>';

  lazyObserveSection(grid, () => {
    lazyLoadImages(grid.querySelectorAll('img[data-src]'));
  });
  observeReveal();
  applyLang(lang);
}

function lazyObserveSection(el, callback) {
  if (!el || !('IntersectionObserver' in window)) { if (callback) callback(); return; }
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { if (callback) callback(); o.unobserve(entry.target); }
    });
  }, { rootMargin: '150px 0px', threshold: 0.01 });
  obs.observe(el);
}

function lazyLoadImages(images) {
  if (!images || !images.length) return;
  if (!('IntersectionObserver' in window)) {
    images.forEach(img => { img.src = img.dataset.src; img.removeAttribute('data-src'); });
    return;
  }
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        o.unobserve(img);
      }
    });
  }, { rootMargin: '100px 0px', threshold: 0.01 });
  images.forEach(img => obs.observe(img));
}

document.addEventListener('DOMContentLoaded', loadNews);
document.getElementById('langToggle')?.addEventListener('click', () => setTimeout(loadNews, 50));