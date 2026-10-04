/* POWR site — shared shell: header/footer, language, cart drawer, forms, reveal. */
(() => {
  const S = window.POWR_SETTINGS;
  const P = window.POWR_PRODUCTS;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------------- language ---------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const urlLang = new URLSearchParams(location.search).get('lang');
  let lang = urlLang || store.get('powr_lang', (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en');
  const t = (en, es) => (lang === 'es' && es != null ? es : en);
  const money = (n) => new Intl.NumberFormat(lang === 'es' ? 'es-ES' : 'en-IE', { style: 'currency', currency: S.currency, minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);

  function applyLang(root = document) {
    document.documentElement.lang = lang;
    $$('[data-es]', root).forEach((el) => {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === 'es' ? el.dataset.es : el.dataset.en;
    });
    $$('[data-es-svg]', root).forEach((el) => {
      if (el.dataset.enSvg === undefined) el.dataset.enSvg = el.textContent;
      el.textContent = lang === 'es' ? el.dataset.esSvg : el.dataset.enSvg;
    });
    $$('[data-es-ph]', root).forEach((el) => {
      if (el.dataset.enPh === undefined) el.dataset.enPh = el.placeholder;
      el.placeholder = lang === 'es' ? el.dataset.esPh : el.dataset.enPh;
    });
    $$('[data-es-label]', root).forEach((el) => {
      if (el.dataset.enLabel === undefined) el.dataset.enLabel = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', lang === 'es' ? el.dataset.esLabel : el.dataset.enLabel);
    });
    const tt = document.querySelector('meta[name="title-es"]');
    if (tt) { document.body.dataset.titleEn ??= document.title; document.title = lang === 'es' ? tt.content : document.body.dataset.titleEn; }
    $$('.lang').forEach((b) => (b.textContent = lang === 'es' ? 'EN' : 'ES'));
  }
  function setLang(l) {
    lang = l; store.set('powr_lang', l); applyLang(); renderCart();
    document.dispatchEvent(new CustomEvent('powr:lang', { detail: l }));
  }

  /* ---------------- icons ---------------- */
  const I = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 016 0"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 8h16M4 16h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  };
  window.POWR_ICONS = I;
  const LOGO = `<img class="logo-word" src="assets/img/logo-wordmark.png?v=20261004b" alt="POWR" width="141" height="26">`;
  window.POWR_LOGO = LOGO;

  /* ---------------- header / footer ---------------- */
  const page = document.body.dataset.page || '';
  const cur = (p) => (page === p ? ' aria-current="page"' : '');
  const header = `
  <div class="announce"><span data-es="Envío gratis desde 40 € · Devolución en 30 días">Free shipping over €40 · 30-day returns</span></div>
  <header class="nav" id="nav">
    <div class="wrap">
      <a class="logo" href="index.html" aria-label="POWR home">${LOGO}</a>
      <nav class="nav-links" aria-label="Main">
        <a href="index.html#how"${cur('home')} data-es="Cómo funciona">How it works</a>
        <a href="product.html?id=kit"${cur('shop')} data-es="El kit">The kit</a>
        <a href="gyms.html"${cur('gyms')} data-es="Gimnasios">For gyms</a>
        <a href="index.html#app" data-es="La app">The app</a>
        <a href="contact.html"${cur('contact')} data-es="Contacto">Contact</a>
      </nav>
      <div class="nav-right">
        <button class="lang" type="button" aria-label="Switch language">ES</button>
        <a class="icon-btn" href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a>
        <button class="icon-btn" type="button" id="cartBtn" aria-label="Cart" data-es-label="Carrito">${I.bag}<span class="cart-count" id="cartCount">0</span></button>
        <a class="btn sm hide-m" href="product.html?id=kit" data-es="Comprar">Shop now</a>
        <button class="icon-btn burger" type="button" id="burger" aria-label="Menu" aria-expanded="false">${I.menu}</button>
      </div>
    </div>
  </header>
  <nav class="mobile-menu" id="mobileMenu" aria-label="Mobile">
    <a href="index.html#how" data-es="Cómo funciona">How it works</a>
    <a href="product.html?id=kit" data-es="El kit">The kit</a>
    <a href="gyms.html" data-es="Gimnasios">For gyms</a>
    <a href="index.html#app" data-es="La app">The app</a>
    <a href="contact.html" data-es="Contacto">Contact</a>
    <a class="btn block" href="product.html?id=kit" data-es="Crea tu kit · 29 €">Build your kit · €29</a>
    <div class="social-row"><a href="${S.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a>${S.email ? `<a href="mailto:${S.email}" aria-label="Email">${I.mail}</a>` : ''}</div>
  </nav>`;

  const footer = `
  <footer class="footer">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <a class="logo" href="index.html" aria-label="POWR home">${LOGO}</a>
          <p class="muted small" style="margin-top:16px;max-width:36ch" data-es="Entrenamiento basado en la velocidad con el móvil que ya llevas. Hecho en Madrid.">Velocity-based training with the phone you already own. Made in Madrid.</p>
          <form class="newsletter" name="newsletter" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-powr-form>
            <input type="hidden" name="form-name" value="newsletter">
            <p class="hp"><label>Leave empty <input name="bot-field"></label></p>
            <input type="email" name="email" required placeholder="Your email" data-es-ph="Tu email" aria-label="Email">
            <button class="btn sm" type="submit" data-es="Unirme">Join</button>
          </form>
          <p class="form-status small" style="margin-top:10px"></p>
          <p class="xs muted" style="margin-top:10px" data-es="Lanzamientos y acceso anticipado. Sin spam.">Launches and early access. No spam.</p>
        </div>
        <div><h4 data-es="Producto">Product</h4><ul>
          <li><a href="product.html?id=kit">POWR Kit</a></li>
          <li><a href="shop.html#box" data-es="Qué incluye">What's in the box</a></li>
          <li><a href="index.html#how" data-es="Cómo funciona">How it works</a></li>
          <li><a href="index.html#collar" data-es="POWR Collar (próximamente)">POWR Collar (coming later)</a></li>
        </ul></div>
        <div><h4 data-es="Empresas">Business</h4><ul>
          <li><a href="gyms.html" data-es="POWR para gimnasios">POWR for gyms</a></li>
          <li><a href="gyms.html#pricing" data-es="Precios gimnasios">Gym pricing</a></li>
          <li><a href="gyms.html#quote" data-es="Pedir presupuesto">Request a quote</a></li>
          <li><a href="contact.html?topic=coach" data-es="Entrenadores y equipos">Coaches &amp; teams</a></li>
        </ul></div>
        <div><h4 data-es="Ayuda">Help</h4><ul>
          <li><a href="index.html#faq">FAQ</a></li>
          <li><a href="legal.html#shipping" data-es="Envíos y devoluciones">Shipping &amp; returns</a></li>
          <li><a href="contact.html" data-es="Contacto">Contact</a></li>
          <li><a href="${S.instagram}" target="_blank" rel="noopener">Instagram ${S.instagramHandle}</a></li>
        </ul></div>
      </div>
      <div class="foot-bottom">
        <span>© ${new Date().getFullYear()} POWR · <span data-es="Todos los derechos reservados">All rights reserved</span></span>
        <nav>
          <a href="legal.html#privacy" data-es="Privacidad">Privacy</a>
          <a href="legal.html#terms" data-es="Condiciones">Terms</a>
          <a href="legal.html#shipping" data-es="Envíos">Shipping</a>
          <a href="legal.html#cookies">Cookies</a>
        </nav>
      </div>
    </div>
  </footer>`;

  const drawer = `
  <div class="scrim" id="scrim"></div>
  <aside class="drawer" id="drawer" aria-label="Cart" aria-hidden="true">
    <div class="drawer-head"><h3 data-es="Tu carrito">Your cart</h3><button class="icon-btn" id="drawerClose" aria-label="Close">${I.close}</button></div>
    <div class="drawer-body" id="drawerBody"></div>
    <div class="drawer-foot" id="drawerFoot"></div>
  </aside>
  <div class="toast" id="toast"></div>`;

  document.body.insertAdjacentHTML('afterbegin', header);
  document.body.insertAdjacentHTML('beforeend', footer + drawer);

  /* ---------------- cart ---------------- */
  let cart = store.get('powr_cart', []).filter((l) => P[l.id]);
  const saveCart = () => store.set('powr_cart', cart);
  const cartQty = () => cart.reduce((a, l) => a + l.qty, 0);
  const subtotal = () => cart.reduce((a, l) => a + P[l.id].price * l.qty, 0);
  /* A built kit is "clip.plate.ring" (catalog.js, custom); older carts hold one colour id. */
  const customParts = (id, cid) => {
    const c = P[id] && P[id].custom; const parts = typeof cid === 'string' ? cid.split('.') : [];
    if (!c || parts.length !== 3) return null;
    const clip = c.plastics.find((x) => x.id === parts[0]), plate = c.plastics.find((x) => x.id === parts[1]), ring = c.rings.find((x) => x.id === parts[2]);
    return clip && plate && ring ? { clip, plate, ring } : null;
  };
  const colorName = (id, cid) => {
    const k = customParts(id, cid);
    if (k) return `${t('Clip', 'Clip')} ${t(k.clip.en, k.clip.es)} · ${t('Plate', 'Placa')} ${t(k.plate.en, k.plate.es)} · ${t('Ring', 'Anillo')} ${t(k.ring.en, k.ring.es)}`;
    const c = (P[id].colors || []).find((x) => x.id === cid); return c ? t(c.en, c.es) : '';
  };

  function add(id, qty = 1, color = null) {
    if (!P[id]) return;
    color = color || (P[id].custom ? P[id].custom.presets[0].id : P[id].colors ? P[id].colors[0].id : null);
    const found = cart.find((l) => l.id === id && l.color === color);
    if (found) found.qty += qty; else cart.push({ id, color, qty });
    saveCart(); renderCart(); openDrawer();
    const c = $('#cartCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  }
  function setQty(i, q) { if (q <= 0) cart.splice(i, 1); else cart[i].qty = Math.min(q, 99); saveCart(); renderCart(); }
  function clearCart() { cart = []; saveCart(); renderCart(); }

  function lineHTML(l, i, editable = true) {
    const p = P[l.id];
    const img = ((p.colors || []).find((c) => c.id === l.color) || {}).img || p.img;
    const k = customParts(l.id, l.color);
    /* A built kit shows its three colours, not a photo of some other colour. */
    const pic = k
      ? `<span class="kit-swatch" aria-hidden="true"><i style="background:${k.clip.hex}"></i><i style="background:${k.plate.hex}"></i><i style="background:${k.ring.hex}"></i></span>`
      : `<img src="${img}" alt="" loading="lazy">`;
    return `<div class="line-item">
      ${pic}
      <div><h4>${p.name}</h4><div class="meta">${l.color ? colorName(l.id, l.color) + ' · ' : ''}${money(p.price)}</div>
        ${editable ? `<div class="qty"><button data-q="${i}" data-d="-1" aria-label="-">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="+">+</button></div>` : `<div class="meta">× ${l.qty}</div>`}
      </div>
      <div><div class="lp">${money(p.price * l.qty)}</div>${editable ? `<button class="remove" data-rm="${i}">${t('Remove', 'Quitar')}</button>` : ''}</div>
    </div>`;
  }

  function renderCart() {
    const n = cartQty(); const cc = $('#cartCount');
    if (cc) { cc.textContent = n; cc.classList.toggle('on', n > 0); }
    const body = $('#drawerBody'), foot = $('#drawerFoot');
    if (!body) return;
    if (!cart.length) {
      body.innerHTML = `<div class="empty">${I.bag}<p>${t('Your cart is empty.', 'Tu carrito está vacío.')}</p><a class="btn sm" href="product.html?id=kit">${t('Build your kit', 'Crea tu kit')}</a></div>`;
      foot.innerHTML = '';
      return;
    }
    const sub = subtotal(), left = Math.max(0, S.freeShippingFrom - sub);
    body.innerHTML = `<div class="ship-meter"><span>${left > 0 ? t(`You're <b>${money(left)}</b> away from free shipping`, `Te faltan <b>${money(left)}</b> para el envío gratis`) : t('You have <b>free shipping</b>', 'Tienes <b>envío gratis</b>')}</span><div class="bar"><i style="width:${Math.min(100, (sub / S.freeShippingFrom) * 100)}%"></i></div></div>` + cart.map((l, i) => lineHTML(l, i)).join('') + upsell();
    foot.innerHTML = `<div class="sum-row total"><span>${t('Subtotal', 'Subtotal')}</span><b>${money(sub)}</b></div>
      <p class="xs muted">${t('VAT included. Shipping calculated at checkout.', 'IVA incluido. Envío calculado en el pago.')}</p>
      <a class="btn block" href="checkout.html">${t('Checkout', 'Finalizar pedido')} →</a>
      <div class="pay-icons"><span>VISA</span><span>MASTERCARD</span><span>APPLE PAY</span><span>GOOGLE PAY</span><span>BIZUM</span></div>`;
  }
  function upsell() { return ''; } // one kit, nothing to upsell


  function openDrawer() { $('#drawer').classList.add('on'); $('#scrim').classList.add('on'); $('#drawer').setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { $('#drawer').classList.remove('on'); $('#scrim').classList.remove('on'); $('#drawer').setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }

  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]');
    if (q) { const i = +q.dataset.q; setQty(i, cart[i].qty + +q.dataset.d); document.dispatchEvent(new Event('powr:cart')); return; }
    const rm = e.target.closest('[data-rm]');
    if (rm) { setQty(+rm.dataset.rm, 0); document.dispatchEvent(new Event('powr:cart')); return; }
    const ad = e.target.closest('[data-add]');
    if (ad) { e.preventDefault(); add(ad.dataset.add, 1, ad.dataset.color || null); document.dispatchEvent(new Event('powr:cart')); }
  });
  $('#cartBtn').addEventListener('click', openDrawer);
  $('#drawerClose').addEventListener('click', closeDrawer);
  $('#scrim').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeDrawer(); toggleMenu(false); } });

  /* ---------------- nav ---------------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menu = $('#mobileMenu'), burger = $('#burger');
  function toggleMenu(force) {
    const open = force ?? !menu.classList.contains('open');
    menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open);
    burger.innerHTML = open ? I.close : I.menu; document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => toggleMenu());
  $$('a', menu).forEach((a) => a.addEventListener('click', () => toggleMenu(false)));
  $$('.lang').forEach((b) => b.addEventListener('click', () => setLang(lang === 'es' ? 'en' : 'es')));

  /* ---------------- toast ---------------- */
  let tt;
  function toast(msg) { const el = $('#toast'); el.innerHTML = msg; el.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('on'), 2600); }

  /* ---------------- forms (FormSubmit -> email) ---------------- */
  const SUBJECTS = { order: '🛒 New POWR order', 'gym-quote': '🏋️ Gym quote request', contact: '✉️ POWR contact', waitlist: '⏳ Pro sensor waitlist', newsletter: '📬 Newsletter sign-up' };
  async function submitForm(form, extra = {}) {
    const fd = new FormData(form);
    Object.entries(extra).forEach(([k, v]) => fd.set(k, v));
    if (fd.get('bot-field')) return true; // honeypot: pretend success, send nothing
    const name = fd.get('form-name') || form.getAttribute('name') || 'form';
    const data = {};
    for (const [k, v] of fd.entries()) if (typeof v === 'string' && !['form-name', 'bot-field'].includes(k) && v !== '') data[k] = v;
    const body = { _subject: `${SUBJECTS[name] || 'POWR form'}${data.order_id ? ' · ' + data.order_id : ''}${data.gym ? ' · ' + data.gym : ''}`, _template: 'table', _captcha: 'false', form: name, ...data };
    if (data.email) body._replyto = data.email;
    const res = await fetch(S.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || j.success === false || j.success === 'false') throw new Error(j.message || 'HTTP ' + res.status);
    return true;
  }
  $$('form[data-powr-form]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = form.nextElementSibling?.classList.contains('form-status') ? form.nextElementSibling : $('.form-status', form);
      const btn = $('button[type="submit"]', form);
      btn.disabled = true; const old = btn.innerHTML; btn.innerHTML = t('Sending…', 'Enviando…');
      try {
        await submitForm(form, { language: lang, page: location.pathname });
        form.reset();
        if (status) { status.className = 'form-status ok'; status.innerHTML = form.dataset.ok ? t(form.dataset.ok, form.dataset.okEs) : t("Thanks — you're on the list.", '¡Gracias! Ya estás en la lista.'); }
      } catch {
        if (status) { status.className = 'form-status err'; status.innerHTML = t('Something went wrong. Please try again or message us on Instagram.', 'Algo ha fallado. Inténtalo otra vez o escríbenos por Instagram.'); }
      } finally { btn.disabled = false; btn.innerHTML = old; }
    });
  });

  /* ---------------- reveal ---------------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  const observe = (root = document) => $$('.reveal:not(.in)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('in')));

  /* ---------------- range fill ---------------- */
  const fillRange = (r) => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');
  document.addEventListener('input', (e) => { if (e.target.matches('input[type="range"]')) fillRange(e.target); });

  /* ---------------- product card ---------------- */
  function card(id, featured = false) {
    const p = P[id];
    const box = (lang === 'es' ? p.boxEs : p.boxEn) || [];
    return `<article class="product reveal${featured ? ' featured' : ''}">
      <a class="product-media" href="product.html?id=${id}"><img src="${p.img}" alt="${p.name}" loading="lazy"><span class="tag ${featured ? 'solid' : 'teal'}">${t(p.tagEn, p.tagEs)}</span></a>
      <div class="product-body">
        <h3><a href="product.html?id=${id}">${p.name}</a></h3>
        <p>${t(p.shortEn, p.shortEs)}</p>
        <ul>${box.slice(0, 4).map((b) => `<li>${b}</li>`).join('')}</ul>
        <div class="price-row">
          <div class="price">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ''}<small>${t('VAT incl. · Free returns', 'IVA incl. · Devolución gratis')}</small></div>
          <button class="btn sm" data-add="${id}">${t('Add to cart', 'Añadir')}</button>
        </div>
      </div>
    </article>`;
  }

  window.POWR = { t, money, card, add, customParts, cart: () => cart, subtotal, clearCart, lineHTML, applyLang, observe, toast, submitForm, lang: () => lang, colorName, fillRange, store };

  applyLang(); renderCart(); observe();
  $$('input[type="range"]').forEach(fillRange);
})();
