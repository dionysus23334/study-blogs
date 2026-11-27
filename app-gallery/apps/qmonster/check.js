/* 对完这一期 — match saved practice receipts against an invented draw.
   Nothing is stored. Refresh clears the page. Numbers are practice only. */

(function () {
  var PATTERNS = [
    '11223344', '22334455', '33445566', '44556677', '55667788', '66778899',
    '12121212', '23232323', '34343434', '45454545', '56565656', '67676767',
    '78787878', '89898989', '12341234', '23452345', '34563456', '45674567',
    '56785678', '67896789', '11112222', '22223333', '33334444', '44445555',
    '55556666', '66667777', '77778888', '88889999', '10101010', '20202020',
    '30303030', '40404040', '50505050', '60606060', '70707070', '80808080',
    '90909090', '13571357', '24682468', '14701470', '25802580', '36903690',
    '10011001', '20022002', '30033003', '40044004', '50055005', '60066006',
    '70077007', '80088008', '90099009', '11001100', '22002200', '33003300',
    '44004400', '55005500', '66006600', '77007700', '88008800', '99009900'
  ];

  var SHOPS = [
    { zh: '纸巷文具', en: 'Paper Lane Stationery' },
    { zh: '暮色豆浆', en: 'Dusk Soy' },
    { zh: '北窗书店', en: 'North Window Books' },
    { zh: '河岸修车', en: 'Riverbank Repair' },
    { zh: '三月茶叶', en: 'March Tea' },
    { zh: '空盒面包', en: 'Empty Box Bakery' },
    { zh: '斜坡花店', en: 'Slope Flowers' },
    { zh: '旧灯五金', en: 'Old Lamp Hardware' },
    { zh: '半山纸铺', en: 'Half Hill Paper' },
    { zh: '青石菜场', en: 'Bluestone Market' },
    { zh: '午后唱片', en: 'Afternoon Records' },
    { zh: '南风裁缝', en: 'South Wind Tailor' },
    { zh: '桥头冰室', en: 'Bridge Ice Room' },
    { zh: '白墙画具', en: 'White Wall Paints' },
    { zh: '慢船咖啡', en: 'Slow Boat Coffee' }
  ];

  /* Fingerprints of eight-digit strings that must never be shown. */
  var BLOCKED = {
    '84813b76': 1,
    '3650a698': 1,
    '326f7309': 1,
    '7a4df065': 1,
    '6d282c59': 1
  };

  function fingerprint(value) {
    var hash = 2166136261;
    for (var i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    var hex = (hash >>> 0).toString(16);
    while (hex.length < 8) hex = '0' + hex;
    return hex;
  }

  function blocked(value) {
    return !!BLOCKED[fingerprint(value)];
  }

  function pad2(n) {
    var s = String(n);
    return s.length < 2 ? '0' + s : s;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function tierOf(num, draw) {
    if (num === draw.special || num === draw.second) return 8;
    var best = 0;
    for (var i = 0; i < draw.first.length; i++) {
      var prize = draw.first[i];
      if (num === prize) return 8;
      for (var k = 7; k >= 3; k--) {
        if (num.slice(-k) === prize.slice(-k)) {
          if (k > best) best = k;
          break;
        }
      }
    }
    return best;
  }

  function fixedTerm() {
    return {
      id: '01',
      special: '11223344',
      second: '55667788',
      first: ['12121212', '34343434', '56565656'],
      receipts: [
        { shop: 0, date: '2026-09-04', number: '90807212' },
        { shop: 1, date: '2026-09-17', number: '87003434' },
        { shop: 2, date: '2026-09-28', number: '10293847' },
        { shop: 3, date: '2026-10-09', number: '56471029' },
        { shop: 4, date: '2026-10-22', number: '81726390' }
      ]
    };
  }

  function matchLast(rand, prize, k) {
    var headLen = 7 - k;
    var out = '';
    for (var i = 0; i < headLen; i++) out += String(Math.floor(rand() * 10));
    var pivot = Number(prize.charAt(7 - k));
    var next = Math.floor(rand() * 9);
    if (next >= pivot) next += 1;
    return out + String(next) + prize.slice(8 - k);
  }

  function scramble(rand) {
    var chars = PATTERNS[Math.floor(rand() * PATTERNS.length)].split('');
    chars[0] = String((Number(chars[0]) + 1 + Math.floor(rand() * 8)) % 10);
    chars[5] = String(Math.floor(rand() * 10));
    chars[6] = String(Math.floor(rand() * 10));
    chars[7] = String(Math.floor(rand() * 10));
    return chars.join('');
  }

  function sharesTail(num, draw) {
    var tail = num.slice(-3);
    if (draw.special.slice(-3) === tail || draw.second.slice(-3) === tail) return true;
    for (var i = 0; i < draw.first.length; i++) {
      if (draw.first[i].slice(-3) === tail) return true;
    }
    return false;
  }

  function datesFor(index) {
    var monthA = (index % 6) + 1;
    var monthB = (monthA % 12) + 1;
    var yearB = monthA === 12 ? 2027 : 2026;
    var shift = index % 4;
    return [
      '2026-' + pad2(monthA) + '-' + pad2(4 + shift),
      '2026-' + pad2(monthA) + '-' + pad2(12 + shift),
      '2026-' + pad2(monthA) + '-' + pad2(21 + shift),
      yearB + '-' + pad2(monthB) + '-' + pad2(7 + shift),
      yearB + '-' + pad2(monthB) + '-' + pad2(18 + shift)
    ];
  }

  function tryBuild(index, attempt) {
    var rand = mulberry32(((index + 1) * 10007) + (attempt * 131) + 17);
    var pool = PATTERNS.slice();
    var picked = [];
    var guard = 0;
    while (picked.length < 5 && pool.length && guard < 80) {
      guard += 1;
      var at = Math.floor(rand() * pool.length);
      var candidate = pool.splice(at, 1)[0];
      if (blocked(candidate)) continue;
      var clash = false;
      for (var j = 0; j < picked.length; j++) {
        if (picked[j].slice(-4) === candidate.slice(-4)) clash = true;
      }
      if (!clash) picked.push(candidate);
    }
    if (picked.length < 5) return null;

    var draw = {
      id: pad2(index + 1),
      special: picked[0],
      second: picked[1],
      first: [picked[2], picked[3], picked[4]],
      receipts: []
    };
    var used = {};
    used[draw.special] = 1;
    used[draw.second] = 1;
    draw.first.forEach(function (num) { used[num] = 1; });

    var hit3 = '';
    for (var a = 0; a < 40 && !hit3; a++) {
      var n3 = matchLast(rand, draw.first[0], 3);
      if (!used[n3] && !blocked(n3) && tierOf(n3, draw) === 3) hit3 = n3;
    }
    var hit4 = '';
    for (var b = 0; b < 40 && !hit4; b++) {
      var n4 = matchLast(rand, draw.first[1], 4);
      if (!used[n4] && !blocked(n4) && tierOf(n4, draw) === 4) hit4 = n4;
    }
    if (!hit3 || !hit4) return null;
    used[hit3] = 1;
    used[hit4] = 1;

    var misses = [];
    for (var m = 0; m < 3; m++) {
      var miss = '';
      for (var c = 0; c < 60 && !miss; c++) {
        var guess = scramble(rand);
        if (used[guess] || blocked(guess)) continue;
        if (tierOf(guess, draw) !== 0) continue;
        if (sharesTail(guess, draw)) continue;
        miss = guess;
      }
      if (!miss) return null;
      used[miss] = 1;
      misses.push(miss);
    }

    var dates = datesFor(index);
    var numbers = [misses[0], hit3, misses[1], hit4, misses[2]];
    var start = (index * 2) % SHOPS.length;
    for (var r = 0; r < 5; r++) {
      draw.receipts.push({
        shop: (start + r) % SHOPS.length,
        date: dates[r],
        number: numbers[r]
      });
    }
    draw.receipts.sort(function (left, right) {
      if (left.date < right.date) return -1;
      if (left.date > right.date) return 1;
      return 0;
    });
    return draw;
  }

  function buildTerm(index) {
    if (index <= 0) return fixedTerm();
    for (var attempt = 0; attempt < 40; attempt++) {
      var built = tryBuild(index, attempt);
      if (built) return built;
    }
    return null;
  }

  function signature(term) {
    return [term.special, term.second]
      .concat(term.first)
      .concat(term.receipts.map(function (item) { return item.number; }))
      .join(',');
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildTerm: buildTerm,
      tierOf: tierOf,
      blocked: blocked,
      signature: signature,
      PATTERNS: PATTERNS,
      SHOPS: SHOPS
    };
    return;
  }

  var root = document.getElementById('desk');
  if (!root) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var copy = lang === 'en'
    ? {
        notice: 'The numbers are invented and cannot be used to check real receipts.',
        ready: 'Five practice receipts are saved. Press Draw this term to compare trailing digits.',
        drawing: 'Drawing the practice term.',
        opening: 'Opening this term.',
        notDrawn: 'Not open yet. The practice numbers are written here after you draw.',
        draw: 'Draw this term',
        drawn: 'This term is open',
        opened: function (id) { return 'Practice Term ' + id + ' is open.'; },
        reset: function (id) { return 'Now on Practice Term ' + id + '. The receipts and the draw are new, and nothing is open yet.'; },
        badDigits: 'Enter exactly eight digits, or leave the field blank.',
        blocked: 'Those eight digits can\'t be used on this practice slip. Try another number.',
        none: function (total) { return 'None of the ' + total + ' matched.'; },
        some: function (hits, total, bits) {
          return hits + ' of ' + total + ' matched: ' + bits.join('; ') + '.';
        },
        tiers: {
          0: 'Miss',
          3: 'Last 3 match',
          4: 'Last 4 match',
          5: 'Last 5 match',
          6: 'Last 6 match',
          7: 'Last 7 match',
          8: 'All 8 match'
        },
        special: 'Special line',
        second: 'Second line',
        first: 'Three lines to match',
        typedShop: 'Typed practice',
        typedDate: 'Practice',
        rewardWait: 'After a match, the stamp takes the receipt and prints the date.',
        rewardYes: function (n) {
          return 'The stamp took ' + n + (n === 1 ? ' receipt' : ' receipts') + ' and printed 2026-11-27.';
        },
        rewardNo: 'Nothing matched, so the stamp stays still.',
        termLabel: function (id) { return 'Practice Term · ' + id; }
      }
    : {
        notice: '号码是编的，不能用来对真发票。',
        ready: '五张练习发票已经放好。按「开这一期」核对末几位。',
        drawing: '正在开练习期。',
        opening: '正在揭开这一期。',
        notDrawn: '还没开。按下之后，练习号码才写在这里。',
        draw: '开这一期',
        drawn: '这一期已开',
        opened: function (id) { return '练习期 ' + id + ' 已开。'; },
        reset: function (id) { return '换到练习期 ' + id + '。发票和号码都换过了，还没开。'; },
        badDigits: '请输入刚好八位数字，或把这一格留空。',
        blocked: '这八位不能写在练习条上。请换一组。',
        none: function (total) { return total + ' 张都没有对上。'; },
        some: function (hits, total, bits) {
          return total + ' 张里对上 ' + hits + ' 张：' + bits.join('；') + '。';
        },
        tiers: {
          0: '没有对上',
          3: '末 3 位相同',
          4: '末 4 位相同',
          5: '末 5 位相同',
          6: '末 6 位相同',
          7: '末 7 位相同',
          8: '八位全同'
        },
        special: '特别一组',
        second: '其次一组',
        first: '用来对齐的三组',
        typedShop: '手写的一张',
        typedDate: '练习',
        rewardWait: '对上之后，图章才会收下发票，并印上日期。',
        rewardYes: function (n) { return '图章收下了 ' + n + ' 张，印上 2026-11-27。'; },
        rewardNo: '这一期没有对上，图章先不动。',
        termLabel: function (id) { return '练习期 · ' + id; }
      };

  function el(id) { return document.getElementById(id); }

  var receiptList = el('receipt-list');
  var practice = el('practice');
  var practiceError = el('practice-error');
  var summary = el('summary');
  var live = el('live-status');
  var slip = el('slip');
  var slipBody = el('slip-body');
  var drawBtn = el('draw-term');
  var newBtn = el('new-term');
  var stage = el('stage');
  var rewardNote = el('reward-note');
  var termName = el('term-name');

  if (!receiptList || !practice || !practiceError || !summary || !live || !slip || !slipBody || !drawBtn || !newBtn || !stage || !rewardNote || !termName) return;

  var reduceMotion = false;
  try {
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion = !!(motionQuery && motionQuery.matches);
    if (motionQuery && motionQuery.addEventListener) {
      motionQuery.addEventListener('change', function () {
        reduceMotion = !!motionQuery.matches;
      });
    }
  } catch (err) {}

  var termIndex = 0;
  var term = fixedTerm();
  var drawn = false;
  var drawing = false;
  var token = 0;

  Array.prototype.forEach.call(root.querySelectorAll('.disclaimer'), function (node) {
    node.textContent = copy.notice;
  });

  function say(message, withNotice) {
    summary.textContent = message;
    var spoken = withNotice ? message + ' ' + copy.notice : message;
    if (live.textContent === spoken) spoken += '\u200B';
    live.textContent = spoken;
  }

  function setError(message) {
    practiceError.textContent = message;
    practice.setAttribute('aria-invalid', 'true');
  }

  function clearError() {
    practiceError.textContent = '';
    practice.removeAttribute('aria-invalid');
  }

  function setDrawEnabled(on) {
    if (on) {
      drawBtn.removeAttribute('aria-disabled');
      drawBtn.classList.remove('is-off');
      drawBtn.textContent = copy.draw;
    } else {
      drawBtn.setAttribute('aria-disabled', 'true');
      drawBtn.classList.add('is-off');
    }
  }

  function shopLabel(item) {
    if (item.typed) return copy.typedShop;
    var shop = SHOPS[item.shop] || SHOPS[0];
    return lang === 'en' ? shop.en : shop.zh;
  }

  function fillDigits(node, num, tier) {
    node.textContent = '';
    var n = tier || 0;
    if (n <= 0 || n > num.length) {
      node.textContent = num;
      return;
    }
    var cut = num.length - n;
    if (cut > 0) {
      var plain = document.createElement('span');
      plain.textContent = num.slice(0, cut);
      node.appendChild(plain);
    }
    var mark = document.createElement('span');
    mark.className = 'match';
    mark.textContent = num.slice(cut);
    node.appendChild(mark);
  }

  function renderReceipts(items, tiers) {
    receiptList.textContent = '';
    items.forEach(function (item, index) {
      var tier = tiers ? tiers[index] : 0;
      var art = document.createElement('article');
      art.className = 'receipt';
      art.setAttribute('role', 'listitem');
      if (item.typed) art.classList.add('is-typed');
      if (tiers && tier > 0) art.classList.add('is-hit');
      if (tiers && tier === 0) art.classList.add('is-miss');

      var shop = document.createElement('p');
      shop.className = 'receipt-shop';
      shop.textContent = shopLabel(item);

      var date = document.createElement('p');
      date.className = 'receipt-date';
      date.textContent = item.date;

      var num = document.createElement('p');
      num.className = 'receipt-num';
      num.setAttribute('translate', 'no');
      fillDigits(num, item.number, tiers ? tier : 0);

      art.appendChild(shop);
      art.appendChild(date);
      art.appendChild(num);

      if (tiers) {
        var result = document.createElement('p');
        result.className = 'receipt-tier';
        result.textContent = copy.tiers[tier] || copy.tiers[0];
        art.appendChild(result);
      }
      receiptList.appendChild(art);
    });
  }

  function addPrize(label, numbers) {
    var block = document.createElement('div');
    block.className = 'prize';
    var lab = document.createElement('p');
    lab.className = 'prize-label';
    lab.textContent = label;
    block.appendChild(lab);
    numbers.forEach(function (num) {
      var line = document.createElement('p');
      line.className = 'prize-num';
      line.setAttribute('translate', 'no');
      line.textContent = num;
      block.appendChild(line);
    });
    slipBody.appendChild(block);
  }

  function renderSlip(mode) {
    slipBody.textContent = '';
    var note = document.createElement('p');
    note.className = 'slip-wait';
    if (mode === 'opening') {
      note.textContent = copy.opening;
      slipBody.appendChild(note);
      return;
    }
    if (mode !== 'open') {
      note.textContent = copy.notDrawn;
      slipBody.appendChild(note);
      return;
    }
    addPrize(copy.special, [term.special]);
    addPrize(copy.second, [term.second]);
    addPrize(copy.first, term.first.slice());
  }

  function summaryText(items, tiers) {
    var bits = [];
    var hits = 0;
    for (var i = 0; i < items.length; i++) {
      if (tiers[i] > 0) {
        hits += 1;
        bits.push(shopLabel(items[i]) + ' · ' + copy.tiers[tiers[i]]);
      }
    }
    if (!hits) return copy.none(items.length);
    return copy.some(hits, items.length, bits);
  }

  function itemsWithExtra(extra) {
    var items = term.receipts.map(function (item) {
      return { shop: item.shop, date: item.date, number: item.number };
    });
    if (typeof extra === 'string') {
      items.push({ typed: true, date: copy.typedDate, number: extra });
    }
    return items;
  }

  function playReward() {
    stage.classList.remove('is-reward');
    if (reduceMotion) {
      stage.classList.add('is-reward');
      return;
    }
    void stage.offsetWidth;
    stage.classList.add('is-reward');
    if (stage.scrollIntoView) {
      stage.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }

  function finishCheck(extra) {
    var items = itemsWithExtra(extra);
    var tiers = items.map(function (item) { return tierOf(item.number, term); });
    var hits = 0;
    tiers.forEach(function (value) { if (value > 0) hits += 1; });
    renderReceipts(items, tiers);
    renderSlip('open');
    var joiner = lang === 'en' ? ' ' : '';
    say(copy.opened(term.id) + joiner + summaryText(items, tiers), true);
    rewardNote.textContent = hits ? copy.rewardYes(hits) : copy.rewardNo;
    if (hits) playReward();
    else stage.classList.remove('is-reward');
  }

  function digitsInField() {
    var digits = practice.value.replace(/\D/g, '').slice(0, 8);
    if (practice.value !== digits) practice.value = digits;
    return digits;
  }

  function readExtra() {
    var digits = digitsInField();
    if (!digits) return null;
    if (digits.length === 8 && blocked(digits)) {
      practice.value = '';
      return 'blocked';
    }
    if (!/^\d{8}$/.test(digits)) return false;
    return digits;
  }

  function showTerm(next) {
    term = next;
    termName.textContent = copy.termLabel(term.id);
    renderReceipts(term.receipts, null);
    renderSlip('closed');
    stage.classList.remove('is-reward');
    rewardNote.textContent = copy.rewardWait;
    setDrawEnabled(true);
    slip.removeAttribute('aria-busy');
  }

  function onDraw() {
    if (drawing || drawn) return;
    var extra = readExtra();
    if (extra === false) {
      setError(copy.badDigits);
      say(copy.badDigits, false);
      practice.focus();
      return;
    }
    if (extra === 'blocked') {
      setError(copy.blocked);
      say(copy.blocked, false);
      practice.focus();
      return;
    }
    clearError();
    drawing = true;
    setDrawEnabled(false);
    slip.setAttribute('aria-busy', 'true');
    renderReceipts(term.receipts, null);
    renderSlip('opening');
    say(copy.drawing, false);
    var mine = ++token;
    var wait = reduceMotion ? 0 : 500;
    window.setTimeout(function () {
      if (mine !== token) return;
      drawing = false;
      drawn = true;
      slip.removeAttribute('aria-busy');
      drawBtn.textContent = copy.drawn;
      finishCheck(extra);
    }, wait);
  }

  function onRecheck() {
    var extra = readExtra();
    if (extra === false) {
      setError(copy.badDigits);
      say(copy.badDigits, false);
      return;
    }
    if (extra === 'blocked') {
      setError(copy.blocked);
      say(copy.blocked, false);
      return;
    }
    clearError();
    finishCheck(extra);
  }

  function onReset() {
    token += 1;
    drawing = false;
    drawn = false;
    practice.value = '';
    clearError();
    var previous = signature(term);
    var nextIndex = termIndex;
    var built = null;
    for (var n = 0; n < 8; n++) {
      nextIndex += 1;
      built = buildTerm(nextIndex);
      if (built && signature(built) !== previous) break;
      built = null;
    }
    if (!built) {
      nextIndex = termIndex + 1;
      built = buildTerm(nextIndex) || fixedTerm();
    }
    termIndex = nextIndex;
    showTerm(built);
    say(copy.reset(term.id), true);
  }

  practice.addEventListener('input', function () {
    var digits = digitsInField();
    if (digits.length === 8 && blocked(digits)) {
      practice.value = '';
      setError(copy.blocked);
      say(copy.blocked, false);
      return;
    }
    if (practice.getAttribute('aria-invalid') === 'true' && (digits.length === 0 || digits.length === 8)) {
      clearError();
    }
  });

  practice.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      practice.value = '';
      clearError();
      if (drawn) finishCheck(null);
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!drawn) {
        drawBtn.focus();
        return;
      }
      onRecheck();
    }
  });

  drawBtn.addEventListener('click', function () {
    if (drawBtn.getAttribute('aria-disabled') === 'true') return;
    onDraw();
  });

  newBtn.addEventListener('click', onReset);

  showTerm(term);
  say(copy.ready, true);
})();
