(function () {
  var listEl = document.getElementById('wish-list');
  var form = document.getElementById('wish-form');
  var titleInput = document.getElementById('wish-title');
  var noteInput = document.getElementById('wish-note');
  var hint = document.getElementById('form-hint');
  var countEl = document.getElementById('paper-count');
  var passBtn = document.getElementById('pass-list');
  var passSlip = document.getElementById('pass-slip');
  var passStatus = document.getElementById('pass-status');
  var passText = document.getElementById('pass-text');
  var passLive = document.getElementById('pass-live');
  if (!listEl || !form || !titleInput || !noteInput || !hint || !countEl || !passBtn || !passSlip || !passStatus || !passText) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var copy = lang === 'en'
    ? {
        reserve: 'Reserve',
        unreserve: 'Unreserve',
        reserveLabel: 'Reserve “',
        unreserveLabel: 'Unreserve “',
        labelEnd: '”',
        stamp: 'Reserved',
        needTitle: 'Write the wish, then put it on the paper.',
        added: 'It’s on the paper.',
        full: 'This page holds twenty-four lines.',
        blank: 'The paper is still blank.',
        noneReserved: 'None reserved.',
        allReserved: 'All ',
        allReservedEnd: ' are reserved.',
        oneReserved: 'The one wish is reserved.',
        stillOpen: ' still open. ',
        oneOpen: 'One still open. ',
        oneLeft: 'One is left for someone else.',
        areLeft: ' are left for someone else.',
        passTitle: 'A short list',
        unsigned: 'unsigned',
        openHead: 'Still open',
        heldHead: 'Left for someone else',
        none: '(none)',
        copied: 'Copied to this device’s clipboard. The same lines are below, if you want to select them.',
        copyFail: 'The clipboard stayed closed. Select the lines below and copy them yourself.'
      }
    : {
        reserve: '预留',
        unreserve: '取消预留',
        reserveLabel: '把「',
        unreserveLabel: '取消「',
        labelEnd: '」的预留',
        reserveTail: '」预留给别人',
        stamp: '已预留',
        needTitle: '先写愿望，再放到纸上。',
        added: '已经写上了。',
        full: '这一页先写到二十四条。',
        blank: '纸上还是空的。',
        noneReserved: '没有人预留。',
        allHeld: '条都已留给别人。',
        stillOpen: '条还空着。',
        held: '条已留给别人。',
        passTitle: '一份短清单',
        unsigned: '没有署名',
        openHead: '还可以挑',
        heldHead: '已留给别人',
        none: '（没有）',
        copied: '已抄到这台设备的剪贴板。下面这段也可以选中。',
        copyFail: '剪贴板没有打开。选中下面这段，再自己抄走。'
      };

  var wordsZh = ['零', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];
  var wordsEn = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wishes = readInitial();
  var seq = wishes.length;
  var passTick = 0;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function word(n) {
    var words = lang === 'en' ? wordsEn : wordsZh;
    return n <= 10 ? words[n] : String(n);
  }

  function squash(value, max) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    if (text.length > max) text = text.slice(0, max).trim();
    return text;
  }

  function readInitial() {
    var nodes = listEl.querySelectorAll('li.wish');
    var seed = [];
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var titleNode = node.querySelector('.wish-title');
      if (!titleNode) continue;
      var noteNode = node.querySelector('.wish-note');
      var id = node.getAttribute('data-id') || '';
      if (!/^[a-z0-9]+$/.test(id)) id = 's' + (i + 1);
      seed.push({
        id: id,
        title: squash(titleNode.textContent, 60),
        note: noteNode ? squash(noteNode.textContent, 140) : '',
        reserved: node.classList.contains('is-reserved')
      });
    }
    return seed;
  }

  function summary() {
    var open = 0;
    var held = 0;
    wishes.forEach(function (wish) {
      if (wish.reserved) held += 1;
      else open += 1;
    });
    var total = wishes.length;
    if (lang === 'en') {
      if (!total) return copy.blank;
      if (!open) {
        if (total === 1) return copy.oneReserved;
        return copy.allReserved + word(total).toLowerCase() + copy.allReservedEnd;
      }
      var openLine = open === 1 ? copy.oneOpen : word(open) + copy.stillOpen;
      var heldLine = !held ? copy.noneReserved : (held === 1 ? copy.oneLeft : word(held) + copy.areLeft);
      return openLine + heldLine;
    }
    if (!total) return copy.blank;
    if (!open) return total === 1 ? '一条已留给别人。' : word(total) + copy.allHeld;
    if (!held) return word(open) + copy.stillOpen + copy.noneReserved;
    return word(open) + copy.stillOpen + word(held) + copy.held;
  }

  function buttonLabel(wish) {
    if (lang === 'en') {
      return (wish.reserved ? copy.unreserveLabel : copy.reserveLabel) + wish.title + copy.labelEnd;
    }
    if (wish.reserved) return copy.unreserveLabel + wish.title + copy.labelEnd;
    return copy.reserveLabel + wish.title + copy.reserveTail;
  }

  function wishNode(wish, index, addedId) {
    var item = el('li', 'wish' + (wish.reserved ? ' is-reserved' : '') + (wish.id === addedId ? ' is-in' : ''));
    item.setAttribute('data-id', wish.id);
    var main = el('div', 'wish-main');
    var kicker = el('p', 'wish-kicker');
    var indexNode = el('span', 'wish-index', pad(index + 1));
    indexNode.setAttribute('aria-hidden', 'true');
    kicker.appendChild(indexNode);
    if (wish.reserved) kicker.appendChild(el('span', 'wish-stamp', copy.stamp));
    main.appendChild(kicker);
    main.appendChild(el('p', 'wish-title', wish.title));
    if (wish.note) main.appendChild(el('p', 'wish-note', wish.note));
    var button = el('button', 'btn wish-reserve', wish.reserved ? copy.unreserve : copy.reserve);
    button.type = 'button';
    button.setAttribute('data-wish', wish.id);
    button.setAttribute('aria-pressed', wish.reserved ? 'true' : 'false');
    button.setAttribute('aria-label', buttonLabel(wish));
    button.addEventListener('click', function () { toggle(wish.id); });
    item.appendChild(main);
    item.appendChild(button);
    return item;
  }

  function render(opts) {
    opts = opts || {};
    listEl.textContent = '';
    wishes.forEach(function (wish, index) {
      listEl.appendChild(wishNode(wish, index, opts.addedId || ''));
    });
    countEl.textContent = summary();
    if (opts.focusId && /^[a-z0-9]+$/.test(opts.focusId)) {
      var again = listEl.querySelector('button[data-wish="' + opts.focusId + '"]');
      if (again) again.focus();
    }
    if (opts.scrollId && /^[a-z0-9]+$/.test(opts.scrollId)) {
      var row = listEl.querySelector('li[data-id="' + opts.scrollId + '"]');
      if (row && row.scrollIntoView) {
        row.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      }
    }
  }

  function toggle(id) {
    wishes.forEach(function (wish) {
      if (wish.id === id) wish.reserved = !wish.reserved;
    });
    render({ focusId: id });
  }

  function linesFor(heading, items) {
    var lines = [heading];
    if (!items.length) {
      lines.push('· ' + copy.none);
      return lines;
    }
    items.forEach(function (wish) {
      lines.push('· ' + wish.title);
      if (wish.note) lines.push('  ' + wish.note);
    });
    return lines;
  }

  function passNote() {
    var open = [];
    var held = [];
    wishes.forEach(function (wish) {
      if (wish.reserved) held.push(wish);
      else open.push(wish);
    });
    var lines = [copy.passTitle, '2026-11-14 · ' + copy.unsigned, ''];
    lines = lines.concat(linesFor(copy.openHead, open));
    lines.push('');
    lines = lines.concat(linesFor(copy.heldHead, held));
    return lines.join('\n');
  }

  function copyFallback(text) {
    var previous = document.activeElement;
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '0';
    area.style.left = '0';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.focus();
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(area);
    if (previous && previous.focus) previous.focus();
    return ok;
  }

  function copyText(text, done) {
    try {
      if (navigator.clipboard && window.isSecureContext && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          done(true);
        }, function () {
          done(copyFallback(text));
        });
        return;
      }
    } catch (err) {}
    done(copyFallback(text));
  }

  function showPass(ok, text) {
    passTick += 1;
    var message = ok ? copy.copied : copy.copyFail;
    passSlip.hidden = false;
    passStatus.textContent = message;
    passText.textContent = text;
    if (passLive) passLive.textContent = message + (passTick % 2 ? '\u200b' : '');
    if (passSlip.scrollIntoView) {
      passSlip.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var title = squash(titleInput.value, 60);
    var note = squash(noteInput.value, 140);
    if (!title) {
      hint.textContent = copy.needTitle;
      titleInput.focus();
      return;
    }
    if (wishes.length >= 24) {
      hint.textContent = copy.full;
      return;
    }
    seq += 1;
    var id = 'n' + seq;
    wishes.push({ id: id, title: title, note: note, reserved: false });
    titleInput.value = '';
    noteInput.value = '';
    hint.textContent = copy.added;
    render({ addedId: id, focusId: id, scrollId: id });
  });

  function clearHint() {
    if (hint.textContent) hint.textContent = '';
  }

  titleInput.addEventListener('input', clearHint);
  noteInput.addEventListener('input', clearHint);

  passBtn.addEventListener('click', function () {
    var text = passNote();
    copyText(text, function (ok) { showPass(ok, text); });
  });

  render();
})();
