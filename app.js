// app.js
// Shared Firebase initialization and helper functions

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy, limit, startAfter, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// ---- Replace with your Firebase config (I used the one you provided earlier) ----
const firebaseConfig = {
  apiKey: "AIzaSyCLCUAiPz-sqhFDskG9g9AwyUI1RdTQWfk",
  authDomain: "marathi-crime-files.firebaseapp.com",
  projectId: "marathi-crime-files",
  storageBucket: "marathi-crime-files.appspot.com",
  messagingSenderId: "973325762370",
  appId: "1:973325762370:web:4fb97306806bbe6cc0d2db"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// Admin email
export const ADMIN_EMAIL = "gulistankh2011@gmail.com";

// Auth helpers
export function doGoogleLogin() {
  return signInWithPopup(auth, provider);
}
export function doSignOut() {
  return signOut(auth);
}
export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

// Firestore helpers
export async function addNews({title, category, blocks = [], time = Date.now()}) {
  return await addDoc(collection(db, "news"), { title, category, blocks, time });
}
export async function deleteNews(id) {
  return await deleteDoc(doc(db, "news", id));
}
export async function setNotice(text) {
  return await setDoc(doc(db, "settings", "notice"), { text, time: Date.now() });
}
export function listenNotice(cb) {
  const ref = doc(db, "settings", "notice");
  return onSnapshot(ref, cb);
}
export function listenBreaking(cb) {
  // breaking headlines stored in settings/breaking as array, or we fallback to latest news
  const ref = doc(db, "settings", "breaking");
  return onSnapshot(ref, cb);
}
export async function addBannerImage(url) {
  // banners collection, each doc {url, time}
  return await addDoc(collection(db, "banners"), { url, time: Date.now() });
}
export async function listBanners() {
  const q = query(collection(db, "banners"), orderBy("time","desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({id:d.id, ...d.data()}));
}

// Storage helper
export async function uploadFile(file, pathPrefix = "images") {
  const name = `${pathPrefix}/${Date.now()}_${file.name}`;
  const r = storageRef(storage, name);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  return url;
}

// Pagination: fetch next batch of news (optionally filtered by category)
export async function fetchNewsBatch(limitCount = 6, lastDoc = null, category = null) {
  let q;
  const col = collection(db, "news");
  if (category) {
    q = query(col, where("category", "==", category), orderBy("time","desc"), limit(limitCount));
  } else {
    q = query(col, orderBy("time","desc"), limit(limitCount));
  }
  if (lastDoc) {
    q = query(col, orderBy("time","desc"), startAfter(lastDoc), limit(limitCount));
    if (category) q = query(col, where("category","==",category), orderBy("time","desc"), startAfter(lastDoc), limit(limitCount));
  }
  const snap = await getDocs(q);
  return { docs: snap.docs, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
}
