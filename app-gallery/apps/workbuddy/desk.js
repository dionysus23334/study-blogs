(function () {
  var listEl = document.getElementById('task-list');
  var stateEl = document.getElementById('desk-state');
  var slipEl = document.getElementById('slip-body');
  var kickerEl = document.getElementById('slip-kicker');
  var statusEl = document.getElementById('slip-status');
  var prevBtn = document.getElementById('slip-prev');
  var nextBtn = document.getElementById('slip-next');
  var live = document.getElementById('slip-live');
  if (!listEl || !slipEl || !kickerEl || !statusEl || !prevBtn || !nextBtn) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var copy = lang === 'en'
    ? { prev: 'Previous', next: 'Next sheet', restart: 'Back to the first sheet', draft: 'Draft written' }
    : { prev: '上一张', next: '下一张', restart: '回到第一张', draft: '草稿已写' };

  var tasks = [
    {
      id: 'essay',
      zh: { morning: '把窗边随笔的第三段收短', today: '中午前把窗边随笔的第三段收短' },
      en: { morning: 'Shorten the third paragraph of the window essay', today: 'Shorten the window essay’s third paragraph before noon' }
    },
    {
      id: 'door',
      zh: { morning: '在门上写周四朗读的房间号', today: '确认小房间，周四 19:00，并写在门上' },
      en: { morning: 'Write Thursday’s room number on the door', today: 'Confirm the small room, Thursday 19:00, and write it on the door' }
    },
    {
      id: 'lin',
      zh: { morning: '回林的短笺', today: '把短笺发给林：第二首改为《北窗》' },
      en: { morning: 'Answer Lin’s note', today: 'Send Lin the note: second poem → North Window' },
      draft: true
    }
  ];
  tasks.forEach(function (task) { task.done = false; });

  var turns = lang === 'en'
    ? [
        {
          kicker: 'Notes',
          ask: 'Summarize this morning’s short meeting in three sentences.',
          kind: 'lines',
          lines: [
            'The reading moves to the small room, Thursday at seven in the evening.',
            'The window essay stays; the second poem comes out.',
            'Lin prints the program by Wednesday noon.'
          ],
          status: 'Three sentences, on this sheet. The list on the other side is unchanged.',
          desk: 'Still this morning’s three things.'
        },
        {
          kicker: 'Reply',
          ask: 'Draft a reply to Lin: I read the program; change the second poem to “North Window.”',
          kind: 'letter',
          letter: [
            'Lin —',
            'I read the program. Please change the second poem to “North Window.” I’ll be in the small room Thursday at seven.',
            '— Zhou'
          ],
          status: 'The note is drafted here. It has not been sent.',
          desk: 'Lin’s note has a draft.'
        },
        {
          kicker: 'List',
          ask: 'Turn this into three things to do today.',
          kind: 'todos',
          status: 'Check them here, or on the other side of the desk.',
          desk: 'Today’s three things are written.'
        },
        {
          kicker: 'Today',
          ask: 'Put them on today’s list.',
          kind: 'close',
          close: 'The other side of the desk is now these three. Check one off, or go back and reread the notes and the draft.',
          status: 'Refresh the page and the desk returns to morning.',
          desk: 'Filed under today.'
        }
      ]
    : [
        {
          kicker: '纪要',
          ask: '把上午的短会收成三句。',
          kind: 'lines',
          lines: [
            '朗读改到小房间，周四晚上七点。',
            '窗边的随笔留下，第二首诗拿下。',
            '林周三中午前把节目单印好。'
          ],
          status: '三句已经写在这张纸上。另一边的清单还没动。',
          desk: '清单还是早上的三件。'
        },
        {
          kicker: '回信',
          ask: '替我回林：节目单我看过了，第二首换成《北窗》。',
          kind: 'letter',
          letter: [
            '林——',
            '节目单我看过了。第二首请换成《北窗》。我周四晚上七点在小房间。',
            '—— 周'
          ],
          status: '短笺起草在这张纸上，还没有发出。',
          desk: '给林的短笺已有草稿。'
        },
        {
          kicker: '清单',
          ask: '写成今天要做的三件事。',
          kind: 'todos',
          status: '可以在这里勾，也可以在书桌的另一边勾。',
          desk: '今日的三件事已经写好。'
        },
        {
          kicker: '今日',
          ask: '放到今天的清单上。',
          kind: 'close',
          close: '书桌的另一边就是这三件。勾掉一件，或回到前面再看一眼纪要和短笺。',
          status: '刷新这一页，书桌会回到早上。',
          desk: '已列入今日。'
        }
      ];

  var step = 0;
  var first = true;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function pack(task) {
    return lang === 'en' ? task.en : task.zh;
  }

  function labelFor(task) {
    var text = pack(task);
    return step >= 2 ? text.today : text.morning;
  }

  function setDone(id, done) {
    tasks.forEach(function (task) {
      if (task.id === id) task.done = done;
    });
    var nodes = document.querySelectorAll('[data-task="' + id + '"]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].checked = done;
      var row = nodes[i].closest('.task');
      if (row) row.classList.toggle('is-done', done);
    }
  }

  function taskRow(task, idPrefix) {
    var item = el('li', 'task' + (task.done ? ' is-done' : ''));
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.id = idPrefix + task.id;
    input.setAttribute('data-task', task.id);
    input.checked = task.done;
    input.addEventListener('change', function () {
      setDone(task.id, input.checked);
    });
    var body = el('div');
    var label = el('label', 'task-label', labelFor(task));
    label.htmlFor = input.id;
    body.appendChild(label);
    if (task.draft && step === 1) body.appendChild(el('span', 'task-note', copy.draft));
    item.appendChild(input);
    item.appendChild(body);
    return item;
  }

  function renderTasks() {
    listEl.textContent = '';
    tasks.forEach(function (task) {
      listEl.appendChild(taskRow(task, 'task-'));
    });
    if (stateEl) stateEl.textContent = turns[step].desk;
  }

  function renderSlip() {
    var turn = turns[step];
    kickerEl.textContent = pad(step + 1) + ' / ' + pad(turns.length) + '  ·  ' + turn.kicker;
    slipEl.className = 'slip-body' + (first ? '' : ' is-in');
    slipEl.textContent = '';
    slipEl.appendChild(el('p', 'slip-ask', turn.ask));

    if (turn.kind === 'lines') {
      var lines = el('ol', 'slip-lines');
      turn.lines.forEach(function (line) {
        lines.appendChild(el('li', null, line));
      });
      slipEl.appendChild(lines);
    } else if (turn.kind === 'letter') {
      var letter = el('div', 'letter');
      turn.letter.forEach(function (line, lineIndex) {
        var p = el('p', lineIndex === turn.letter.length - 1 ? 'letter-sign' : '', line);
        letter.appendChild(p);
      });
      slipEl.appendChild(letter);
    } else if (turn.kind === 'todos') {
      var todos = el('ul', 'task-list slip-tasks');
      tasks.forEach(function (task) {
        todos.appendChild(taskRow(task, 'slip-'));
      });
      slipEl.appendChild(todos);
    } else if (turn.kind === 'close') {
      slipEl.appendChild(el('p', 'slip-close', turn.close));
    }

    statusEl.textContent = turn.status;
    prevBtn.disabled = step === 0;
    prevBtn.textContent = copy.prev;
    nextBtn.textContent = step === turns.length - 1 ? copy.restart : copy.next;
    if (live && !first) live.textContent = turn.kicker + '. ' + turn.ask;
    first = false;
  }

  function render() {
    renderTasks();
    renderSlip();
  }

  function go(delta) {
    if (delta > 0 && step === turns.length - 1) {
      step = 0;
      render();
      return;
    }
    var next = step + delta;
    if (next < 0 || next >= turns.length) return;
    step = next;
    render();
  }

  prevBtn.addEventListener('click', function () { go(-1); });
  nextBtn.addEventListener('click', function () { go(1); });

  document.addEventListener('keydown', function (event) {
    var tag = event.target && event.target.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (tag === 'INPUT' && event.target.type !== 'checkbox') return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(-1);
    }
  });

  render();
})();
