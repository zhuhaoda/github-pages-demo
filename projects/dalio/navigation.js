const language = document.querySelector('[data-lang-link]');
if (language) {
  const sync = () => {
    language.search = location.search;
    language.hash = location.hash;
  };
  sync();
  // The scene selector and accuracy tabs use replaceState, which emits no hashchange.
  for (const event of ['dalio:routechange', 'hashchange', 'popstate', 'pageshow']) {
    window.addEventListener(event, sync);
  }
}
