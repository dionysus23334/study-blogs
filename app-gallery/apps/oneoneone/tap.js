/* 开一下 — rewrite how a path is described.
   Nothing is stored. No network calls. Refresh returns the switch to off. */

(function () {
  var root = document.getElementById('tap');
  if (!root) return;

  function byId(id) { return document.getElementById(id); }

  var notice = byId('tap-notice');
  var midRole = byId('mid-role');
  var midName = byId('mid-name');
  var explain = byId('explain');
  var switchBtn = byId('paper-switch');
  var switchLabel = byId('switch-label');
  var statusEl = byId('tap-status');
  var live = byId('live-status');

  if (!notice || !midRole || !midName || !explain || !switchBtn || !switchLabel || !statusEl || !live) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var copy = lang === 'en'
    ? {
        midRoleOff: 'Middle',
        midRoleOn: 'Nearer',
        midNameOff: 'Observer on the path',
        midNameOn: 'Encrypted nearer hop',
        explainOff: 'The middle stop can still read the destination name. Press the switch, pause, and the path is rewritten as an encrypted nearer hop.',
        explainOn: 'The destination sits inside the encrypted hop. The observer stays in the margin and cannot read the name. Press again to bring back the first description.',
        turnOn: 'Turn it on',
        turnOff: 'Turn it off',
        rewriting: 'Rewriting',
        statusWait: 'Rewriting this path',
        statusOff: 'This path can still see where it goes',
        statusOn: 'The destination is taken into the encrypted hop',
        liveOff: 'The middle stop is an observer on the path, and the destination name is written beside it.',
        liveOn: 'The middle stop is an encrypted nearer hop. The observer cannot read the name.'
      }
    : {
        midRoleOff: '中间',
        midRoleOn: '近处',
        midNameOff: '路上的观察点',
        midNameOn: '加密的近处 hop',
        explainOff: '中间这一站还能读出去向的名字。按下去，停一停，这条路改写成加密的近处 hop。',
        explainOn: '去向收在加密 hop 里。观察点留在页边，读不出名字。再按一次，回到还能看见去向的说法。',
        turnOn: '开一下',
        turnOff: '关上',
        rewriting: '正在改写',
        statusWait: '正在改写这条路',
        statusOff: '这条路上还能看见去向',
        statusOn: '去向被收进加密 hop',
        liveOff: '中间是路上的观察点，去向的名字写在旁边。',
        liveOn: '中间是加密的近处 hop。观察点读不出名字。'
      };

  var on = false;
  var pending = false;
  var token = 0;

  function prefersReduced() {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (err) {
      return false;
    }
  }

  function say(message) {
    var spoken = message;
    if (live.textContent === spoken) spoken += '\u200B';
    live.textContent = spoken;
  }

  function paint(isOn) {
    root.setAttribute('data-state', isOn ? 'on' : 'off');
    midRole.textContent = isOn ? copy.midRoleOn : copy.midRoleOff;
    midName.textContent = isOn ? copy.midNameOn : copy.midNameOff;
    explain.textContent = isOn ? copy.explainOn : copy.explainOff;
    switchLabel.textContent = isOn ? copy.turnOff : copy.turnOn;
    switchBtn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
    statusEl.textContent = isOn ? copy.statusOn : copy.statusOff;
  }

  function finish(next) {
    on = next;
    paint(on);
    pending = false;
    root.classList.remove('is-wait');
    root.removeAttribute('aria-busy');
    switchBtn.removeAttribute('aria-disabled');
    say((on ? copy.statusOn : copy.statusOff) + ' ' + (on ? copy.liveOn : copy.liveOff));
  }

  switchBtn.addEventListener('click', function () {
    if (pending || switchBtn.getAttribute('aria-disabled') === 'true') return;
    var next = !on;
    pending = true;
    switchBtn.setAttribute('aria-pressed', next ? 'true' : 'false');
    switchBtn.setAttribute('aria-disabled', 'true');
    root.setAttribute('aria-busy', 'true');
    if (prefersReduced()) {
      finish(next);
      return;
    }
    root.classList.add('is-wait');
    switchLabel.textContent = copy.rewriting;
    statusEl.textContent = copy.statusWait;
    say(copy.statusWait);
    var mine = ++token;
    window.setTimeout(function () {
      if (mine !== token) return;
      finish(next);
    }, 400);
  });

  paint(false);
  say(notice.textContent.replace(/\s+/g, ' ').trim() + ' ' + copy.statusOff + ' ' + copy.liveOff);
})();
