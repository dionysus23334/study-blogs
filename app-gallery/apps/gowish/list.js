(function () {
  var listEl = document.getElementById('wish-list');
  var form = document.getElementById('wish-form');
  var titleInput = document.getElementById('wish-title');
  var noteInput = document.getElementById('wish-note');
  var hint = document.getElementById('form-hint');
  var countEl = document.getElementById('paper-count');
  var lookBtn = document.getElementById('look-list');
  if (!listEl || !form || !titleInput || !noteInput || !hint || !countEl || !lookBtn) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var copy = lang === 'en'
    ? {
        reserve: 'Reserve',
        received: 'Received',
        stampReserved: 'Reserved',
        stampReceived: 'Received',
        reserveOn: 'Reserve “',
        reserveOff: 'Clear the reservation on “',
        receivedOn: 'Mark “',
        receivedOnEnd: '” received',
        receivedOff: 'Clear received on “',
        end: '”',
        needTitle: 'Write the wish, then put it on the paper.',
        added: 'It’s on the paper.',
        full: 'This page holds twenty-four lines.',
        blank: 'The paper is still blank.',
        noneOpen: 'None still open.',
        noneReserved: 'None reserved.',
        noneReceived: 'None received.',
        stillOpen: ' still open.',
        oneOpen: 'One still open.',
        oneReserved: 'One reserved.',
        reservedMany: ' reserved.',
        oneReceived: 'One received.',
        receivedMany: ' received.',
        look: 'Look by state',
        written: 'As written',
        groups: { open: 'Still open', reserved: 'Reserved', received: 'Received' },
        none: '(none)'
      }
    : {
        reserve: '预留',
        received: '收到',
        stampReserved: '已预留',
        stampReceived: '已收到',
        needTitle: '先写愿望，再放到纸上。',
        added: '已经写上了。',
        full: '这一页先写到二十四条。',
        blank: '纸上还是空的。',
        openSuffix: '条还空着。',
        noneOpen: '没有还空着的。',
        reservedSuffix: '条已预留。',
        noneReserved: '没有预留。',
        receivedSuffix: '条已收到。',
        noneReceived: '没有收到。',
        look: '按状态看',
        written: '按写下的顺序',
        groups: { open: '还空着', reserved: '已预留', received: '已收到' },
        none: '（没有）'
      };

  var wordsZh = ['零', '一', '两', '三', '四', '五', '六', '七', '八', '九', '十'];
  var wordsEn = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wishes = readInitial();
  var seq = wishes.length;
  var looking = false;

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
      var state = 'open';
      if (node.classList.contains('is-received')) state = 'received';
      else if (node.classList.contains('is-reserved')) state = 'reserved';
      seed.push({
        id: id,
        title: squash(titleNode.textContent, 60),
        note: noteNode ? squash(noteNode.textContent, 140) : '',
        state: state
      });
    }
    return seed;
  }

  function summary() {
    var open = 0;
    var held = 0;
    var got = 0;
    wishes.forEach(function (wish) {
      if (wish.state === 'reserved') held += 1;
      else if (wish.state === 'received') got += 1;
      else open += 1;
    });
    if (!wishes.length) return copy.blank;
    if (lang === 'en') {
      var openLine = !open ? copy.noneOpen : (open === 1 ? copy.oneOpen : word(open) + copy.stillOpen);
      var heldLine = !held ? copy.noneReserved : (held === 1 ? copy.oneReserved : word(held) + copy.reservedMany);
      var gotLine = !got ? copy.noneReceived : (got === 1 ? copy.oneReceived : word(got) + copy.receivedMany);
      return openLine + ' ' + heldLine + ' ' + gotLine;
    }
    return (open ? word(open) + copy.openSuffix : copy.noneOpen) +
      (held ? word(held) + copy.reservedSuffix : copy.noneReserved) +
      (got ? word(got) + copy.receivedSuffix : copy.noneReceived);
  }

  function labelFor(wish, state) {
    var on = wish.state === state;
    if (lang === 'en') {
      if (state === 'reserved') {
        return (on ? copy.reserveOff : copy.reserveOn) + wish.title + copy.end;
      }
      return (on ? copy.receivedOff : copy.receivedOn) + wish.title + (on ? copy.end : copy.receivedOnEnd);
    }
    if (state === 'reserved') {
      return (on ? '取消「' : '把「') + wish.title + (on ? '」的预留' : '」标成预留');
    }
    return (on ? '取消「' : '把「') + wish.title + (on ? '」的已收到' : '」标成已收到');
  }

  function markButton(wish, state) {
    var button = el('button', 'btn wish-mark', state === 'reserved' ? copy.reserve : copy.received);
    button.type = 'button';
    button.setAttribute('data-wish', wish.id);
    button.setAttribute('data-state', state);
    button.setAttribute('aria-pressed', wish.state === state ? 'true' : 'false');
    button.setAttribute('aria-label', labelFor(wish, state));
    button.addEventListener('click', function () { mark(wish.id, state); });
    return button;
  }

  function wishNode(wish, index, addedId) {
    var cls = 'wish';
    if (wish.state === 'reserved') cls += ' is-reserved';
    if (wish.state === 'received') cls += ' is-received';
    if (wish.id === addedId) cls += ' is-in';
    var item = el('li', cls);
    item.setAttribute('data-id', wish.id);
    var main = el('div', 'wish-main');
    var kicker = el('p', 'wish-kicker');
    var indexNode = el('span', 'wish-index', pad(index + 1));
    indexNode.setAttribute('aria-hidden', 'true');
    kicker.appendChild(indexNode);
    if (wish.state === 'reserved') kicker.appendChild(el('span', 'wish-stamp', copy.stampReserved));
    if (wish.state === 'received') kicker.appendChild(el('span', 'wish-stamp', copy.stampReceived));
    main.appendChild(kicker);
    main.appendChild(el('p', 'wish-title', wish.title));
    if (wish.note) main.appendChild(el('p', 'wish-note', wish.note));
    var actions = el('div', 'wish-actions');
    actions.appendChild(markButton(wish, 'reserved'));
    actions.appendChild(markButton(wish, 'received'));
    item.appendChild(main);
    item.appendChild(actions);
    return item;
  }

  function indexOfId(id) {
    for (var i = 0; i < wishes.length; i++) {
      if (wishes[i].id === id) return i;
    }
    return 0;
  }

  function render(opts) {
    opts = opts || {};
    listEl.textContent = '';
    if (!looking) {
      wishes.forEach(function (wish, index) {
        listEl.appendChild(wishNode(wish, index, opts.addedId || ''));
      });
    } else {
      ['open', 'reserved', 'received'].forEach(function (state) {
        var group = el('li', 'wish-group');
        group.appendChild(el('p', 'section-label', copy.groups[state]));
        var found = wishes.filter(function (wish) { return wish.state === state; });
        if (!found.length) group.appendChild(el('p', 'wish-empty', copy.none));
        listEl.appendChild(group);
        found.forEach(function (wish) {
          listEl.appendChild(wishNode(wish, indexOfId(wish.id), opts.addedId || ''));
        });
      });
    }
    countEl.textContent = summary();
    lookBtn.textContent = looking ? copy.written : copy.look;
    lookBtn.setAttribute('aria-pressed', looking ? 'true' : 'false');
    if (opts.focusId && opts.focusState && /^[a-z0-9]+$/.test(opts.focusId)) {
      var again = listEl.querySelector('button[data-wish="' + opts.focusId + '"][data-state="' + opts.focusState + '"]');
      if (again) again.focus();
    }
    if (opts.scrollId && /^[a-z0-9]+$/.test(opts.scrollId)) {
      var row = listEl.querySelector('li[data-id="' + opts.scrollId + '"]');
      if (row && row.scrollIntoView) {
        row.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      }
    }
  }

  function mark(id, state) {
    wishes.forEach(function (wish) {
      if (wish.id === id) wish.state = wish.state === state ? 'open' : state;
    });
    render({ focusId: id, focusState: state });
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
    wishes.push({ id: id, title: title, note: note, state: 'open' });
    titleInput.value = '';
    noteInput.value = '';
    hint.textContent = copy.added;
    render({ addedId: id, focusId: id, focusState: 'reserved', scrollId: id });
  });

  function clearHint() {
    if (hint.textContent) hint.textContent = '';
  }

  titleInput.addEventListener('input', clearHint);
  noteInput.addEventListener('input', clearHint);
  lookBtn.addEventListener('click', function () {
    looking = !looking;
    render();
    lookBtn.focus();
  });

  render();
})();
