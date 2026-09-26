/* Home page: product cards + the live "recording a set" phone in the hero. */
(() => {
  const { t, card, observe } = window.POWR;

  const products = document.getElementById('homeProducts');
  function renderProducts() {
    products.innerHTML = card('clip-kit') + card('complete-kit', true) + gymCard();
    observe(products);
  }
  function gymCard() {
    return `<article class="product reveal">
      <a class="product-media" href="gyms.html"><img src="assets/img/gym-nfc.jpg" alt="" loading="lazy"><span class="tag teal">${t('Business', 'Empresas')}</span></a>
      <div class="product-body">
        <h3><a href="gyms.html">POWR for Gyms</a></h3>
        <p>${t('Tagged machines, member leaderboards and on-site installation.', 'Máquinas etiquetadas, rankings de socios e instalación en tu gimnasio.')}</p>
        <ul><li>${t('NFC + QR tag on every station', 'Etiqueta NFC + QR en cada estación')}</li><li>${t('Your gym listed in the app', 'Tu gimnasio dado de alta en la app')}</li><li>${t('Leaderboards by age, weight, machine', 'Rankings por edad, peso y máquina')}</li><li>${t('Installation by our team', 'Instalación por nuestro equipo')}</li></ul>
        <div class="price-row">
          <div class="price"><span style="font-size:.55em;color:var(--muted);font-weight:600">${t('from', 'desde')}</span> €49<span style="font-size:.5em;color:var(--muted)">/${t('mo', 'mes')}</span><small>${t('+ one-off setup', '+ instalación única')}</small></div>
          <a class="btn sm ghost" href="gyms.html#quote">${t('Get a quote', 'Presupuesto')}</a>
        </div>
      </div>
    </article>`;
  }
  renderProducts();
  document.addEventListener('powr:lang', renderProducts);

  /* ---- live set simulation: 8 reps slowing down, cutoff at 20 % loss ---- */
  const big = document.getElementById('liveBig');
  const bars = document.getElementById('liveBars');
  const loss = document.getElementById('liveLoss');
  const peak = document.getElementById('livePeak');
  const rom = document.getElementById('liveRom');
  const chipVel = document.getElementById('chipVel');
  const chipCue = document.getElementById('chipCue');
  if (!big) return;

  const reps = [0.62, 0.64, 0.61, 0.58, 0.56, 0.53, 0.51, 0.48];
  const best = Math.max(...reps);
  const maxH = 1.0; // m/s mapped to 100 % height
  const cutFrac = (best * 0.8) / maxH; // 20 % loss line
  bars.querySelector('.cut').style.bottom = `calc(${cutFrac * 86}% + 3%)`;
  let i = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function reset() {
    i = 0; bars.querySelectorAll('.app-bar').forEach((b) => b.remove());
    big.textContent = '0.00'; big.className = 'app-big'; loss.textContent = '0%'; peak.textContent = '0.00'; rom.innerHTML = '0<small style="font-size:.6em">cm</small>';
  }
  function step() {
    if (i >= reps.length) { setTimeout(() => { reset(); setTimeout(step, 900); }, 2600); return; }
    const v = reps[i];
    const l = Math.round((1 - v / best) * 100);
    const cls = l >= 20 ? 'stop' : l >= 12 ? 'warn' : '';
    const b = document.createElement('div');
    b.className = 'app-bar ' + cls; b.innerHTML = `<span>${i + 1}</span>`;
    bars.appendChild(b);
    requestAnimationFrame(() => (b.style.height = `${(v / maxH) * 86}%`));
    big.textContent = v.toFixed(2); big.className = 'app-big ' + cls;
    loss.textContent = l + '%'; loss.style.color = cls === 'stop' ? '#ef4343' : cls === 'warn' ? '#fbbf24' : '';
    peak.textContent = (v * 1.62).toFixed(2);
    rom.innerHTML = `${41 + (i % 3)}<small style="font-size:.6em">cm</small>`;
    chipVel.textContent = v.toFixed(2) + ' m/s';
    chipCue.textContent = cls === 'stop' ? t('“Stop — 20% loss”', '“Para — 20 % de pérdida”') : `“${t('Rep', 'Rep')} ${i + 1} — ${v.toFixed(2)}”`;
    i = cls === 'stop' ? reps.length : i + 1;
    setTimeout(step, cls === 'stop' ? 1800 : 1250);
  }
  setTimeout(step, reduce ? 0 : 900);
})();
