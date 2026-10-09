// ===== Admin Dashboard Logic =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs,
  addDoc, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let currentUser = null;

// ===== Cek Auth + Role Admin =====
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const role = userDoc.exists() ? userDoc.data().role : 'member';
  if (role !== 'admin') {
    alert('Akses ditolak. Halaman ini hanya untuk admin.');
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;
  document.getElementById('adminUser').textContent = user.email;

  // Load data awal
  loadStats();
  loadNews();
  loadEvents();
  loadGallery();
});

// ===== Logout =====
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'login.html';
});

// ===== Tab Navigation =====
document.querySelectorAll('.admin-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('tab-' + tab).classList.add('active');
    document.getElementById('pageTitle').textContent = btn.querySelector('span').textContent;
  });
});

// ===== Stats =====
async function loadStats() {
  const news = await getDocs(collection(db, 'news'));
  const events = await getDocs(collection(db, 'events'));
  const gallery = await getDocs(collection(db, 'gallery'));
  document.getElementById('statNews').textContent = news.size;
  document.getElementById('statEvents').textContent = events.size;
  document.getElementById('statGallery').textContent = gallery.size;
}

// ===== Modal =====
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalForm = document.getElementById('modalForm');
const modalClose = document.getElementById('modalClose');

function openModal(title, fields, onSubmit) {
  modalTitle.textContent = title;
  modalForm.innerHTML = fields + `
    <button type="submit" class="btn btn-primary">Simpan</button>
  `;
  modalForm.onsubmit = async (e) => {
    e.preventDefault();
    await onSubmit(new FormData(modalForm));
    closeModal();
  };
  modal.classList.add('open');
}
function closeModal() {
  modal.classList.remove('open');
  modalForm.innerHTML = '';
}
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// ===== NEWS =====
async function loadNews() {
  const list = document.getElementById('newsList');
  const snap = await getDocs(collection(db, 'news'));
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  list.innerHTML = items.length ? items.map(item => `
    <div class="admin-item">
      <div class="admin-item-info">
        <h4>${item.title_id || item.title?.id || '(tanpa judul)'}</h4>
        <p>${item.date || ''} — ${item.excerpt_id || item.excerpt?.id || ''}</p>
      </div>
      <div class="admin-item-actions">
        <button data-id="${item.id}" class="edit-news"><i class="lucide-pencil"></i></button>
        <button data-id="${item.id}" class="delete-news danger"><i class="lucide-trash-2"></i></button>
      </div>
    </div>
  `).join('') : '<p style="color:var(--text-mute)">Belum ada berita.</p>';

  list.querySelectorAll('.edit-news').forEach(btn => {
    btn.addEventListener('click', () => editNews(btn.dataset.id));
  });
  list.querySelectorAll('.delete-news').forEach(btn => {
    btn.addEventListener('click', () => deleteNews(btn.dataset.id));
  });
}

document.getElementById('addNewsBtn')?.addEventListener('click', () => newsForm());

function newsForm(data = {}) {
  const fields = `
    <div><label>Judul (ID)</label><input name="title_id" value="${data.title_id || ''}" required /></div>
    <div><label>Judul (EN)</label><input name="title_en" value="${data.title_en || ''}" required /></div>
    <div><label>Tanggal</label><input name="date" type="date" value="${data.date || ''}" required /></div>
    <div><label>Ringkasan (ID)</label><textarea name="excerpt_id" required>${data.excerpt_id || ''}</textarea></div>
    <div><label>Ringkasan (EN)</label><textarea name="excerpt_en" required>${data.excerpt_en || ''}</textarea></div>
    <div><label>URL Gambar</label><input name="thumbnail" value="${data.thumbnail || ''}" placeholder="https://..." /></div>
    <div><label>Link Berita</label><input name="url" value="${data.url || '#'}" /></div>
  `;
  openModal(data.id ? 'Edit Berita' : 'Tambah Berita', fields, async (fd) => {
    const obj = Object.fromEntries(fd.entries());
    if (data.id) {
      await updateDoc(doc(db, 'news', data.id), obj);
    } else {
      await addDoc(collection(db, 'news'), obj);
    }
    loadNews(); loadStats();
  });
}

async function editNews(id) {
  const snap = await getDoc(doc(db, 'news', id));
  if (snap.exists()) newsForm({ id, ...snap.data() });
}
async function deleteNews(id) {
  if (confirm('Hapus berita ini?')) {
    await deleteDoc(doc(db, 'news', id));
    loadNews(); loadStats();
  }
}

