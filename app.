// app.js
// Shared Firebase init + helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, collection, addDoc, doc, setDoc, deleteDoc, getDocs, query, orderBy, limit, startAfter, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --- REPLACE THIS if needed ---
const firebaseConfig = {
  apiKey: "AIzaSyCLCUAiPz-sqhFDskG9g9AwyUI1RdTQWfk",
  authDomain: "marathi-crime-files.firebaseapp.com",
  projectId: "marathi-crime-files",
  storageBucket: "marathi-crime-files.appspot.com",
  messagingSenderId: "973325762370",
  appId: "1:973325762370:web:4fb97306806bbe6cc0d2db"
};
// -------------------------------

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

// admin email (your admin)
export const ADMIN_EMAIL = "gulistankh2011@gmail.com";

// Auth helpers
export function doGoogleLogin(){ return signInWithPopup(auth, provider); }
export function doSignOut(){ return signOut(auth); }
export function onAuth(cb){ return onAuthStateChanged(auth, cb); }

// News helpers
export async function addNews({title, category, blocks=[], time=Date.now()}) {
  return await addDoc(collection(db,"news"), { title, category, blocks, time });
}
export async function deleteNews(id){ return await deleteDoc(doc(db,"news",id)); }

// Settings: notice & breaking
export async function setNotice(text){ return await setDoc(doc(db,"settings","notice"), { text, time: Date.now() }); }
export async function setBreaking(items){ return await setDoc(doc(db,"settings","breaking"), { items, time: Date.now() }); }
export function listenNotice(cb){ return onSnapshot(docRef(db,"settings","notice"), cb); }
export function listenBreaking(cb){ return onSnapshot(docRef(db,"settings","breaking"), cb); }

// Banners
export async function addBannerImage(url){ return await addDoc(collection(db,"banners"), { url, time: Date.now() }); }
export async function listBanners(){
  const q = query(collection(db,"banners"), orderBy("time","desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({ id: d.id, ...d.data() }));
}

// Storage upload
export async function uploadFile(file, prefix="images"){
  const name = `${prefix}/${Date.now()}_${file.name}`;
  const r = storageRef(storage, name);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  return url;
}

// Small helper because we used docRef above
import { doc as docRef } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
export { db, auth };
