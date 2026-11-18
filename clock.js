(() => {
  const card = document.querySelector('#offer');
  const announcement = document.querySelector('#announcement');
  const bannerHeading = announcement.querySelector('.ann-heading');
  const bannerDigits = announcement.querySelectorAll('.ann-unit b');
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
    const top = tile.querySelector('.upper i');
    const bottom = tile.querySelector('.lower i');
    top.textContent = value;
    if (!previous || motion.matches || !tile.animate) {
      bottom.textContent = value;
      return;
    }
    bottom.textContent = previous;
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
      animation.onfinish = () => {
        if (side === 'lower' && tile.dataset.value === value) bottom.textContent = value;
        leaf.remove();
      };
    }
  }
  let job;
  function update() {
    clearTimeout(job);
    const now = Date.now() + offset;
    card.hidden = now < start || now >= mondayEnd;
    announcement.hidden = card.hidden;
    if (document.hidden || now >= mondayEnd) return;
    if (now < start) {
      // Keep long waits within the browser timeout range.
      job = setTimeout(update, Math.min(start - now, 2147483647));
      return;
    }
    const friday = now < fridayEnd;
    card.querySelector('.phase').textContent = friday ? 'Black Friday' : 'Cyber Monday';
    card.querySelector('.until-label').textContent = friday ? 'Our biggest sale ends in' : 'Cyber Monday ends in';
    card.querySelector('.finish-date').textContent = friday ? 'Ends Nov 27' : 'Ends Nov 30';
    bannerHeading.textContent = friday ? 'Our biggest sale' : 'Cyber Monday sale';
    const phaseStart = friday ? start : fridayEnd;
    const phaseEnd = friday ? fridayEnd : mondayEnd;
    const pct = Math.max(0, Math.min(100, 100 * (now - phaseStart) / (phaseEnd - phaseStart)));
    bar.style.setProperty('--elapsed', pct.toFixed(4) + '%');
    bar.setAttribute('aria-valuenow', String(Math.floor(pct)));
    bar.title = friday ? 'Nov 1–27 · Black Friday' : 'Nov 28–30 · Cyber Monday';
    bar.setAttribute('aria-valuetext', Math.floor(pct) + '% elapsed, ' + bar.title);
    const s = Math.ceil(((friday ? fridayEnd : mondayEnd) - now) / 1000);
    const parts = [Math.floor(s/86400), Math.floor(s/3600)%24, Math.floor(s/60)%60, s%60];
    parts.forEach((n, i) => {
      const value = String(n).padStart(2, '0');
      paint(units[i], value);
      if (bannerDigits[i].textContent !== value) bannerDigits[i].textContent = value;
    });
    card.querySelector('time').dateTime = friday ? '2026-11-28T00:00:00+01:00' : '2026-12-01T00:00:00+01:00';
    card.querySelector('time').textContent = friday ? 'Ends November 27 at midnight, Stockholm time.' : 'Ends November 30 at midnight, Stockholm time.';
    job = setTimeout(update, 1005 - (now % 1000));
  }
  document.addEventListener('visibilitychange', update);
  update();
  for (const button of [card.querySelector('.coupon'), announcement.querySelector('.coupon')]) {
    let resetLabel;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('BLACK20');
        button.firstElementChild.textContent = 'Copied';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(button.querySelector('strong'));
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.firstElementChild.textContent = 'Copy code';
      }
      clearTimeout(resetLabel);
      resetLabel = setTimeout(() => button.firstElementChild.textContent = 'Use code', 1800);
    });
  }
})();
