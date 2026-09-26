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
      noteEn: 'Secure payment link sent by email — nothing is charged now.',
      noteEs: 'Te enviamos un enlace de pago seguro por email — ahora no se cobra nada.' },
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
  'clip-kit': {
    name: 'POWR Bar Clip Kit',
    tagEn: 'Best to start', tagEs: 'Para empezar',
    price: 29, compareAt: 0,
    img: 'assets/img/clip-hero.jpg',
    model: 'assets/models/barclip.stl',
    stripeLink: '',
    shortEn: 'Turns your phone into a velocity tracker on any Olympic bar.',
    shortEs: 'Convierte tu móvil en un medidor de velocidad en cualquier barra olímpica.',
    boxEn: ['POWR Bar Clip (fits 50 mm Olympic sleeves)', 'Double-sided N52 magnetic ring', '4 spare grip strips', '3 months of POWR Premium'],
    boxEs: ['POWR Bar Clip (manguito olímpico de 50 mm)', 'Anillo magnético N52 de doble cara', '4 tiras de agarre de repuesto', '3 meses de POWR Premium'],
    colors: [
      { id: 'black', en: 'Graphite', es: 'Grafito', hex: '#1d2021', img: 'assets/img/clip-hero.jpg' },
      { id: 'chalk', en: 'Chalk', es: 'Tiza', hex: '#e9e6df', img: 'assets/img/clip-chalk.jpg' },
      { id: 'teal', en: 'POWR Teal', es: 'Teal POWR', hex: '#38f0d7', img: 'assets/img/kit-complete.jpg' },
    ],
  },
  'complete-kit': {
    name: 'POWR Complete Kit',
    tagEn: 'Most popular', tagEs: 'Más vendido',
    price: 49, compareAt: 61,
    img: 'assets/img/kit-complete.jpg',
    model: 'assets/models/barclip.stl',
    stripeLink: '',
    shortEn: 'Barbell, dumbbells and machines — everything to track every lift.',
    shortEs: 'Barra, mancuernas y máquinas — todo para medir cada levantamiento.',
    boxEn: ['2 × POWR Bar Clip', 'Double-sided N52 magnetic ring', 'Forearm band for dumbbells & cables', '5 NFC tags for your home gym', '6 months of POWR Premium'],
    boxEs: ['2 × POWR Bar Clip', 'Anillo magnético N52 de doble cara', 'Banda de antebrazo para mancuernas y poleas', '5 etiquetas NFC para tu gimnasio en casa', '6 meses de POWR Premium'],
    colors: [
      { id: 'black', en: 'Graphite', es: 'Grafito', hex: '#1d2021', img: 'assets/img/clip-hero.jpg' },
      { id: 'chalk', en: 'Chalk', es: 'Tiza', hex: '#e9e6df', img: 'assets/img/clip-chalk.jpg' },
      { id: 'teal', en: 'POWR Teal', es: 'Teal POWR', hex: '#38f0d7', img: 'assets/img/kit-complete.jpg' },
    ],
  },
  'ring': {
    name: 'POWR Magnetic Ring',
    tagEn: 'Accessory', tagEs: 'Accesorio',
    price: 12, compareAt: 0,
    img: 'assets/img/ring.jpg',
    stripeLink: '',
    shortEn: 'Double-sided N52 ring. Makes any phone case snap to the clip.',
    shortEs: 'Anillo N52 de doble cara. Cualquier funda se engancha al clip.',
    boxEn: ['1 × magnetic ring', 'Alignment sticker'],
    boxEs: ['1 × anillo magnético', 'Pegatina de alineación'],
  },
  'nfc-tags': {
    name: 'NFC Home Gym Tags · 5',
    tagEn: 'Accessory', tagEs: 'Accesorio',
    price: 9, compareAt: 0,
    img: 'assets/img/nfc-tags.jpg',
    stripeLink: '',
    shortEn: 'Stick one on each station. Tap your phone and the exercise opens.',
    shortEs: 'Pega una en cada estación. Acerca el móvil y se abre el ejercicio.',
    boxEn: ['5 × NFC + QR tags, 40 mm, sweat-proof'],
    boxEs: ['5 × etiquetas NFC + QR, 40 mm, resistentes al sudor'],
  },
  'band': {
    name: 'POWR Forearm Band',
    tagEn: 'Accessory', tagEs: 'Accesorio',
    price: 14, compareAt: 0,
    img: 'assets/img/band.jpg',
    stripeLink: '',
    shortEn: 'Wear the phone on your forearm for dumbbells, cables and machines.',
    shortEs: 'Lleva el móvil en el antebrazo para mancuernas, poleas y máquinas.',
    boxEn: ['1 × knitted band with magnetic plate', 'Two sizes (S/M and L/XL) in the box'],
    boxEs: ['1 × banda tejida con placa magnética', 'Dos tallas (S/M y L/XL) en la caja'],
  },
};

// Order shown in the shop grid.
window.POWR_SHOP_ORDER = ['clip-kit', 'complete-kit', 'ring', 'band', 'nfc-tags'];

/*
 * Gym plans and estimator rates — indicative, VAT excluded. The final quote is written by hand.
 * Plans are picked by station count; Performance adds perStationOver for each station above includedStations.
 */
window.POWR_GYM = {
  plans: [
    { id: 'studio', name: 'Studio', maxStations: 20, monthly: 49 },
    { id: 'club', name: 'Club', maxStations: 60, monthly: 99 },
    { id: 'performance', name: 'Performance', maxStations: Infinity, monthly: 149, includedStations: 120, perStationOver: 1 },
  ],
  setupPerStation: 18,   // NFC + QR tag, mapping and installation, per machine/station (one-off)
  visitFee: 0,           // travel/visit fee in Madrid; set for other cities if needed
  clipUnit: 19,          // bar clips sold to the gym to lend or resell at reception
  screenMonthly: 20,     // live leaderboard on a TV, per screen
  extraLocationMonthly: 39,
};
