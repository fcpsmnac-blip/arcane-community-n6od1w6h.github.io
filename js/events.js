// ===== Events dari Firestore =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function loadEvents() {
  const el = document.getElementById('calendar');
  if (!el || typeof FullCalendar === 'undefined') return;

  let events = [];
  try {
    const snap = await getDocs(collection(db, 'events'));
    events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) { console.error('Gagal memuat acara:', err); }

  const lang = window.currentLang || 'id';
  const mapped = events.map(e => ({
    title: e['title_' + lang] || e.title_id || '',
    start: e.start,
    end: e.end || undefined,
    color: e.color || '#1E9BE0'
  }));

  if (window._arcaneCalendar) window._arcaneCalendar.destroy();

  const calendar = new FullCalendar.Calendar(el, {
    initialView: 'dayGridMonth',
    locale: lang === 'id' ? 'id' : 'en',
    height: 'auto',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listMonth' },
    buttonText: {
      today: lang === 'id' ? 'Hari ini' : 'Today',
      month: lang === 'id' ? 'Bulan'  : 'Month',
      list:  lang === 'id' ? 'Daftar' : 'List'
    },
    events: mapped, eventDisplay: 'block', dayMaxEvents: 2
  });
  calendar.render();
  window._arcaneCalendar = calendar;
}

function initCalendarLazy() {
  const wrapper = document.querySelector('.calendar-wrapper');
  if (!wrapper) return;
  if (!('IntersectionObserver' in window)) { loadEvents(); return; }
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { loadEvents(); o.unobserve(entry.target); }
    });
  }, { rootMargin: '100px 0px', threshold: 0.01 });
  obs.observe(wrapper);
}

document.addEventListener('DOMContentLoaded', () => {
  const tryInit = setInterval(() => {
    if (typeof FullCalendar !== 'undefined') { clearInterval(tryInit); initCalendarLazy(); }
  }, 100);
});

document.getElementById('langToggle')?.addEventListener('click', () => setTimeout(loadEvents, 50));