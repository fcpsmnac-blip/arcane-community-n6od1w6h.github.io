// ===== Gallery dari Firestore =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadGallery() {
  try {
    const snap = await getDocs(collection(db, 'gallery'));
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderGallery(items);
  } catch (err) { console.error('Gagal memuat galeri:', err); }
}

function renderGallery(items) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;
  const lang = window.currentLang || 'id';

  grid.innerHTML = items.length ? items.map(item => {
    const caption = item['caption_' + lang] || item.caption_id || '';
    return `
      <div class="gallery-item reveal lazy-wrap" data-src="${item.src}" data-caption="${caption}">
        <img data-src="${item.src}" alt="${caption}" loading="lazy"
             onload="this.parentElement.classList.add('loaded');this.classList.add('loaded')" />
        <div class="gallery-overlay">${caption}</div>
      </div>
    `;
  }).join('') : '<p style="color:var(--text-mute);text-align:center;grid-column:1/-1;">Belum ada gambar.</p>';

  lazyLoadImages(grid.querySelectorAll('img[data-src]'));
  observeReveal();
  initLightbox();
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

function initLightbox() {
  const box = document.getElementById('lightbox');
  const boxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  if (!box || !boxImg) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      boxImg.src = item.dataset.src;
      box.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => { box.classList.remove('open'); document.body.style.overflow = ''; };
  closeBtn?.addEventListener('click', close);
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

document.addEventListener('DOMContentLoaded', loadGallery);
document.getElementById('langToggle')?.addEventListener('click', () => setTimeout(loadGallery, 50));