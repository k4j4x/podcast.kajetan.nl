(async () => {
  // the page's language (/nl/ → nl): cards open that language's start screen; a chosen language filter opens its own
  const PL = (location.pathname.match(/^\/(de|nl|fr|es|it)\//) || [])[1] || 'en';
  const W = {en: ['city', 'cities'], de: ['Stadt', 'Städte'], nl: ['stad', 'steden'], fr: ['ville', 'villes'],
             es: ['ciudad', 'ciudades'], it: ['città', 'città']}[PL];
  const q = document.getElementById('q'), lang = document.getElementById('lang');
  const list = document.getElementById('list'), count = document.getElementById('count'), none = document.getElementById('none');
  const data = await (await fetch('/episodes.json')).json();
  const items = [...list.children];
  const fold = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const hay = data.map(d => fold([d.city, d.country, d.region, ...d.titles].join(' ')));
  const nm = data.map(d => [d.city, ...(d.names || [])].map(fold));   // the city's own name(s), for the order below
  function apply() {
    const words = fold(q.value).split(/\s+/).filter(Boolean), l = lang.value;
    let n = 0;
    data.forEach((d, i) => {
      const ok = words.every(w => hay[i].includes(w)) && (!l || d.languages.includes(l));
      items[i].hidden = !ok; if (ok) n++;
      const to = l || (d.languages.includes(PL) ? PL : 'en');
      const a = items[i].querySelector('a'); a.href = to === 'en' ? d.url + (l ? '?lang=en' : '') : '/' + to + d.url;
    });
    // order (Kaj 2026-11-16): city named exactly like the search, then names starting with it, then names containing
    // it, then the rest (region/country/episode matches); alphabetical within each group
    const s = words.join(' ');
    const rank = i => !s ? 0 : nm[i].includes(s) ? 0 : nm[i].some(x => x.startsWith(s)) ? 1 : nm[i].some(x => x.includes(s)) ? 2 : 3;
    items.map((el, i) => [rank(i), i]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(([, i]) => list.append(items[i]));
    count.textContent = (words.length || l) ? '· ' + n + ' ' + (n === 1 ? W[0] : W[1]) : '';
    none.hidden = n > 0;
  }
  const p = new URLSearchParams(location.search);
  if (p.get('q')) q.value = p.get('q');
  if (p.get('lang')) lang.value = p.get('lang');
  q.addEventListener('input', apply); lang.addEventListener('change', apply); apply();
})();
