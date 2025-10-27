// category.js
import { listBanners } from "./app.js";
import { onAuth } from "./app.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(location.search);
const category = params.get("cat") || "crime";

const bannerWrap = document.getElementById("bannerWrap");
const postsEl = document.getElementById("posts");
const breakingTick = document.getElementById("breakingTick");
const noticeTick = document.getElementById("noticeTick");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const modal = document.getElementById("modal');
const modalContent = document.getElementById("modalContent");

// load banners
async function initBanners(){
  const banners = await listBanners().catch(()=>[]);
  const urls = banners.length ? banners.map(b=>b.url) : [
    "https://via.placeholder.com/1400x500?text=Banner+1",
    "https://via.placeholder.com/1400x500?text=Banner+2"
  ];
  bannerWrap.innerHTML = urls.map((u,i)=>`<img src="${u}" style="display:${i===0?'block':'none'};width:100%;height:100%;object-fit:cover">`).join("");
  // auto switch
  let idx=0; setInterval(()=>{const imgs=bannerWrap.querySelectorAll("img"); idx=(idx+1)%imgs.length; imgs.forEach((im,i)=>im.style.display=i===idx?'block':'none')},4000);
}
initBanners();

// load category news via onSnapshot and filter client-side
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const db = getFirestore();
const newsCol = collection(db,"news");
onSnapshot(query(newsCol, orderBy("time","desc")), snap=>{
  const list = snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=> (p.category||"").toLowerCase()===category.toLowerCase());
  postsEl.innerHTML = "";
  list.forEach(item=>{
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<img src="${item.blocks.find(b=>b.type==='image')?.url || 'https://via.placeholder.com/600x400?text=No+Image'}"><h3>${item.title}</h3><p>${item.blocks.find(b=>b.type==='text')?.text?.substring(0,120) || ''}</p>`;
    card.onclick = ()=>openModal(item);
    postsEl.appendChild(card);
  });
});

function openModal(item){
  modalContent.innerHTML = `<h2>${item.title}</h2>`;
  item.blocks.forEach(b=>{
    if (b.type==='text') modalContent.innerHTML += `<p>${b.text}</p>`;
    else if (b.type==='image') modalContent.innerHTML += `<img src="${b.url}" style="width:100%;margin:8px 0">`;
  });
  modal.style.display = "flex";
}
modal.onclick = (e)=> { if (e.target===modal) modal.style.display = "none"; }
