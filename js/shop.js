/* ORGANAS — prices & cart
   Prices are per kilogram. A weight such as "500g" or "2kg" scales the price;
   anything else (for example "6 pcs") is charged at the per-unit price. */
(() => {
  'use strict';
  const DEF = window.ORG_DEFAULTS, API = window.ORGAPI;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = DEF.esc;

  const cfg = Object.assign({}, DEF.shop);
  let catalog = new Map();
  let cur = null, selW = null, qty = 1;
  const KEY = 'organas:cart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]').filter(l => l && l.id && l.w && l.q > 0); } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ } };

  const money = (n) => cfg.currency + (Math.round(n * 100) / 100).toFixed(2);
  const factor = (w) => {
    const m = String(w).trim().match(/^(\d+(?:\.\d+)?)\s*(kg|g)\b/i);
    if (!m) return 1;
    const v = parseFloat(m[1]);
    return m[2].toLowerCase() === 'g' ? v / 1000 : v;
  };
  const unitPrice = (p, w) => p.price * factor(w);
  const shopOn = () => cfg.enabled !== false;

  /* ---------- cart drawer ---------- */
  const ov = document.createElement('div'); ov.className = 'cart-ov'; ov.hidden = true;
  const dr = document.createElement('aside'); dr.className = 'cart-dr'; dr.setAttribute('aria-label', 'Cart'); dr.setAttribute('aria-hidden', 'true');
  dr.innerHTML = `
    <header class="cd-head"><h3><span class="cd-title"></span> <span class="cd-count"></span></h3><button type="button" class="cd-close" aria-label="Close cart"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg></button></header>
    <div class="cd-body" data-lenis-prevent><ul class="cd-list"></ul><p class="cd-empty"></p></div>
    <footer class="cd-foot">
      <div class="cd-row"><span class="cd-sub-l"></span><b class="cd-sub">$0.00</b></div>
      <p class="cd-note"></p>
      <button type="button" class="cd-check"></button>
    </footer>`;
  document.body.append(ov, dr);
  let isOpen = false;
  function openCart() { if (!shopOn()) return; render(); isOpen = true; ov.hidden = false; dr.setAttribute('aria-hidden', 'false'); requestAnimationFrame(() => { document.body.classList.add('cart-open'); }); API.lockScroll(false); $('.cd-close', dr).focus({ preventScroll: true }); }
  function closeCart() { if (!isOpen) return; isOpen = false; document.body.classList.remove('cart-open'); dr.setAttribute('aria-hidden', 'true'); setTimeout(() => { if (!isOpen) ov.hidden = true; }, 420); API.lockScroll(true); }
  ov.addEventListener('click', closeCart);
  $('.cd-close', dr).addEventListener('click', closeCart);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });
  $$('.cart, .cart-v1').forEach(b => b.addEventListener('click', e => { e.preventDefault(); isOpen ? closeCart() : openCart(); }));

  /* ---------- cart data ---------- */
  const count = () => cart.reduce((n, l) => n + l.q, 0);
  const lineTotal = (l) => { const p = catalog.get(l.id); return p ? unitPrice(p, l.w) * l.q : 0; };
  const subtotal = () => cart.reduce((n, l) => n + lineTotal(l), 0);

  function badge() {
    const n = count();
    $$('.cart-n').forEach(b => { b.hidden = n === 0; b.textContent = n > 99 ? '99+' : n; });
    $$('.cart-n').forEach(b => { if (n) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } });
  }
  function render() {
    $('.cd-title', dr).textContent = cfg.cartTitle;
    $('.cd-count', dr).textContent = count() ? `(${count()})` : '';
    $('.cd-sub-l', dr).textContent = cfg.subtotal;
    $('.cd-note', dr).textContent = cfg.note;
    $('.cd-check', dr).textContent = cfg.checkout;
    $('.cd-empty', dr).textContent = cfg.empty;
    $('.cd-empty', dr).hidden = cart.length > 0;
    $('.cd-foot', dr).hidden = cart.length === 0;
    $('.cd-sub', dr).textContent = money(subtotal());
    $('.cd-list', dr).innerHTML = cart.map((l, i) => {
      const p = catalog.get(l.id); if (!p) return '';
      return `<li class="cd-item" data-i="${i}">
        <span class="cd-img"><img src="${esc(p.img)}" alt="" draggable="false"></span>
        <div class="cd-info"><h4>${esc(p.label)}</h4><p>${esc(l.w)} · ${esc(money(unitPrice(p, l.w)))}</p>
          <div class="qty sm"><button type="button" data-act="minus" aria-label="Decrease quantity">−</button><output>${l.q}</output><button type="button" data-act="plus" aria-label="Increase quantity">+</button></div></div>
        <div class="cd-end"><b>${esc(money(lineTotal(l)))}</b><button type="button" class="cd-rm" data-act="remove" aria-label="Remove ${esc(p.label)}">Remove</button></div>
      </li>`;
    }).join('');
    badge();
  }
  $('.cd-list', dr).addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const i = +b.closest('.cd-item').dataset.i, l = cart[i]; if (!l) return;
    if (b.dataset.act === 'plus') l.q = Math.min(99, l.q + 1);
    if (b.dataset.act === 'minus') l.q = l.q - 1;
    if (b.dataset.act === 'remove') l.q = 0;
    cart = cart.filter(x => x.q > 0); save(); render();
  });
  $('.cd-check', dr).addEventListener('click', () => {
    if (!cart.length) return;
    if (cfg.checkoutUrl) { window.open(cfg.checkoutUrl, '_blank', 'noopener'); return; }
    const lines = cart.map(l => { const p = catalog.get(l.id); return p ? `${l.q} x ${p.label} (${l.w}) - ${money(lineTotal(l))}` : ''; }).filter(Boolean);
    const text = `${lines.join('\n')}\n${cfg.subtotal}: ${money(subtotal())}`;
    const done = (ok) => toast(ok ? 'Order summary copied. Checkout is not connected yet.' : 'Checkout is not connected yet.');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(false)); else done(false);
  });

  /* ---------- toast ---------- */
  function toast(msg) {
    let t = $('#shop-toast');
    if (!t) { t = document.createElement('div'); t.id = 'shop-toast'; t.className = 'shop-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('on'), 2600);
  }

  /* ---------- product page ---------- */
  const buy = $('.buy'), pills = $('.d-weights'), amount = $('.bp-amount'), per = $('.bp-per'), qv = $('.q-val'), addBtn = $('.btn-add'), addT = $('.ba-t');
  function paintBuy() {
    if (!cur) return;
    buy.hidden = !shopOn();
    $$('li', pills).forEach(li => { const on = li.dataset.w === selW; li.classList.toggle('is-on', on); li.setAttribute('aria-checked', String(on)); });
    qv.textContent = qty;
    const one = unitPrice(cur, selW);
    amount.textContent = cfg.showPrices === false ? '' : money(one * qty);
    per.textContent = cfg.showPrices === false ? '' : `${selW} · ${money(one)} ${qty > 1 ? '× ' + qty : ''}`.trim();
    addT.textContent = cfg.addToCart;
  }
  function selectW(li) { if (!li) return; selW = li.dataset.w; paintBuy(); }
  pills.addEventListener('click', e => selectW(e.target.closest('li')));
  pills.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectW(e.target.closest('li')); } });
  $('.q-minus').addEventListener('click', () => { qty = Math.max(1, qty - 1); paintBuy(); });
  $('.q-plus').addEventListener('click', () => { qty = Math.min(99, qty + 1); paintBuy(); });
  addBtn.addEventListener('click', () => {
    if (!cur || !selW) return;
    const line = cart.find(l => l.id === cur.id && l.w === selW);
    if (line) line.q = Math.min(99, line.q + qty); else cart.push({ id: cur.id, w: selW, q: qty });
    save(); qty = 1; paintBuy(); render();
    toast(`${cfg.added}: ${cur.label}`);
    addBtn.classList.remove('pop'); void addBtn.offsetWidth; addBtn.classList.add('pop');
    openCart();
  });

  const shop = {
    setConfig(c) {
      Object.assign(cfg, c);
      const on = shopOn();
      document.documentElement.classList.toggle('shop-off', !on);
      document.documentElement.classList.toggle('prices-off', cfg.showPrices === false);
      if (!on) closeCart();
      paintBuy(); render();
      API.rebuildOthers();
    },
    setCatalog(list) {
      catalog = new Map(list.map(p => [p.id, p]));
      if (cur && catalog.get(cur.id)) cur = catalog.get(cur.id);
      render();
    },
    onDetail(p) {
      if (!cur || cur.id !== p.id) qty = 1;
      cur = p;
      if (!p.weights.includes(selW)) selW = p.weights[0] || '1kg';
      paintBuy();
    },
    fromText(p) { return shopOn() && cfg.showPrices !== false && p.price ? `${cfg.from} ${money(p.price)} ${cfg.perUnit}` : ''; },
    open: openCart, close: closeCart
  };
  window.ORGSHOP = shop;

  /* initial state from the site's defaults */
  shop.setCatalog(API.all());
  const first = API.currentProduct(); if (first) shop.onDetail(first);
  badge();
})();
