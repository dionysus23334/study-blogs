/* 这个码能用吗 — try each code twice, then once more at checkout. */

(function () {
  var root = document.querySelector('.check');
  var tabs = root ? Array.prototype.slice.call(root.querySelectorAll('.item-tab')) : [];
  var shopEl = document.getElementById('item-shop');
  var nameEl = document.getElementById('item-name');
  var priceEl = document.getElementById('item-price');
  var chipsEl = document.getElementById('chips');
  var checkBtn = document.getElementById('check-twice');
  var logCard = document.getElementById('log-card');
  var logEmpty = document.getElementById('log-empty');
  var logList = document.getElementById('log-list');
  var metaEl = document.getElementById('checkout-meta');
  var codeField = document.getElementById('checkout-code');
  var checkoutBtn = document.getElementById('checkout-go');
  var hint = document.getElementById('checkout-hint');
  var sizeBtn = document.getElementById('size-toggle');
  var sizeNote = document.getElementById('size-note');
  var result = document.getElementById('checkout-result');
  var reportBtn = document.getElementById('report-code');
  var startBtn = document.getElementById('start-over');
  var reportList = document.getElementById('report-list');
  if (!root || !tabs.length || !shopEl || !nameEl || !priceEl || !chipsEl || !checkBtn || !logCard || !logEmpty || !logList || !metaEl || !codeField || !checkoutBtn || !hint || !sizeBtn || !sizeNote || !result || !reportBtn || !startBtn || !reportList) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';

  function line(zh, en) {
    return { zh: zh, en: en };
  }

  var ui = lang === 'en'
    ? {
        shop: 'Riverside Store',
        list: 'List',
        auto: 'Auto test',
        human: 'Human review',
        stamp: { works: 'Works', expired: 'Expired', meh: 'Works, not worth it' },
        pending: 'Re-check pending',
        reported: 'Reported',
        useThis: 'Use this',
        ago: function (n) { return 'Last checked ' + n + ' min ago'; },
        hintWait: 'Check twice, and checkout will open.',
        hintChecking: 'Both passes are still running.',
        hintReady: 'The best code is filled in. Try it at checkout.',
        sizeOff: 'Size now: the one on the page.',
        sizeOn: 'Size now: a different one.',
        needCode: 'Enter a code first.',
        needCheck: 'Check twice before checkout.',
        unknown: 'This code is not on the log for this item.',
        stays: function (price) { return 'Checkout price stays ' + price + '. '; },
        sizeFail: 'Code redeemed, but not eligible for this item.',
        success: function (code, price) {
          return 'Checkout price ' + price + '. ' + code + ' applied at this step.';
        },
        tiny: function (code, price, saved) {
          return 'Checkout price ' + price + '. ' + code + ' saves ' + saved + '. It works, but it is not worth it.';
        },
        colon: ': '
      }
    : {
        shop: '河岸百货',
        list: '标价',
        auto: '自动测试',
        human: '人工复核',
        stamp: { works: '可用', expired: '已过期', meh: '能用但不值' },
        pending: '待复查',
        reported: '已报告',
        useThis: '用这个',
        ago: function (n) { return '上次验证：' + n + ' 分钟前'; },
        hintWait: '先验两遍，结账才会打开。',
        hintChecking: '两遍还在走。',
        hintReady: '最好的那个码已经填好，可以到结账页试一次。',
        sizeOff: '当前尺寸：页面上这一件。',
        sizeOn: '当前尺寸：另一号。',
        needCode: '先写一个优惠码。',
        needCheck: '先验两遍，再来结账。',
        unknown: '记录里没有这个码。',
        stays: function (price) { return '结账价仍是 ' + price + '。'; },
        sizeFail: '这个码已兑换，但不适用于当前商品。',
        success: function (code, price) {
          return '结账价 ' + price + '。' + code + ' 在这一步生效了。';
        },
        tiny: function (code, price, saved) {
          return '结账价 ' + price + '。' + code + ' 只少了 ' + saved + '，能用但不值。';
        },
        colon: '：'
      };

  var appliesLead = line('适用，减 ', 'Applies. Takes off ');
  var appliesTail = line('。', '.');
  var tinyLead = line('适用，只减 ', 'Applies. Takes off ');

  var items = [
    {
      id: 'umbrella',
      name: line('竹柄雨伞', 'Bamboo-handle umbrella'),
      price: { zh: 12800, en: 1800 },
      codes: [
        {
          code: 'RAIN20',
          kind: 'works',
          off: { zh: 2560, en: 360 },
          ago: 12,
          claim: line('标称减两成', 'Claims 20% off'),
          autoLead: appliesLead,
          autoTail: appliesTail,
          human: line('条款对得上这件伞，没有满减门槛。', 'Terms match this umbrella. No minimum.'),
          reason: line('减两成，这件可以直接用。', 'Twenty percent off, and this item qualifies.')
        },
        {
          code: 'SPRING50',
          kind: 'expired',
          off: { zh: 0, en: 0 },
          ago: 41,
          claim: line('标称减五成', 'Claims 50% off'),
          autoFixed: line('不适用。测试时被拒绝。', 'Does not apply. The test refused it.'),
          human: line('条款写明到 2026-03-01 截止。', 'Terms say it ended on 1 Mar 2026.'),
          reason: line('春天的码，已经过期。', 'A spring code. It has expired.')
        },
        {
          code: 'BIGBAG30',
          kind: 'meh',
          off: { zh: 0, en: 0 },
          ago: 6,
          claim: line('标称减三成', 'Claims 30% off'),
          autoFixed: line('折扣率在，但这件达不到门槛，实减 ¥0。', 'The rate is real, but this item misses the minimum. Saves $0.00.'),
          human: line('要满 ¥300 才生效。这件标价 ¥128。', 'It needs $45 in the basket. This item is $18.00.'),
          reason: line('满 ¥300 才行，单独买这件用不上。', 'The $45 minimum is more than this item.')
        }
      ]
    },
    {
      id: 'lamp',
      name: line('折叠露营灯', 'Folding camp lamp'),
      price: { zh: 19900, en: 2800 },
      codes: [
        {
          code: 'GLOW20',
          kind: 'works',
          off: { zh: 4000, en: 500 },
          ago: 8,
          claim: line('标称减 ¥40', 'Claims $5 off'),
          autoLead: appliesLead,
          autoTail: appliesTail,
          human: line('条款对得上这盏灯，不限颜色。', 'Terms match this lamp. Any colour.'),
          reason: line('少 ¥40，没有附加条件。', 'Five dollars off, with no catch.')
        },
        {
          code: 'FEST50',
          kind: 'expired',
          off: { zh: 0, en: 0 },
          ago: 54,
          claim: line('标称灯会半价', 'Claims half off'),
          autoFixed: line('不适用。活动日已经过了。', 'Does not apply. The festival day has passed.'),
          human: line('条款只写 2026-02-14 当天。', 'Terms name 14 Feb 2026 only.'),
          reason: line('灯会当天的码，过期了。', 'A festival-day code. It has expired.')
        },
        {
          code: 'COIN3',
          kind: 'meh',
          off: { zh: 300, en: 40 },
          ago: 19,
          claim: line('标称减 ¥3', 'Claims $0.40 off'),
          autoLead: tinyLead,
          autoTail: appliesTail,
          human: line('条款就是减这一点，没有别的条件。', 'The terms are only this small cut.'),
          reason: line('少了不到五块，不值得专门用。', 'It saves under a dollar. Not worth a separate code.')
        }
      ]
    },
    {
      id: 'kettle',
      name: line('手冲咖啡壶', 'Pour-over kettle'),
      price: { zh: 26000, en: 3600 },
      codes: [
        {
          code: 'POUR40',
          kind: 'works',
          off: { zh: 4000, en: 600 },
          ago: 4,
          claim: line('标称减 ¥40', 'Claims $6 off'),
          autoLead: appliesLead,
          autoTail: appliesTail,
          human: line('条款对得上这把壶，钢色也包括。', 'Terms match this kettle, including the steel one.'),
          reason: line('少 ¥40，没有附加条件。', 'Six dollars off, with no extra condition.')
        },
        {
          code: 'APRIL10',
          kind: 'expired',
          off: { zh: 0, en: 0 },
          ago: 27,
          claim: line('标称减一成', 'Claims 10% off'),
          autoFixed: line('不适用。测试时被拒绝。', 'Does not apply. The test refused it.'),
          human: line('条款写明到 2026-04-30 截止。', 'Terms say it ended on 30 Apr 2026.'),
          reason: line('四月的码，已经过期。', 'An April code. It has expired.')
        },
        {
          code: 'CREAM15',
          kind: 'meh',
          off: { zh: 0, en: 0 },
          ago: 11,
          claim: line('标称减一成半', 'Claims 15% off'),
          autoFixed: line('折扣率在，但这把是钢色，实减 ¥0。', 'The rate is real, but this kettle is steel. Saves $0.00.'),
          human: line('只限象牙色。页上这把是拉丝钢。', 'Ivory only. The one on the page is brushed steel.'),
          reason: line('要换成象牙色才生效，这把用不上。', 'It needs the ivory kettle. This one does not qualify.')
        }
      ]
    }
  ];

  var itemById = {};
  items.forEach(function (item) { itemById[item.id] = item; });

  var timers = [];
  var token = 0;
  var currentId = '';
  var checkedId = '';
  var checking = false;
  var pending = {};
  var failedCode = '';

  function prefersReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function clearTimers() {
    timers.forEach(function (id) { window.clearTimeout(id); });
    timers = [];
  }

  function formatMoney(cents) {
    var negative = cents < 0;
    var abs = Math.abs(cents);
    var whole = Math.floor(abs / 100);
    var frac = abs % 100;
    var body;
    if (lang === 'en') {
      body = whole + '.' + (frac < 10 ? '0' : '') + frac;
      return (negative ? '-' : '') + '$' + body;
    }
    body = frac === 0 ? String(whole) : whole + '.' + (frac < 10 ? '0' : '') + frac;
    return (negative ? '-' : '') + '¥' + body;
  }

  function bestOf(item) {
    var best = null;
    item.codes.forEach(function (code) {
      if (code.kind !== 'works') return;
      if (!best || code.off[lang] > best.off[lang]) best = code;
    });
    return best;
  }

  function autoText(code) {
    if (code.autoFixed) return code.autoFixed[lang];
    return code.autoLead[lang] + formatMoney(code.off[lang]) + code.autoTail[lang];
  }

  function renderCard(item) {
    shopEl.textContent = ui.shop;
    nameEl.textContent = item.name[lang];
    priceEl.textContent = ui.list + ' ' + formatMoney(item.price[lang]);
    chipsEl.textContent = '';
    item.codes.forEach(function (code) {
      var chip = document.createElement('li');
      chip.className = 'chip';
      var tokenEl = document.createElement('span');
      tokenEl.className = 'chip-code';
      tokenEl.textContent = code.code;
      tokenEl.setAttribute('translate', 'no');
      var claim = document.createElement('span');
      claim.className = 'chip-claim';
      claim.textContent = code.claim[lang];
      chip.appendChild(tokenEl);
      chip.appendChild(claim);
      chipsEl.appendChild(chip);
    });
    metaEl.textContent = ui.shop + ' · ' + item.name[lang] + ' · ' + formatMoney(item.price[lang]);
  }

  function showLogEmpty() {
    logList.textContent = '';
    logEmpty.hidden = false;
  }

  function clearResult() {
    result.textContent = '';
    result.className = 'checkout-result';
    failedCode = '';
    reportBtn.hidden = true;
  }

  function resetCheckoutFields() {
    codeField.value = '';
    checkoutBtn.disabled = true;
    hint.textContent = ui.hintWait;
    clearResult();
  }

  function setSize(on) {
    sizeBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    sizeNote.textContent = on ? ui.sizeOn : ui.sizeOff;
  }

  function selectItem(id, force) {
    if (!itemById[id]) return;
    if (!force && id === currentId) return;
    token += 1;
    clearTimers();
    checking = false;
    checkBtn.disabled = false;
    currentId = id;
    checkedId = '';
    tabs.forEach(function (tab) {
      tab.setAttribute('aria-pressed', tab.getAttribute('data-item') === id ? 'true' : 'false');
    });
    renderCard(itemById[id]);
    setSize(false);
    resetCheckoutFields();
    showLogEmpty();
    logCard.setAttribute('aria-busy', 'false');
  }

  function rowFor(code) {
    var rows = logList.querySelectorAll('.log-row');
    var i;
    for (i = 0; i < rows.length; i += 1) {
      if (rows[i].getAttribute('data-code') === code) return rows[i];
    }
    return null;
  }

  function stepLine(code, mark, label, detail) {
    var p = document.createElement('p');
    p.className = 'log-step';
    var num = document.createElement('span');
    num.className = 'step-no';
    num.textContent = mark;
    var lab = document.createElement('span');
    lab.className = 'step-label';
    lab.textContent = label;
    var det = document.createElement('span');
    det.className = 'step-detail';
    det.textContent = detail;
    p.appendChild(num);
    p.appendChild(lab);
    p.appendChild(det);
    return p;
  }

  function createRow(code) {
    var li = document.createElement('li');
    li.className = 'log-row';
    li.setAttribute('data-code', code.code);
    var name = document.createElement('p');
    name.className = 'log-code';
    name.textContent = code.code;
    name.setAttribute('translate', 'no');
    li.appendChild(name);
    return li;
  }

  function addPending(row) {
    if (row.querySelector('.stamp-pending')) return;
    var stamp = document.createElement('span');
    stamp.className = 'stamp stamp-pending';
    stamp.textContent = ui.pending;
    var verdict = row.querySelector('.stamp');
    if (verdict && verdict.parentNode) verdict.parentNode.insertBefore(stamp, verdict.nextSibling);
    else row.appendChild(stamp);
  }

  function finishRow(row, code, item, isBest) {
    row.appendChild(stepLine(code, '②', ui.human, code.human[lang]));
    row.classList.add('is-' + code.kind);

    var end = document.createElement('p');
    end.className = 'log-end';
    var stamp = document.createElement('span');
    stamp.className = 'stamp stamp-' + code.kind;
    stamp.textContent = ui.stamp[code.kind];
    var reason = document.createElement('span');
    reason.className = 'log-reason';
    reason.textContent = code.reason[lang];
    end.appendChild(stamp);
    end.appendChild(reason);
    row.appendChild(end);

    var ago = document.createElement('p');
    ago.className = 'log-ago';
    ago.textContent = ui.ago(code.ago);
    row.appendChild(ago);

    if (isBest) {
      row.classList.add('is-best');
      var price = document.createElement('p');
      price.className = 'log-price';
      var use = document.createElement('span');
      use.className = 'log-use';
      use.textContent = ui.useThis;
      var was = document.createElement('s');
      was.textContent = formatMoney(item.price[lang]);
      var now = document.createElement('span');
      now.className = 'log-now';
      now.textContent = formatMoney(item.price[lang] - code.off[lang]);
      price.appendChild(use);
      price.appendChild(was);
      price.appendChild(document.createTextNode(' → '));
      price.appendChild(now);
      row.appendChild(price);
    }

    if (pending[code.code]) addPending(row);
  }

  function finishRun(item, best, run) {
    if (run !== token) return;
    checking = false;
    checkBtn.disabled = false;
    logCard.setAttribute('aria-busy', 'false');
    checkedId = item.id;
    if (best) codeField.value = best.code;
    checkoutBtn.disabled = false;
    hint.textContent = ui.hintReady;
  }

  function runCheck() {
    var item = itemById[currentId];
    if (!item || checking) return;
    token += 1;
    var run = token;
    clearTimers();
    checking = true;
    checkBtn.disabled = true;
    checkedId = '';
    resetCheckoutFields();
    hint.textContent = ui.hintChecking;
    logEmpty.hidden = true;
    logList.textContent = '';
    logCard.setAttribute('aria-busy', 'true');

    var best = bestOf(item);
    var steps = [];
    item.codes.forEach(function (code) {
      steps.push({ type: 'auto', code: code });
      steps.push({ type: 'human', code: code, best: !!(best && best.code === code.code) });
    });

    function applyStep(index) {
      if (run !== token) return;
      var step = steps[index];
      var row = rowFor(step.code.code);
      if (!row) {
        row = createRow(step.code);
        logList.appendChild(row);
      }
      if (step.type === 'auto') row.appendChild(stepLine(step.code, '①', ui.auto, autoText(step.code)));
      else finishRow(row, step.code, item, step.best);
      if (index === steps.length - 1) finishRun(item, best, run);
    }

    if (prefersReduced()) {
      steps.forEach(function (_, index) { applyStep(index); });
      return;
    }
    steps.forEach(function (_, index) {
      timers.push(window.setTimeout(function () { applyStep(index); }, index * 400));
    });
  }

  function showResult(text, ok) {
    result.className = 'checkout-result ' + (ok ? 'is-ok' : 'is-fail');
    result.textContent = text;
  }

  function checkout() {
    var item = itemById[currentId];
    if (!item || checkedId !== item.id || checking) {
      showResult(ui.needCheck, false);
      reportBtn.hidden = true;
      failedCode = '';
      return;
    }
    var typed = codeField.value.replace(/^\s+|\s+$/g, '').toUpperCase();
    codeField.value = typed;
    if (!typed) {
      showResult(ui.needCode, false);
      reportBtn.hidden = true;
      failedCode = '';
      return;
    }
    var sizeOn = sizeBtn.getAttribute('aria-pressed') === 'true';
    var code = null;
    var list = formatMoney(item.price[lang]);
    item.codes.forEach(function (candidate) {
      if (candidate.code === typed) code = candidate;
    });
    if (sizeOn) {
      failedCode = typed;
      showResult(ui.stays(list) + ui.sizeFail, false);
      reportBtn.hidden = !!pending[typed];
      return;
    }
    if (!code) {
      failedCode = '';
      showResult(ui.unknown, false);
      reportBtn.hidden = true;
      return;
    }
    if (code.kind === 'works') {
      failedCode = '';
      showResult(ui.success(typed, formatMoney(item.price[lang] - code.off[lang])), true);
      reportBtn.hidden = true;
      return;
    }
    if (code.kind === 'meh' && code.off[lang] > 0) {
      failedCode = '';
      showResult(ui.tiny(typed, formatMoney(item.price[lang] - code.off[lang]), formatMoney(code.off[lang])), true);
      reportBtn.hidden = true;
      return;
    }
    failedCode = typed;
    showResult(ui.stays(list) + typed + ui.colon + code.reason[lang], false);
    reportBtn.hidden = !!pending[typed];
  }

  function report() {
    if (!failedCode || pending[failedCode]) return;
    pending[failedCode] = true;
    var li = document.createElement('li');
    li.textContent = ui.reported + ' · ' + failedCode;
    reportList.appendChild(li);
    var row = rowFor(failedCode);
    if (row) addPending(row);
    reportBtn.hidden = true;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      selectItem(tab.getAttribute('data-item'), false);
    });
  });

  checkBtn.addEventListener('click', runCheck);
  checkoutBtn.addEventListener('click', checkout);
  codeField.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (!checkoutBtn.disabled) checkout();
  });
  sizeBtn.addEventListener('click', function () {
    setSize(sizeBtn.getAttribute('aria-pressed') !== 'true');
    clearResult();
  });
  reportBtn.addEventListener('click', report);
  startBtn.addEventListener('click', function () {
    pending = {};
    reportList.textContent = '';
    selectItem(items[0].id, true);
  });

  selectItem(items[0].id, true);
})();