// ===== EVENTS =====
async function loadEvents() {
  const list = document.getElementById('eventsList');
  const snap = await getDocs(collection(db, 'events'));
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  list.innerHTML = items.length ? items.map(item => `
    <div class="admin-item">
      <div class="admin-item-info">
        <h4>${item.title_id || item.title?.id || '(tanpa judul)'}</h4>
        <p>${item.start || ''}</p>
      </div>
      <div class="admin-item-actions">
        <button data-id="${item.id}" class="edit-event"><i class="lucide-pencil"></i></button>
        <button data-id="${item.id}" class="delete-event danger"><i class="lucide-trash-2"></i></button>
      </div>
    </div>
  `).join('') : '<p style="color:var(--text-mute)">Belum ada acara.</p>';

  list.querySelectorAll('.edit-event').forEach(btn => {
    btn.addEventListener('click', () => editEvent(btn.dataset.id));
  });
  list.querySelectorAll('.delete-event').forEach(btn => {
    btn.addEventListener('click', () => deleteEvent(btn.dataset.id));
  });
}

document.getElementById('addEventBtn')?.addEventListener('click', () => eventForm());

function eventForm(data = {}) {
  const fields = `
    <div><label>Judul (ID)</label><input name="title_id" value="${data.title_id || ''}" required /></div>
    <div><label>Judul (EN)</label><input name="title_en" value="${data.title_en || ''}" required /></div>
    <div><label>Mulai</label><input name="start" type="datetime-local" value="${data.start || ''}" required /></div>
    <div><label>Selesai (opsional)</label><input name="end" type="datetime-local" value="${data.end || ''}" /></div>
    <div><label>Warna</label><input name="color" type="color" value="${data.color || '#1E9BE0'}" /></div>
  `;
  openModal(data.id ? 'Edit Acara' : 'Tambah Acara', fields, async (fd) => {
    const obj = Object.fromEntries(fd.entries());
    if (data.id) {
      await updateDoc(doc(db, 'events', data.id), obj);
    } else {
      await addDoc(collection(db, 'events'), obj);
    }
    loadEvents(); loadStats();
  });
}

async function editEvent(id) {
  const snap = await getDoc(doc(db, 'events', id));
  if (snap.exists()) eventForm({ id, ...snap.data() });
}
async function deleteEvent(id) {
  if (confirm('Hapus acara ini?')) {
    await deleteDoc(doc(db, 'events', id));
    loadEvents(); loadStats();
  }
}

// ===== GALLERY =====
async function loadGallery() {
  const list = document.getElementById('galleryList');
  const snap = await getDocs(collection(db, 'gallery'));
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  list.innerHTML = items.length ? items.map(item => `
    <div class="admin-gallery-item">
      <img src="${item.src}" alt="${item.caption_id || ''}" loading="lazy" />
      <button class="delete-btn delete-gallery" data-id="${item.id}" data-src="${item.src}">
        <i class="lucide-trash-2"></i>
      </button>
    </div>
  `).join('') : '<p style="color:var(--text-mute)">Belum ada gambar.</p>';

  list.querySelectorAll('.delete-gallery').forEach(btn => {
    btn.addEventListener('click', () => deleteGallery(btn.dataset.id, btn.dataset.src));
  });
}

document.getElementById('addGalleryBtn')?.addEventListener('click', () => galleryForm());

function galleryForm() {
  const fields = `
    <div><label>Upload Gambar</label><input name="file" type="file" accept="image/*" required /></div>
    <div><label>Caption (ID)</label><input name="caption_id" required /></div>
    <div><label>Caption (EN)</label><input name="caption_en" required /></div>
  `;
  openModal('Upload Gambar', fields, async (fd) => {
    const file = fd.get('file');
    const caption_id = fd.get('caption_id');
    const caption_en = fd.get('caption_en');

    // Upload ke Storage
    const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    // Simpan ke Firestore
    await addDoc(collection(db, 'gallery'), {
      src: url,
      caption_id, caption_en,
      storagePath: storageRef.fullPath
    });
    loadGallery(); loadStats();
  });
}

async function deleteGallery(id, src) {
  if (!confirm('Hapus gambar ini?')) return;
  const snap = await getDoc(doc(db, 'gallery', id));
  if (snap.exists() && snap.data().storagePath) {
    try {
      await deleteObject(ref(storage, snap.data().storagePath));
    } catch (e) { console.warn('Gagal hapus file Storage:', e); }
  }
  await deleteDoc(doc(db, 'gallery', id));
  loadGallery(); loadStats();
}