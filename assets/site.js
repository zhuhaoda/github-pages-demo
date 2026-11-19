(() => {
  'use strict';
  const toggle = document.getElementById('theme-toggle');
  function updateThemeButton() {
    if (!toggle) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    toggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    toggle.setAttribute('title', `Switch to ${dark ? 'light' : 'dark'} theme`);
    toggle.setAttribute('aria-pressed', String(dark));
  }
  updateThemeButton();
  toggle?.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('haoda-theme', theme); } catch {}
    updateThemeButton();
  });

  const clock = document.getElementById('local-time');
  function updateClock() {
    if (clock) clock.textContent = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Hong_Kong', hour12: false
    }).format(new Date()) + ' HKT';
  }
  updateClock();
  if (clock) setInterval(updateClock, 60000);

  for (const list of document.querySelectorAll('[data-filter-list]')) {
    const section = list.closest('[data-collection]');
    const search = section?.querySelector('[data-search]');
    const buttons = [...(section?.querySelectorAll('[data-filter]') || [])];
    const rows = [...list.querySelectorAll('[data-entry]')];
    const resultCount = section?.querySelector('[data-result-count]');
    const empty = section?.querySelector('.empty-state');
    let selected = 'all';
    function filter() {
      const query = (search?.value || '').trim().toLocaleLowerCase();
      let count = 0;
      for (const row of rows) {
        const matchCategory = selected === 'all' || row.dataset.category === selected;
        const matchText = !query || (row.dataset.search || '').toLocaleLowerCase().includes(query);
        row.hidden = !(matchCategory && matchText);
        if (!row.hidden) count += 1;
      }
      if (empty) empty.hidden = count > 0;
      if (resultCount) resultCount.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
      for (const button of buttons) {
        const active = button.dataset.filter === selected;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('active', active);
      }
    }
    search?.addEventListener('input', filter);
    for (const button of buttons) button.addEventListener('click', () => {
      selected = button.dataset.filter || 'all';
      filter();
    });
    filter();
  }

  const tocLinks = [...document.querySelectorAll('[data-toc-link]')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of tocLinks) {
          const active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      }
    }, { rootMargin: '-100px 0px -55% 0px', threshold: 0 });
    for (const link of tocLinks) {
      const id = link.getAttribute('href')?.slice(1);
      const section = id && document.getElementById(id);
      if (section) observer.observe(section);
    }
  }
})();
