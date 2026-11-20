(function () {
  var choices = document.querySelector('.errand-choices');
  var plan = document.getElementById('plan');
  var emptyEl = document.getElementById('plan-empty');
  var stepsEl = document.getElementById('plan-steps');
  var gate = document.getElementById('gate');
  var actionEl = document.getElementById('gate-action');
  var approveBtn = document.getElementById('gate-approve');
  var declineBtn = document.getElementById('gate-decline');
  var resultEl = document.getElementById('gate-result');
  var logEl = document.getElementById('activity-log');
  var logEmpty = document.getElementById('log-empty');
  var resetBtn = document.getElementById('errand-reset');
  if (!choices || !plan || !emptyEl || !stepsEl || !gate || !actionEl || !approveBtn || !declineBtn || !resultEl || !logEl || !resetBtn) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var ui = lang === 'en'
    ? { hold: 'Your OK' }
    : { hold: '要你点头' };

  var errands = {
    dinner: {
      zh: {
        steps: [
          { text: '查河堤小馆周五空位' },
          { text: '找到 19:15 两人位' },
          { text: '用你的名字订 19:15，两人。', gate: true }
        ],
        approve: '已订好。确认号 RT-0415（虚构）。',
        decline: '没订。空位留到今晚九点。'
      },
      en: {
        steps: [
          { text: 'Check Friday openings at Riverside Table' },
          { text: 'Found a table for two at 19:15' },
          { text: 'Book 19:15 under your name, for two.', gate: true }
        ],
        approve: 'Booked. Confirmation RT-0415 (invented).',
        decline: 'Not booked. The opening is held until nine tonight.'
      }
    },
    lamp: {
      zh: {
        steps: [
          { text: '记下目标价 ¥199' },
          { text: '今天价格 ¥238，未到' },
          { text: '价格降到 ¥189（演示中模拟）' },
          { text: '下单 ¥189，寄到家里。', gate: true }
        ],
        approve: '已下单 ¥189（虚构）。',
        decline: '没买。继续盯着。'
      },
      en: {
        steps: [
          { text: 'Note the target price, ¥199' },
          { text: "Today's price is ¥238, not yet" },
          { text: 'The price fell to ¥189 (simulated in this demo)' },
          { text: 'Place the order at ¥189 and send it home.', gate: true }
        ],
        approve: 'Ordered at ¥189 (invented).',
        decline: 'Not bought. Still watching.'
      }
    },
    dentist: {
      zh: {
        steps: [
          { text: '查日历，周四 14:00–17:00 空' },
          {
            text: '起草短信',
            draft: '您好，下周二的预约我来不了，能否改到周四下午？谢谢。',
            log: '起草短信：「您好，下周二的预约我来不了，能否改到周四下午？谢谢。」'
          },
          { text: '把这封短信发给诊所。', gate: true }
        ],
        approve: '已发出（虚构）。',
        decline: '草稿留着，没发。'
      },
      en: {
        steps: [
          { text: 'Check the calendar: Thursday 14:00–17:00 is free' },
          {
            text: 'Draft the note',
            draft: "Hi, I can't make next Tuesday — could we move to Thursday afternoon? Thanks.",
            log: 'Draft the note: “Hi, I can\'t make next Tuesday — could we move to Thursday afternoon? Thanks.”'
          },
          { text: 'Send this note to the clinic.', gate: true }
        ],
        approve: 'Sent (invented).',
        decline: 'The draft stays. Nothing was sent.'
      }
    }
  };

  var buttons = Array.prototype.slice.call(choices.querySelectorAll('.errand'));
  var timers = [];
  var token = 0;
  var chosen = '';
  var minute = 0;
  var pending = null;

  function prefersReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function clearTimers() {
    timers.forEach(function (id) { window.clearTimeout(id); });
    timers = [];
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function clock() {
    var total = (19 * 60) + 2 + minute;
    minute += 1;
    return pad(Math.floor(total / 60) % 24) + ':' + pad(total % 60);
  }

  function writeLog(text) {
    var stamp = clock();
    var item = document.createElement('li');
    var time = document.createElement('time');
    time.dateTime = stamp;
    time.textContent = stamp;
    var body = document.createElement('span');
    body.className = 'log-text';
    body.textContent = text;
    item.appendChild(time);
    item.appendChild(body);
    logEl.appendChild(item);
    if (logEmpty) logEmpty.hidden = true;
  }

  function mark(index, state) {
    var li = stepsEl.children[index];
    if (!li) return;
    li.classList.remove('is-done', 'is-hold', 'is-declined');
    if (state === 'done') li.classList.add('is-done');
    else if (state === 'hold') li.classList.add('is-hold');
    else if (state === 'declined') li.classList.add('is-declined');
    var flag = li.querySelector('.step-flag');
    if (flag && (state === 'done' || state === 'declined')) flag.hidden = true;
  }

  function render(spec) {
    stepsEl.textContent = '';
    spec.steps.forEach(function (step, index) {
      var li = document.createElement('li');
      li.className = 'plan-step' + (step.gate ? ' is-sensitive' : '');
      var num = document.createElement('span');
      num.className = 'step-num';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = String(index + 1);
      var body = document.createElement('div');
      body.className = 'step-body';
      var text = document.createElement('p');
      text.className = 'step-text';
      text.textContent = step.text;
      body.appendChild(text);
      if (step.gate) {
        var flag = document.createElement('p');
        flag.className = 'step-flag';
        flag.textContent = ui.hold;
        body.appendChild(flag);
      }
      var badge = document.createElement('span');
      badge.className = 'step-mark';
      badge.setAttribute('aria-hidden', 'true');
      li.appendChild(num);
      li.appendChild(body);
      li.appendChild(badge);
      stepsEl.appendChild(li);
    });
    emptyEl.hidden = true;
    stepsEl.hidden = false;
    gate.hidden = true;
    gate.classList.remove('is-settled');
    actionEl.textContent = '';
    resultEl.textContent = '';
    resultEl.hidden = true;
    approveBtn.disabled = false;
    declineBtn.disabled = false;
  }

  function showDraft(index, draft) {
    var li = stepsEl.children[index];
    if (!li) return;
    var body = li.querySelector('.step-body');
    if (!body || body.querySelector('.step-draft')) return;
    var quote = document.createElement('blockquote');
    quote.className = 'step-draft';
    quote.textContent = draft;
    body.appendChild(quote);
  }

  function openGate(spec, gateIndex, mine) {
    if (mine !== token) return;
    var step = spec.steps[gateIndex];
    mark(gateIndex, 'hold');
    actionEl.textContent = step.text;
    resultEl.textContent = '';
    resultEl.hidden = true;
    approveBtn.disabled = false;
    declineBtn.disabled = false;
    gate.classList.remove('is-settled');
    gate.hidden = false;
    pending = { spec: spec, gateIndex: gateIndex, mine: mine };
    plan.setAttribute('aria-busy', 'false');
    window.requestAnimationFrame(function () {
      if (mine !== token) return;
      try { gate.focus({ preventScroll: false }); }
      catch (err) { gate.focus(); }
    });
  }

  function decide(yes) {
    if (!pending || pending.mine !== token) return;
    var spec = pending.spec;
    var text = yes ? spec.approve : spec.decline;
    mark(pending.gateIndex, yes ? 'done' : 'declined');
    resultEl.hidden = false;
    resultEl.textContent = text;
    approveBtn.disabled = true;
    declineBtn.disabled = true;
    gate.classList.add('is-settled');
    writeLog(text);
    pending = null;
  }

  function finishStep(spec, index) {
    var step = spec.steps[index];
    mark(index, 'done');
    if (step.draft) showDraft(index, step.draft);
    writeLog(step.log || step.text);
  }

  function start(id) {
    var pack = errands[id];
    if (!pack) return;
    if (chosen === id) return;
    clearTimers();
    token += 1;
    var mine = token;
    chosen = id;
    pending = null;
    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-errand') === id ? 'true' : 'false');
    });
    var spec = pack[lang];
    render(spec);
    plan.setAttribute('aria-busy', 'true');
    var harmless = [];
    var gateIndex = spec.steps.length - 1;
    spec.steps.forEach(function (step, index) {
      if (!step.gate) harmless.push(index);
    });

    function tickAt(cursor) {
      if (mine !== token) return;
      finishStep(spec, harmless[cursor]);
      var next = cursor + 1;
      if (next < harmless.length) schedule(next);
      else scheduleGate();
    }

    function schedule(cursor) {
      timers.push(window.setTimeout(function () { tickAt(cursor); }, 450));
    }

    function scheduleGate() {
      timers.push(window.setTimeout(function () {
        openGate(spec, gateIndex, mine);
      }, 450));
    }

    if (prefersReduced()) {
      harmless.forEach(function (index) { finishStep(spec, index); });
      openGate(spec, gateIndex, mine);
      return;
    }
    schedule(0);
  }

  function reset() {
    clearTimers();
    token += 1;
    chosen = '';
    pending = null;
    minute = 0;
    buttons.forEach(function (btn) { btn.setAttribute('aria-pressed', 'false'); });
    stepsEl.textContent = '';
    stepsEl.hidden = true;
    emptyEl.hidden = false;
    gate.hidden = true;
    gate.classList.remove('is-settled');
    actionEl.textContent = '';
    resultEl.textContent = '';
    resultEl.hidden = true;
    approveBtn.disabled = false;
    declineBtn.disabled = false;
    logEl.textContent = '';
    if (logEmpty) logEmpty.hidden = false;
    plan.setAttribute('aria-busy', 'false');
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      start(btn.getAttribute('data-errand'));
    });
  });

  approveBtn.addEventListener('click', function () { decide(true); });
  declineBtn.addEventListener('click', function () { decide(false); });
  resetBtn.addEventListener('click', reset);
})();
