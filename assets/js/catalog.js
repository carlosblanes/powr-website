/*
 * POWR catalogue and store settings — THE ONE FILE TO EDIT for prices, products,
 * shipping and payment. Every page reads from here.
 *
 * Prices are in EUR, VAT included.
 * `stripeLink`: paste a Stripe Payment Link (https://buy.stripe.com/...) to take card
 * payment straight after the order is placed. Leave '' and the customer gets a payment
 * link by email instead (manual, no account needed to start).
 */
window.POWR_SETTINGS = {
  brand: 'POWR',
  currency: 'EUR',
  locale: 'es-ES',
  email: '',   // public contact email shown on the site; leave '' to hide it
  // Where orders, quotes and messages are emailed (FormSubmit, free, no account).
  // After the first submission FormSubmit emails an activation link; once activated you can
  // swap the address for the random alias it gives you, so the email is not in the page source.
  formEndpoint: 'https://formsubmit.co/ajax/carlos@highfrontier.es',
  // Card payments: Stripe Checkout via a Supabase edge function (prices are re-computed server-side
  // in supabase/functions/_shared/shop.ts — change a price in BOTH places). 503 = Stripe not configured
  // yet, in which case checkout falls back to emailing the order.
  shopCheckoutEndpoint: 'https://nkvmnwehztaovkldfprq.supabase.co/functions/v1/shop-checkout',
  instagram: 'https://www.instagram.com/powr.app/',
  instagramHandle: '@powr.app',
  freeShippingFrom: 40,
  shipping: [
    { id: 'es', en: 'Spain (peninsula) · 2–4 days', es: 'España (península) · 2–4 días', price: 3.95 },
    { id: 'eu', en: 'European Union · 4–7 days', es: 'Unión Europea · 4–7 días', price: 6.95 },
    { id: 'pickup', en: 'Pick up in Madrid · free', es: 'Recogida en Madrid · gratis', price: 0 },
  ],
  payment: [
    { id: 'card', en: 'Card, Apple Pay or Google Pay', es: 'Tarjeta, Apple Pay o Google Pay',
      noteEn: 'Pay securely with Stripe on the next page.',
      noteEs: 'Pago seguro con Stripe en la siguiente página.' },
    { id: 'bizum', en: 'Bizum', es: 'Bizum',
      noteEn: 'We confirm stock and send you the Bizum details.',
      noteEs: 'Confirmamos stock y te enviamos los datos de Bizum.' },
    { id: 'transfer', en: 'Bank transfer', es: 'Transferencia bancaria',
      noteEn: 'IBAN sent with your confirmation. Ships when received.',
      noteEs: 'Te enviamos el IBAN con la confirmación. Se envía al recibirla.' },
  ],
  promo: { POWR10: 0.10, FOUNDER: 0.15 },
};

window.POWR_PRODUCTS = {
  // The individual kit: everything one lifter needs. Three parts: phone ring, magnet, bar support.
  'kit': {
    name: 'POWR Kit',
    tagEn: 'Everything you need', tagEs: 'Todo lo que necesitas',
    price: 29, compareAt: 0,
    img: 'assets/img/clip-hero.jpg',
    model: 'assets/models/barclip.stl',
    stripeLink: '',
    shortEn: 'Your phone becomes a velocity tracker on any Olympic bar.',
    shortEs: 'Tu móvil se convierte en un medidor de velocidad en cualquier barra olímpica.',
    boxEn: ['Phone ring — sticks to your phone or case', 'Double-sided N52 magnet', 'POWR Bar Clip support — fits 50 mm Olympic sleeves'],
    boxEs: ['Anillo para el móvil — se pega al móvil o a la funda', 'Imán N52 de doble cara', 'Soporte POWR Bar Clip — manguitos olímpicos de 50 mm'],
    colors: [
      { id: 'black', en: 'Graphite', es: 'Grafito', hex: '#1d2021', img: 'assets/img/clip-hero.jpg' },
      { id: 'chalk', en: 'Chalk', es: 'Tiza', hex: '#e9e6df', img: 'assets/img/clip-chalk.jpg' },
      { id: 'teal', en: 'POWR Teal', es: 'Teal POWR', hex: '#38f0d7', img: 'assets/img/kit-complete.jpg' },
    ],
  },
};

// Order shown in the shop grid.
window.POWR_SHOP_ORDER = ['kit'];

/*
 * Gym plans and estimator rates — indicative, VAT excluded. The final quote is written by hand.
 * Plans are picked by station count; Gym Pro adds perStationOver for each station above includedStations.
 */
window.POWR_GYM = {
  plans: [
    { id: 'gym', name: 'Gym', maxStations: 30, monthly: 49 },
    { id: 'pro', name: 'Gym Pro', maxStations: Infinity, monthly: 99, includedStations: 100, perStationOver: 1 },
  ],
  setupPerStation: 18,   // NFC + QR tag, mapping and installation, per machine/station (one-off)
  visitFee: 0,           // travel/visit fee in Madrid; set for other cities if needed
  clipUnit: 19,          // bar clips sold to the gym to lend or resell at reception
  screenMonthly: 20,     // live leaderboard on a TV, per screen
  extraLocationMonthly: 39,
};
