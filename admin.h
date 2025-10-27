<!-- admin.html -->
<!doctype html>
<html lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin | Marathi Crime Files</title>
<link rel="stylesheet" href="style.css">
<script type="module" defer src="admin.js"></script>
</head>
<body>

<header class="header-bar">
  <div style="display:flex;align-items:center;gap:10px">
    <img src="https://i.postimg.cc/6Q5TYPVR/Whats-App-Image-2025-10-26-at-2-42-16-PM.jpg" alt="logo" class="logo-img">
    <h1 style="margin:0;font-size:18px">Admin Dashboard</h1>
  </div>
  <div style="display:flex;gap:10px">
    <button id="loginBtn" class="auth-btn">Login (Google)</button>
    <button id="logoutBtn" class="auth-btn" style="display:none;background:#ef4444;color:#fff">Logout</button>
    <a href="index.html" class="auth-btn" style="background:#fff;color:#1e40af">View Site</a>
  </div>
</header>

<main class="container" style="padding:14px">
  <section style="background:#fff;padding:12px;border-radius:8px;margin-bottom:12px">
    <h3>Add News</h3>
    <input id="title" placeholder="Title" style="width:100%;padding:8px;margin:8px 0">
    <input id="category" placeholder="Category (crime, story, gumshuda, lawarish)" style="width:100%;padding:8px;margin:8px 0">
    <textarea id="text" placeholder="Text content" style="width:100%;padding:8px;margin:8px 0"></textarea>
    <input id="imageFile" type="file" style="margin-bottom:8px">
    <button id="addNewsBtn" class="auth-btn">Publish News</button>
  </section>

  <section style="background:#fff;padding:12px;border-radius:8px;margin-bottom:12px">
    <h3>Upload Banner Image</h3>
    <input id="bannerFile" type="file" style="margin-bottom:8px">
    <button id="uploadBannerBtn" class="auth-btn">Upload Banner</button>
    <div id="bannerPreview" style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap"></div>
  </section>

  <section style="background:#fff;padding:12px;border-radius:8px;margin-bottom:12px">
    <h3>Breaking News (comma separated)</h3>
    <input id="breakingInput" placeholder="Headline1, Headline2, Headline3" style="width:100%;padding:8px;margin:8px 0">
    <button id="saveBreaking" class="auth-btn">Save Breaking</button>
  </section>

  <section style="background:#fff;padding:12px;border-radius:8px;margin-bottom:12px">
    <h3>Notice</h3>
    <input id="noticeInput" placeholder="Notice text here" style="width:100%;padding:8px;margin:8px 0">
    <button id="saveNotice" class="auth-btn">Save Notice</button>
  </section>

  <section id="existingNews" style="background:#fff;padding:12px;border-radius:8px">
    <h3>Existing News (Delete)</h3>
    <div id="newsList"></div>
  </section>
</main>

</body>
</html>
