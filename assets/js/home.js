/* Home page: product cards + the live "recording a set" phone in the hero. */
(() => {
  const { t, card, observe } = window.POWR;

  const products = document.getElementById('homeProducts');
  function renderProducts() {
    if (!products) return;
    products.innerHTML = card('kit', true) + gymCard();
    observe(products);
  }
  function gymCard() {
    return `<article class="product reveal">
      <a class="product-media" href="gyms.html"><img src="assets/img/gym-nfc.jpg" alt="" loading="lazy"><span class="tag teal">${t('Business', 'Empresas')}</span></a>
      <div class="product-body">
        <h3><a href="gyms.html">POWR for Gyms</a></h3>
        <p>${t('Tagged machines, member leaderboards and on-site installation.', 'Máquinas etiquetadas, rankings de socios e instalación en tu gimnasio.')}</p>
        <ul><li>${t('NFC + QR tag on every station', 'Etiqueta NFC + QR en cada estación')}</li><li>${t('Your gym listed in the app', 'Tu gimnasio dado de alta en la app')}</li><li>${t('Leaderboards by age, weight, machine', 'Rankings por edad, peso y máquina')}</li><li>${t('Installation by our team', 'Instalación por nuestro equipo')}</li></ul><p class="small muted">${t('Two plans: Gym and Gym Pro.', 'Dos planes: Gym y Gym Pro.')}</p>
        <div class="price-row">
          <div class="price"><span style="font-size:.55em;color:var(--muted);font-weight:600">${t('from', 'desde')}</span> €49<span style="font-size:.5em;color:var(--muted)">/${t('mo', 'mes')}</span><small>${t('+ one-off setup', '+ instalación única')}</small></div>
          <a class="btn sm ghost" href="gyms.html#quote">${t('Get a quote', 'Presupuesto')}</a>
        </div>
      </div>
    </article>`;
  }
  renderProducts();
  document.addEventListener('powr:lang', renderProducts);

  /* ---- live set: mirrors powr-native active-set + RepVelocityChart ----
   * Real 60 kg bench trace for the first 7 reps (fixtures/traces), then two slow reps.
   * Chart top = max(fastest, 0.5); STOP line at (100 - cutoff)% of the chart height;
   * FATIGUE = loss vs the fastest rep; the set stops after two consecutive reps past the cutoff. */
  const big = document.getElementById('liveBig');
  if (!big) return;
  const bars = document.getElementById('liveBars'), loss = document.getElementById('liveLoss'), peak = document.getElementById('livePeak'),
    rom = document.getElementById('liveRom'), meta = document.getElementById('liveMeta'), chipVel = document.getElementById('chipVel'), chipCue = document.getElementById('chipCue');
  const reps = [[0.80, 49], [0.68, 51], [0.75, 50], [0.72, 52], [0.75, 50], [0.64, 53], [0.67, 51], [0.61, 52], [0.59, 50]];
  const CUT = 20;
  const zone = (v) => v < 0.5 ? 'Absolute Strength' : v < 0.75 ? 'Accelerative' : v < 1 ? 'Strength-Speed' : v < 1.3 ? 'Speed-Strength' : 'Starting Strength';
  const cutEl = bars.querySelector('.cut');
  let i = 0, over = 0;
  const reset = () => { i = 0; over = 0; bars.querySelectorAll('.app-bar').forEach((b) => b.remove()); big.textContent = '--'; loss.textContent = '--'; loss.style.color = ''; peak.innerHTML = '--'; rom.innerHTML = '--'; meta.textContent = t('0 reps', '0 reps'); cutEl.style.opacity = 0; };
  function draw() {
    const done = reps.slice(0, i), vs = done.map((r) => r[0]), best = Math.max(...vs), top = Math.max(best, 0.5);
    [...bars.querySelectorAll('.app-bar')].forEach((b, k) => {
      b.style.height = `${(vs[k] / top) * 100}%`;
      b.classList.toggle('best', vs[k] === best);
      b.classList.toggle('slow', k > 0 && (1 - vs[k] / vs[k - 1]) * 100 >= CUT);
    });
    cutEl.style.opacity = 1; cutEl.style.bottom = `calc(1.5em + ${((100 - CUT) / 100) * (best / top)} * (100% - 2.9em))`;
  }
  function step() {
    if (i >= reps.length || over >= 2) { setTimeout(() => { reset(); setTimeout(step, 900); }, 3000); return; }
    const [v, r] = reps[i];
    const b = document.createElement('div'); b.className = 'app-bar'; b.innerHTML = `<span>${i + 1}</span>`; bars.appendChild(b);
    i++;
    const best = Math.max(...reps.slice(0, i).map((x) => x[0]));
    const l = Math.round((1 - v / best) * 100);
    over = l >= CUT ? over + 1 : 0;
    requestAnimationFrame(draw);
    big.textContent = v.toFixed(2);
    loss.innerHTML = i < 2 ? '--' : `${l}<small style="font-size:.6em">%</small>`;
    loss.style.color = over >= 2 ? '#fbbf24' : '';
    peak.innerHTML = `${(v * 1.5).toFixed(2)}<small style="font-size:.6em">m/s</small>`;
    rom.innerHTML = `${r}<small style="font-size:.6em">cm</small>`;
    meta.textContent = `${i} reps · ${zone(v)}`;
    chipVel.textContent = v.toFixed(2) + ' m/s';
    chipCue.textContent = over >= 2 ? t('“Set done”', '“Serie terminada”') : `“${i} — ${v.toFixed(2)}”`;
    setTimeout(step, over >= 2 ? 1800 : 1250);
  }
  reset(); setTimeout(step, 900);

  /* ---- set-analysis chart: Mean / Peak / MPV / Power / ROM, same bars as the app ---- */
  const saChart = document.getElementById('saChart'), saSeg = document.getElementById('saSeg');
  if (saChart) {
    const kg = 60, mean = reps.slice(0, 8).map((r) => r[0]), romv = reps.slice(0, 8).map((r) => r[1]);
    const M = {
      mean: { en: 'Mean velocity per rep', es: 'Velocidad media por rep', d: mean, u: 'm/s', stop: true },
      peak: { en: 'Peak velocity per rep', es: 'Velocidad pico por rep', d: mean.map((v) => +(v * 1.5).toFixed(2)), u: 'm/s', stop: true },
      mpv: { en: 'Mean propulsive velocity per rep', es: 'Velocidad media propulsiva por rep', d: mean.map((v) => +(v * 1.08).toFixed(2)), u: 'm/s', stop: true },
      power: { en: 'Power per rep', es: 'Potencia por rep', d: mean.map((v) => Math.round(kg * 9.81 * v)), u: 'W', stop: false },
      rom: { en: 'Range of motion per rep', es: 'Recorrido por rep', d: romv, u: 'cm', stop: false },
    };
    let m = 'mean';
    saChart.insertAdjacentHTML('beforeend', mean.map((_, k) => `<div class="bar"><span>${k + 1}</span></div>`).join(''));
    const renderSA = () => {
      const x = M[m], best = Math.max(...x.d), top = x.u === 'm/s' ? Math.max(best, 0.5) : best * 1.05;
      [...saChart.querySelectorAll('.bar')].forEach((b, k) => { b.style.height = `${(x.d[k] / top) * 100}%`; b.classList.toggle('best', x.d[k] === best); b.title = `${x.d[k]} ${x.u}`; });
      const cut = saChart.querySelector('.cut'); cut.style.opacity = x.stop ? 1 : 0; cut.style.bottom = `calc(24px + ${((100 - CUT) / 100) * (best / top)} * (100% - 38px))`;
      document.getElementById('saTitle').textContent = t(x.en, x.es);
      document.getElementById('saNote').textContent = t(`Fastest: ${best} ${x.u}${x.stop ? ' · STOP line at 20% loss' : ''}`, `Mejor: ${best} ${x.u}${x.stop ? ' · línea STOP al 20 % de pérdida' : ''}`);
      saSeg.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
    };
    saSeg.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { m = b.dataset.m; renderSA(); } });
    renderSA(); document.addEventListener('powr:lang', renderSA);
  }

  /* ---- goals: what powr-native changes per training goal ---- */
  const goalSeg = document.getElementById('goalSeg'), goalBody = document.getElementById('goalBody');
  if (goalSeg) {
    const G = [
      { id: 'power', en: 'Power', es: 'Potencia', q: ['IS THE BAR MOVING FASTER?', '¿SE MUEVE MÁS RÁPIDA LA BARRA?'], a: ['Moving faster', 'Más rápida'], cut: '10 %', lead: ['Peak velocity', 'Velocidad pico'], board: ['Fastest rep', 'Rep más rápida'],
        txt: ['Every rep has to be explosive. POWR stops the set at 10% velocity loss, before fatigue makes you slow, and tracks whether the bar gets faster at the same weight.', 'Cada rep tiene que ser explosiva. POWR para la serie al 10 % de pérdida de velocidad, antes de que la fatiga te frene, y vigila si la barra va más rápida con el mismo peso.'] },
      { id: 'strength', en: 'Strength', es: 'Fuerza', q: ['ARE YOUR LIFTS GOING UP?', '¿SUBEN TUS LEVANTAMIENTOS?'], a: ['Rising', 'Suben'], cut: '20 %', lead: ['Mean velocity', 'Velocidad media'], board: ['Strength score', 'Puntuación de fuerza'],
        txt: ['Heavy, high-quality reps. POWR stops the set at 20% loss, adjusts the weight of your next set, and tracks your estimated 1RM session by session.', 'Reps pesadas y de calidad. POWR para la serie al 20 % de pérdida, ajusta el peso de tu siguiente serie y sigue tu 1RM estimado sesión a sesión.'] },
      { id: 'hypertrophy', en: 'Muscle', es: 'Músculo', q: ['ARE YOUR MUSCLES GETTING ENOUGH?', '¿RECIBEN TUS MÚSCULOS LO SUFICIENTE?'], a: ['Well dosed', 'Bien dosificado'], cut: ['No cutoff', 'Sin límite'], lead: ['Range of motion', 'Recorrido'], board: ['Stimulating sets', 'Series efectivas'],
        txt: ['Muscle grows from hard sets through full range. POWR counts the sets that were really hard (20%+ velocity loss) for each muscle and shows whether you are in the 4–10 sets-a-week band.', 'El músculo crece con series duras y recorrido completo. POWR cuenta las series realmente duras (más del 20 % de pérdida) de cada músculo y te dice si estás entre 4 y 10 series por semana.'] },
      { id: 'endurance', en: 'Endurance', es: 'Resistencia', q: ['ARE YOU DOING MORE WORK?', '¿HACES MÁS TRABAJO?'], a: ['On track', 'En camino'], cut: ['No cutoff', 'Sin límite'], lead: ['Reps & volume', 'Reps y volumen'], board: ['Most reps', 'Más repeticiones'],
        txt: ['More work at moderate loads. POWR tracks volume and reps at 40–60% of your max, and whether you do more of it week after week.', 'Más trabajo con cargas moderadas. POWR sigue el volumen y las reps al 40–60 % de tu máximo, y si haces más semana tras semana.'] },
      { id: 'general', en: 'Fitness', es: 'Forma', q: ['ARE YOU KEEPING IT UP?', '¿MANTIENES EL RITMO?'], a: ['On track', 'En camino'], cut: '20 %', lead: ['Mean velocity', 'Velocidad media'], board: ['Sessions', 'Sesiones'],
        txt: ['Staying consistent is the win. POWR keeps sets safe with a 20% cutoff and tracks sessions a week, your streak and a 12-week consistency grid.', 'Ser constante es ganar. POWR mantiene las series seguras con un límite del 20 % y sigue tus sesiones por semana, tu racha y 12 semanas de constancia.'] },
    ];
    let g = 'strength';
    const L = (v) => Array.isArray(v) ? t(v[0], v[1]) : v;
    const renderGoal = () => {
      goalSeg.innerHTML = G.map((x) => `<button data-g="${x.id}" class="${x.id === g ? 'on' : ''}">${t(x.en, x.es)}</button>`).join('');
      const x = G.find((y) => y.id === g);
      goalBody.innerHTML = `<div style="display:grid;gap:8px"><span class="goal-q">${L(x.q)}</span><span class="goal-a teal">${L(x.a)}</span></div>
        <div class="goal-grid"><div><small>${t('Stop the set at', 'Parar la serie al')}</small><b>${L(x.cut)}</b></div><div><small>${t('First metric', 'Primera métrica')}</small><b>${L(x.lead)}</b></div><div><small>${t('Leaderboard', 'Ranking')}</small><b>${L(x.board)}</b></div></div>
        <p>${L(x.txt)}</p>
        ${x.id === 'strength' || x.id === 'power' ? `<p class="cite">${t('Stopping at 20% loss gave similar strength gains to 40%, with less fatigue', 'Parar al 20 % dio ganancias de fuerza similares a llegar al 40 %, con menos fatiga')} — Pareja-Blanco et al., Scand J Med Sci Sports, 2017</p>` : ''}`;
    };
    goalSeg.addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (b) { g = b.dataset.g; renderGoal(); } });
    renderGoal(); document.addEventListener('powr:lang', renderGoal);
  }
})();
