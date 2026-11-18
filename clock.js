(() => {
  const card = document.querySelector('#offer');
  const fridayEnd = Date.parse('2026-11-28T00:00:00+01:00');
  const mondayEnd = Date.parse('2026-12-01T00:00:00+01:00');
  // The alternate review link advances only this preview clock.
  const demoCyber = new URLSearchParams(location.search).get('phase') === 'cyber';
  const offset = demoCyber ? fridayEnd + 12 * 3600000 - Date.now() : 0;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const units = [...card.querySelectorAll('.digits')];
  const start = Date.parse('2026-11-01T00:00:00+01:00');
  const bar = card.querySelector('.timeline');
  function paint(unit, value) {
    [...unit.children].forEach((slot, index) => {
      const next = value[index];
      if (slot.dataset.value === next) return;
      const old = slot.lastElementChild;
      slot.replaceChildren();
      slot.dataset.value = next;
      const face = document.createElement('i');
      face.textContent = next;
      slot.append(face);
      if (!old || motion.matches || !face.animate) return;
      slot.prepend(old);
      const timing = {duration: 390, easing: 'cubic-bezier(.22,.65,.26,1)'};
      old.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(92%)',opacity:0}],timing).onfinish = () => old.remove();
      face.animate([{transform:'translateY(-93%)',opacity:.12},{transform:'translateY(0)',opacity:1}],timing);
    });
  }
  let job;
  function update() {
    clearTimeout(job);
    const now = Date.now() + offset;
    card.hidden = now < start || now >= mondayEnd;
    if (card.hidden || document.hidden) return;
    const friday = now < fridayEnd;
    card.querySelector('.phase').textContent = friday ? 'Black Friday' : 'Cyber Monday';
    const phaseStart = friday ? start : fridayEnd;
    const phaseEnd = friday ? fridayEnd : mondayEnd;
    const pct = Math.max(0, Math.min(100, 100 * (now - phaseStart) / (phaseEnd - phaseStart)));
    bar.style.setProperty('--elapsed', pct.toFixed(4) + '%');
    bar.setAttribute('aria-valuenow', String(Math.floor(pct)));
    const dates = card.querySelector('.dates').children;
    dates[0].textContent = friday ? 'Nov 1' : 'Nov 28';
    dates[1].textContent = friday ? 'Nov 27' : 'Nov 30';
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
