/* 开卖这一天 — one price taken apart, then a 24-hour app-only sale.
   Clock: 05:00 the day before → 07:00 the day after, in 30-minute steps.
   Value 0 is day-before 05:00. The sale is value 50..97 (06:00 → 06:00 next day). */

(function () {
  var root = document.querySelector('.sale');
  var tabs = root ? Array.prototype.slice.call(root.querySelectorAll('.item-tab')) : [];
  var shopEl = document.getElementById('tag-shop');
  var nameEl = document.getElementById('tag-name');
  var materialEl = document.getElementById('tag-material');
  var priceEl = document.getElementById('tag-price');
  var realBar = document.getElementById('real-bar');
  var splitList = document.getElementById('split-list');
  var ghostName = document.getElementById('ghost-name');
  var ghostVal = document.getElementById('ghost-val');
  var togetherName = document.getElementById('together-name');
  var togetherVal = document.getElementById('together-val');
  var webBtn = document.getElementById('ch-web');
  var appBtn = document.getElementById('ch-app');
  var clock = document.getElementById('clock');
  var clockNow = document.getElementById('clock-now');
  var clockRail = document.getElementById('clock-rail');
  var statusText = document.getElementById('status-text');
  var statusPrice = document.getElementById('status-price');
  var openApp = document.getElementById('open-app');
  var stockEl = document.getElementById('stock');
  var addBtn = document.getElementById('add-bag');
  var bagList = document.getElementById('bag-list');
  var receipt = document.getElementById('receipt');
  var checkoutBtn = document.getElementById('checkout');
  var startBtn = document.getElementById('start-over');

  if (!root || !tabs.length || !shopEl || !nameEl || !materialEl || !priceEl || !realBar || !splitList || !ghostName || !ghostVal || !togetherName || !togetherVal || !webBtn || !appBtn || !clock || !clockNow || !clockRail || !statusText || !statusPrice || !openApp || !stockEl || !addBtn || !bagList || !receipt || !checkoutBtn || !startBtn) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';

  function line(zh, en) {
    return { zh: zh, en: en };
  }

  var ui = lang === 'en'
    ? {
        shop: 'Plainthread',
        kicker: 'Illustrative',
        days: ['Day before', 'Sale day', 'Day after'],
        before: 'Not started · opens at 06:00',
        early: 'Early price in the app −20%',
        webOnly: 'The web still shows the regular price. This price only applies at checkout in the app.',
        ended: 'Ended',
        left: function (n) { return n + ' left'; },
        soldOut: 'Sold out',
        add: 'Add to bag',
        inBag: 'In the bag',
        empty: 'The bag is empty.',
        receipt: 'Receipt',
        subtotal: 'Subtotal',
        saved: 'You saved',
        regular: 'Regular price',
        policy: 'Illustrative: free shipping · returns within a year',
        markup: 'Typical retail markup (illustrative)',
        together: 'Together',
        endsLeft: 'Day before 05:00',
        endsRight: 'Day after 07:00'
      }
    : {
        shop: '素线',
        kicker: '示意',
        days: ['前一天', '开卖日', '次日'],
        before: '还没开始 · 06:00 开卖',
        early: 'App 内早鸟价 −20%',
        webOnly: '网页上仍是原价。这一档只在 App 里结账。',
        ended: '已结束',
        left: function (n) { return '还剩 ' + n + ' 件'; },
        soldOut: '售罄',
        add: '放进袋子',
        inBag: '已在袋子里',
        empty: '袋子是空的。',
        receipt: '收据',
        subtotal: '小计',
        saved: '你省下',
        regular: '原价',
        policy: '示意：包邮 · 一年内可退',
        markup: '常见的零售加价（示意）',
        together: '合计',
        endsLeft: '前一天 05:00',
        endsRight: '次日 07:00'
      };

  var items = [
    {
      id: 'scarf',
      name: line('羊毛围巾', 'Wool scarf'),
      material: line('100% 美利奴羊毛', '100% merino'),
      price: { zh: 420, en: 60 },
      elsewhere: { zh: 980, en: 140 },
      parts: [
        { key: 'mat', label: line('材料', 'Materials'), amount: { zh: 168, en: 24 } },
        { key: 'make', label: line('做工', 'Making'), amount: { zh: 105, en: 15 } },
        { key: 'ship', label: line('运输与关税', 'Shipping & duty'), amount: { zh: 63, en: 9 } },
        { key: 'margin', label: line('店的毛利', 'Shop margin'), amount: { zh: 84, en: 12 } }
      ],
      stock: function (i) { return 120 - Math.round(114 * i / 47); }
    },
    {
      id: 'linen',
      name: line('亚麻床单', 'Linen sheet set'),
      material: line('水洗亚麻', 'washed linen'),
      price: { zh: 840, en: 120 },
      elsewhere: { zh: 1890, en: 270 },
      parts: [
        { key: 'mat', label: line('材料', 'Materials'), amount: { zh: 336, en: 48 } },
        { key: 'make', label: line('做工', 'Making'), amount: { zh: 252, en: 36 } },
        { key: 'ship', label: line('运输与关税', 'Shipping & duty'), amount: { zh: 126, en: 18 } },
        { key: 'margin', label: line('店的毛利', 'Shop margin'), amount: { zh: 126, en: 18 } }
      ],
      stock: function (i) { return 80 - Math.round(64 * i / 47); }
    },
    {
      id: 'tote',
      name: line('皮革托特包', 'Leather tote'),
      material: line('植鞣牛皮', 'veg-tanned leather'),
      price: { zh: 1050, en: 150 },
      elsewhere: { zh: 2520, en: 360 },
      parts: [
        { key: 'mat', label: line('材料', 'Materials'), amount: { zh: 420, en: 60 } },
        { key: 'make', label: line('做工', 'Making'), amount: { zh: 315, en: 45 } },
        { key: 'ship', label: line('运输与关税', 'Shipping & duty'), amount: { zh: 147, en: 21 } },
        { key: 'margin', label: line('店的毛利', 'Shop margin'), amount: { zh: 168, en: 24 } }
      ],
      stock: function (i) {
        if (i >= 44) return 0;
        return 40 - Math.round(40 * i / 44);
      }
    }
  ];

  var itemById = {};
  items.forEach(function (item) { itemById[item.id] = item; });

  var SALE_START = 50;
  var SALE_END = 98;
  var CLOCK_MAX = 100;
  var START_MIN = 5 * 60;

  var currentId = 'scarf';
  var channel = 'web';
  var bag = [];
  var statusSig = '';
  var stockSig = '';

  function formatMoney(amount) {
    var body = String(Math.round(amount));
    return lang === 'en' ? '$' + body : '¥' + body;
  }

  function saleOf(amount) {
    return amount - amount / 5;
  }

  function phaseOf(value) {
    if (value < SALE_START) return 'before';
    if (value < SALE_END) return 'during';
    return 'after';
  }

  function stockIndex(value) {
    var i = value - SALE_START;
    if (i < 0) return 0;
    if (i > 47) return 47;
    return i;
  }

  function stockCount(item, value) {
    return item.stock(stockIndex(value));
  }

  function clockLabel(value) {
    var mins = START_MIN + value * 30;
    var day = Math.floor(mins / 1440);
    var rem = mins % 1440;
    var hh = Math.floor(rem / 60);
    var mm = rem % 60;
    var hhmm = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
    return ui.days[day] + ' ' + hhmm;
  }

  function currentItem() {
    return itemById[currentId];
  }

  function inBag(id) {
    var i;
    for (i = 0; i < bag.length; i += 1) {
      if (bag[i].id === id) return true;
    }
    return false;
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function moneyLine(parent, regular, paid) {
    clearNode(parent);
    var was = document.createElement('s');
    was.textContent = formatMoney(regular);
    var now = document.createElement('span');
    now.className = 'now-price';
    now.textContent = formatMoney(paid);
    parent.appendChild(was);
    parent.appendChild(document.createTextNode(' → '));
    parent.appendChild(now);
  }

  function renderLedger(item) {
    var price = item.price[lang];
    var elsewhere = item.elsewhere[lang];
    realBar.style.width = (price / elsewhere * 100) + '%';
    clearNode(realBar);
    item.parts.forEach(function (part) {
      var seg = document.createElement('span');
      seg.className = 'seg seg-' + part.key;
      seg.style.flexGrow = String(part.amount[lang]);
      seg.style.flexBasis = '0';
      realBar.appendChild(seg);
    });
    clearNode(splitList);
    item.parts.forEach(function (part) {
      var li = document.createElement('li');
      li.className = 'split split-' + part.key;
      var swatch = document.createElement('span');
      swatch.className = 'split-swatch';
      swatch.setAttribute('aria-hidden', 'true');
      var label = document.createElement('span');
      label.className = 'split-name';
      label.textContent = part.label[lang];
      var val = document.createElement('span');
      val.className = 'split-val';
      val.textContent = formatMoney(part.amount[lang]);
      li.appendChild(swatch);
      li.appendChild(label);
      li.appendChild(val);
      splitList.appendChild(li);
    });
    ghostName.textContent = ui.markup;
    ghostVal.textContent = formatMoney(elsewhere);
    togetherName.textContent = ui.together;
    togetherVal.textContent = formatMoney(price);
  }

  function renderTag(item) {
    shopEl.textContent = ui.shop;
    nameEl.textContent = item.name[lang];
    materialEl.textContent = item.material[lang];
    var price = item.price[lang];
    var onSale = channel === 'app' && phaseOf(Number(clock.value)) === 'during';
    if (onSale) moneyLine(priceEl, price, saleOf(price));
    else priceEl.textContent = formatMoney(price);
  }

  function renderStatus(item) {
    var value = Number(clock.value);
    var phase = phaseOf(value);
    var sig = phase + '|' + channel + '|' + item.id;
    if (sig === statusSig) return;
    statusSig = sig;
    openApp.hidden = true;
    statusPrice.hidden = true;
    clearNode(statusPrice);
    if (phase === 'before') {
      statusText.textContent = ui.before;
      return;
    }
    if (phase === 'after') {
      statusText.textContent = ui.ended;
      return;
    }
    if (channel === 'app') {
      statusText.textContent = ui.early;
      statusPrice.hidden = false;
      moneyLine(statusPrice, item.price[lang], saleOf(item.price[lang]));
      return;
    }
    statusText.textContent = ui.webOnly;
    openApp.hidden = false;
  }

  function renderStock(item) {
    var n = stockCount(item, Number(clock.value));
    var text = n <= 0 ? ui.soldOut : ui.left(n);
    if (text === stockSig) return;
    stockSig = text;
    stockEl.textContent = text;
    stockEl.classList.toggle('is-out', n <= 0);
  }

  function renderAdd(item) {
    var value = Number(clock.value);
    var owned = inBag(item.id);
    var open = channel === 'app' && phaseOf(value) === 'during' && stockCount(item, value) > 0 && !owned;
    addBtn.disabled = !open;
    addBtn.textContent = owned ? ui.inBag : ui.add;
  }

  function renderClock() {
    var value = Number(clock.value);
    var label = clockLabel(value);
    clockNow.textContent = label;
    clock.setAttribute('aria-valuetext', label);
  }

  function renderSale() {
    var item = currentItem();
    if (!item) return;
    renderClock();
    renderTag(item);
    renderStatus(item);
    renderStock(item);
    renderAdd(item);
  }

  function renderBag() {
    clearNode(bagList);
    if (!bag.length) {
      var empty = document.createElement('li');
      empty.className = 'bag-empty';
      empty.textContent = ui.empty;
      bagList.appendChild(empty);
      checkoutBtn.disabled = true;
      return;
    }
    bag.forEach(function (row) {
      var li = document.createElement('li');
      var label = document.createElement('span');
      label.className = 'bag-name';
      label.textContent = row.name;
      var val = document.createElement('span');
      val.className = 'bag-val';
      val.textContent = formatMoney(row.paid);
      li.appendChild(label);
      li.appendChild(val);
      bagList.appendChild(li);
    });
    checkoutBtn.disabled = false;
  }

  function hideReceipt() {
    receipt.hidden = true;
    clearNode(receipt);
  }

  function selectItem(id) {
    if (!itemById[id]) return;
    currentId = id;
    statusSig = '';
    stockSig = '';
    tabs.forEach(function (tab) {
      tab.setAttribute('aria-pressed', tab.getAttribute('data-item') === id ? 'true' : 'false');
    });
    renderLedger(itemById[id]);
    renderSale();
  }

  function setChannel(next) {
    channel = next === 'app' ? 'app' : 'web';
    webBtn.setAttribute('aria-pressed', channel === 'web' ? 'true' : 'false');
    appBtn.setAttribute('aria-pressed', channel === 'app' ? 'true' : 'false');
    statusSig = '';
    renderSale();
  }

  function addCurrent() {
    var item = currentItem();
    if (!item || addBtn.disabled) return;
    bag.push({
      id: item.id,
      name: item.name[lang],
      paid: saleOf(item.price[lang]),
      regular: item.price[lang]
    });
    hideReceipt();
    renderBag();
    renderAdd(item);
  }

  function row(label, value, className) {
    var p = document.createElement('p');
    p.className = className || 'receipt-row';
    var name = document.createElement('span');
    name.textContent = label;
    var val = document.createElement('span');
    val.className = 'receipt-val';
    val.textContent = formatMoney(value);
    p.appendChild(name);
    p.appendChild(val);
    return p;
  }

  function checkout() {
    if (!bag.length) return;
    clearNode(receipt);
    var title = document.createElement('h3');
    title.className = 'receipt-title';
    title.textContent = ui.receipt;
    var shop = document.createElement('p');
    shop.className = 'receipt-shop';
    shop.textContent = ui.shop;
    var list = document.createElement('ul');
    list.className = 'receipt-items';
    var sub = 0;
    var regular = 0;
    bag.forEach(function (item) {
      sub += item.paid;
      regular += item.regular;
      var li = document.createElement('li');
      var name = document.createElement('span');
      name.textContent = item.name;
      var val = document.createElement('span');
      val.className = 'receipt-val';
      val.textContent = formatMoney(item.paid);
      li.appendChild(name);
      li.appendChild(val);
      list.appendChild(li);
    });
    var policy = document.createElement('p');
    policy.className = 'receipt-policy';
    policy.textContent = ui.policy;
    receipt.appendChild(title);
    receipt.appendChild(shop);
    receipt.appendChild(list);
    receipt.appendChild(row(ui.subtotal, sub, 'receipt-row'));
    receipt.appendChild(row(ui.saved, regular - sub, 'receipt-row is-saved'));
    receipt.appendChild(row(ui.regular, regular, 'receipt-row is-regular'));
    receipt.appendChild(policy);
    receipt.hidden = false;
    receipt.focus();
  }

  function startOver() {
    bag = [];
    hideReceipt();
    renderBag();
    clock.value = '1';
    setChannel('web');
    selectItem(items[0].id);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      selectItem(tab.getAttribute('data-item'));
    });
  });

  webBtn.addEventListener('click', function () { setChannel('web'); });
  appBtn.addEventListener('click', function () { setChannel('app'); });
  openApp.addEventListener('click', function () {
    setChannel('app');
    appBtn.focus();
  });
  clock.addEventListener('input', renderSale);
  addBtn.addEventListener('click', addCurrent);
  checkoutBtn.addEventListener('click', checkout);
  startBtn.addEventListener('click', startOver);

  clockRail.style.setProperty('--band-start', String(SALE_START / CLOCK_MAX));
  clockRail.style.setProperty('--band-span', String((SALE_END - SALE_START) / CLOCK_MAX));

  var ends = root.querySelectorAll('.clock-end');
  if (ends[0]) ends[0].textContent = ui.endsLeft;
  if (ends[1]) ends[1].textContent = ui.endsRight;

  renderBag();
  selectItem(items[0].id);
})();
