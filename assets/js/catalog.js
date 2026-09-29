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
    model: 'assets/models/POWR_Clip_RevJ.stl',
    stripeLink: '',
    shortEn: 'Your phone becomes a velocity tracker on any Olympic bar.',
    shortEs: 'Tu móvil se convierte en un medidor de velocidad en cualquier barra olímpica.',
    boxEn: ['Phone ring — sticks to your phone or case', 'Metal magnet ring (55 × 45 mm) on the clip plate', 'POWR Bar Clip, two PETG parts in your colours, with 4 silicone grip strips — fits 50 mm Olympic sleeves'],
    boxEs: ['Anillo para el móvil — se pega al móvil o a la funda', 'Anillo magnético metálico (55 × 45 mm) sobre la placa del clip', 'POWR Bar Clip, dos piezas de PETG en tus colores, con 4 tiras de silicona — manguitos olímpicos de 50 mm'],
    // Older single-colour ids, still accepted in a saved cart.
    colors: [
      { id: 'black', en: 'Graphite', es: 'Grafito', hex: '#1d2021', img: 'assets/img/clip-hero.jpg' },
      { id: 'chalk', en: 'Chalk', es: 'Tiza', hex: '#e9e6df', img: 'assets/img/clip-chalk.jpg' },
      { id: 'teal', en: 'POWR Teal', es: 'Teal POWR', hex: '#38f0d7', img: 'assets/img/kit-complete.jpg' },
    ],
    /*
     * Build your own: a PETG colour for the clip, one for the plate, a finish for the
     * magnet ring. The cart stores it as "clip.plate.ring" (e.g. "black.teal.silver").
     * EDIT HERE to match the filament on the shelf, and mirror any id change in
     * supabase/functions/_shared/shop.ts (the checkout refuses ids it does not know).
     */
    custom: {
      plastics: [
        { id: 'black', en: 'Black', es: 'Negro', hex: '#18191a' },
        { id: 'white', en: 'White', es: 'Blanco', hex: '#ecebe7' },
        { id: 'grey', en: 'Grey', es: 'Gris', hex: '#7d8285' },
        { id: 'teal', en: 'POWR Teal', es: 'Teal POWR', hex: '#38f0d7' },
        { id: 'red', en: 'Red', es: 'Rojo', hex: '#c8202f' },
        { id: 'orange', en: 'Orange', es: 'Naranja', hex: '#f0671c' },
        { id: 'yellow', en: 'Yellow', es: 'Amarillo', hex: '#f4c20d' },
        { id: 'green', en: 'Green', es: 'Verde', hex: '#2f9e4a' },
        { id: 'blue', en: 'Blue', es: 'Azul', hex: '#1f63c6' },
        { id: 'navy', en: 'Navy', es: 'Azul marino', hex: '#1c2a4d' },
        { id: 'purple', en: 'Purple', es: 'Morado', hex: '#6b3fa6' },
        { id: 'pink', en: 'Pink', es: 'Rosa', hex: '#ef7aa9' },
      ],
      rings: [
        { id: 'silver', en: 'Silver', es: 'Plata', hex: '#cfd3d6' },
        { id: 'black', en: 'Black chrome', es: 'Cromo negro', hex: '#2b2d31' },
        { id: 'gold', en: 'Gold', es: 'Oro', hex: '#d6ae4a' },
        { id: 'rose', en: 'Rose gold', es: 'Oro rosa', hex: '#d9a08c' },
      ],
      presets: [
        { id: 'black.teal.silver', en: 'POWR', es: 'POWR' },
        { id: 'black.black.black', en: 'Stealth', es: 'Sigilo' },
        { id: 'white.white.silver', en: 'Chalk', es: 'Tiza' },
        { id: 'white.teal.silver', en: 'Arctic', es: 'Ártico' },
        { id: 'navy.navy.gold', en: 'Navy & gold', es: 'Marino y oro' },
        { id: 'red.yellow.gold', en: 'Roja', es: 'Roja' },
        { id: 'black.orange.black', en: 'Ember', es: 'Brasa' },
        { id: 'pink.white.rose', en: 'Blossom', es: 'Flor' },
      ],
    },
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
