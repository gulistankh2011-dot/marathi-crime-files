// home.js
import { doGoogleLogin, doSignOut, onAuth, ADMIN_EMAIL, uploadFile, addBannerImage, listBanners, fetchNewsBatch, listenNotice, listenBreaking } from "./app.js";
import { getDocs, query, collection, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const postsEl = document.getElementById("posts");
const loaderEl = document.getElementById("loader");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const breakingTick = document.getElementById("breakingTick");
const noticeTick = document.getElementById("noticeTick");
const bannerWrap = document.getElementById("bannerWrap");
const bannerDots = document.getElementById("bannerDots");

let isAdmin = false;
let loading = false;
let lastDocs = null;
let finished = false;
const BATCH = 6;
let bannerList = [];

// Auth UI
loginBtn.onclick = async () => {
  try {
    await doGoogleLogin();
  } catch (e) { alert(e.message) }
};
logoutBtn.onclick = async () => {
  try { await doSignOut(); } catch(e){ alert(e.message) }
};

onAuth(user => {
  if (user && user.email === ADMIN_EMAIL) {
    isAdmin = true;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    isAdmin = false;
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});

// Banner: load banners from Firestore (banners collection)
async function loadBanners() {
  try {
    const arr = await listBanners();
    bannerList = arr.map(a=>a.url);
  } catch(e){ console.warn(e); }
  if (bannerList.length === 0) {
    // fallback placeholder images
    bannerList = [
      "https://via.placeholder.com/1400x500?text=Marathi+Crime+Files+Banner+1",
      "https://via.placeholder.com/1400x500?text=Banner+2",
      "https://via.placeholder.com/1400x500?text=Banner+3"
    ];
  }
  renderBanner();
}
function renderBanner() {
  bannerWrap.innerHTML = "";
  bannerDots.innerHTML = "";
  bannerList.forEach((url, idx) => {
    const img = document.createElement("img");
    img.src = url;
    img.style.display = idx===0 ? "block" : "none";
    bannerWrap.appendChild(img);
    const d = document.createElement("div");
    d.className = "banner-dot" + (idx===0? " active" : "");
    d.onclick = ()=>switchSlide(idx);
    bannerDots.appendChild(d);
  });
  // autoplay
  let current = 0;
  setInterval(()=> {
    const imgs = bannerWrap.querySelectorAll("img");
    current = (current + 1) % imgs.length;
    imgs.forEach((im,i)=> im.style.display = i===current ? "block" : "none");
    const dots = bannerDots.querySelectorAll(".banner-dot");
    dots.forEach((dt,i)=> dt.classList.toggle("active", i===current));
  }, 4000);
}
function switchSlide(i) {
  const imgs = bannerWrap.querySelectorAll("img");
  imgs.forEach((im,idx)=> im.style.display = idx===i ? "block" : "none");
  const dots = bannerDots.querySelectorAll(".banner-dot");
  dots.forEach((dt,idx)=> dt.classList.toggle("active", idx===i));
}

// Tickers: listen to settings documents
listenBreaking(snap=>{
  if (snap.exists()){
    const data = snap.data();
    if (data.items && data.items.length) breakingTick.textContent = data.items.join("  —  ");
    else breakingTick.textContent = "Latest headlines will appear here.";
  } else {
    breakingTick.textContent = "Latest headlines will appear here.";
  }
});
listenNotice(snap=>{
  if (snap.exists()){
    noticeTick.textContent = snap.data().text || "No notice";
  } else noticeTick.textContent = "No notice";
});

// Load initial batch
async function loadMore() {
  if (loading || finished) return;
  loading = true;
  loaderEl.textContent = "Loading...";
  try {
    // Simple approach: use fetchNewsBatch from app.js (but we don't have lastDoc snapshot here),
    // so we'll use basic query by time with offset using recently loaded IDs.
    // For reliability we fetch ordered and use page counter approach.
    const res = await fetch(`/api/getNewsBatch?limit=${BATCH}`); // placeholder - but we don't have server
    // Since we don't have server, we'll fetch from Firestore directly here:
  } catch(e){
    // fallback to direct method
  }
  // Direct fetch using Firestore (simple: get ordered docs with limit and skip by already loaded count)
  // We'll use getDocs & query with limit and then skip already shown by time filtering.
  // Simpler: load all and then paginate in memory (ok for small datasets).
  if (!window._allNewsCache) {
    const q = query(collection((await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js")).getFirestore(), "news"), orderBy("time","desc"), limit(1000));
    // but to avoid cross-import complexity, we'll use a simple fetch via REST is not available.
    // To keep this self-contained and working without complicated imports, we'll implement a listener to news collection.
  }
  // Use onSnapshot to get current news and then paginate in-memory
}

// Simpler approach: subscribe to news once and paginate in-memory
import { collection as coll, onSnapshot as onSnap, orderBy as oBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const newsCol = coll((await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js")).getFirestore(), "news");
let allNews = [];
onSnap(query(newsCol, orderBy("time","desc")), snap=>{
  allNews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  displayedCount = 0;
  postsEl.innerHTML = "";
  finished = false;
  loadBatch();
});

let displayedCount = 0;
function loadBatch() {
  const next = allNews.slice(displayedCount, displayedCount + BATCH);
  next.forEach(item=> {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.blocks.find(b=>b.type==="image")?.url || 'https://via.placeholder.com/600x400?text=No+Image'}" alt="">
      <h3>${item.title}</h3>
      <p>${item.blocks.find(b=>b.type==="text")?.text?.substring(0,120) || ""}</p>
    `;
    card.onclick = ()=>openPostModal(item);
    postsEl.appendChild(card);
  });
  displayedCount += next.length;
  if (displayedCount >= allNews.length) {
    finished = true;
    loaderEl.textContent = "No more news";
  } else loaderEl.textContent = "Scroll to load more";
  loading = false;
}

// infinite scroll listener
window.addEventListener("scroll", ()=>{
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 140) {
    if (!loading && !finished) loadBatch();
  }
});

// open modal
function openPostModal(item) {
  modalContent.innerHTML = `<h2>${item.title}</h2>`;
  item.blocks.forEach(b=>{
    if (b.type==="text") modalContent.innerHTML += `<p style="color:#111;margin:8px 0">${b.text}</p>`;
    else if (b.type==="image") modalContent.innerHTML += `<img src="${b.url}" style="width:100%;margin:8px 0;border-radius:8px">`;
  });
  modal.style.display = "flex";
}
modal.onclick = (e)=> { if (e.target === modal) modal.style.display = "none"; }

// init
await loadBanners();
