/* Gyms page: tap demo, leaderboard demo, usage chart, plans, estimator. */
(() => {
  const { t, money, observe, fillRange } = window.POWR;
  const G = window.POWR_GYM;
  const $ = (id) => document.getElementById(id);

  /* ---- decorative QR (finder squares + seeded noise) ---- */
  (() => {
    const svg = $('qr'); if (!svg) return;
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let r = '';
    const finder = (x, y) => { r += `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`; };
    for (let y = 0; y < 29; y++) for (let x = 0; x < 29; x++) {
      const inF = (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
      if (!inF && rnd() > 0.52) r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
    finder(0, 0); finder(22, 0); finder(0, 22);
    r += '<rect x="11.5" y="11.5" width="6" height="6" rx="1.5" fill="#fff"/><path d="M12.8 15.6 L13.8 14.4 L14.6 16 L15.6 13 L16.4 14.6" fill="none" stroke="#17cfb6" stroke-width=".8" stroke-linecap="round" stroke-linejoin="round"/>';
    svg.innerHTML = `<g fill="#0d0d0d">${r}</g>`;
  })();

  /* ---- tap demo ---- */
  const demo = $('nfcDemo');
  const play = () => { demo.classList.remove('demo-on'); setTimeout(() => demo.classList.add('demo-on'), 1400); };
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); play(); } }, { threshold: 0.5 }).observe(demo);
  $('replay').addEventListener('click', play);

  /* ---- leaderboard demo ---- */
  const EX = [
    { id: 'bench', en: 'Bench Press · 80 kg', es: 'Press banca · 80 kg', base: 0.62 },
    { id: 'squat', en: 'Squat · 100 kg', es: 'Sentadilla · 100 kg', base: 0.78 },
    { id: 'dead', en: 'Deadlift · 140 kg', es: 'Peso muerto · 140 kg', base: 0.66 },
    { id: 'lat', en: 'Lat Pulldown · 60 kg', es: 'Jalón al pecho · 60 kg', base: 0.95 },
  ];
  const CAT = [
    { id: 'all', en: 'All', es: 'Todos' },
    { id: 'u30', en: 'Under 30', es: 'Menos de 30' },
    { id: '30s', en: '30–39', es: '30–39' },
    { id: '40p', en: '40+', es: '40+' },
    { id: 'w', en: 'Women', es: 'Mujeres' },
    { id: 'm83', en: '−83 kg', es: '−83 kg' },
  ];
  const PEOPLE = [
    ['Lucía M.', 27, 'w', 61], ['Javier R.', 31, 'm', 82], ['Alba G.', 24, 'w', 58], ['Marcos T.', 42, 'm', 90], ['Sara P.', 35, 'w', 66],
    ['Diego L.', 29, 'm', 79], ['Irene C.', 45, 'w', 63], ['Pablo S.', 22, 'm', 74], ['Nerea V.', 38, 'w', 70], ['Hugo F.', 51, 'm', 86],
    ['Carla D.', 26, 'w', 55], ['Andrés B.', 33, 'm', 95], ['Marta O.', 41, 'w', 68], ['Álvaro N.', 36, 'm', 81],
  ];
  let ex = 'bench', cat = 'all';
  const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 997, 7);
  function rows() {
    const e = EX.find((x) => x.id === ex);
    return PEOPLE
      .filter(([, age, sex, bw]) => cat === 'all' || (cat === 'u30' && age < 30) || (cat === '30s' && age >= 30 && age < 40) || (cat === '40p' && age >= 40) || (cat === 'w' && sex === 'w') || (cat === 'm83' && sex === 'm' && bw <= 83))
      .map(([n, age]) => ({ n, age, v: +(e.base - (hash(n + ex) % 38) / 100).toFixed(2), d: (hash(ex + n) % 7) - 2 }))
      .sort((a, b) => b.v - a.v).slice(0, 6);
  }
  function renderBoard() {
    $('exChips').innerHTML = EX.map((e) => `<button class="chip${e.id === ex ? ' on' : ''}" data-ex="${e.id}">${t(e.en, e.es)}</button>`).join('');
    $('catChips').innerHTML = CAT.map((c) => `<button class="chip${c.id === cat ? ' on' : ''}" data-cat="${c.id}">${t(c.en, c.es)}</button>`).join('');
    $('boardRows').innerHTML = rows().map((r, i) => `<div class="board-row${r.n === 'Diego L.' ? ' you' : ''}"><span class="rank">${i + 1}</span><span class="who"><span class="avatar">${r.n.split(' ').map((w) => w[0]).join('')}</span><span>${r.n}${r.n === 'Diego L.' ? ` <span class="teal xs">· ${t('you', 'tú')}</span>` : ''}<small>${r.age} ${t('yrs', 'años')}</small></span></span><span class="val">${r.v.toFixed(2)} m/s</span><span class="delta" style="color:${r.d > 0 ? 'var(--green)' : r.d < 0 ? 'var(--red)' : ''}">${r.d > 0 ? '▲' + r.d : r.d < 0 ? '▼' + -r.d : '—'}</span></div>`).join('')
      || `<div class="board-row"><span></span><span class="muted">${t('No one in this category yet', 'Nadie en esta categoría todavía')}</span></div>`;
    $('boardPeriod').textContent = t('Fastest rep · peak m/s · this week', 'Rep más rápida · pico m/s · esta semana');
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-ex]'); if (a) { ex = a.dataset.ex; renderBoard(); }
    const c = e.target.closest('[data-cat]'); if (c) { cat = c.dataset.cat; renderBoard(); }
  });

  /* ---- usage chart ---- */
  function renderUsage() {
    const u = [['Squat rack 1', 'Rack sentadilla 1', 96], ['Bench 2', 'Banco 2', 88], ['Lat pulldown', 'Jalón al pecho', 74], ['Leg press', 'Prensa', 61], ['Cable row', 'Remo en polea', 47], ['Pec deck', 'Contractora', 18]];
    $('usage').innerHTML = u.map(([en, es, v]) => `<div><span>${t(en, es)}</span><i style="width:${v}%;${v < 25 ? 'background:#3a4444' : ''}"></i><em>${v}%</em></div>`).join('');
  }

  /* ---- plans ---- */
  function renderPlans() {
    const feat = {
      gym: [t('Up to 30 tagged stations', 'Hasta 30 estaciones etiquetadas'), t('Your gym listed in the app', 'Tu gimnasio dado de alta en la app'), t('Leaderboards by age, weight and machine', 'Rankings por edad, peso y máquina'), t('Owner dashboard', 'Panel del gimnasio'), t('Launch kit: posters + staff training', 'Kit de lanzamiento: carteles + formación')]
      ,
      pro: [t('Unlimited stations (100 included, then €1 each)', 'Estaciones ilimitadas (100 incluidas, luego 1 € cada una)'), t('Everything in Gym', 'Todo lo de Gym'), t('Monthly challenges, run by us', 'Retos mensuales, gestionados por nosotros'), t('Your logo on tags and in the app', 'Tu logo en etiquetas y en la app'), t('Several locations, shared leaderboards', 'Varios centros con rankings compartidos'), t('Priority support', 'Soporte prioritario')],
    };
    const desc = { gym: t('Studios, boxes and neighbourhood gyms', 'Estudios, boxes y gimnasios de barrio'), pro: t('Large gyms and chains', 'Gimnasios grandes y cadenas') };
    $('plans').innerHTML = G.plans.map((p) => `<div class="plan reveal${p.id === 'pro' ? ' featured' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:center"><h3>${p.name}</h3>${p.id === 'pro' ? `<span class="tag solid">${t('All included', 'Todo incluido')}</span>` : ''}</div>
      <p class="muted small">${desc[p.id]}</p>
      <div class="price">${money(p.monthly)}<span style="font-size:.42em;color:var(--muted);font-weight:600">/${t('month', 'mes')}</span><small>+ ${money(G.setupPerStation)} ${t('per station, one-off installation', 'por estación, instalación única')}</small></div>
      <ul>${feat[p.id].map((f) => `<li>${f}</li>`).join('')}</ul>
      <a class="btn ${p.id === 'pro' ? '' : 'ghost'}" href="#quote" data-plan="${p.id}">${t('Get a quote', 'Pedir presupuesto')}</a>
    </div>`).join('');
    observe($('plans'));
  }

  /* ---- estimator ---- */
  const inputs = ['st', 'cl', 'sc', 'lo'].map($);
  function estimate() {
    const [st, cl, sc, lo] = inputs.map((i) => +i.value);
    inputs.forEach((i) => { $(i.id + 'O').textContent = i.value; fillRange(i); });
    const plan = G.plans.find((p) => st <= p.maxStations);
    const monthly = plan.monthly + (plan.includedStations && st > plan.includedStations ? (st - plan.includedStations) * plan.perStationOver : 0) + sc * G.screenMonthly + (lo - 1) * G.extraLocationMonthly;
    const setup = st * G.setupPerStation + G.visitFee;
    const clips = cl * G.clipUnit;
    $('estPlan').textContent = `${t('Plan', 'Plan')}: ${plan.name}`;
    $('eSetup').textContent = money(setup);
    $('eClips').textContent = money(clips);
    $('eMonthly').textContent = money(monthly);
    $('eYear').textContent = money(setup + clips + monthly * 12);
    $('estHidden').value = `plan=${plan.name}; stations=${st}; clips=${cl}; screens=${sc}; locations=${lo}; setup=${setup}; clips€=${clips}; monthly=${monthly}; year1=${setup + clips + monthly * 12}`;
    $('q-stations').value = st; $('q-loc').value = lo;
  }
  inputs.forEach((i) => i.addEventListener('input', estimate));

  function all() { renderBoard(); renderUsage(); renderPlans(); estimate(); }
  all();
  document.addEventListener('powr:lang', all);
})();
