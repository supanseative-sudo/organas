/* ORGANAS — live control panel (DialKit)
   Every text, image, color, font, size and animation value on the site is a control here.
   Add ?clean to the page address to hide the panel (the site then shows its saved settings). */
(() => {
  'use strict';
  const DEF = window.ORG_DEFAULTS, API = window.ORGAPI, P = API.P;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const setVar = (k, v) => root.style.setProperty(k, v);
  const clean = /[?&]clean\b/.test(location.search);
  const K = (k) => $$(`[data-k="${k}"]`);
  const kText = (k, v) => K(k).forEach(el => { el.textContent = v; });
  const kHtml = (k, v) => K(k).forEach(el => { el.innerHTML = DEF.esc(v).split('|').map(s => s.trim()).join('<br>'); });
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* colour helpers */
  const cvs = document.createElement('canvas'); cvs.width = cvs.height = 1;
  const g2d = cvs.getContext('2d', { willReadFrequently: true });
  function toRGB(c) { try { g2d.clearRect(0, 0, 1, 1); g2d.fillStyle = '#000'; g2d.fillStyle = c; g2d.fillRect(0, 0, 1, 1); const d = g2d.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; } catch (e) { return [128, 128, 128]; } }
  const isLight = (c) => { const [r, g, b] = toRGB(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62; };

  /* fonts (the defaults ship with the site; others load from Google Fonts on demand) */
  const LOCAL = ['Playfair Display', 'Figtree'];
  const FONTS_DISPLAY = ['Playfair Display', 'DM Serif Display', 'Cormorant Garamond', 'Bodoni Moda', 'Fraunces', 'Abril Fatface', 'Instrument Serif', 'Libre Caslon Display', 'Gloock', 'Prata', 'Marcellus', 'Italiana'];
  const FONTS_BODY = ['Figtree', 'Inter', 'DM Sans', 'Manrope', 'Poppins', 'Outfit', 'Work Sans', 'Montserrat', 'Lato', 'Nunito Sans'];
  const loaded = new Set();
  function loadFont(name) {
    if (LOCAL.includes(name) || loaded.has(name)) return;
    loaded.add(name);
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + '&display=swap';
    document.head.appendChild(l);
  }

  /* shared image lists */
  const IMG = (v, l) => ({ value: v, label: l });
  const siteImages = [
    ...DEF.fruits.map(f => IMG(f.img, f.label)),
    IMG('assets/avocado.jpg', 'Avocado splash'), IMG('assets/avocado-poster.jpg', 'Video still')
  ];

  const controllers = [];   // for copy / reset
  window.ORG_CONTROLS = controllers;
  const make = (name, cfg, opts, apply) => {
    const c = DialKit.createDialKit(name, cfg, Object.assign({ persist: true }, opts));
    controllers.push({ id: opts.id, name, c });
    if (apply) c.subscribe(apply);
    return c;
  };

  if (!clean) DialKit.createDialRoot({ position: 'bottom-right', theme: 'light', defaultOpen: false, versions: 'menu' });

  /* =============== Header Design (V1 classic / V2 arc wheel) =============== */
  const H2 = DEF.header2;
  const hd = make('Header Design', {
    design: { type: 'select', options: [{ value: 'v1', label: 'V1 · Classic' }, { value: 'v2', label: 'V2 · Arc wheel' }], default: H2.design },
    menuButton: { type: 'text', default: H2.menu },
    language: { type: 'text', default: H2.language },
    languageList: { type: 'text', default: H2.languages, placeholder: 'Comma separated, e.g. EN, FR, ES' },
    cartLabel: { type: 'text', default: H2.cart },
    showLanguage: H2.showLanguage,
    showCart: H2.showCart,
    logoWidth: [H2.logoWidth, 40, 200, 1],
    colors: {
      text: { type: 'color', default: H2.red },
      circle: { type: 'color', default: H2.disc },
      _collapsed: true
    },
    wheel: {
      ringText: { type: 'text', default: H2.ringText, placeholder: 'Words that circle the arc' },
      ringTextSize: [H2.ringSize, 60, 300, 1],
      ringSpeed: [H2.ringSpeed, -30, 30, 0.5],  // negative = right to left
      ringFollowsWheel: H2.ringFollow,
      fruitSpacing: [H2.spread, 35, 90, 1],
      wheelRadius: [H2.radius, 380, 720, 1],
      fruitTilt: [H2.tilt, 0, 40, 1],
      fruitSize: [100, 50, 170, 1],
      autoplay: H2.autoplay,
      secondsPerSlide: [H2.autoEvery, 1.5, 15, 0.1],
      _collapsed: true
    },
    decoration: { showCircle: H2.showDisc, showArcLines: H2.showArcs, showSparkles: H2.showSparkles, _collapsed: true }
  }, { id: 'header-design-2' }, v => {
    API.setDesign(v.design);
    API.setMenuLabel2(v.menuButton);
    API.setLangs(v.languageList.split(',').map(x => x.trim()).filter(Boolean), v.language);
    $('.lang2').style.display = v.showLanguage ? '' : 'none';
    const cart = $('.cart'); cart.style.display = v.showCart ? '' : 'none'; $('.cart-t').textContent = v.cartLabel;
    setVar('--logo-w2', v.logoWidth + 'px');
    setVar('--v2-red', v.colors.text); setVar('--v2-disc', v.colors.circle);
    setVar('--ring2', v.wheel.ringTextSize + 'px');
    const P2 = API.P2;
    P2.spread = v.wheel.fruitSpacing; P2.radius = v.wheel.wheelRadius; P2.tilt = v.wheel.fruitTilt;
    P2.ringSpeed = v.wheel.ringSpeed; P2.ringFollow = v.wheel.ringFollowsWheel;
    P2.autoplay = v.wheel.autoplay; P2.autoEvery = v.wheel.secondsPerSlide;
    setVar('--fs2', v.wheel.fruitSize / 100);
    $('.v2-disc').style.display = v.decoration.showCircle ? '' : 'none';
    $('.v2-arcs').style.display = v.decoration.showArcLines ? '' : 'none';
    $$('.spark').forEach(el => { el.style.display = v.decoration.showSparkles ? '' : 'none'; });
    requestAnimationFrame(() => { API.setRing2(v.wheel.ringText); API.calcS(); });
  });
  // Make "V2" a real DialKit version (V1 = classic header, V2 = new arc header), selected on first visit.
  try {
    if (!localStorage.getItem('organas:v2-seeded-2')) {
      localStorage.setItem('organas:v2-seeded-2', '1');
      hd.setValue('design', 'v2');
      DialKit.DialStore.savePreset(hd.id, 'V2');
    }
  } catch (e) { /* storage unavailable: the Design select still switches between the two headers */ }

  /* =============== Brand & Style =============== */
  const B = DEF.brand;
  make('Brand & Style', {
    name: { type: 'text', default: B.name },
    logo: { type: 'image', options: [IMG(B.logo, 'Organas logo')], default: B.logo },
    logoWidth: [B.logoWidth, 40, 220, 1],
    colors: {
      cream: { type: 'color', default: B.colors.cream },
      peach: { type: 'color', default: B.colors.peach },
      burgundy: { type: 'color', default: B.colors.burgundy },
      red: { type: 'color', default: B.colors.red },
      ink: { type: 'color', default: B.colors.ink },
      _collapsed: true
    },
    fonts: {
      headings: { type: 'select', options: FONTS_DISPLAY, default: B.fonts.display },
      text: { type: 'select', options: FONTS_BODY, default: B.fonts.body },
      _collapsed: true
    },
    cornerRadius: [B.radius, 0, 48, 1]
  }, { id: 'brand', defaultCollapsed: true }, v => {
    document.title = v.name + ' — Fresh Fruits';
    $('.brand').setAttribute('aria-label', v.name + ' — home');
    if (v.logo && v.logo !== B.logo) { root.classList.add('logo-custom'); setVar('--logo', `url("${v.logo}")`); }
    else { root.classList.remove('logo-custom'); }
    setVar('--logo-w', v.logoWidth + 'px');
    const c = v.colors;
    setVar('--cream', c.cream); setVar('--peach', c.peach); setVar('--burgundy', c.burgundy); setVar('--red', c.red); setVar('--ink', c.ink);
    const meta = $('meta[name="theme-color"]'); if (meta) meta.content = c.cream;
    loadFont(v.fonts.headings); loadFont(v.fonts.text);
    setVar('--serif', `"${v.fonts.headings}","Times New Roman",serif`);
    setVar('--sans', `"${v.fonts.text}",system-ui,-apple-system,"Segoe UI",sans-serif`);
    setVar('--card-r', v.cornerRadius + 'px');
    setTimeout(() => API.setRing(lastRing), 400);
  });

  /* =============== Header & Menu =============== */
  const H = DEF.header;
  make('Header & Menu', {
    showLanguageSwitch: H.showLang,
    languageOne: { type: 'text', default: H.lang1 },
    languageTwo: { type: 'text', default: H.lang2 },
    menuButton: { type: 'text', default: H.menuLabel },
    closeButton: { type: 'text', default: H.closeLabel },
    links: {
      home: { type: 'text', default: H.links.home },
      fruits: { type: 'text', default: H.links.fruits },
      experience: { type: 'text', default: H.links.experience },
      collection: { type: 'text', default: H.links.collection },
      contact: { type: 'text', default: H.links.contact },
      _collapsed: true
    },
    menuFooterLine: { type: 'text', default: H.menuFoot }
  }, { id: 'header', defaultCollapsed: true }, v => {
    $('.lang').hidden = !v.showLanguageSwitch;
    kText('lang1', v.languageOne); kText('lang2', v.languageTwo);
    P.menuLabel = v.menuButton; P.closeLabel = v.closeButton; API.setMenuLabel(v.menuButton);
    Object.entries(v.links).forEach(([k, t]) => $$(`[data-link="${k}"]`).forEach(a => { a.textContent = t; }));
    kText('menuFoot', v.menuFooterLine);
  });

  /* =============== Hero =============== */
  const Hh = DEF.hero;
  let lastRing = Hh.ringText, heroFirst = true, lastStart = Hh.startFruit;
  make('Hero · V1 carousel', {
    ringText: { type: 'text', default: Hh.ringText, placeholder: 'Words that circle behind the fruit' },
    ring: {
      textSize: [Hh.ringSize, 80, 380, 1], speed: [Hh.ringSpeed, 0, 220, 1], followScroll: Hh.ringFollowScroll, _collapsed: true
    },
    carousel: {
      spacing: [Hh.spacing, 15, 50, 1], tilt: [Hh.tilt, 0, 35, 1], arc: [Hh.dip, 0, 40, 1],
      fruitSize: [Hh.fruitScale, 40, 180, 1], autoplay: Hh.autoplay, secondsPerSlide: [Hh.autoEvery, 1.5, 15, 0.1], _collapsed: true
    },
    backdrop: { show: Hh.showBlob, width: [Hh.blobWidth, 40, 110, 1], height: [Hh.blobHeight, 25, 90, 1], _collapsed: true },
    firstFruit: { type: 'select', options: DEF.fruits.map(f => ({ value: f.id, label: f.label })), default: Hh.startFruit },
    scrollHint: { type: 'text', default: Hh.scrollHint },
    showPrivacyLink: Hh.showPrivacy,
    privacyLink: { type: 'text', default: Hh.privacy },
    cursorLabelOnFruit: { type: 'text', default: Hh.chipDiscover },
    cursorLabelOnDrag: { type: 'text', default: Hh.chipDrag }
  }, { id: 'hero', defaultCollapsed: true }, v => {
    lastRing = v.ringText;
    setVar('--ring-size', v.ring.textSize + 'px');
    requestAnimationFrame(() => API.setRing(lastRing));
    P.ringSpeed = v.ring.speed; P.ringFollowScroll = v.ring.followScroll;
    P.spacing = v.carousel.spacing; P.tilt = v.carousel.tilt; P.dip = v.carousel.arc;
    P.autoplay = v.carousel.autoplay; P.autoEvery = v.carousel.secondsPerSlide;
    setVar('--hero-scale', v.carousel.fruitSize / 100); API.calcS();
    const blob = $('.blob'); blob.style.display = v.backdrop.show ? '' : 'none';
    setVar('--blob-w', v.backdrop.width + '%'); setVar('--blob-h', v.backdrop.height + '%');
    kText('scrollHint', v.scrollHint);
    const pv = $('.privacy'); pv.style.display = v.showPrivacyLink ? '' : 'none'; pv.textContent = v.privacyLink;
    P.chipDiscover = v.cursorLabelOnFruit; P.chipDrag = v.cursorLabelOnDrag;
    if (!heroFirst && v.firstFruit !== lastStart) API.goTo(v.firstFruit);
    if (heroFirst) setTimeout(() => API.goTo(v.firstFruit), 0);
    lastStart = v.firstFruit; heroFirst = false;
  });

  /* =============== Fruits (one panel each) =============== */
  const fruitVals = new Array(DEF.fruits.length).fill(null);
  const pushFruits = debounce(() => {
    if (fruitVals.some(v => !v)) return;
    const list = DEF.fruits.map((f, i) => {
      const v = fruitVals[i];
      return DEF.norm({
        id: f.id, show: v.showOnSite, price: v.pricePerKg, label: v.name, img: v.image || f.img, h: v.sizes.inHero, h2: v.sizes.inArcHeader, dh: v.sizes.onDetailPage,
        shape: v.hoverShape, t1: v.headlineLine1, t2: v.headlineLine2, left: v.captionLeft, right: v.captionRight,
        desc: v.description, note: v.note, tips: v.servingTips, weights: v.weights, shelf: v.shelfLife
      });
    });
    API.setProducts(list);
  }, 30);
  DEF.fruits.forEach((f, i) => {
    make('Fruit · ' + f.label, {
      showOnSite: f.show,
      pricePerKg: [f.price, 0, 100, 0.05],
      image: { type: 'image', options: [IMG(f.img, f.label + ' (original)'), ...siteImages.filter(o => o.value !== f.img)], default: f.img },
      name: { type: 'text', default: f.label },
      headlineLine1: { type: 'text', default: f.t1 },
      headlineLine2: { type: 'text', default: f.t2 },
      captionLeft: { type: 'text', default: f.left, placeholder: 'Use | for a new line' },
      captionRight: { type: 'text', default: f.right, placeholder: 'Use | for a new line' },
      description: { type: 'text', default: f.desc, placeholder: 'Wrap words in **double stars** to bold them' },
      note: { type: 'text', default: f.note },
      servingTips: { type: 'text', default: f.tips },
      weights: { type: 'text', default: f.weights, placeholder: 'Comma separated, e.g. 500g, 1kg' },
      shelfLife: { type: 'text', default: f.shelf },
      sizes: { inHero: [f.h, 10, 110, 1], inArcHeader: [f.h2, 60, 700, 1], onDetailPage: [f.dh, 10, 110, 1], _collapsed: true },
      hoverShape: { type: 'color', default: f.shape }
    }, { id: 'fruit-' + f.id, defaultCollapsed: true }, v => { fruitVals[i] = v; pushFruits(); });
  });

  /* =============== Detail page =============== */
  const Dd = DEF.detail;
  let detailKey = '';
  const rebuildDetail = debounce(() => API.rebuildDetail(), 200);
  make('Detail Page', {
    headlineSize: [Dd.headSize, 3, 14, 0.1],
    scrollLength: [Dd.pinLength, 120, 450, 5],
    showSideCaptions: Dd.showCaptions,
    fruitShadow: Dd.fruitShadow,
    fruitTilt: { atStart: [Dd.rotStart, -60, 60, 1], inMiddle: [Dd.rotMid, -60, 60, 1], atEnd: [Dd.rotEnd, -60, 60, 1], _collapsed: true },
    labels: {
      tips: { type: 'text', default: Dd.tipsLabel },
      weights: { type: 'text', default: Dd.weightsLabel },
      shelfLife: { type: 'text', default: Dd.shelfLabel },
      _collapsed: true
    }
  }, { id: 'detail', defaultCollapsed: true }, v => {
    setVar('--head', v.headlineSize); setVar('--pin', v.scrollLength);
    $$('.d-side').forEach(el => { el.style.display = v.showSideCaptions ? '' : 'none'; });
    setVar('--fshadow', v.fruitShadow ? 'drop-shadow(0 30px 34px rgba(60,10,20,.25))' : 'none');
    P.rotStart = v.fruitTilt.atStart; P.rotMid = v.fruitTilt.inMiddle; P.rotEnd = v.fruitTilt.atEnd;
    kText('tipsLabel', v.labels.tips); kText('weightsLabel', v.labels.weights); kText('shelfLabel', v.labels.shelfLife);
    const key = [v.scrollLength, v.fruitTilt.atStart, v.fruitTilt.inMiddle, v.fruitTilt.atEnd].join();
    if (key !== detailKey) { detailKey = key; rebuildDetail(); } else API.refresh();
  });

  /* =============== Shop (prices & cart) =============== */
  const Sh = DEF.shop;
  make('Shop', {
    enableShop: Sh.enabled,
    showPrices: Sh.showPrices,
    currencySymbol: { type: 'text', default: Sh.currency },
    priceWording: {
      fromWord: { type: 'text', default: Sh.from },
      perUnit: { type: 'text', default: Sh.perUnit },
      _collapsed: true
    },
    texts: {
      addToCartButton: { type: 'text', default: Sh.addToCart },
      addedMessage: { type: 'text', default: Sh.added },
      cartTitle: { type: 'text', default: Sh.cartTitle },
      emptyCartMessage: { type: 'text', default: Sh.empty },
      subtotalLabel: { type: 'text', default: Sh.subtotal },
      cartNote: { type: 'text', default: Sh.note },
      checkoutButton: { type: 'text', default: Sh.checkout },
      _collapsed: true
    },
    checkoutLink: { type: 'text', default: Sh.checkoutUrl, placeholder: 'https://... (leave empty until checkout is connected)' }
  }, { id: 'shop', defaultCollapsed: true }, v => {
    if (!window.ORGSHOP) return;
    window.ORGSHOP.setConfig({
      enabled: v.enableShop, showPrices: v.showPrices, currency: v.currencySymbol || '$',
      from: v.priceWording.fromWord, perUnit: v.priceWording.perUnit,
      addToCart: v.texts.addToCartButton, added: v.texts.addedMessage, cartTitle: v.texts.cartTitle,
      empty: v.texts.emptyCartMessage, subtotal: v.texts.subtotalLabel, note: v.texts.cartNote,
      checkout: v.texts.checkoutButton, checkoutUrl: (v.checkoutLink || '').trim()
    });
  });

  /* =============== Gallery =============== */
  const Gg = DEF.gallery;
  const gcfg = (c) => ({ show: c.show, image: { type: 'image', options: [IMG(c.image, 'Original'), ...siteImages.filter(o => o.value !== c.image)], default: c.image }, caption: { type: 'text', default: c.caption }, color: { type: 'color', default: c.color }, _collapsed: true });
  make('Gallery', {
    showSection: Gg.show, cardHeight: [Gg.height, 25, 95, 1], gap: [Gg.gap, 0, 6, 0.1],
    photoCard: { show: Gg.photo.show, image: { type: 'image', options: [IMG(Gg.photo.image, 'Original'), ...siteImages.filter(o => o.value !== Gg.photo.image)], default: Gg.photo.image }, _collapsed: true },
    videoCard: {
      show: Gg.video.show,
      videoAddress: { type: 'text', default: Gg.video.src, placeholder: 'Path or URL of an .mp4 file' },
      coverImage: { type: 'image', options: [IMG(Gg.video.poster, 'Original'), ...siteImages.filter(o => o.value !== Gg.video.poster)], default: Gg.video.poster },
      _collapsed: true
    },
    card1: gcfg(Gg.cards[0]), card2: gcfg(Gg.cards[1]), card3: gcfg(Gg.cards[2]), card4: gcfg(Gg.cards[3])
  }, { id: 'gallery', defaultCollapsed: true }, v => {
    $('#gallery').style.display = v.showSection ? '' : 'none';
    setVar('--gh', v.cardHeight); setVar('--gg', v.gap);
    const ph = $('.gc-photo'); ph.style.display = v.photoCard.show ? '' : 'none'; $('img', ph).src = v.photoCard.image;
    const vc = $('.gc-video'), vid = $('video', vc);
    vc.style.display = v.videoCard.show ? '' : 'none';
    if (v.videoCard.videoAddress && vid.getAttribute('src') !== v.videoCard.videoAddress) { vid.src = v.videoCard.videoAddress; vid.load(); }
    if (v.videoCard.coverImage) vid.poster = v.videoCard.coverImage;
    [v.card1, v.card2, v.card3, v.card4].forEach((c, i) => {
      const fig = $(`[data-gc="${i}"]`); if (!fig) return;
      fig.style.display = c.show ? '' : 'none';
      $('img', fig).src = c.image; $('figcaption', fig).textContent = c.caption;
      fig.style.setProperty('--c', c.color);
      fig.style.setProperty('--fc', isLight(c.color) ? '#631928' : '#FCEFE7');
    });
    API.measureGallery(); API.refresh();
  });

  /* =============== Other fruits =============== */
  const Oo = DEF.others;
  make('Other Fruits', {
    showSection: Oo.show,
    headingLine1: { type: 'text', default: Oo.line1 },
    headingLine2: { type: 'text', default: Oo.line2 },
    cardButton: { type: 'text', default: Oo.button },
    columns: [Oo.columns, 1, 5, 1]
  }, { id: 'others', defaultCollapsed: true }, v => {
    $('#others').style.display = v.showSection ? '' : 'none';
    const sp = $$('.big span');
    [v.headingLine1, v.headingLine2].forEach((t, i) => { const b = $('b', sp[i]) || sp[i]; b.textContent = t; });
    setVar('--ocols', v.columns);
    P.otherLabel = v.cardButton; $$('.ocard .ob').forEach(el => { el.textContent = v.cardButton; });
    API.refresh();
  });

  /* =============== Footer =============== */
  const F = DEF.footer;
  make('Footer', {
    bigWordTop: { type: 'text', default: F.word1 },
    bigWordBottom: { type: 'text', default: F.word2 },
    bigWordSizes: { top: [F.size1, 6, 24, 0.1], bottom: [F.size2, 6, 24, 0.1], _collapsed: true },
    showEmblem: F.showEmblem,
    copyright: { type: 'text', default: F.copy },
    tagline: { type: 'text', default: F.tagline },
    headOffice: { label: { type: 'text', default: F.headLabel }, address: { type: 'text', default: F.head, placeholder: 'Use | for a new line' }, _collapsed: true },
    operations: { label: { type: 'text', default: F.opsLabel }, address: { type: 'text', default: F.ops, placeholder: 'Use | for a new line' }, _collapsed: true },
    social: { label: { type: 'text', default: F.followLabel }, handle: { type: 'text', default: F.handle }, link: { type: 'text', default: F.handleUrl }, _collapsed: true },
    message: { type: 'text', default: F.ask, placeholder: 'Use | for a new line' },
    email: { type: 'text', default: F.email },
    privacyLink: { type: 'text', default: F.privacy }
  }, { id: 'footer', defaultCollapsed: true }, v => {
    kText('word1', v.bigWordTop); kText('word2', v.bigWordBottom);
    setVar('--fw1', v.bigWordSizes.top); setVar('--fw2', v.bigWordSizes.bottom);
    $('.mark').style.display = v.showEmblem ? '' : 'none';
    kText('copy', v.copyright); kText('tagline', v.tagline);
    kText('headLabel', v.headOffice.label); kHtml('head', v.headOffice.address);
    kText('opsLabel', v.operations.label); kHtml('ops', v.operations.address);
    kText('followLabel', v.social.label); kText('handle', v.social.handle);
    K('handle').forEach(a => { a.href = v.social.link || '#'; if (/^https?:/.test(v.social.link)) { a.target = '_blank'; a.rel = 'noopener'; } });
    kHtml('ask', v.message);
    kText('email', v.email); K('email').forEach(a => { a.href = 'mailto:' + v.email; });
    kText('fprivacy', v.privacyLink);
    API.refresh();
  });

  /* =============== Project tools =============== */
  function toast(msg) {
    let t = $('#org-toast');
    if (!t) { t = document.createElement('div'); t.id = 'org-toast'; t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:300;background:#631928;color:#FCEFE7;font:600 12px/1 Figtree,system-ui,sans-serif;padding:11px 16px;border-radius:99px;box-shadow:0 8px 30px rgba(0,0,0,.25);transition:opacity .3s;pointer-events:none'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1'; clearTimeout(t._t); t._t = setTimeout(() => { t.style.opacity = '0'; }, 2400);
  }
  function snapshot() {
    const out = {};
    controllers.forEach(({ id, name, c }) => {
      const v = JSON.parse(JSON.stringify(c.getValues ? c.getValues() : c.values));
      (function strip(o) { for (const k in o) { if (typeof o[k] === 'string' && o[k].startsWith('data:')) o[k] = '[uploaded image: re-upload it in the panel]'; else if (o[k] && typeof o[k] === 'object') strip(o[k]); } })(v);
      out[name] = v;
    });
    return JSON.stringify(out, null, 2);
  }
  function copyText(text) {
    const fallback = () => { const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok; };
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(() => true, () => fallback());
    return Promise.resolve(fallback());
  }
  make('Project', {
    copyAllSettings: { type: 'action', label: 'Copy all settings' },
    resetEverything: { type: 'action', label: 'Reset everything' }
  }, {
    id: 'project', defaultCollapsed: true, persist: false,
    onAction: (path) => {
      if (path === 'copyAllSettings') copyText(snapshot()).then(ok => toast(ok ? 'All settings copied' : 'Copy blocked by the browser'));
      if (path === 'resetEverything') { controllers.forEach(({ c }) => c.resetValues && c.resetValues()); toast('Everything is back to the original'); }
    }
  });

  /* initial ring text once fonts are ready */
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => API.setRing(lastRing));
})();
