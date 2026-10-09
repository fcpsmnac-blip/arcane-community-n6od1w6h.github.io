// ===== Auth Helper =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const ROLE_DISPLAY = {
  owner:    'ArcZeyn',
  operator: 'Operator',
  member:   'Member'
};

// Ambil data user dari Firestore
export async function getUserData(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error('Gagal ambil data user:', e);
    return null;
  }
}

// Cek login + redirect kalau belum
export function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    const data = await getUserData(user.uid);
    callback(user, data);
  });
}

// Logout
export async function logout() {
  await signOut(auth);
  window.location.href = 'login.html';
}