(function () {
  var slip = document.getElementById('slip');
  var seal = document.getElementById('open-slip');
  var inside = document.getElementById('slip-inside');
  var stateEl = document.getElementById('slip-state');
  var ahead = document.getElementById('ahead');
  var hint = document.getElementById('ahead-hint');
  var notebook = document.getElementById('notebook');
  var line = document.getElementById('notebook-line');
  var kicker = document.getElementById('notebook-kicker');
  if (!slip || !seal || !inside || !ahead || !hint || !notebook || !line) return;

  var paths = Array.prototype.slice.call(ahead.querySelectorAll('.path'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var opened = false;

  function openSlip() {
    if (opened) return;
    opened = true;
    slip.classList.add('is-open');
    ahead.classList.add('is-ready');
    seal.setAttribute('aria-expanded', 'true');
    seal.disabled = true;
    inside.inert = false;
    inside.removeAttribute('aria-hidden');
    if (stateEl) stateEl.textContent = stateEl.getAttribute('data-open') || stateEl.textContent;
    var ready = hint.getAttribute('data-ready');
    if (ready) hint.textContent = ready;
    paths.forEach(function (btn) { btn.disabled = false; });
    window.setTimeout(function () {
      try { inside.focus({ preventScroll: true }); }
      catch (err) { inside.focus(); }
    }, reduce ? 0 : 80);
  }

  function keep(btn) {
    if (!opened) return;
    if (btn.getAttribute('aria-pressed') === 'true') return;
    var pin = btn.getAttribute('data-pin') || '';
    if (!pin) return;
    paths.forEach(function (other) {
      other.setAttribute('aria-pressed', other === btn ? 'true' : 'false');
    });
    notebook.classList.add('is-kept');
    if (kicker) kicker.hidden = false;
    line.textContent = pin;
    line.classList.remove('is-in');
    if (!reduce) {
      void line.offsetWidth;
      line.classList.add('is-in');
    }
  }

  slip.addEventListener('click', function () { openSlip(); });

  paths.forEach(function (btn) {
    btn.addEventListener('click', function () { keep(btn); });
  });
})();
