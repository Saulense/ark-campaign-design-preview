(() => {
  const card = document.querySelector('#offer');
  const fridayEnd = Date.parse('2026-11-28T00:00:00+01:00');
  const mondayEnd = Date.parse('2026-12-01T00:00:00+01:00');
  // The alternate review link advances only this preview clock.
  const demoCyber = new URLSearchParams(location.search).get('phase') === 'cyber';
  const offset = demoCyber ? fridayEnd + 12 * 3600000 - Date.now() : 0;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const units = [...card.querySelectorAll('.flap')];
  const start = Date.parse('2026-11-01T00:00:00+01:00');
  const bar = card.querySelector('.timeline');
  function paint(tile, value) {
    const previous = tile.dataset.value;
    if (previous === value) return;
    tile.dataset.value = value;
    tile.querySelectorAll('.turn').forEach(el => el.remove());
    tile.querySelectorAll('i').forEach(el => el.textContent = value);
    if (!previous || motion.matches || !tile.animate) return;
    const faces = [
      ['upper', previous, ['rotateX(0deg)', 'rotateX(-90deg)'], 0],
      ['lower', value, ['rotateX(90deg)', 'rotateX(0deg)'], 135]
    ];
    for (const [side, digits, angles, delay] of faces) {
      const leaf = tile.querySelector('.' + side).cloneNode(true);
      leaf.classList.add('turn');
      leaf.firstElementChild.textContent = digits;
      tile.append(leaf);
      const animation = leaf.animate(angles.map(transform => ({transform})), {duration: 145, delay, fill:'both', easing:'ease-in-out'});
      animation.onfinish = () => leaf.remove();
    }
  }
  let job;
  function update() {
    clearTimeout(job);
    const now = Date.now() + offset;
    card.hidden = now < start || now >= mondayEnd;
    if (card.hidden || document.hidden) return;
    const friday = now < fridayEnd;
    card.querySelector('.phase').textContent = friday ? 'Black Friday' : 'Cyber Monday';
    card.querySelector('.until-label').textContent = friday ? 'Our best sale ends in' : 'Cyber Monday ends in';
    const phaseStart = friday ? start : fridayEnd;
    const phaseEnd = friday ? fridayEnd : mondayEnd;
    const pct = Math.max(0, Math.min(100, 100 * (now - phaseStart) / (phaseEnd - phaseStart)));
    bar.style.setProperty('--elapsed', pct.toFixed(4) + '%');
    bar.setAttribute('aria-valuenow', String(Math.floor(pct)));
    bar.title = friday ? 'Nov 1–27 · Black Friday' : 'Nov 28–30 · Cyber Monday';
    bar.setAttribute('aria-valuetext', Math.floor(pct) + '% elapsed, ' + bar.title);
    const s = Math.ceil(((friday ? fridayEnd : mondayEnd) - now) / 1000);
    const parts = [Math.floor(s/86400), Math.floor(s/3600)%24, Math.floor(s/60)%60, s%60];
    parts.forEach((n,i) => paint(units[i], String(n).padStart(2,'0')));
    card.querySelector('time').dateTime = friday ? '2026-11-28T00:00:00+01:00' : '2026-12-01T00:00:00+01:00';
    card.querySelector('time').textContent = friday ? 'Ends November 27 at midnight, Stockholm time.' : 'Ends November 30 at midnight, Stockholm time.';
    job = setTimeout(update, 1005 - (now % 1000));
  }
  document.addEventListener('visibilitychange', update);
  update();
  const btn=card.querySelector('.coupon');
  let clearFeedback;
  btn.addEventListener('click',async () => {
    try { await navigator.clipboard.writeText('BLACK20'); btn.firstElementChild.textContent='Copied'; }
    catch { const range=document.createRange();range.selectNodeContents(btn.querySelector('strong'));const selection=getSelection();selection.removeAllRanges();selection.addRange(range);btn.firstElementChild.textContent='Copy code'; }
    clearTimeout(clearFeedback);
    clearFeedback=setTimeout(()=>btn.firstElementChild.textContent='Use code',1800);
  });
})();
