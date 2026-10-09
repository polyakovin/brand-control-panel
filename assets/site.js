for (const button of document.querySelectorAll('[data-theme-choice]')) {
  const controller = window.PersonalBrandTheme;
  if (!controller) continue;
  button.setAttribute('aria-pressed', String(controller.preference === button.dataset.themeChoice));
  button.addEventListener('click', () => controller.choose(button.dataset.themeChoice));
  button.closest('[data-theme-control]').hidden = false;
}

const filterPanel = document.querySelector('[data-filters]');
if (filterPanel) {
  const search = document.querySelector('#catalog-search');
  const goal = document.querySelector('#catalog-goal');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-entry]')];
  const formatGuide = document.querySelector('[data-format-guide]');
  const empty = document.querySelector('#catalog-empty');
  const count = document.querySelector('#catalog-count');
  const normalize = value => value.toLocaleLowerCase('ru').replaceAll('ё', 'е').trim();
  const searchable = new Map(cards.map(card => [card, normalize(card.dataset.search)]));
  let type = 'all';
  function render() {
    const tokens = normalize(search.value).split(/\s+/).filter(Boolean);
    let total = 0;
    for (const card of cards) {
      const visible = (type === 'all' || card.dataset.kind === type) && (goal.value === 'all' || card.dataset.goal === goal.value) && tokens.every(token => searchable.get(card).includes(token));
      card.hidden = !visible;
      if (visible) total++;
    }
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === type)));
    if (formatGuide) formatGuide.hidden = !['all', 'format'].includes(type);
    count.textContent = `Показано: ${total} из ${cards.length}`;
    empty.hidden = total > 0;
  }
  function restore() {
    const params = new URLSearchParams(location.search);
    search.value = params.get('q') || '';
    type = buttons.some(b => b.dataset.filter === params.get('type')) ? params.get('type') : 'all';
    goal.value = [...goal.options].some(o => o.value === params.get('goal')) ? params.get('goal') : 'all';
    render();
  }
  function sync(mode) {
    const url = new URL(location.href);
    for (const [key, value] of [['q', search.value.trim()], ['type', type === 'all' ? '' : type], ['goal', goal.value === 'all' ? '' : goal.value]]) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url);
    render();
  }
  search.addEventListener('input', () => sync('replace'));
  goal.addEventListener('change', () => sync('push'));
  buttons.forEach(button => button.addEventListener('click', () => { type = button.dataset.filter; sync('push'); }));
  document.querySelector('#catalog-reset').addEventListener('click', () => { search.value = ''; type = 'all'; goal.value = 'all'; sync('push'); search.focus(); });
  window.addEventListener('popstate', restore);
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) { event.preventDefault(); search.focus(); }
  });
  restore();
  filterPanel.hidden = false;
}
for (const button of document.querySelectorAll('[data-copy]')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const box = button.closest('.formula-box');
    const formula = box.querySelector('[data-formula]');
    const status = box.querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(formula.textContent);
      status.textContent = 'Формула скопирована';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(formula);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Текст выделен. Скопируйте его через меню браузера или Ctrl/Cmd+C.';
    }
  });
}
