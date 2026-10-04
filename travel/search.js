(async () => {
  const q = document.getElementById('q'), lang = document.getElementById('lang');
  const list = document.getElementById('list'), count = document.getElementById('count'), none = document.getElementById('none');
  const data = await (await fetch('/travel/episodes.json')).json();
  const items = [...list.children];
  const fold = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const hay = data.map(d => fold([d.city, d.country, d.region, ...d.titles].join(' ')));
  function apply() {
    const words = fold(q.value).split(/\s+/).filter(Boolean), l = lang.value;
    let n = 0;
    data.forEach((d, i) => {
      const ok = words.every(w => hay[i].includes(w)) && (!l || d.languages.includes(l));
      items[i].hidden = !ok; if (ok) n++;
    });
    count.textContent = n + (n === 1 ? ' city' : ' cities');
    none.hidden = n > 0;
  }
  const p = new URLSearchParams(location.search);
  if (p.get('q')) q.value = p.get('q');
  if (p.get('lang')) lang.value = p.get('lang');
  q.addEventListener('input', apply); lang.addEventListener('change', apply); apply();
})();
