/* "Ask about me" chat.
   Mode 1 — AI: sends the conversation to the Cloudflare Worker (data.js → chat.endpoint), streams the answer.
   Mode 2 — Quick answers: no AI; matches the question to facts in data.js + scores.json. Used when no endpoint
   is set, or automatically if the AI is unavailable (offline, daily limit reached). */
(function () {
  "use strict";
  var D = window.PORTFOLIO, P = D.profile, C = D.chat || {};
  var ENDPOINT = C.endpoint || "";
  var SCORES = {};
  var history = []; // {role, content}
  var busy = false;

  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var host = function (u) { return u.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, ""); };
  var slug = function (u) { return host(u).replace(/[^a-z0-9]+/gi, "-").toLowerCase(); };
  var cat = {}; D.categories.forEach(function (c) { cat[c.id] = c.label; });
  var first = P.name.split(" ")[0];

  fetch("scores.json").then(function (r) { return r.ok ? r.json() : {}; }).then(function (s) { SCORES = s || {}; }).catch(function () {});

  /* ---------------- markup ---------------- */
  var spark = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z"/></svg>';
  var wrap = document.createElement("div");
  wrap.innerHTML =
    '<button class="ask-fab" id="ask-fab" type="button" aria-haspopup="dialog" aria-controls="ask-panel">' + spark + "<span>Ask about me</span></button>" +
    '<section class="ask-panel" id="ask-panel" role="dialog" aria-label="Ask about ' + esc(first) + '" hidden>' +
    '  <header class="ask-head"><div class="ask-ava">' + esc(first[0]) + "</div><div><b>Ask about " + esc(first) + '</b><small id="ask-mode"></small></div>' +
    '    <button class="ask-x" id="ask-close" type="button" aria-label="Close chat">✕</button></header>' +
    '  <div class="ask-log" id="ask-log" aria-live="polite"></div>' +
    '  <div class="ask-chips" id="ask-chips"></div>' +
    '  <form class="ask-form" id="ask-form"><label class="sr" for="ask-input">Your question</label>' +
    '    <input id="ask-input" type="text" maxlength="500" autocomplete="off" placeholder="Ask about skills, projects, experience…">' +
    '    <button type="submit" aria-label="Send">↑</button></form>' +
    "</section>";
  document.body.appendChild(wrap);
  var $ = function (id) { return document.getElementById(id); };
  var panel = $("ask-panel"), log = $("ask-log"), input = $("ask-input");

  function setMode(ai) {
    $("ask-mode").innerHTML = ai ? '<i class="ask-dot ai"></i>AI answers from my CV and projects' : '<i class="ask-dot"></i>Quick answers from my CV and projects';
  }
  setMode(!!ENDPOINT);

  /* ---------------- rendering ---------------- */
  function md(text) {
    var out = [], list = false;
    esc(text).split("\n").forEach(function (line) {
      var l = line.trim();
      var item = /^[-•*]\s+/.test(l);
      if (item && !list) { out.push("<ul>"); list = true; }
      if (!item && list) { out.push("</ul>"); list = false; }
      if (!l) return;
      l = l.replace(/^[-•*]\s+/, "");
      l = l.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
      l = l.replace(/(https?:\/\/[^\s<)]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      l = l.replace(/(^|[\s(])((?:[a-z0-9-]+\.)+(?:com|co\.uk|uk|ae|net|org|io))(?=[\s).,;:]|$)/gi, '$1<a href="https://$2" target="_blank" rel="noopener">$2</a>');
      l = l.replace(new RegExp(esc(P.email).replace(/\./g, "\\."), "g"), '<a href="mailto:' + esc(P.email) + '">' + esc(P.email) + "</a>");
      out.push(item ? "<li>" + l + "</li>" : "<p>" + l + "</p>");
    });
    if (list) out.push("</ul>");
    return out.join("");
  }
  function bubble(role, html) {
    var el = document.createElement("div");
    el.className = "ask-msg " + role;
    el.innerHTML = html;
    log.appendChild(el); log.scrollTop = log.scrollHeight;
    return el;
  }
  function chips(list) {
    $("ask-chips").innerHTML = (list || []).map(function (q) { return '<button type="button">' + esc(q) + "</button>"; }).join("");
  }
  $("ask-chips").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) ask(b.textContent); });

  /* ---------------- quick answers (no AI) ---------------- */
  var proj = D.projects;
  var scoreOf = function (p) { return SCORES[slug(p.url)]; };
  var bullet = function (p) {
    var s = scoreOf(p);
    return "- **" + p.name + "** — " + host(p.url) + (p.status !== "live" ? " (" + (p.status === "building" ? "in progress" : "staging") + ")" : "") + (s ? " · speed " + s.performance + "/100" : "");
  };
  var has = function (q, words) { return words.some(function (w) { return q.indexOf(w) > -1; }); };
  var CATWORDS = {
    finance: ["account", "finance", "tax", "bookkeep", "advis", "consult"],
    retail: ["fashion", "cloth", "garment", "ecommerce", "e-commerce", "store", "shop", "retail"],
    beauty: ["beauty", "salon", "hair", "wellness", "spa"],
    food: ["food", "restaurant", "burger", "butcher", "hospitality", "cafe"],
    build: ["construct", "builder", "build company", "window", "curtain", "renovat", "home improvement"],
    services: ["education", "study", "energy", "tyre", "repair", "phone"],
  };

  function quick(raw) {
    var q = " " + raw.toLowerCase().replace(/[?!.]/g, " ") + " ";
    var live = proj.filter(function (p) { return p.status === "live"; });

    // a specific project by name or domain
    var named = proj.filter(function (p) {
      var n = p.name.toLowerCase().replace(/\(.*\)/, "").trim(), h = host(p.url).split(".")[0];
      return q.indexOf(n) > -1 || (h.length > 4 && q.indexOf(h) > -1);
    });
    if (named.length === 1) {
      var p = named[0], s = scoreOf(p);
      return "**" + p.name + "** (" + host(p.url) + ") — " + cat[p.cat] + ".\n" + p.desc +
        (p.did ? "\nWhat " + first + " did:\n" + p.did.map(function (d) { return "- " + d; }).join("\n") : "") +
        "\nBuilt with " + p.tech.join(", ") + "." +
        (s ? "\nGoogle Lighthouse: performance **" + s.performance + "**, SEO **" + s.seo + "**, accessibility **" + s.accessibility + "**." : "");
    }

    if (has(q, ["salary", "rate", "price", "cost", "charge", "budget", "notice period", "pay "]))
      return first + " discusses rates and terms directly. Email " + P.email + " or message him on LinkedIn. For a rough build timeline, try the **Plan a website** tool on this page.";

    if (has(q, ["woocommerce", "woo ", "online store", "ecommerce", "e-commerce", "shop", "cart", "checkout", "payment"])) {
      var woo = proj.filter(function (p) { return p.tech.indexOf("WooCommerce") > -1 || p.cat === "retail"; });
      return "Yes. " + first + " has built WooCommerce stores, including product catalogues, categories, cart and checkout, and payment gateway setup. Retail and e-commerce work:\n" + woo.map(bullet).join("\n");
    }
    if (has(q, ["fast", "speed", "performance", "lighthouse", "score", "quick"])) {
      var sc = proj.filter(scoreOf).sort(function (a, b) { return scoreOf(b).performance - scoreOf(a).performance; });
      if (!sc.length) return "Every site is tested weekly with Google Lighthouse. Open any project card to see its speed, SEO and accessibility scores.";
      var arr = sc.map(function (p) { return scoreOf(p).performance; }).sort(function (a, b) { return a - b; });
      return "His fastest sites on Google Lighthouse (desktop):\n" + sc.slice(0, 5).map(bullet).join("\n") + "\nThe median score across " + sc.length + " sites is **" + arr[Math.floor(arr.length / 2)] + "/100**, re-tested every week.";
    }
    if (has(q, [" seo", "google rank", "search engine"])) {
      var seo = proj.filter(scoreOf).sort(function (a, b) { return scoreOf(b).seo - scoreOf(a).seo; }).slice(0, 5);
      return "SEO is part of every build: page structure, headings, metadata and speed. Top SEO scores:\n" + seo.map(function (p) { return "- **" + p.name + "** — SEO " + scoreOf(p).seo + "/100"; }).join("\n");
    }
    for (var c in CATWORDS) {
      if (has(q, CATWORDS[c]) && !has(q, ["experience", "skill"])) {
        var list = proj.filter(function (p) { return p.cat === c; });
        return first + " has built " + list.length + " " + cat[c].toLowerCase() + " websites:\n" + list.map(bullet).join("\n");
      }
    }
    if (has(q, [" code ", "github", " lab ", "javascript project", "calculator", "side project"]))
      return D.lab.map(function (l) { return "- **" + l.name + "** — " + l.desc + " " + l.url; }).join("\n");
    if (has(q, ["available", "hire", "hiring", "freelance", "open to", "looking", "remote", "relocat"]))
      return first + " is **" + P.available.toLowerCase() + "**. He's based in " + P.location + " and works with UK clients remotely. Reach him at " + P.email + " or on LinkedIn.";
    if (has(q, ["experience", "work history", "job", "employ", "worked", "career", "background", "years"]))
      return D.experience.filter(function (x) { return !x.edu; }).map(function (x) { return "- **" + x.role + "**, " + x.org + " (" + x.when + "): " + x.points.slice(0, 3).join("; ") + "."; }).join("\n") +
        "\nHe has built " + proj.length + " websites so far, " + live.length + " of them live.";
    if (has(q, ["educat", "degree", "university", "study", "studied", "qualif"])) {
      var e = D.experience.filter(function (x) { return x.edu; })[0];
      return e ? "**" + e.role + "**, " + e.org + " (" + e.when + "). Core areas: " + e.points.join(", ") + "." : "Education details are in his CV.";
    }
    var OTHER = ["react", "vue", "angular", "next.js", "nextjs", "laravel", "shopify", "wix", "squarespace", "webflow", "node", "python", "django", "typescript", "tailwind", "bootstrap", "figma", "photoshop", "divi", "magento", "drupal", "joomla", "flutter", "java ", "c#", ".net", "aws", "docker"];
    var known = D.skills.reduce(function (a, g) { return a.concat(g.items.map(function (i) { return i.toLowerCase(); })); }, []);
    var asked = OTHER.filter(function (t) { return q.indexOf(t) > -1 && known.indexOf(t.trim()) < 0; });
    if (asked.length) {
      var nm = asked.map(function (t) { return t.trim().replace(/^./, function (c) { return c.toUpperCase(); }); }).join(" or ");
      return nm + (asked.length > 1 ? " aren't" : " isn't") + " listed in " + first + "'s skills. His main stack is " + D.skills.map(function (g) { return g.items.join(", "); }).join("; ") +
        ". If your role needs " + nm + ", ask him directly at " + P.email + ". He may have experience that isn't on the portfolio.";
    }
    if (has(q, ["skill", "tech", "stack", "know", "tools", "php", "javascript", "html", "css", "mysql", "elementor", "wordpress"]))
      return D.skills.map(function (g) { return "- **" + g.group + ":** " + g.items.join(", "); }).join("\n") +
        "\nEvery site here is built with WordPress and Elementor, and he also writes custom HTML, CSS and JavaScript (see the Lab section).";
    if (has(q, ["contact", "email", "reach", "phone", "whatsapp", "linkedin", "call", "message", "cv", "resume"]))
      return "- Email: " + P.email + "\n- WhatsApp: " + P.phone + "\n- LinkedIn: " + P.linkedin + "\n- GitHub: " + P.github + "\nHis CV is in the Contact section as a PDF.";
    if (has(q, ["where", "location", "based", "country", "city", "timezone", "time zone"]))
      return first + " is based in " + P.location + " (Pakistan time, UTC+5) and works with clients in the UK and UAE.";
    if (has(q, ["language", "urdu", "english", "speak"]))
      return first + " speaks " + D.languages.join(" and ") + ".";
    if (has(q, ["how many", "number of", "count", "projects", "websites", "portfolio", "work"]))
      return first + " has built **" + proj.length + " websites** (" + live.length + " live) across " + D.categories.length + " industries:\n" +
        D.categories.map(function (c) { return "- " + c.label + ": " + proj.filter(function (p) { return p.cat === c.id; }).length; }).join("\n");
    if (has(q, [" hi ", "hello", "hey", "salam", "assalam"]))
      return "Hi! I can tell you about " + first + "'s experience, skills and the " + proj.length + " websites he's built. What would you like to know?";
    if (has(q, ["who is", "about him", "tell me about", "introduce", "summary"]))
      return "**" + P.name + "** is a " + P.role + " in " + P.location + ". " + P.summary.replace(/\bI\b/g, "He").replace(/\bmy\b/g, "his").replace(/I care/, "He cares") ;
    return "I don't have a quick answer for that. I can tell you about " + first + "'s experience, skills, WooCommerce work, his fastest sites, or the websites he's built in a particular industry. For anything else, email " + P.email + ".";
  }

  /* ---------------- AI (streaming) ---------------- */
  function askAI(el) {
    return fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.slice(-7) }) })
      .then(function (res) {
        if (!res.ok || !res.body) throw new Error("status " + res.status);
        var reader = res.body.getReader(), dec = new TextDecoder(), buf = "", text = "";
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) return text;
            buf += dec.decode(r.value, { stream: true });
            var lines = buf.split("\n"); buf = lines.pop();
            lines.forEach(function (line) {
              line = line.trim();
              if (line.indexOf("data:") !== 0) return;
              var data = line.slice(5).trim();
              if (!data || data === "[DONE]") return;
              try {
                var j = JSON.parse(data);
                var piece = j.response != null ? j.response : (j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content) || "";
                text += piece;
              } catch (e) {}
            });
            el.innerHTML = md(text) || '<span class="ask-typing"><i></i><i></i><i></i></span>';
            log.scrollTop = log.scrollHeight;
            return pump();
          });
        }
        return pump();
      })
      .then(function (text) { if (!text.trim()) throw new Error("empty"); return text; });
  }

  function ask(q) {
    q = String(q || "").trim().slice(0, 500);
    if (!q || busy) return;
    busy = true; input.value = ""; chips([]);
    bubble("user", esc(q));
    history.push({ role: "user", content: q });
    var el = bubble("bot", '<span class="ask-typing"><i></i><i></i><i></i></span>');
    var done = function (text, ai) {
      history.push({ role: "assistant", content: text });
      el.innerHTML = md(text);
      setMode(ai); busy = false; log.scrollTop = log.scrollHeight;
      chips(follow(q));
      input.focus();
    };
    if (ENDPOINT) {
      askAI(el).then(function (t) { done(t, true); }).catch(function () { done(quick(q), false); });
    } else {
      setTimeout(function () { done(quick(q), false); }, 350);
    }
  }

  // suggest questions not asked yet
  function follow(last) {
    var asked = history.filter(function (m) { return m.role === "user"; }).map(function (m) { return m.content; });
    return (C.questions || []).filter(function (x) { return asked.indexOf(x) < 0 && x !== last; }).slice(0, 3);
  }

  /* ---------------- open / close ---------------- */
  var greeted = false;
  function open() {
    panel.hidden = false; $("ask-fab").setAttribute("aria-expanded", "true"); $("ask-fab").classList.add("on");
    if (!greeted) {
      greeted = true;
      bubble("bot", md("Hi! I'm " + first + "'s portfolio assistant. Ask me anything about his experience, skills or the " + proj.length + " websites he's built."));
      chips((C.questions || []).slice(0, 4));
    }
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() { panel.hidden = true; $("ask-fab").setAttribute("aria-expanded", "false"); $("ask-fab").classList.remove("on"); $("ask-fab").focus(); }
  $("ask-fab").addEventListener("click", function () { panel.hidden ? open() : close(); });
  $("ask-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) close(); });
  $("ask-form").addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });

  window.AskMe = { open: open, ask: function (q) { open(); ask(q); }, quick: quick };
})();
