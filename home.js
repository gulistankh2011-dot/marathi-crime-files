// home.js
import { ADMIN_EMAIL, doGoogleLogin, doSignOut, onAuth, uploadFile, listBanners, addBannerImage, db } from "./app.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let allNews = [];
let displayedCount = 0;
const BATCH = 6;
let bannerList = [];

// Auth UI
loginBtn.onclick = async ()=> { try { await doGoogleLogin(); } catch(e){ alert(e.message) } };
logoutBtn.onclick = async ()=> { try { await doSignOut(); } catch(e){ alert(e.message) } };

onAuth(user=>{
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

// banners
async function loadBanners(){
  try {
    const arr = await listBanners();
    bannerList = arr.map(a=>a.url);
  } catch(e){ console.warn(e) }
  if (!bannerList.length){
    bannerList = [
      "https://via.placeholder.com/1400x500?text=Marathi+Crime+Files+Banner+1",
      "https://via.placeholder.com/1400x500?text=Banner+2"
    ];
  }
  renderBanner();
}
function renderBanner(){
  bannerWrap.innerHTML = "";
  bannerDots.innerHTML = "";
  bannerList.forEach((url, idx)=>{
    const img = document.createElement("img");
    img.src = url;
    img.style.display = idx===0 ? "block" : "none";
    bannerWrap.appendChild(img);
    const d = document.createElement("div");
    d.className = "banner-dot" + (idx===0 ? " active" : "");
    d.onclick = ()=>switchSlide(idx);
    bannerDots.appendChild(d);
  });
  let current = 0;
  setInterval(()=> {
    const imgs = bannerWrap.querySelectorAll("img");
    if (!imgs.length) return;
    current = (current + 1) % imgs.length;
    imgs.forEach((im,i)=> im.style.display = i===current ? "block" : "none");
    const dots = bannerDots.querySelectorAll(".banner-dot");
    dots.forEach((dt,i)=> dt.classList.toggle("active", i===current));
  }, 4000);
}
function switchSlide(i){ const imgs = bannerWrap.querySelectorAll("img"); imgs.forEach((im,idx)=> im.style.display = idx===i ? "block" : "none"); const dots = bannerDots.querySelectorAll(".banner-dot"); dots.forEach((dt,idx)=> dt.classList.toggle("active", idx===i)); }

// tickers (listen to settings docs)
const noticeRef = docRef(db,"settings","notice");
const breakingRef = docRef(db,"settings","breaking");
import { doc as docRef, getDoc, onSnapshot as onSnap } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
onSnap(noticeRef, snap=>{
  if (snap.exists()) noticeTick.textContent = snap.data().text || "No notice";
  else noticeTick.textContent = "No notice";
});
onSnap(breakingRef, snap=>{
  if (snap.exists()) {
    const data = snap.data();
    if (data.items && data.items.length) breakingTick.textContent = data.items.join("  —  ");
    else breakingTick.textContent = "Latest headlines will appear here.";
  } else breakingTick.textContent = "Latest headlines will appear here.";
});

// news: subscribe and paginate in-memory
const newsCol = collection(db,"news");
onSnapshot(query(newsCol, orderBy("time","desc")), snap=>{
  allNews = snap.docs.map(d=>({ id: d.id, ...d.data() }));
  displayedCount = 0;
  postsEl.innerHTML = "";
  loadBatch();
});

function loadBatch(){
  const next = allNews.slice(displayedCount, displayedCount + BATCH);
  next.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    const img = item.blocks.find(b=>b.type==="image")?.url || "https://via.placeholder.com/600x400?text=No+Image";
    const text = item.blocks.find(b=>b.type==="text")?.text?.substring(0,120) || "";
    card.innerHTML = `<img src="${img}"><h3>${item.title}</h3><p>${text}</p>`;
    card.onclick = ()=> openPostModal(item);
    postsEl.appendChild(card);
  });
  displayedCount += next.length;
  if (displayedCount >= allNews.length) loaderEl.textContent = "No more news";
  else loaderEl.textContent = "Scroll to load more";
}

window.addEventListener("scroll", ()=>{
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 140) {
    if (displayedCount < allNews.length) loadBatch();
  }
});

// modal
function openPostModal(item){
  modalContent.innerHTML = `<h2 style="margin:0 0 8px">${item.title}</h2>`;
  item.blocks.forEach(b=>{
    if (b.type==="text") modalContent.innerHTML += `<p style="color:#111;margin:8px 0">${b.text}</p>`;
    else if (b.type==="image") modalContent.innerHTML += `<img src="${b.url}" style="width:100%;margin:8px 0;border-radius:8px">`;
  });
  modal.style.display = "flex";
}
modal.onclick = (e)=> { if (e.target === modal) modal.style.display = "none"; }

// init
await loadBanners();
