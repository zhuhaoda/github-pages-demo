// The two native tables remain readable if the enhancement cannot initialize.
function enableMetricTabs(section) {
  const list = section?.querySelector('#accuracy-switch');
  if (!list || list.querySelectorAll('[data-metric-tab]').length !== 2) return;
  const pairs = ['rmse', 'e2e'].map(name => {
    const tab = list.querySelector(`button#metric-tab-${name}[data-metric-tab="${name}"]`);
    const panel = section.querySelector(`.metric-panel#accuracy-${name}[data-metric="${name}"]`);
    return {tab, panel};
  });
  if (pairs.some(({tab, panel}) => !tab || !panel || tab.getAttribute('aria-controls') !== panel.id ||
    !panel.querySelector('h4') || !panel.querySelector('table'))) return;

  function select(index) {
    pairs.forEach(({tab, panel}, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panel.hidden = i !== index;
    });
  }
  const fragmentIndex = () => pairs.findIndex(({panel}) => location.hash === '#'+panel.id);
  function activate(index, focus) {
    select(index);
    if (focus) pairs[index].tab.focus({preventScroll:true});
    // A fragment-only replacement preserves scene/query parameters and scroll position.
    history.replaceState(history.state, '', '#'+pairs[index].panel.id);
    window.dispatchEvent(new Event('dalio:routechange'));
  }

  list.setAttribute('role', 'tablist');
  pairs.forEach(({tab, panel}, i) => {
    tab.setAttribute('role', 'tab');
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    tab.addEventListener('click', () => activate(i, false));
    tab.addEventListener('keydown', event => {
      let next;
      switch (event.key) {
        case 'Home': next = 0; break;
        case 'End': next = 1; break;
        case 'ArrowRight': case 'ArrowLeft': next = 1-i; break;
        default: return;
      }
      event.preventDefault();
      activate(next, true);
    });
  });
  select(Math.max(0, fragmentIndex()));
  list.hidden = false;
  window.addEventListener('hashchange', () => {
    const index = fragmentIndex();
    if (index !== -1) select(index);
  });
}

enableMetricTabs(document.getElementById('accuracy'));
