/* ORGANAS — interactions
   GSAP + ScrollTrigger + Lenis. All content and tuning values come from
   window.ORG_DEFAULTS and are changed live through window.ORGAPI (see panel.js). */
(() => {
  'use strict';
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const DEF = window.ORG_DEFAULTS;

  /* live tuning values (the control panel writes into this object) */
  const P = {
    spacing: DEF.hero.spacing, tilt: DEF.hero.tilt, dip: DEF.hero.dip,
    ringSpeed: DEF.hero.ringSpeed, ringFollowScroll: DEF.hero.ringFollowScroll,
    autoplay: DEF.hero.autoplay, autoEvery: DEF.hero.autoEvery,
    rotStart: DEF.detail.rotStart, rotMid: DEF.detail.rotMid, rotEnd: DEF.detail.rotEnd,
    menuLabel: DEF.header.menuLabel, menuLabel2: DEF.header2.menu, closeLabel: DEF.header.closeLabel,
    otherLabel: DEF.others.button, chipDiscover: DEF.hero.chipDiscover, chipDrag: DEF.hero.chipDrag
  };

  /* header V2 (arc wheel) tuning values */
  const P2 = {
    spread: DEF.header2.spread, radius: DEF.header2.radius, tilt: DEF.header2.tilt,
    ringSpeed: DEF.header2.ringSpeed, ringFollow: DEF.header2.ringFollow,
    autoplay: DEF.header2.autoplay, autoEvery: DEF.header2.autoEvery
  };
  let design = 'v1';
  const html = document.documentElement;

  let ALL = DEF.fruits.map(DEF.norm);
  let PRODUCTS = ALL.filter(p => p.show);
  let N = PRODUCTS.length;

  /* ---------------- scroll engine ---------------- */
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({
    lerp: 0.09, smoothWheel: !reduce,
    // let the control panel (and anything marked data-lenis-prevent) scroll natively
    prevent: (node) => !!(node.closest && node.closest('.dialkit-root, [data-lenis-prevent]'))
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop(); // until preloader ends

  const scrollTo = (target, opts = {}) => lenis.scrollTo(target, { duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4), ...opts });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) { if (a.dataset.k || a.classList.contains('cart')) e.preventDefault(); return; }
    const el = $(id); if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollTo(id === '#top' ? 0 : el);
  }));

  /* ---------------- hero carousel ---------------- */
  const cx = $('#cx');
  const v2el = $('#v2'), v2fruits = $('#v2fruits'), v2stage = $('#v2stage');
  let items = [], items2 = [];
  let pos = 0, tgt = 0, S = 420, S2 = 500, K = 1, active = -1, intro = 0, started = false;

  function buildItems() {
    cx.innerHTML = '';
    items = PRODUCTS.map((p) => {
      const b = document.createElement('button');
      b.className = 'cx-item';
      b.type = 'button';
      b.setAttribute('aria-label', 'Discover ' + p.label);
      b.innerHTML = `<img src="${p.img}" alt="${DEF.esc(p.label)}" draggable="false" style="height:calc(var(--u)*${p.h}*var(--hero-scale,1))">`;
      cx.appendChild(b);
      return b;
    });
    v2fruits.innerHTML = '';
    items2 = PRODUCTS.map((p) => {
      const b = document.createElement('button');
      b.className = 'v2-item';
      b.type = 'button';
      b.setAttribute('aria-label', 'Discover ' + p.label);
      b.innerHTML = `<img src="${p.img}" alt="${DEF.esc(p.label)}" draggable="false" style="height:calc(${p.h2}px*var(--fs2,1))">`;
      v2fruits.appendChild(b);
      return b;
    });
  }
  buildItems();
  pos = tgt = Math.max(0, PRODUCTS.findIndex(p => p.id === DEF.hero.startFruit));

  const hero = $('#hero');
  const calcS = () => {
    S = clamp(innerWidth * (P.spacing / 100) * (innerWidth < 700 ? 2 : 1), 200, 620);
    const h = hero.clientHeight || innerHeight;
    K = innerWidth < 700 ? clamp(h / 900 * 0.82, 0.3, 1) : Math.min(innerWidth / 1600, h / 900);
    v2stage.style.setProperty('--k', K.toFixed(4));
    S2 = Math.max(120, P2.radius * (P2.spread * Math.PI / 180) * K);
  };
  calcS(); addEventListener('resize', calcS);

  function layout() {
    const n = items.length;
    for (let i = 0; i < n; i++) {
      let p = (((i - pos) % n) + n) % n;
      if (p > n / 2) p -= n;
      const a = Math.abs(p);
      const x = p * S;
      const y = a * a * P.dip + (1 - intro) * innerHeight * 0.9 + (p > 0 ? 14 * Math.min(p, 1.5) : -8 * Math.min(a, 1.5));
      const rot = p * P.tilt + (1 - intro) * 25;
      const sc = (1 - Math.min(a, 2.2) * 0.17);
      const fade = n > 3 ? (a < 1.9 ? 1 : Math.max(0, 1 - (a - 1.9) * 3.3)) : 1;
      const op = fade * clamp(intro * 2, 0, 1);
      const el = items[i];
      el.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = Math.round(100 - a * 10);
      el.style.pointerEvents = a < 2.2 ? 'auto' : 'none';
    }
  }

  /* V2: fruits ride a wheel whose centre sits at the bottom of the 1600x900 frame */
  const CX = 800, CY = 899;
  function layout2() {
    const n = items2.length, th = P2.spread;
    for (let i = 0; i < n; i++) {
      let p = (((i - pos) % n) + n) % n;
      if (p > n / 2) p -= n;
      const a = p * th + (1 - intro) * 70;           // fly in along the arc
      const rad = a * Math.PI / 180;
      const x = CX + P2.radius * Math.sin(rad);
      const y = CY - P2.radius * Math.cos(rad);
      const near = Math.max(0, 1 - Math.abs(p));
      const sc = 1 + 0.05 * near;
      const rot = a * (P2.tilt / th);
      const edge = Math.abs(a);
      const op = clamp((118 - edge) / 28, 0, 1) * clamp(intro * 2, 0, 1);
      const el = items2[i];
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      el.style.opacity = op.toFixed(3);
      el.style.zIndex = Math.round(100 - Math.abs(p) * 10);
      el.style.pointerEvents = edge < 100 ? 'auto' : 'none';
    }
  }
  const v2Ring = $('#v2RingText'), v2RingG = $('#v2RingG');
  let ring2Base = 0, ringRef = 0;
  let lastRing2 = DEF.header2.ringText;
  function setRing2(text) {
    lastRing2 = text;
    const t = String(text || '').trim().toUpperCase() || ' ';
    const el = v2Ring.parentNode;                       // the <text> element
    const circ = 2 * Math.PI * 603;
    v2Ring.style.letterSpacing = '0px';
    el.style.fontSize = '';
    v2Ring.textContent = t + ' ';
    let natural = v2Ring.getComputedTextLength() || 1000;
    if (natural > circ * 0.94) {                         // too long for the circle: shrink to fit
      const fs = parseFloat(getComputedStyle(el).fontSize) || 150;
      el.style.fontSize = (fs * circ * 0.94 / natural).toFixed(2) + 'px';
      natural = v2Ring.getComputedTextLength() || natural;
    }
    v2Ring.style.letterSpacing = Math.max(0, (circ - natural) / Math.max(1, t.length + 1)).toFixed(2) + 'px';
  }

  const ringText = $('#ringText');
  let ringT = 0, ringLoop = 2400;
  function setRing(text) {
    const unit = (String(text || '').trim() || ' ') + ' · ';
    ringText.textContent = unit;
    const w = Math.max(40, ringText.getComputedTextLength() || 600);
    const reps = Math.ceil(4600 / w) + 2;
    ringText.textContent = unit.repeat(reps);
    ringLoop = w;
  }

  gsap.ticker.add((time, dt) => {
    if (!items.length) return;
    const n = items.length;
    pos += (tgt - pos) * Math.min(1, 0.085 * (dt / 16.7 || 1));
    ringT += dt / 1000;
    if (design === 'v2') {
      layout2();
      const deg = ring2Base + ringT * P2.ringSpeed - (P2.ringFollow ? (pos - ringRef) * P2.spread : 0) + lenis.scroll * 0.02;
      v2RingG.setAttribute('transform', `rotate(${deg.toFixed(2)} 800 899)`);
    } else {
      layout();
      const off = -(pos * 320) - ringT * P.ringSpeed - (P.ringFollowScroll ? lenis.scroll * 0.35 : 0);
      ringText.setAttribute('startOffset', ((off % ringLoop)).toFixed(1));
    }
    const idx = ((Math.round(pos) % n) + n) % n;
    if (idx !== active) { active = idx; setProduct(idx, true); }
  });

  /* drag / click */
  let dragging = false, lastX = 0, moved = 0, vel = 0, hovering = false, lastT = 0;
  const step = () => design === 'v2' ? S2 : S;
  const surfaces = [cx, v2el];
  surfaces.forEach(surface => {
    surface.addEventListener('pointerdown', e => {
      dragging = true; lastX = e.clientX; moved = 0; vel = 0; lastT = performance.now();
      surface.setPointerCapture(e.pointerId);
    });
    surface.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
      tgt -= dx / step();
      const now = performance.now(); vel = (-dx / step()) / Math.max(1, now - lastT) * 16; lastT = now;
    });
    surface.addEventListener('pointerup', e => endDrag(e));
    surface.addEventListener('pointercancel', e => endDrag(e));
    surface.addEventListener('pointerenter', () => hovering = true);
    surface.addEventListener('pointerleave', () => hovering = false);
    surface.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { tgt += e.deltaX / 600; clearTimeout(surface._w); surface._w = setTimeout(() => tgt = Math.round(tgt), 140); } }, { passive: true });
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    if (moved < 7) {
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const itemEl = hit && hit.closest && hit.closest(design === 'v2' ? '.v2-item' : '.cx-item');
      const i = itemEl ? (design === 'v2' ? items2 : items).indexOf(itemEl) : -1;
      if (i > -1) {
        let p = (((i - tgt) % N) + N) % N; if (p > N / 2) p -= N;
        if (Math.abs(p) < 0.5) openProduct(i);
        else tgt = Math.round(tgt + p);
      }
    } else {
      tgt = Math.round(tgt + vel * 7);
    }
  }
  addEventListener('keydown', e => {
    if (scrollY > innerHeight * 0.5) return;
    if (/input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') tgt = Math.round(tgt) + 1;
    if (e.key === 'ArrowLeft')  tgt = Math.round(tgt) - 1;
  });
  let lastAuto = performance.now();
  setInterval(() => {
    const on = design === 'v2' ? P2.autoplay : P.autoplay, every = design === 'v2' ? P2.autoEvery : P.autoEvery;
    if (!on || dragging || hovering || document.hidden || reduce) return;
    if (scrollY > innerHeight * 0.4 || intro < 1) return;
    if (performance.now() - lastAuto < every * 1000 - 100) return;
    lastAuto = performance.now(); tgt = Math.round(tgt) + 1;
  }, 250);

  function openProduct(i) {
    setProduct(i, false);
    scrollTo('#detail', { duration: 1.9 });
  }

  /* ---------------- detail ---------------- */
  const D = {
    l1: $('.d-title .l1'), l2: $('.d-title .l2'),
    left: $('.d-left'), right: $('.d-right'), fruit: $('.d-fruit'),
    desc: $('.d-desc'), note: $('.d-note'), tips: $('.d-tips'), weights: $('.d-weights'), shelf: $('.d-shelf')
  };
  let current = -1;
  function fillDetail(p) {
    D.l1.textContent = p.title[0]; D.l2.textContent = p.title[1];
    D.left.textContent = p.left; D.right.textContent = p.right;
    D.fruit.src = p.img; D.fruit.alt = p.label;
    D.fruit.style.height = `calc(var(--u)*${p.dh})`;
    D.desc.innerHTML = p.desc; D.note.textContent = p.note; D.tips.textContent = p.tips;
    D.shelf.textContent = p.shelf;
    D.weights.innerHTML = p.weights.map(w => `<li role="radio" tabindex="0" aria-checked="false" data-w="${DEF.esc(w)}">${DEF.esc(w)}</li>`).join('');
    if (window.ORGSHOP) window.ORGSHOP.onDetail(p);
  }
  function setProduct(i, silent) {
    if (i === current || !PRODUCTS[i]) return;
    const p = PRODUCTS[i];
    const visible = !silent && !reduce;
    current = i;
    if (!visible) { fillDetail(p); buildOthers(); return; }
    gsap.to([D.l1, D.l2, D.left, D.right, D.fruit], { autoAlpha: 0, duration: .25, onComplete() {
      fillDetail(p); buildOthers();
      gsap.to([D.l1, D.l2, D.left, D.right, D.fruit], { autoAlpha: 1, duration: .5 });
    }});
  }

  /* big headline / fruit scroll choreography */
  let detailTL = null;
  function initDetail() {
    if (detailTL) { detailTL.scrollTrigger && detailTL.scrollTrigger.kill(); detailTL.kill(); }
    gsap.set([D.l1, D.l2], { clearProps: 'transform' });
    detailTL = gsap.timeline({
      scrollTrigger: { trigger: '.detail-pin', start: 'top top', end: 'bottom bottom', scrub: 0.7, invalidateOnRefresh: true }
    });
    gsap.set(D.fruit, { xPercent: -50, yPercent: -50 });
    detailTL.fromTo(D.fruit, { y: () => innerHeight * 0.95, rotation: P.rotStart, scale: 0.92 },
                       { y: () => innerHeight * 0.02, rotation: P.rotMid, scale: 1.04, ease: 'none', duration: 1 }, 0)
      .to(D.fruit,     { y: () => -innerHeight * 0.98, rotation: P.rotEnd, scale: 0.96, ease: 'none', duration: 1 }, 1)
      .fromTo(D.l1,    { xPercent: -5 }, { xPercent: 5,  ease: 'none', duration: 2 }, 0)
      .fromTo(D.l2,    { xPercent: 5  }, { xPercent: -5, ease: 'none', duration: 2 }, 0)
      .fromTo([D.left, D.right], { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: 'none', duration: .5 }, 0);
  }
  function initDetailBody() {
    gsap.utils.toArray('.detail-body > *').forEach(el => {
      gsap.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
    });
  }

  /* ---------------- other fruits ---------------- */
  const ocards = $('#ocards');
  function buildOthers() {
    ocards.innerHTML = '';
    PRODUCTS.forEach((p, i) => {
      if (i === current) return;
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'ocard'; c.dataset.cursor = 'DISCOVER';
      c.innerHTML = `<span class="shape" style="background:${DEF.esc(p.shape)}"></span><img src="${p.img}" alt="${DEF.esc(p.label)}" loading="lazy" draggable="false"><h3>${DEF.esc(p.label)}</h3><span class="op">${window.ORGSHOP ? DEF.esc(window.ORGSHOP.fromText(p)) : ''}</span><small>◆ <span class="ob">${DEF.esc(P.otherLabel)}</span></small>`;
      c.addEventListener('click', () => {
        scrollTo('#detail', { duration: 1.9 });
        setTimeout(() => setProduct(i, false), 500);
      });
      ocards.appendChild(c);
    });
    if (ocards.children.length) {
      gsap.fromTo(ocards.children, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: .9, stagger: .09, ease: 'power3.out',
        scrollTrigger: { trigger: ocards, start: 'top 88%', once: true } });
    }
  }

  /* ---------------- gallery drag ---------------- */
  let measureGallery = () => {};
  function initGallery() {
    const wrap = $('#gallery'), track = $('#track'), vid = $('.gc-video video');
    let x = 0, vx = 0, drag = false, lx = 0, min = 0, base = 0;
    const measure = () => { min = Math.min(0, wrap.clientWidth - track.scrollWidth); x = clamp(x, min, 0); };
    measureGallery = measure;
    measure(); addEventListener('resize', measure); addEventListener('load', measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(track);
    wrap.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; vx = 0; wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - lx; lx = e.clientX; x += dx; vx = dx; });
    const up = () => { drag = false; };
    wrap.addEventListener('pointerup', up); wrap.addEventListener('pointercancel', up);
    wrap.addEventListener('wheel', e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { x -= e.deltaX; } }, { passive: true });
    gsap.ticker.add(() => {
      if (!drag) { vx *= 0.94; x += vx; }
      if (x > 0) { x *= 0.8; vx *= .5; } if (x < min) { x = min + (x - min) * 0.8; vx *= .5; }
      track.style.transform = `translate3d(${(x + base).toFixed(1)}px,0,0)`;
    });
    ScrollTrigger.create({ trigger: wrap, start: 'top bottom', end: 'bottom top', onUpdate: s => { base = (0.5 - s.progress) * 120; } });
    const start = () => { measure(); const v = $('.gc-video'); if (!v.offsetWidth) return; x = clamp(wrap.clientWidth / 2 - (v.offsetLeft + v.offsetWidth / 2), min, 0); };
    start(); addEventListener('load', start);
    if (vid) ScrollTrigger.create({ trigger: wrap, start: 'top 85%', end: 'bottom 10%', onToggle: s => { s.isActive ? vid.play().catch(() => {}) : vid.pause(); } });
  }

  /* ---------------- cursor chip ---------------- */
  function initCursor() {
    if (!fine) return;
    const chip = $('.chip'), txt = $('span', chip);
    const qx = gsap.quickTo(chip, 'x', { duration: .35, ease: 'power3' });
    const qy = gsap.quickTo(chip, 'y', { duration: .35, ease: 'power3' });
    let on = false;
    const label = el => (el && el.dataset.cursor === 'DRAG') ? P.chipDrag : P.chipDiscover;
    addEventListener('pointermove', e => {
      qx(e.clientX + 14); qy(e.clientY + 14);
      const t = e.target.closest && e.target.closest('[data-cursor]');
      const show = !!t && !((t.id === 'cx' || t.id === 'v2') && !e.target.closest('.cx-item, .v2-item'));
      if (t) { const l = label(t); if (txt.textContent !== l) txt.textContent = l; }
      if (show !== on) { on = show; gsap.to(chip, { autoAlpha: show ? 1 : 0, scale: show ? 1 : .6, duration: .25, overwrite: 'auto' }); }
    });
    [cx, v2el].forEach(surface => surface.addEventListener('pointermove', e => {
      const onItem = !!e.target.closest('.cx-item, .v2-item');
      txt.textContent = onItem ? P.chipDiscover : P.chipDrag;
      if (!on) { on = true; gsap.to(chip, { autoAlpha: 1, scale: 1, duration: .25, overwrite: 'auto' }); }
    }));
    addEventListener('pointerleave', () => gsap.to(chip, { autoAlpha: 0, duration: .2 }));
  }

  /* ---------------- menu ---------------- */
  const menu = $('#menu'), menuBtns = $$('.menu-btn'), mbts = $$('.mb-t');
  const setMbt = (t) => mbts.forEach(el => { el.textContent = t; });
  const setExpanded = (v) => menuBtns.forEach(b => b.setAttribute('aria-expanded', v));
  let menuOpen = false;
  function openMenu() {
    menuOpen = true; document.body.classList.add('menu-open'); setExpanded('true'); setMbt(P.closeLabel);
    lenis.stop();
    gsap.set(menu, { visibility: 'visible' });
    gsap.to(menu, { clipPath: 'inset(0 0 0% 0)', duration: .8, ease: 'power4.inOut' });
    gsap.to('.menu li a', { y: 0, duration: .9, ease: 'power4.out', stagger: .07, delay: .35 });
  }
  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false; document.body.classList.remove('menu-open'); setExpanded('false'); setMbt(design === 'v2' ? P.menuLabel2 : P.menuLabel);
    gsap.to('.menu li a', { y: '110%', duration: .4, ease: 'power3.in', stagger: .03 });
    gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: .7, ease: 'power4.inOut', delay: .15, onComplete() { gsap.set(menu, { visibility: 'hidden' }); lenis.start(); } });
  }
  menuBtns.forEach(b => b.addEventListener('click', () => menuOpen ? closeMenu() : openMenu()));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const l2btn = $('.lang2-btn'), l2list = $('.lang2-list'), l2t = $('.l2t');
  let l2opts = ['EN', 'FR'];
  function setLangs(list, current) {
    l2opts = list.length ? list : ['EN'];
    if (current != null) l2t.textContent = current;
    l2list.innerHTML = l2opts.map(l => `<li><button type="button" role="option" aria-selected="${l === l2t.textContent}">${DEF.esc(l)}</button></li>`).join('');
  }
  const closeLang = () => { l2list.hidden = true; l2btn.setAttribute('aria-expanded', 'false'); };
  l2btn.addEventListener('click', e => { e.stopPropagation(); const open = l2list.hidden; l2list.hidden = !open; l2btn.setAttribute('aria-expanded', String(open)); });
  l2list.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; l2t.textContent = b.textContent; setLangs(l2opts); closeLang(); });
  document.addEventListener('click', closeLang);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLang(); });
  $$('.lang button').forEach(b => b.addEventListener('click', () => { $$('.lang button').forEach(x => x.classList.toggle('is-on', x === b)); }));

  /* ---------------- misc scroll effects ---------------- */
  function initMisc() {
    const hdr = $('.hdr');
    ScrollTrigger.create({ trigger: '.foot', start: 'top 60px', end: 'bottom top', onToggle: s => hdr.classList.toggle('on-dark', s.isActive) });

    $$('.big span').forEach((s, i) => {
      const b = document.createElement('b'); b.textContent = s.textContent; s.textContent = ''; s.appendChild(b);
      gsap.fromTo(b, { yPercent: 110 }, { yPercent: 0, duration: 1.1, ease: 'power4.out', delay: i * .12,
        scrollTrigger: { trigger: '.big', start: 'top 85%', toggleActions: 'play none none reverse' } });
    });

    gsap.fromTo('.fw1', { xPercent: -8 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 20%', scrub: true } });
    gsap.fromTo('.fw2', { xPercent: 6 },  { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 20%', scrub: true } });
    gsap.fromTo('.foot-grid > *', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .9, stagger: .1, ease: 'power3.out',
      scrollTrigger: { trigger: '.foot-grid', start: 'top 92%', toggleActions: 'play none none none' } });

    gsap.to('.blob', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.cx', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.v2-par', { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.sp1', { scale: 1.2, rotation: 25, duration: 1.7, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    gsap.to('.scroll-hint', { autoAlpha: 0, scrollTrigger: { trigger: '.hero', start: '5% top', end: '20% top', scrub: true } });
  }

  /* ---------------- public API (used by panel.js) ---------------- */
  let refreshT;
  const refresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => { measureGallery(); calcS(); ScrollTrigger.refresh(); }, 120); };
  window.ORGAPI = {
    P, P2, refresh, setRing, setRing2, calcS, setLangs,
    setDesign(d) {
      design = d === 'v2' ? 'v2' : 'v1';
      html.dataset.design = design;
      setMbt(design === 'v2' ? P.menuLabel2 : P.menuLabel);
      calcS(); refresh();
      requestAnimationFrame(() => setRing2(lastRing2));
    },
    get design() { return design; },
    all: () => ALL,
    currentProduct: () => PRODUCTS[current] || PRODUCTS[0],
    lockScroll(on) { on ? lenis.stop() : lenis.start(); },
    setProducts(list) {
      ALL = list; if (window.ORGSHOP) window.ORGSHOP.setCatalog(list);
      const next = list.filter(p => p.show);
      if (!next.length) return;
      const keep = PRODUCTS[((Math.round(tgt) % N) + N) % N];
      PRODUCTS = next; N = PRODUCTS.length;
      buildItems();
      let k = keep ? PRODUCTS.findIndex(p => p.id === keep.id) : -1;
      if (k < 0) k = 0;
      pos = tgt = k; ringRef = k; active = -1; current = -1;
      refresh();
    },
    goTo(id) { const k = PRODUCTS.findIndex(p => p.id === id); if (k > -1) { tgt = k; pos = k; ringRef = k; } },
    rebuildDetail() { initDetail(); refresh(); },
    rebuildOthers() { buildOthers(); },
    setMenuLabel(t) { P.menuLabel = t; if (!menuOpen && design !== 'v2') setMbt(t); },
    setMenuLabel2(t) { P.menuLabel2 = t; if (!menuOpen && design === 'v2') setMbt(t); },
    measureGallery: () => measureGallery(),
    ready: false
  };

  /* ---------------- boot ---------------- */
  fillDetail(PRODUCTS[Math.max(0, pos)]); current = Math.max(0, pos); buildOthers();
  initDetail(); initDetailBody(); initGallery(); initMisc(); initCursor();
  setRing2(DEF.header2.ringText); setLangs(DEF.header2.languages.split(',').map(x => x.trim()).filter(Boolean), DEF.header2.language);
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { setRing2(DEF.header2.ringText); calcS(); });
  window.ORGAPI.ready = true;
  document.dispatchEvent(new Event('orgapi-ready'));

  const ring2Intro = { v: 0 };
  function intro_() {
    const pre = $('.pre');
    const tl = gsap.timeline({ onComplete() { pre.remove(); document.body.classList.remove('is-loading'); lenis.start(); ScrollTrigger.refresh(); } });
    tl.to('.pre-logo', { opacity: 1, scale: 1, duration: .8, ease: 'power3.out' }, 0.1)
      .to('.pre-logo', { opacity: 0, y: -20, duration: .4, ease: 'power2.in' }, 1.2)
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'power4.inOut' }, 1.4)
      .fromTo('.blob', { scaleY: 0 }, { scaleY: 1, duration: 1.1, ease: 'power4.out' }, 1.8)
      .fromTo('.ring', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 1.9)
      .fromTo('.hdr > *', { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: .8, stagger: .1, ease: 'power3.out' }, 2.1)
      .fromTo('.scroll-hint,.privacy', { autoAlpha: 0 }, { autoAlpha: 1, duration: .8 }, 2.6)
      .fromTo('.v2-disc', { scale: 0.55, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.4, ease: 'power4.out' }, 1.75)
      .fromTo('.v2-ring', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1, ease: 'power2.out' }, 1.95)
      .fromTo(ring2Intro, { v: -55 }, { v: 0, duration: 2, ease: 'power3.out', onUpdate() { ring2Base = ring2Intro.v; } }, 1.9)
      .fromTo('.spark', { scale: 0 }, { scale: 1, duration: .9, ease: 'back.out(2)', stagger: .12 }, 2.6)
      .to({ v: 0 }, { v: 1, duration: 1.5, ease: 'power3.out', onUpdate() { intro = this.targets()[0].v; } }, 1.75);
    gsap.set('.pre', { clipPath: 'inset(0 0 0% 0)' });
    gsap.set('.pre-logo', { scale: .85 });
  }
  if (reduce) { intro = 1; $('.pre').remove(); document.body.classList.remove('is-loading'); lenis.start(); }
  else if (document.readyState === 'complete') intro_();
  else addEventListener('load', intro_);
})();
