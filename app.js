/* Portfolio app — renders everything from window.PORTFOLIO (data.js). No framework. */
(function () {
  "use strict";
  var D = window.PORTFOLIO, P = D.profile;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HUE = { finance: "#3046FF", retail: "#E0457B", beauty: "#B44FD6", food: "#E8743B", build: "#2E9E6A", services: "#1E9BC8" };
  var catLabel = {}; D.categories.forEach(function (c) { catLabel[c.id] = c.label; });
  var host = function (u) { return u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, ""); };
  var STATUS = { live: "Live", staging: "Staging", building: "In progress" };
  // must match slug() in tools/screenshots.mjs
  var slug = function (u) { return host(u).replace(/[^a-z0-9]+/gi, "-").toLowerCase(); };

  // Featured first, then live, then the rest
  var order = { live: 0, building: 1, staging: 2 };
  var projects = D.projects.slice().sort(function (a, b) {
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || order[a.status] - order[b.status];
  });

  /* ---------- toast + clipboard ---------- */
  var toastT;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2200); }
  function copy(text, msg) {
    var done = function () { toast(msg || "Copied"); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { toast("Select and copy: " + text); } ta.remove(); }
  }

  /* ---------- screenshots (live via WordPress mShots, with a designed fallback) ---------- */
  function shot(p, w) {
    var h = HUE[p.cat] || "#3046FF";
    var initials = p.name.replace(/[^A-Za-z0-9& ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(function (s) { return s[0]; }).join("");
    return '<div class="fallback" style="--hue:' + h + '"><div class="mono-mark">' + esc(initials) + '</div><div class="fb-lines"><i></i><i></i><i></i></div></div>' +
      '<img alt="Homepage of ' + esc(p.name) + '" loading="lazy" decoding="async" data-src="shots/' + slug(p.url) + '.webp" data-live="https://s.wordpress.com/mshots/v1/' + encodeURIComponent(p.url) + "?w=" + (w || 900) + '&h=' + Math.round((w || 900) * 0.75) + '">';
  }
  // 1) saved screenshot in shots/ (refreshed weekly by GitHub Actions) → 2) live WordPress mShots → 3) designed placeholder
  function loadShots(root) {
    root.querySelectorAll("img[data-src]").forEach(function (img) {
      var local = img.getAttribute("data-src"), live = img.getAttribute("data-live"), stage = 0, tries = 0;
      img.removeAttribute("data-src");
      img.onload = function () {
        if (stage === 0) return img.classList.add("ok");
        // mShots returns a small placeholder while it generates; retry a couple of times
        if (img.naturalWidth < 500 && tries < 2) { tries++; setTimeout(function () { img.src = live + "&r=" + tries; }, 5000); return; }
        if (img.naturalWidth >= 500) img.classList.add("ok");
      };
      img.onerror = function () { if (stage === 0 && live) { stage = 1; img.src = live; } else img.remove(); };
      img.src = local;
    });
  }

  /* ---------- hero ---------- */
  $("#hero-lede").innerHTML = "I'm a <strong>WordPress &amp; Elementor developer</strong> in Islamabad. I've built <strong>" + D.projects.length +
    " websites</strong> for businesses in the UK and UAE: accountants, salons, fashion brands, builders and restaurants.";
  var heroList = projects.filter(function (p) { return p.status === "live"; });
  var hi = 0, typeT, progT;
  function heroShow() {
    var p = heroList[hi % heroList.length];
    $("#hero-shot").innerHTML = shot(p, 1100); loadShots($("#hero-shot"));
    $("#hero-site").textContent = p.name; $("#hero-cat").textContent = "· " + catLabel[p.cat];
    $("#hero-open").onclick = function (e) { e.preventDefault(); openModal(projects.indexOf(p), projects); };
    var h = host(p.url), addr = $("#hero-addr"), i = 0;
    clearInterval(typeT);
    if (reduce) addr.textContent = h; else { addr.textContent = ""; typeT = setInterval(function () { addr.textContent = h.slice(0, ++i); if (i >= h.length) clearInterval(typeT); }, 38); }
    var bar = $("#hero-progress"), start = performance.now(), dur = 5200;
    cancelAnimationFrame(progT);
    (function tick(now) { var k = Math.min(1, (now - start) / dur); bar.style.width = k * 100 + "%"; if (k < 1) progT = requestAnimationFrame(tick); else { hi++; heroShow(); } })(start);
  }
  heroShow();
  $("#hero-browser").addEventListener("mouseenter", function () { cancelAnimationFrame(progT); });
  $("#hero-browser").addEventListener("mouseleave", function () { cancelAnimationFrame(progT); hi++; heroShow(); });

  // status + local time in Islamabad
  function clock() {
    var t; try { t = new Date().toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: P.timezone }); } catch (e) { t = ""; }
    $("#status-text").textContent = P.available + (t ? " · " + t + " in Islamabad" : "");
  }
  clock(); setInterval(clock, 30000);

  // stats
  var live = D.projects.filter(function (p) { return p.status === "live"; }).length;
  var stats = [[D.projects.length, "websites built"], [live, "live right now"], [D.categories.length, "industries"], [new Date().getFullYear() - 2024 + "+", "years building for clients"]];
  $("#stats").innerHTML = stats.map(function (s) { return '<div class="stat"><div class="n" data-n="' + s[0] + '">' + s[0] + '</div><div class="l">' + s[1] + "</div></div>"; }).join("");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; io.disconnect();
        document.querySelectorAll("#stats .n").forEach(function (n) {
          var raw = n.dataset.n, target = parseInt(raw, 10), suf = raw.replace(/\d+/, ""), s = performance.now();
          (function tick(now) { var k = Math.min(1, (now - s) / 900); n.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(tick); })(s);
        });
      });
    });
    io.observe($("#stats"));
  }

  // marquee (doubled for a seamless loop)
  var m = D.projects.map(function (p) { return '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(host(p.url)) + "</a>"; }).join("");
  $("#marquee").innerHTML = m + m.replace(/<a /g, '<a aria-hidden="true" tabindex="-1" ');

  /* ---------- work grid ---------- */
  var filter = "all", query = "", visible = projects;
  function chips() {
    var counts = { all: D.projects.length };
    D.projects.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
    $("#chips").innerHTML = [{ id: "all", label: "All" }].concat(D.categories).map(function (c) {
      return '<button type="button" class="chip" data-f="' + c.id + '" aria-pressed="' + (filter === c.id) + '">' + esc(c.label) + " <span>" + (counts[c.id] || 0) + "</span></button>";
    }).join("");
  }
  function grid() {
    var q = query.toLowerCase().trim();
    visible = projects.filter(function (p) {
      if (filter !== "all" && p.cat !== filter) return false;
      if (!q) return true;
      return (p.name + " " + host(p.url) + " " + catLabel[p.cat] + " " + p.desc + " " + p.tech.join(" ")).toLowerCase().indexOf(q) > -1;
    });
    var g = $("#grid");
    if (!visible.length) { g.innerHTML = '<div class="empty">No projects match "' + esc(query) + '". Try another word, or clear the search.</div>'; return; }
    g.innerHTML = visible.map(function (p, i) {
      return '<button type="button" class="card" data-i="' + i + '" aria-label="' + esc(p.name) + ', open details">' +
        '<div class="chrome"><div class="lights"><i></i><i></i><i></i></div><div class="addr"><span class="host">' + esc(host(p.url)) + "</span></div></div>" +
        '<div class="shot">' + (p.featured ? '<span class="feat">Featured</span>' : "") + shot(p, 700) + "</div>" +
        '<div class="card-body"><div class="card-top"><h3>' + esc(p.name) + '</h3><span class="badge ' + p.status + '">' + STATUS[p.status] + "</span></div>" +
        "<p>" + esc(p.desc) + "</p></div></button>";
    }).join("");
    loadShots(g);
  }
  $("#chips").addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    filter = b.dataset.f; chips(); grid();
  });
  $("#search").addEventListener("input", function (e) { query = e.target.value; grid(); });
  $("#grid").addEventListener("click", function (e) { var c = e.target.closest(".card"); if (c) openModal(+c.dataset.i, visible); });
  chips(); grid();

  /* ---------- modal ---------- */
  var modal = $("#modal"), mList = [], mIdx = 0;
  function openModal(i, list) {
    mList = list; mIdx = i; renderModal();
    if (!modal.open) { if (modal.showModal) modal.showModal(); else modal.setAttribute("open", ""); }
  }
  function renderModal() {
    var p = mList[mIdx];
    modal.innerHTML = '<div class="modal" style="position:relative">' +
      '<button class="iconbtn m-close" type="button" data-act="close" aria-label="Close">✕</button>' +
      '<div class="browser"><div class="chrome"><div class="lights"><i></i><i></i><i></i></div><div class="addr"><span class="lock">●</span><span class="host">' + esc(host(p.url)) + "</span></div></div>" +
      '<div class="shot">' + shot(p, 1200) + "</div></div>" +
      '<div class="m-body"><div><span class="badge ' + p.status + '">' + STATUS[p.status] + '</span></div><h3>' + esc(p.name) + "</h3>" +
      '<div class="mono" style="font-size:13px;color:var(--muted)">' + esc(catLabel[p.cat]) + "</div>" +
      "<p>" + esc(p.desc) + "</p>" +
      (p.did ? '<div><div class="lbl">What I did</div><ul>' + p.did.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul></div>" : "") +
      '<div><div class="lbl">Built with</div><div class="tags">' + p.tech.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + "</div></div>" +
      '<div class="m-actions"><a class="btn primary" href="' + esc(p.url) + '" target="_blank" rel="noopener">Visit site ↗</a>' +
      '<div class="m-nav"><button class="iconbtn" type="button" data-act="prev" aria-label="Previous project">←</button><button class="iconbtn" type="button" data-act="next" aria-label="Next project">→</button></div></div>' +
      '<div class="mono" style="font-size:12px;color:var(--muted)">' + (mIdx + 1) + " / " + mList.length + " · use ← → keys</div></div></div>";
    loadShots(modal);
  }
  modal.addEventListener("click", function (e) {
    if (e.target === modal) return modal.close();
    var a = e.target.closest("[data-act]"); if (!a) return;
    if (a.dataset.act === "close") modal.close();
    if (a.dataset.act === "prev") { mIdx = (mIdx - 1 + mList.length) % mList.length; renderModal(); }
    if (a.dataset.act === "next") { mIdx = (mIdx + 1) % mList.length; renderModal(); }
  });
  document.addEventListener("keydown", function (e) {
    if (!modal.open) return;
    if (e.key === "ArrowLeft") { mIdx = (mIdx - 1 + mList.length) % mList.length; renderModal(); }
    if (e.key === "ArrowRight") { mIdx = (mIdx + 1) % mList.length; renderModal(); }
  });

  /* ---------- lab ---------- */
  var snippets = [
    '<span class="k">const</span> vat = gross - gross / <span class="s">1.2</span>;\n<span class="k">const</span> gp = (sales - cost) / sales;\n<span class="k">const</span> erNI = (pay - <span class="s">5000</span>) * <span class="s">0.15</span>;',
    '<span class="k">const</span> sites = PORTFOLIO.projects\n  .filter(p =&gt; p.status === <span class="s">"live"</span>)\n  .map(renderCard);'
  ];
  $("#lab-list").innerHTML = D.lab.map(function (l, i) {
    return '<a class="lab-card" href="' + esc(l.url) + '" target="_blank" rel="noopener"><div class="code">' + (snippets[i] || "") + "</div><h3>" + esc(l.name) + "</h3><p>" + esc(l.desc) +
      '</p><div class="tags">' + l.tech.map(function (t) { return '<span class="tag">' + esc(t) + "</span>"; }).join("") + '</div><span class="go">View on GitHub →</span></a>';
  }).join("");

  /* ---------- timeline + skills ---------- */
  $("#timeline").innerHTML = D.experience.map(function (x) {
    return '<li class="' + (x.edu ? "edu" : "") + '"><div class="when">' + esc(x.when) + "</div><h3>" + esc(x.role) + '</h3><div class="org">' + esc(x.org) + "</div><ul>" +
      x.points.map(function (pt) { return "<li>" + esc(pt) + "</li>"; }).join("") + "</ul></li>";
  }).join("");
  var used = {}; D.projects.forEach(function (p) { p.tech.forEach(function (t) { used[t] = (used[t] || 0) + 1; }); });
  $("#skills").innerHTML = D.skills.map(function (g) {
    return '<div class="skill-group"><div class="lbl">' + esc(g.group) + "</div>" + g.items.map(function (s) {
      return '<span class="skill">' + esc(s) + (used[s] ? ' <i title="Used in ' + used[s] + ' projects">' + used[s] + " sites</i>" : "") + "</span>";
    }).join("") + "</div>";
  }).join("");
  $("#langs").textContent = "Languages: " + D.languages.join(", ");

  /* ---------- planner ---------- */
  var BASE = { landing: { d: 3, inc: 1, label: "Landing page" }, business: { d: 6, inc: 5, label: "Business website" }, shop: { d: 12, inc: 6, label: "Online shop (WooCommerce)" } };
  var EXTRA = { forms: [0.5, "Contact & lead forms"], seo: [1, "SEO setup"], booking: [2, "Online booking"], blog: [1, "Blog"], tool: [3, "Custom calculator or tool"], lang: [3, "Second language"], content: [3, "Help with content"], speed: [1, "Speed optimisation"] };
  var pType = "business";
  function plan() {
    var b = BASE[pType], pages = +$("#p-pages").value;
    $("#p-pages-out").textContent = pages;
    var extras = Array.prototype.filter.call(document.querySelectorAll("#p-extras input"), function (c) { return c.checked; }).map(function (c) { return c.value; });
    var days = b.d + Math.max(0, pages - b.inc) * 0.6 + extras.reduce(function (s, x) { return s + EXTRA[x][0]; }, 0);
    days = Math.ceil(days);
    var weeks = Math.max(1, Math.round(days / 5));
    $("#p-days").innerHTML = days + " <small>working days · about " + weeks + " week" + (weeks > 1 ? "s" : "") + "</small>";
    var ph = [["Design", 0.3, "#7584FF"], ["Build", 0.5, "#FFB21E"], ["Test & launch", 0.2, "#3DD68C"]];
    $("#p-phases").innerHTML = ph.map(function (x) { return '<i style="flex:' + x[1] + ";background:" + x[2] + '"></i>'; }).join("");
    $("#p-legend").innerHTML = ph.map(function (x) { return '<div><span style="--c:' + x[2] + '">' + x[0] + "</span><b>" + Math.max(1, Math.round(days * x[1])) + " days</b></div>"; }).join("");
    var brief = "Website brief\n-------------\nType: " + b.label + "\nPages: " + pages + "\nExtras: " + (extras.length ? extras.map(function (x) { return EXTRA[x][1]; }).join(", ") : "none") +
      "\nEstimated build: " + days + " working days\n\nAbout my business:\n";
    $("#p-brief").textContent = brief;
    $("#p-send").href = "mailto:" + P.email + "?subject=" + encodeURIComponent("Website project: " + b.label) + "&body=" + encodeURIComponent(brief);
    $("#p-copy").onclick = function () { copy(brief, "Brief copied"); };
  }
  $("#p-type").addEventListener("click", function (e) {
    var o = e.target.closest(".opt"); if (!o) return;
    pType = o.dataset.v; document.querySelectorAll("#p-type .opt").forEach(function (x) { x.setAttribute("aria-pressed", x === o); });
    plan();
  });
  $("#p-pages").addEventListener("input", plan);
  $("#p-extras").addEventListener("change", plan);
  plan();

  /* ---------- contact ---------- */
  var IC = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
    in: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z"/></svg>',
    gh: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.8-.3 2.8 1a9.5 9.5 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>',
    cv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M12 12v6m-3-3 3 3 3-3"/></svg>'
  };
  $("#contact-lede").textContent = "Tell me about your business and what the website needs to do. I usually reply within a day. I'm based in " + P.location + " and work with clients in the UK and worldwide.";
  var contacts = [
    { ic: "mail", k: "Email", v: P.email, act: "Copy", copy: P.email },
    { ic: "chat", k: "WhatsApp", v: P.phone, act: "Chat ↗", href: "https://wa.me/" + P.whatsapp },
    { ic: "in", k: "LinkedIn", v: "zulfiqar-ali-nasir", act: "Open ↗", href: P.linkedin },
    { ic: "gh", k: "GitHub", v: "Zulfiali2", act: "Open ↗", href: P.github },
    { ic: "cv", k: "CV", v: "Download my CV (PDF)", act: "PDF ↓", href: P.cv, dl: true }
  ];
  $("#contact-list").innerHTML = contacts.map(function (c, i) {
    var tag = c.copy ? 'button type="button" data-copy="' + i + '"' : 'a href="' + esc(c.href) + '"' + (c.dl ? " download" : ' target="_blank" rel="noopener"');
    return "<" + tag + ' class="c-item" style="font:inherit;text-align:left;cursor:pointer;width:100%"><span class="ico">' + IC[c.ic] + '</span><span class="t"><small>' + c.k + "</small><b>" + esc(c.v) + '</b></span><span class="act">' + c.act + "</span></" + (c.copy ? "button" : "a") + ">";
  }).join("");
  $("#contact-list").addEventListener("click", function (e) { var b = e.target.closest("[data-copy]"); if (b) copy(contacts[+b.dataset.copy].copy, "Email copied"); });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- theme ---------- */
  function currentTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function toggleTheme() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    toast(next === "dark" ? "Dark theme" : "Light theme");
  }
  $("#theme").addEventListener("click", toggleTheme);

  /* ---------- command palette ---------- */
  var pal = $("#palette"), pin = $("#pal-input"), plist = $("#pal-list"), sel = 0, results = [];
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
  $("#kbd-hint").textContent = isMac ? "⌘K" : "Ctrl K";
  var go = function (id) { return function () { document.getElementById(id).scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }; };
  var commands = [
    { k: "Go to", t: "Work", run: go("work") }, { k: "Go to", t: "Lab", run: go("lab") }, { k: "Go to", t: "Experience and skills", run: go("journey") },
    { k: "Go to", t: "Plan a website", run: go("plan") }, { k: "Go to", t: "Contact", run: go("contact") },
    { k: "Action", t: "Copy my email address", run: function () { copy(P.email, "Email copied"); } },
    { k: "Action", t: "Switch light or dark theme", run: toggleTheme },
    { k: "Action", t: "Open LinkedIn", run: function () { window.open(P.linkedin, "_blank", "noopener"); } },
    { k: "Action", t: "Open GitHub", run: function () { window.open(P.github, "_blank", "noopener"); } },
    { k: "Action", t: "Download CV", run: function () { location.href = P.cv; } }
  ].concat(projects.map(function (p, i) { return { k: "Project", t: p.name, sub: host(p.url), run: function () { openModal(i, projects); } }; }));
  function palRender() {
    var words = pin.value.toLowerCase().split(/\s+/).filter(Boolean);
    results = commands.filter(function (c) { var hay = (c.k + " " + c.t + " " + (c.sub || "")).toLowerCase(); return words.every(function (w) { return hay.indexOf(w) > -1; }); }).slice(0, 40);
    sel = Math.min(sel, Math.max(0, results.length - 1));
    plist.innerHTML = results.length ? results.map(function (c, i) {
      return '<li role="option" data-i="' + i + '" aria-selected="' + (i === sel) + '"><span class="k">' + c.k + "</span>" + esc(c.t) + (c.sub ? "<small>" + esc(c.sub) + "</small>" : "") + "</li>";
    }).join("") : '<li style="color:var(--muted);cursor:default">Nothing found</li>';
    var a = plist.querySelector('[aria-selected="true"]'); if (a) a.scrollIntoView({ block: "nearest" });
  }
  function palOpen() { if (modal.open) modal.close(); pin.value = ""; sel = 0; palRender(); if (pal.showModal) pal.showModal(); else pal.setAttribute("open", ""); pin.focus(); }
  function palRun(i) { var c = results[i]; if (!c) return; pal.close(); setTimeout(c.run, 10); }
  $("#open-palette").addEventListener("click", palOpen);
  pin.addEventListener("input", function () { sel = 0; palRender(); });
  pin.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(results.length - 1, sel + 1); palRender(); }
    if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); palRender(); }
    if (e.key === "Enter") { e.preventDefault(); palRun(sel); }
  });
  plist.addEventListener("click", function (e) { var li = e.target.closest("[data-i]"); if (li) palRun(+li.dataset.i); });
  pal.addEventListener("click", function (e) { if (e.target === pal) pal.close(); });
  document.addEventListener("keydown", function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); pal.open ? pal.close() : palOpen(); }
    else if (e.key === "/" && !typing && !pal.open) { e.preventDefault(); palOpen(); }
  });
})();
