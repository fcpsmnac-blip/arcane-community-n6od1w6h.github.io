let currentLang = localStorage.getItem('arcane-lang') || 'id';
window.currentLang = currentLang;

const translations = {
  id: {
    "nav.home": "Beranda",
    "nav.about": "Tentang",
    "nav.services": "Layanan",
    "nav.news": "Info",
    "nav.events": "Acara",
    "nav.gallery": "Galeri",
    "hero.badge": "Komunitas Informasi & Digital",
    "hero.title": "Informasi. Kreativitas. Komunitas.",
    "hero.subtitle": "ARCANE Community berbagi informasi sekolah dan menyediakan jasa digital untuk anggota maupun publik.",
    "hero.cta1": "Lihat Layanan",
    "hero.cta2": "Tentang Kami",
    "about.tag": "Tentang Kami",
    "about.title": "Siapa ARCANE?",
    "about.desc": "ARCANE Community adalah wadah berbagi informasi seputar sekolah dan penyedia jasa digital. Kami percaya informasi yang tepat & desain yang rapi bisa membantu banyak orang.",
    "services.tag": "Layanan",
    "services.title": "Jasa Digital Kami",
    "services.desc": "Lima layanan utama yang kami sediakan untuk anggota dan publik.",
    "services.doc.title": "Edit Dokumen",
    "services.doc.desc": "Perapian format, pengetikan, dan penyuntingan dokumen.",
    "services.schedule.title": "Edit Jadwal",
    "services.schedule.desc": "Pembuatan & perapian jadwal pelajaran atau kegiatan.",
    "services.logo.title": "Desain Logo",
    "services.logo.desc": "Pembuatan logo modern & minimalis untuk komunitas atau brand.",
    "services.image.title": "Edit Gambar",
    "services.image.desc": "Retouch, komposisi, dan desain grafis sederhana.",
    "services.video.title": "Edit Video",
    "services.video.desc": "Editing video untuk konten sekolah, acara, atau promosi.",
    "news.tag": "Info Sekolah",
    "news.title": "Berita & Informasi Terbaru",
    "news.desc": "Update seputar kegiatan, pengumuman, dan informasi sekolah.",
    "news.readmore": "Baca selengkapnya →",
    "events.tag": "Kalender",
    "events.title": "Acara Mendatang",
    "events.desc": "Jadwal kegiatan dan acara ARCANE Community.",
    "gallery.tag": "Galeri",
    "gallery.title": "Momen & Karya",
    "gallery.desc": "Dokumentasi kegiatan dan hasil karya ARCANE Community.",
    "footer.tagline": "Informasi. Kreativitas. Komunitas.",
    "footer.rights": "Hak cipta dilindungi."
  },
  en: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.news": "News",
    "nav.events": "Events",
    "nav.gallery": "Gallery",
    "hero.badge": "Info & Digital Community",
    "hero.title": "Information. Creativity. Community.",
    "hero.subtitle": "ARCANE Community shares school information and provides digital services for members and the public.",
    "hero.cta1": "View Services",
    "hero.cta2": "About Us",
    "about.tag": "About Us",
    "about.title": "Who is ARCANE?",
    "about.desc": "ARCANE Community is a hub for sharing school information and digital services. We believe the right information & clean design can help many people.",
    "services.tag": "Services",
    "services.title": "Our Digital Services",
    "services.desc": "Five main services we provide for members and the public.",
    "services.doc.title": "Document Editing",
    "services.doc.desc": "Formatting, typing, and document editing.",
    "services.schedule.title": "Schedule Editing",
    "services.schedule.desc": "Creating & tidying class or event schedules.",
    "services.logo.title": "Logo Design",
    "services.logo.desc": "Modern & minimalist logo design for communities or brands.",
    "services.image.title": "Image Editing",
    "services.image.desc": "Retouching, compositing, and simple graphic design.",
    "services.video.title": "Video Editing",
    "services.video.desc": "Video editing for school content, events, or promotions.",
    "news.tag": "School Info",
    "news.title": "Latest News & Info",
    "news.desc": "Updates on activities, announcements, and school information.",
    "news.readmore": "Read more →",
    "events.tag": "Calendar",
    "events.title": "Upcoming Events",
    "events.desc": "Schedule of ARCANE Community events and activities.",
    "gallery.tag": "Gallery",
    "gallery.title": "Moments & Works",
    "gallery.desc": "Documentation of ARCANE Community activities and works.",
    "footer.tagline": "Information. Creativity. Community.",
    "footer.rights": "All rights reserved."
  }
};

function applyLang(lang) {
  currentLang = lang;
  window.currentLang = lang;
  localStorage.setItem('arcane-lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) el.textContent = translations[lang][key];
  });
  const label = document.getElementById('langLabel');
  if (label) label.textContent = lang === 'id' ? 'EN' : 'ID';
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
  document.getElementById('langToggle')?.addEventListener('click', () => {
    applyLang(currentLang === 'id' ? 'en' : 'id');
  });
});