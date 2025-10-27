// admin.js
import { doGoogleLogin, doSignOut, onAuth, ADMIN_EMAIL, uploadFile, addBannerImage, addNews, setNotice, listBanners, deleteNews } from "./app.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const addNewsBtn = document.getElementById("addNewsBtn");
const uploadBannerBtn = document.getElementById("uploadBannerBtn");
const saveBreaking = document.getElementById("saveBreaking");
const saveNotice = document.getElementById("saveNotice");

const titleEl = document.getElementById("title");
const categoryEl = document.getElementById("category");
const textEl = document.getElementById("text");
const imageFile = document.getElementById("imageFile");
const bannerFile = document.getElementById("bannerFile");
const bannerPreview = document.getElementById("bannerPreview");
const breakingInput = document.getElementById("breakingInput");
const noticeInput = document.getElementById("noticeInput");
const newsList = document.getElementById("newsList");

// auth
loginBtn.onclick = async ()=> { try { await doGoogleLogin(); } catch(e){ alert(e.message) } }
logoutBtn.onclick = async ()=> { try { await doSignOut(); } catch(e){ alert(e.message) } }

onAuth(user=>{
  if (user && user.email === ADMIN_EMAIL) {
    loginBtn.style.display = "none"; logoutBtn.style.display = "inline-block";
    // load existing banners preview
    loadBannersPreview();
  } else {
    loginBtn.style.display = "inline-block"; logoutBtn.style.display = "none";
    alert("You must login as admin.");
  }
});

// upload banner
uploadBannerBtn.onclick = async ()=> {
  if (!bannerFile.files.length) return alert("Choose an image");
  const file = bannerFile.files[0];
  bannerPreview.textContent = "Uploading...";
  try {
    const url = await uploadFile(file, "banners");
    await addBannerImage(url);
    bannerPreview.textContent = "Uploaded";
    loadBannersPreview();
  } catch(e){ alert(e.message) }
};

// add news
addNewsBtn.onclick = async ()=> {
  const title = titleEl.value.trim();
  const category = categoryEl.value.trim() || "general";
  const text = textEl.value.trim();
  if (!title) return alert("Enter title");
  const blocks = [];
  if (text) blocks.push({type:"text", text});
  if (imageFile.files.length) {
    const url = await uploadFile(imageFile.files[0], "news");
    blocks.push({type:"image", url});
  }
  await addNews({title, category, blocks, time:Date.now()});
  titleEl.value = categoryEl.value = textEl.value = ""; imageFile.value = "";
  alert("News added");
};

// save breaking
saveBreaking.onclick = async ()=> {
  const items = breakingInput.value.split(",").map(s=>s.trim()).filter(Boolean);
  if (!items.length) return alert("Add at least one");
  await setDoc(doc((await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js")).getFirestore(),"settings","breaking"), { items, time:Date.now() });
  alert("Breaking saved");
};

// save notice
saveNotice.onclick = async ()=>{
  const t = noticeInput.value.trim();
  if (!t) return alert("Enter notice");
  await setNotice(t);
  noticeInput.value = "";
  alert("Notice saved");
};

// load banners preview
async function loadBannersPreview() {
  bannerPreview.innerHTML = "Loading...";
  const banners = await listBanners();
  bannerPreview.innerHTML = banners.map(b=>`<img src="${b.url}" style="width:120px;height:60px;object-fit:cover;border-radius:6px;margin-right:8px">`).join("");
}

// existing news list + delete
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const db = getFirestore();
const newsCol = collection(db,"news");
onSnapshot(query(newsCol, orderBy("time","desc")), snap=>{
  newsList.innerHTML = "";
  snap.docs.forEach(d=>{
    const data = d.data();
    const div = document.createElement("div");
    div.style = "display:flex;align-items:center;justify-content:space-between;padding:8px;border-bottom:1px solid #eee";
    div.innerHTML = `<div><strong>${data.title}</strong> <small style="color:#444">[${data.category || 'general'}]</small></div>
      <div><button data-id="${d.id}" style="background:#ef4444;color:#fff;padding:6px 8px;border-radius:6px;border:none">Delete</button></div>`;
    newsList.appendChild(div);
    div.querySelector("button").onclick = async ()=> {
      if (!confirm("Delete this news?")) return;
      await deleteNews(d.id);
    };
  });
});
