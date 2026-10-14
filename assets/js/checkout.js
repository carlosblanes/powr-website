/* Checkout: 3 steps, summary, promo, order emailed via FormSubmit (form "order"). */
(() => {
  const { t, money, cart, subtotal, clearCart, lineHTML, applyLang, submitForm, store } = window.POWR;
  const S = window.POWR_SETTINGS, P = window.POWR_PRODUCTS;
  const $ = (id) => document.getElementById(id);
  const form = $('orderForm');
  let step = 1, promo = store.get('powr_promo', null);
  let ship = 'es', pay = 'card';

  if (!cart().length && !location.hash.includes('done') && !location.search.includes('paid=1')) {
    $('checkout').innerHTML = `<div class="empty" style="grid-column:1/-1;padding:120px 0">${window.POWR_ICONS.bag}<h2 style="font-size:32px">${t('Your cart is empty', 'Tu carrito está vacío')}</h2><a class="btn" href="shop.html">${t('Go to the shop', 'Ir a la tienda')}</a></div>`;
    return;
  }

  const totals = () => {
    const sub = subtotal();
    const disc = promo && S.promo[promo] ? +(sub * S.promo[promo]).toFixed(2) : 0;
    const opt = S.shipping.find((s) => s.id === ship);
    const shipCost = sub - disc >= S.freeShippingFrom ? 0 : opt.price;
    return { sub, disc, shipCost, total: +(sub - disc + shipCost).toFixed(2) };
  };

  function renderSummary() {
    $('sumLines').innerHTML = cart().map((l, i) => lineHTML(l, i, false)).join('');
    const { sub, disc, shipCost, total } = totals();
    $('sSub').textContent = money(sub);
    $('sDiscRow').style.display = disc ? '' : 'none';
    $('sDisc').textContent = '−' + money(disc);
    $('sShip').textContent = shipCost ? money(shipCost) : t('Free', 'Gratis');
    $('sTotal').textContent = money(total);
    $('placeBtn').textContent = `${t('Place order', 'Realizar pedido')} · ${money(total)}`;
    if (promo) $('promo').value = promo;
  }

  function renderOptions() {
    const { sub } = totals();
    $('shipOpts').innerHTML = S.shipping.map((s) => `<label class="radio-card"><input type="radio" name="ship_opt" value="${s.id}"${s.id === ship ? ' checked' : ''}><div><b>${t(s.en, s.es)}</b>${s.id === 'pickup' ? `<small>${t("We'll message you to arrange a time.", 'Te escribimos para quedar.')}</small>` : ''}</div><span class="rc-price">${s.price === 0 || sub >= S.freeShippingFrom ? t('Free', 'Gratis') : money(s.price)}</span></label>`).join('');
    $('payOpts').innerHTML = S.payment.map((p) => `<label class="radio-card"><input type="radio" name="pay_opt" value="${p.id}"${p.id === pay ? ' checked' : ''}><div><b>${t(p.en, p.es)}</b><small>${t(p.noteEn, p.noteEs)}</small></div><span></span></label>`).join('');
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'ship_opt') { ship = e.target.value; renderSummary(); }
    if (e.target.name === 'pay_opt') { pay = e.target.value; }
  });

  function valid(panel) {
    const fields = [...panel.querySelectorAll('input[required], select[required]')];
    const bad = fields.find((f) => !f.checkValidity());
    if (bad) { bad.reportValidity(); bad.focus(); return false; }
    return true;
  }

  function renderReview() {
    const fd = new FormData(form);
    const f = { get: (k) => String(fd.get(k) || '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`) };
    const shipOpt = S.shipping.find((s) => s.id === ship), payOpt = S.payment.find((p) => p.id === pay);
    const block = (title, body, go) => `<div class="review-block"><div><b>${title}</b>${body}</div><button type="button" data-next="${go}">${t('Edit', 'Editar')}</button></div>`;
    $('review').innerHTML =
      block(t('Contact', 'Contacto'), `${f.get('first_name')} ${f.get('last_name')}<br>${f.get('email')} · ${f.get('phone')}`, 1) +
      block(t('Ship to', 'Envío a'), ship === 'pickup' ? t('Pick up in Madrid', 'Recogida en Madrid') : `${f.get('address')}<br>${f.get('postcode')} ${f.get('city')}, ${f.get('country')}<br><span class="muted">${t(shipOpt.en, shipOpt.es)}</span>`, 1) +
      block(t('Payment', 'Pago'), `${t(payOpt.en, payOpt.es)}<br><span class="muted">${t(payOpt.noteEn, payOpt.noteEs)}</span>`, 2);
    $('payNote').textContent = t('No payment is taken on this page. We\'ll email you the payment step within 24 hours.', 'En esta página no se cobra nada. Te enviaremos el paso de pago por email en menos de 24 horas.');
  }

  function go(n) {
    const cur = document.querySelector(`.co-panel[data-p="${step}"]`);
    if (n > step && !valid(cur)) return;
    step = n;
    document.querySelectorAll('.co-panel').forEach((p) => p.classList.toggle('on', p.dataset.p == n));
    document.querySelectorAll('#stepper [data-s]').forEach((s) => { s.classList.toggle('on', s.dataset.s == n); s.classList.toggle('done', +s.dataset.s < n); });
    if (n === 3) renderReview();
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-next]'); if (b) go(+b.dataset.next); });
  $('editCart').addEventListener('click', () => document.getElementById('cartBtn').click());
  document.addEventListener('powr:cart', () => { if (!cart().length) location.reload(); renderSummary(); renderOptions(); });

  $('promoBtn').addEventListener('click', () => {
    const code = $('promo').value.trim().toUpperCase();
    if (S.promo[code]) { promo = code; store.set('powr_promo', code); $('promoMsg').innerHTML = `<span class="teal">✓ ${code} · −${Math.round(S.promo[code] * 100)}%</span>`; }
    else { promo = null; store.set('powr_promo', null); $('promoMsg').innerHTML = `<span style="color:var(--red)">${t('That code is not valid.', 'Ese código no es válido.')}</span>`; }
    renderSummary();
  });

  // Card: Stripe Checkout through the shop-checkout edge function. Returns null when Stripe is not
  // available (503 / network), so the caller falls back to emailing the order.
  async function stripeCheckout(fd) {
    const body = {
      items: cart().map((l) => ({ id: l.id, color: l.color, qty: l.qty })),
      email: fd.get('email'),
      shipping: { method: ship, name: `${fd.get('first_name')} ${fd.get('last_name')}`.trim(), address: fd.get('address'), city: fd.get('city'), postcode: fd.get('postcode'), country: fd.get('country'), phone: fd.get('phone') },
      lang: window.POWR.lang(),
    };
    if (promo) body.promo = promo;
    let res;
    try { res = await fetch(S.shopCheckoutEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
    catch { return null; }
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.url) return j;
    if (res.status === 503 || res.status >= 500) return null;
    const msg = {
      rate_limited: t('Too many attempts. Please wait a few minutes.', 'Demasiados intentos. Espera unos minutos.'),
      invalid_shipping: t('Please check your address.', 'Revisa tu dirección.'),
      invalid_email: t('Please check your email.', 'Revisa tu email.'),
    }[j.error] || t('We could not start the payment. Please try again.', 'No hemos podido iniciar el pago. Inténtalo de nuevo.');
    throw Object.assign(new Error(msg), { shown: true });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!$('terms').checked) { $('terms').reportValidity(); return; }
    const btn = $('placeBtn'); btn.disabled = true; btn.textContent = t('Placing order…', 'Enviando pedido…');
    const { sub, disc, shipCost, total } = totals();
    const fd = new FormData(form);
    const email = fd.get('email');
    try {
      if (pay === 'card') {
        const s = await stripeCheckout(fd);
        if (s) { store.set('powr_last_order', { orderId: s.orderId, total: s.totalCents / 100, pay, email }); location.href = s.url; return; }
      }
      const orderId = 'PWR-' + Date.now().toString(36).toUpperCase().slice(-6);
      const items = cart().map((l) => `${l.qty} × ${P[l.id].name}${l.color ? ' (' + window.POWR.colorName(l.id, l.color) + ')' : ''} @ ${P[l.id].price} €`).join(' | ');
      await submitForm(form, {
        order_id: orderId, items, subtotal: sub.toFixed(2), discount: disc.toFixed(2), shipping_cost: shipCost.toFixed(2), total: total.toFixed(2),
        language: window.POWR.lang(), shipping_method: ship, payment_method: pay, promo_code: promo || '',
      });
      store.set('powr_last_order', { orderId, total, pay, email, manual: true });
      clearCart(); store.set('powr_promo', null);
      done();
    } catch (err) {
      $('coStatus').className = 'form-status err';
      $('coStatus').textContent = err.shown ? err.message : t('We could not send your order. Please try again, or message us on Instagram @powr.app.', 'No hemos podido enviar tu pedido. Inténtalo de nuevo o escríbenos por Instagram @powr.app.');
      btn.disabled = false; renderSummary();
    }
  });

  function done() {
    const o = store.get('powr_last_order', {});
    document.querySelectorAll('.co-panel').forEach((p) => p.classList.toggle('on', p.dataset.p === 'done'));
    $('stepper').style.display = 'none'; $('summary').style.display = 'none';
    $('checkout').style.gridTemplateColumns = '1fr';
    const esc = (v) => String(v || '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`); o.email = esc(o.email);
    $('doneMsg').innerHTML = t(`Order <b class="teal">${o.orderId}</b> · ${money(o.total || 0)}. We'll email <b>${o.email}</b> within 24 hours.`, `Pedido <b class="teal">${o.orderId}</b> · ${money(o.total || 0)}. Te escribiremos a <b>${o.email}</b> en menos de 24 horas.`);
    $('doneStep1').textContent = o.pay === 'card' && !o.manual ? t('Stripe emails your receipt; we confirm shipping by email.', 'Stripe te envía el recibo y nosotros te confirmamos el envío por email.')
      : o.pay === 'card' ? t('Within 24 h you get a secure payment link (card, Apple Pay, Google Pay).', 'En 24 h recibes un enlace de pago seguro (tarjeta, Apple Pay, Google Pay).')
      : o.pay === 'bizum' ? t('Within 24 h we send you the Bizum details.', 'En 24 h te enviamos los datos para el Bizum.')
      : t('Within 24 h we send you the IBAN for the transfer.', 'En 24 h te enviamos el IBAN para la transferencia.');
    location.hash = 'done';
    scrollTo({ top: 0 });
  }

  renderOptions(); renderSummary();
  const qs = new URLSearchParams(location.search);
  if (qs.get('paid') === '1') {
    // Back from Stripe. Not proof of payment (anyone can type the URL) — the webhook is the truth.
    const last = store.get('powr_last_order', {}) || {};
    store.set('powr_last_order', { ...last, orderId: qs.get('order') || last.orderId, pay: 'card', manual: false });
    clearCart(); store.set('powr_promo', null); done();
  } else if (qs.get('cancelled') === '1') {
    window.POWR.toast(t('Payment cancelled — your cart is still here.', 'Pago cancelado — tu carrito sigue aquí.'));
  } else if (location.hash === '#done' && store.get('powr_last_order', null)) done();
  document.addEventListener('powr:lang', () => { renderOptions(); renderSummary(); if (step === 3) renderReview(); });
})();
