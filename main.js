(function () {
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var icon = toggle ? toggle.querySelector('.theme-icon') : null;
  var meta = document.querySelector('meta[name="theme-color"]');

  function apply(theme) {
    root.dataset.theme = theme;
    if (icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
    if (toggle) toggle.setAttribute('aria-label', theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b0d10' : '#e9ecef');
  }

  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(saved || (prefersDark ? 'dark' : 'light'));

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }


  var LANG_KEY = 'hub-lang-scroll';

  function hubState() {
    var sections = document.querySelectorAll('main section[id]');
    var best = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= 96) best = sections[i];
    }
    if (!best) return { y: window.scrollY, ts: Date.now() };
    return {
      id: best.id,
      offset: window.scrollY - (best.getBoundingClientRect().top + window.scrollY),
      y: window.scrollY,
      ts: Date.now()
    };
  }

  function saveHubState() {
    try { sessionStorage.setItem(LANG_KEY, JSON.stringify(hubState())); } catch (e) {}
  }

  function restoreHubState() {
    var raw = null;
    try { raw = sessionStorage.getItem(LANG_KEY); } catch (e) {}
    if (!raw) return;
    var state;
    try { state = JSON.parse(raw); } catch (e) { return; }
    if (!state || Date.now() - state.ts > 15000) {
      try { sessionStorage.removeItem(LANG_KEY); } catch (e) {}
      return;
    }
    try { sessionStorage.removeItem(LANG_KEY); } catch (e) {}

    var prev = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    var target = state.y || 0;
    if (state.id) {
      var el = document.getElementById(state.id);
      if (el) target = el.getBoundingClientRect().top + window.scrollY + Math.max(0, state.offset || 0) - 76;
    }
    window.scrollTo(0, Math.max(0, target));
    setTimeout(function () { history.scrollRestoration = prev || 'auto'; }, 80);
  }

  document.querySelectorAll('.lang-switch a').forEach(function (a) {
    a.addEventListener('click', saveHubState);
  });

  function runRestore() { setTimeout(restoreHubState, 350); }
  if (document.readyState === 'complete') runRestore();
  else window.addEventListener('load', runRestore, { once: true });
  setTimeout(restoreHubState, 1200);

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }
})();
