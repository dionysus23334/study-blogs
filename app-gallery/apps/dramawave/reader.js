(function () {
  var sheet = document.getElementById('sheet');
  var prevBtn = document.getElementById('beat-prev');
  var nextBtn = document.getElementById('beat-next');
  var live = document.getElementById('sheet-live');
  if (!sheet || !prevBtn || !nextBtn) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var copy = lang === 'en'
    ? {
        running: 'Study sketch',
        progress: 'Reading progress',
        hint: 'Tap, or swipe sideways',
        hintShort: 'Tap · swipe · arrows',
        prev: 'Previous',
        next: 'Next beat',
        restart: 'Read again'
      }
    : {
        running: '学习速写',
        progress: '阅读进度',
        hint: '点按，或左右滑动',
        hintShort: '点按 · 滑动 · 方向键',
        prev: '上一拍',
        next: '下一拍',
        restart: '从第一拍再读'
      };

  var scenes = lang === 'en'
    ? [
        {
          numeral: 'I',
          title: 'The Last Train',
          meta: 'Three beats',
          beats: [
            {
              kicker: 'Platform, 23:41',
              text: 'The announcement says the last train is cancelled. She is the only person left, with a board still flipping through times that will not run.',
              aside: 'Rain ticks off the edge of the canopy, counting the services that were missed.'
            },
            {
              kicker: 'A note',
              text: 'She closes her umbrella and writes to one person: I’ll walk back. She presses send twice. Only the second one leaves.'
            },
            {
              kicker: 'The exit',
              text: 'Someone offers half an umbrella. She declines. The rain stops before she reaches the exit. The pavement stays wet, as if nothing had been cancelled.'
            }
          ]
        },
        {
          numeral: 'II',
          title: 'The Borrowed Key',
          meta: 'Three beats',
          beats: [
            {
              kicker: 'Clay',
              text: 'The ceramicist finds a key in the clay. The teeth are new. A chip of blue-green glaze sits on the ring.'
            },
            {
              kicker: 'Next door',
              text: 'The studio next door has been empty for a year. The key turns once. The light comes on by itself. A note is on the table.'
            },
            {
              kicker: 'The note',
              text: '“The kiln is yours until Thursday.” She weights the note with a rib of clay and does not ask who wrote it. The kiln is warm.'
            }
          ]
        },
        {
          numeral: 'III',
          title: 'The Reply',
          meta: 'Three beats',
          beats: [
            {
              kicker: 'No return address',
              text: 'A librarian receives a letter asking for a book that was never catalogued. There is nowhere on the envelope to send an answer.'
            },
            {
              kicker: 'A checkout slip',
              text: 'She writes on the back of a slip: third shelf, behind the atlases. Come before closing.'
            },
            {
              kicker: 'Closing',
              text: 'At closing, the chair beside the atlases is warm. The book is still there. A thumb-mark has appeared on the spine.'
            }
          ]
        }
      ]
    : [
        {
          numeral: 'Ⅰ',
          title: '末班车',
          meta: '三拍',
          beats: [
            {
              kicker: '站台 · 23:41',
              text: '广播说，末班车取消。站台上只剩她，和一块还在翻字的时刻表。',
              aside: '雨从雨棚边沿滴下来，一滴，一滴，像在数错过的班次。'
            },
            {
              kicker: '短笺',
              text: '她把伞收好，给一个人写：我走回去。发送键按了两次，第二次才真的出去。'
            },
            {
              kicker: '出口',
              text: '有人递来半把伞。她摇头。雨在她走到出口之前停了。地面仍是湿的，像什么都没有被取消。'
            }
          ]
        },
        {
          numeral: 'Ⅱ',
          title: '借来的钥匙',
          meta: '三拍',
          beats: [
            {
              kicker: '泥',
              text: '陶工在泥里摸到一把钥匙。齿很新，环上沾着一小块青釉。'
            },
            {
              kicker: '隔壁',
              text: '隔壁工作室空了一年。钥匙转了一圈，灯自己亮了。桌上有一张纸条。'
            },
            {
              kicker: '纸条',
              text: '「窑归你用，到周四为止。」她把纸条压在泥板上，没有问是谁写的。窑是温的。'
            }
          ]
        },
        {
          numeral: 'Ⅲ',
          title: '回信',
          meta: '三拍',
          beats: [
            {
              kicker: '没有回邮地址',
              text: '图书馆员收到一封信，要一本从未编目的书。信封上没有可以寄回的地方。'
            },
            {
              kicker: '借书条',
              text: '她在借书条背面写：在第三架，地图册后面。闭馆前来。'
            },
            {
              kicker: '闭馆',
              text: '闭馆时，地图册旁的椅子是温的。那本书仍在。书脊上多了一道指印。'
            }
          ]
        }
      ];

  var ending = lang === 'en'
    ? {
        type: 'end',
        numeral: 'End',
        title: 'Three miniatures',
        text: 'Written to study the feeling of reading straight down, one beat at a time. They are not a show.',
        aside: 'You can read them again from the first beat.'
      }
    : {
        type: 'end',
        numeral: '完',
        title: '三则读完',
        text: '这些场景是为了学习「竖着读、一拍一拍往下」而写的，不是任何一部正在播的剧。',
        aside: '可以从第一拍再读。'
      };

  function build(list, end) {
    var steps = [];
    list.forEach(function (scene) {
      steps.push({
        type: 'title',
        numeral: scene.numeral,
        title: scene.title,
        meta: scene.meta
      });
      scene.beats.forEach(function (beat, beatIndex) {
        steps.push({
          type: 'beat',
          scene: scene.numeral + '  ' + scene.title,
          at: beatIndex + 1,
          of: scene.beats.length,
          kicker: beat.kicker,
          text: beat.text,
          aside: beat.aside || ''
        });
      });
    });
    steps.push(end);
    return steps;
  }

  var steps = build(scenes, ending);
  var index = 0;
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

  function spoken(step) {
    if (step.type === 'beat') return step.scene + '. ' + step.text;
    return step.numeral + '. ' + step.title + (step.text ? '. ' + step.text : '');
  }

  function render() {
    var step = steps[index];
    sheet.textContent = '';

    var top = el('div', 'sheet-top');
    top.appendChild(el('span', null, copy.running));
    top.appendChild(el('span', null, pad(index + 1) + ' / ' + pad(steps.length)));
    sheet.appendChild(top);

    var progress = el('div', 'sheet-progress');
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '1');
    progress.setAttribute('aria-valuemax', String(steps.length));
    progress.setAttribute('aria-valuenow', String(index + 1));
    progress.setAttribute('aria-label', copy.progress);
    var fill = el('span');
    fill.style.width = ((index + 1) / steps.length * 100) + '%';
    progress.appendChild(fill);
    sheet.appendChild(progress);

    var body = el('div', 'sheet-body' + (step.type === 'beat' ? ' is-beat' : '') + (first ? '' : ' is-in'));
    if (step.type === 'beat') {
      var scene = el('p', 'beat-scene');
      scene.appendChild(el('span', null, step.scene));
      scene.appendChild(el('span', 'beat-count', step.at + ' / ' + step.of));
      body.appendChild(scene);
      if (step.kicker) body.appendChild(el('p', 'beat-kicker', step.kicker));
      body.appendChild(el('p', 'beat-text', step.text));
      if (step.aside) body.appendChild(el('p', 'beat-aside', step.aside));
    } else {
      body.appendChild(el('p', 'sheet-numeral', step.numeral));
      body.appendChild(el('h2', 'sheet-title', step.title));
      if (step.meta) body.appendChild(el('p', 'sheet-meta', step.meta));
      if (step.text) body.appendChild(el('p', 'beat-text', step.text));
      if (step.aside) body.appendChild(el('p', 'beat-aside', step.aside));
    }
    sheet.appendChild(body);
    sheet.appendChild(el('p', 'sheet-hint', index === 0 ? copy.hint : copy.hintShort));

    prevBtn.disabled = index === 0;
    prevBtn.textContent = copy.prev;
    nextBtn.textContent = index === steps.length - 1 ? copy.restart : copy.next;
    if (live && !first) live.textContent = spoken(step);
    first = false;
  }

  function go(delta) {
    if (delta > 0 && index === steps.length - 1) {
      index = 0;
      render();
      return;
    }
    var next = index + delta;
    if (next < 0 || next >= steps.length) return;
    index = next;
    render();
  }

  prevBtn.addEventListener('click', function () { go(-1); });
  nextBtn.addEventListener('click', function () { go(1); });

  var pointer = null;
  sheet.addEventListener('pointerdown', function (event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  sheet.addEventListener('pointerup', function (event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    var dx = event.clientX - pointer.x;
    var dy = event.clientY - pointer.y;
    var fromEdge = pointer.x < 28;
    pointer = null;
    if (fromEdge && Math.abs(dx) > Math.abs(dy)) return;
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
      go(1);
      return;
    }
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  });
  sheet.addEventListener('pointercancel', function () { pointer = null; });

  document.addEventListener('keydown', function (event) {
    var tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
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
