/* ============================================================
   PALCOS INVISÍVEIS — comportamento do site
   ➜ CONFIGURAÇÃO: preencha os contatos abaixo (só números, com DDI+DDD).
     Exemplo de WhatsApp: "5511999999999"
   ============================================================ */
const CONFIG = {
  instagramNourrant: "nourrant_", // usuário do Instagram, sem @ (ex.: "nomeartistico")
  whatsappNourrant: "5511954318164",   // WhatsApp autorizado do Nourrant
  whatsappProjeto:  "5586988862416",   // WhatsApp do projeto (inscrição de artistas e dúvidas)
  emailProjeto:     ""    // opcional: e-mail do projeto (usado se não houver WhatsApp)
};

(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- cabeçalho + menu ---------- */
  const header = $("#top-header");
  const onScroll = () => header && header.classList.toggle("solid", window.scrollY > 40);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  const burger = $(".burger");
  if (burger) {
    const setMenu = (open) => {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
    $$("#nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
  }


  window.__piLoader = true; /* avisa a página que este código está atualizado */
  /* ---------- primeira dobra primeiro ----------
     As imagens de baixo (data-src) só são liberadas depois que a foto
     principal terminou. A partir daí o próprio navegador cuida do resto
     com loading="lazy" — funciona em Chrome, Safari, Firefox e Samsung. */
  (function () {
    const imgs = $$("img[data-src]").filter(i => !i.closest(".cine-slide, .cine-thumbs"));
    let started = false;
    const start = () => {
      if (started) return; started = true;
      imgs.forEach(i => {
        if (!i.hasAttribute("loading")) i.loading = "lazy";
        if (i.dataset.srcset) { i.srcset = i.dataset.srcset; delete i.dataset.srcset; }
        i.src = i.dataset.src; delete i.dataset.src;
      });
    };
    const hero = $('img[fetchpriority="high"]');
    if (!hero || hero.complete) start();
    else { hero.addEventListener("load", start, { once: true }); hero.addEventListener("error", start, { once: true }); }
    window.addEventListener("load", start, { once: true });
    setTimeout(start, 3000);
  })();

  /* ---------- revelar ao rolar ---------- */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add("in"));

  /* ---------- busca e filtros de artistas ---------- */
  const cards = $$(".card[data-cat]");
  if (cards.length) {
    const input = $("#q"), count = $("#count"), empty = $("#empty");
    const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
    let cat = "todos";
    const apply = () => {
      const q = norm(input ? input.value : "");
      let n = 0;
      cards.forEach(c => {
        const ok = (cat === "todos" || c.dataset.cat === cat) && (!q || norm(c.dataset.search || c.textContent).includes(q));
        c.classList.toggle("hidden", !ok);
        if (ok) n++;
      });
      if (count) count.textContent = n === 1 ? "1 perfil" : n + " perfis";
      if (empty) empty.classList.toggle("show", n === 0);
    };
    $$(".filter").forEach(b => b.addEventListener("click", () => {
      $$(".filter").forEach(x => x.classList.remove("active"));
      b.classList.add("active"); cat = b.dataset.filter; apply();
    }));
    if (input) input.addEventListener("input", apply);
  }

  /* ---------- contato (WhatsApp / e-mail / aviso) ---------- */
  const dlg = $("#contact-dialog");
  const MSG = {
    nourrant: { name: "Nourrant", wa: () => CONFIG.whatsappNourrant,
      text: "Olá, Nourrant! Vi seu perfil na plataforma Palcos Invisíveis!",
      soon: "O WhatsApp autorizado de Nourrant ainda não foi cadastrado. Assim que o número for informado, este botão abrirá a conversa diretamente com o artista." },
    projeto: { name: "o projeto", wa: () => CONFIG.whatsappProjeto,
      text: "Olá! quero fazer parte da plataforma Palcos Invisíveis e mostrar meu trabalho para o mundo!",
      soon: "O canal de inscrição de artistas ainda não foi configurado. Em breve, este botão abrirá uma conversa direta com a equipe do projeto." }
  };
  const openDialog = (title, text) => {
    if (!dlg) { alert(text); return; }
    $("#dlg-title", dlg).textContent = title; $("#dlg-text", dlg).textContent = text;
    typeof dlg.showModal === "function" ? dlg.showModal() : dlg.setAttribute("open", "");
  };
  $$("[data-contact]").forEach(el => el.addEventListener("click", e => {
    e.preventDefault();
    const m = MSG[el.dataset.contact]; if (!m) return;
    const num = (m.wa() || "").replace(/\D/g, "");
    if (num) { window.open("https://wa.me/" + num + "?text=" + encodeURIComponent(m.text), "_blank", "noopener"); return; }
    if (el.dataset.contact === "projeto" && CONFIG.emailProjeto) {
      location.href = "mailto:" + CONFIG.emailProjeto + "?subject=" + encodeURIComponent("Quero participar do Palcos Invisíveis") + "&body=" + encodeURIComponent(m.text); return;
    }
    openDialog("Contato em breve", m.soon);
  }));
  if (dlg) {
    $$("[data-close]", dlg).forEach(b => b.addEventListener("click", () => dlg.close ? dlg.close() : dlg.removeAttribute("open")));
    dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- Instagram do artista ---------- */
  $$('[data-instagram="nourrant"]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    const handle = (CONFIG.instagramNourrant || '').trim().replace(/^@/, '');
    if (/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
      window.open('https://www.instagram.com/' + handle + '/', '_blank', 'noopener,noreferrer');
    } else {
      openDialog('Instagram em breve', 'O perfil oficial do Instagram de Nourrant ainda não foi informado.');
    }
  }));

  /* ---------- vídeo (carrega o player só ao clicar) ---------- */
  const vbox = $("#video-box");
  if (vbox) {
    const poster = $(".video-poster", vbox);
    poster.addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + vbox.dataset.yt + "?autoplay=1&rel=0";
      f.title = "Vídeo de Nourrant";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.referrerPolicy = "strict-origin-when-cross-origin"; f.allowFullscreen = true;
      vbox.appendChild(f); poster.remove();
    });
  }

  /* ---------- carrossel cinema + lightbox ---------- */
  const root = $("#cine");
  if (!root) return;
  const slides = $$(".cine-slide", root), N = slides.length;
  const capBox = $(".cap", root), chEl = $(".ch", capBox), capTxt = $("p", capBox), curEl = $(".cine-num .cur", root);
  const prog = $(".cine-progress", root), thumbsEl = $(".cine-thumbs", root);
  const playBtn = $("[data-play]", root), playLbl = $("span", playBtn), playUse = $("use", playBtn);
  const pad = n => String(n).padStart(2, "0");
  let cur = -1, playing = false, userStopped = false, visible = false, swapT;

  slides.forEach((s, i) => {
    const img = $("img", s), thumb = img.dataset.src || img.getAttribute("src");
    const bg = document.createElement("div"); bg.className = "cine-bg";
    bg.dataset.bg = thumb; s.prepend(bg); /* fundo só carrega quando o carrossel chega perto da tela */
    s.setAttribute("aria-label", "Fotografia " + (i + 1) + " de " + N + ": " + s.dataset.caption);
    const b = document.createElement("button"); b.type = "button";
    b.setAttribute("aria-label", "Ir para a fotografia " + (i + 1));
    if (s.classList.contains("portrait")) b.className = "portrait";
    const t = document.createElement("img"); t.dataset.src = thumb; t.alt = ""; b.appendChild(t);
    b.addEventListener("click", () => { go(i); stopAuto(true); });
    thumbsEl.appendChild(b);
  });
  const tbtns = [...thumbsEl.children];

  /* o carrossel só começa a baixar fotos quando está chegando na tela,
     para não disputar a internet com a primeira dobra */
  let near = !("IntersectionObserver" in window);
  /* cada foto do carrossel mostra a miniatura na hora e troca pela versão grande quando ela chegar */
  const showThumbs = () => slides.forEach(s => { const im = $("img", s); if (im.dataset.src) { if ((im.getAttribute("src") || "").startsWith("data:")) im.src = im.dataset.src; delete im.dataset.src; } });
  const loadThumbs = () => $$("img[data-src]", thumbsEl).forEach(t => { t.src = t.dataset.src; delete t.dataset.src; });
  const load = i => {
    if (!near) return;
    const s = slides[(i + N) % N], img = $("img", s), f = img.dataset.full, bg = $(".cine-bg", s);
    if (bg && bg.dataset.bg) { bg.style.backgroundImage = 'url("' + bg.dataset.bg + '")'; delete bg.dataset.bg; }
    if (f && img.getAttribute("src") !== f) img.src = f;
  };
  if (near) { showThumbs(); loadThumbs(); }
  const wake = () => { if (near) return; near = true; showThumbs(); load(cur); load(cur + 1); load(cur - 1); loadThumbs(); };
  if (!near) {
    const nio = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { nio.disconnect(); wake(); } }, { rootMargin: "600px 0px" });
    nio.observe(root);
    window.addEventListener("load", () => setTimeout(wake, 1500), { once: true });
  }
  const restartProgress = () => {
    prog.classList.remove("run", "static"); void prog.offsetWidth;
    if (playing) prog.classList.add("run");
    else { prog.classList.add("static"); prog.style.setProperty("--p", (cur + 1) / N); }
  };
  function go(n) {
    n = (n + N) % N; if (n === cur) return; cur = n;
    slides.forEach((s, i) => { s.classList.toggle("on", i === cur); s.setAttribute("aria-hidden", i === cur ? "false" : "true"); });
    load(cur); load(cur + 1); load(cur - 1);
    tbtns.forEach((b, i) => { b.classList.toggle("on", i === cur); b.setAttribute("aria-current", i === cur ? "true" : "false"); });
    const tb = tbtns[cur];
    thumbsEl.scrollTo({ left: tb.offsetLeft - (thumbsEl.clientWidth - tb.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    clearTimeout(swapT); capBox.classList.add("swap");
    swapT = setTimeout(() => {
      chEl.textContent = slides[cur].dataset.chapter; capTxt.textContent = slides[cur].dataset.caption;
      curEl.textContent = pad(cur + 1); capBox.classList.remove("swap");
    }, cur === 0 && !capTxt.textContent ? 0 : 260);
    restartProgress();
  }
  function setPlaying(v) {
    playing = v; playBtn.setAttribute("aria-pressed", v);
    playLbl.textContent = v ? "Pausar" : "Reproduzir";
    playUse.setAttribute("href", v ? "#i-pause" : "#i-play");
    restartProgress();
  }
  function stopAuto(byUser) { if (byUser) userStopped = true; if (playing) setPlaying(false); }
  prog.addEventListener("animationend", () => { if (playing) go(cur + 1); });
  playBtn.addEventListener("click", () => { if (playing) stopAuto(true); else { userStopped = false; setPlaying(true); } });
  $(".prev", root).addEventListener("click", () => { go(cur - 1); stopAuto(true); });
  $(".next", root).addEventListener("click", () => { go(cur + 1); stopAuto(true); });
  root.addEventListener("keydown", e => {
    const k = e.key;
    if (k === "ArrowLeft") { e.preventDefault(); go(cur - 1); stopAuto(true); }
    else if (k === "ArrowRight") { e.preventDefault(); go(cur + 1); stopAuto(true); }
    else if (k === "Home") { e.preventDefault(); go(0); stopAuto(true); }
    else if (k === "End") { e.preventDefault(); go(N - 1); stopAuto(true); }
  });
  const stage = $(".cine-stage", root); let tx = null, ty = null;
  stage.addEventListener("touchstart", e => { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, { passive: true });
  stage.addEventListener("touchend", e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { go(cur + (dx < 0 ? 1 : -1)); stopAuto(true); }
  }, { passive: true });
  if ("IntersectionObserver" in window && !reduce) {
    new IntersectionObserver(es => es.forEach(e => {
      visible = e.isIntersecting;
      if (visible && !userStopped && !playing) setPlaying(true);
      else if (!visible && playing) setPlaying(false);
    }), { threshold: 0.5 }).observe(stage);
  }

  /* lightbox */
  const lb = $("#lightbox"), lbImg = $("img", lb), lbCap = $(".lb-cap", lb);
  let lbI = 0, lastFocus = null;
  const lbShow = () => {
    const s = slides[lbI], im = $("img", s);
    lbImg.src = im.dataset.full || im.src; lbImg.alt = im.alt;
    lbCap.innerHTML = ""; const sm = document.createElement("small"); sm.textContent = s.dataset.chapter + " · " + pad(lbI + 1) + " / " + N;
    lbCap.append(sm, s.dataset.caption);
  };
  const lbOpen = i => {
    lbI = i; lastFocus = document.activeElement; lbShow(); lb.classList.add("show");
    document.body.style.overflow = "hidden"; stopAuto(true); $(".lb-close", lb).focus();
  };
  const lbClose = () => { lb.classList.remove("show"); document.body.style.overflow = ""; go(lbI); if (lastFocus) lastFocus.focus(); };
  const lbStep = d => { lbI = (lbI + d + N) % N; lbShow(); };
  $("[data-expand]", root).addEventListener("click", () => lbOpen(cur));
  slides.forEach((s, i) => $("img", s).addEventListener("click", () => { if (i === cur) lbOpen(i); }));
  $("img", lb) && lb.addEventListener("click", e => { if (e.target === lb) lbClose(); });
  $(".lb-close", lb).addEventListener("click", lbClose);
  $(".lb-prev", lb).addEventListener("click", () => lbStep(-1));
  $(".lb-next", lb).addEventListener("click", () => lbStep(1));
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("show")) return;
    if (e.key === "Escape") lbClose(); else if (e.key === "ArrowLeft") lbStep(-1); else if (e.key === "ArrowRight") lbStep(1);
  });
  let lx = null;
  lb.addEventListener("touchstart", e => { lx = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => { if (lx === null) return; const dx = e.changedTouches[0].clientX - lx; lx = null; if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1); }, { passive: true });

  go(0);
})();
