/* 说清哪里不舒服 — turn a vague complaint into a description. No camera, no judgement. */

(function () {
  var root = document.getElementById('say');
  var log = document.getElementById('log');
  var logEmpty = document.getElementById('log-empty');
  var ask = document.getElementById('ask');
  var ruler = document.getElementById('ruler');
  var rulerN = document.getElementById('ruler-n');
  var rulerFill = document.getElementById('ruler-fill');
  var summaryEl = document.getElementById('summary');
  var askDoctor = document.getElementById('ask-doctor');
  var copyBtn = document.getElementById('copy-desc');
  var copyStatus = document.getElementById('copy-status');
  var copyFallback = document.getElementById('copy-fallback');
  var doctor = document.getElementById('doctor');
  var doctorTitle = document.getElementById('doctor-title');
  var doctorNote = document.getElementById('doctor-note');
  var startOver = document.getElementById('start-over');
  var liveStatus = document.getElementById('live-status');
  var starts = root ? Array.prototype.slice.call(root.querySelectorAll('.start')) : [];

  if (!root || !log || !logEmpty || !ask || !ruler || !rulerN || !rulerFill || !summaryEl || !askDoctor || !copyBtn || !copyStatus || !copyFallback || !doctor || !doctorTitle || !doctorNote || !startOver || !liveStatus || !starts.length) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var summaryPlaceholder = (summaryEl.textContent || '').trim();
  var FIELD_KEYS = ['area', 'look', 'feeling', 'duration', 'worse'];

  function t(pair) {
    if (!pair) return '';
    if (typeof pair === 'string') return pair;
    return lang === 'en' ? pair.en : pair.zh;
  }

  var ui = lang === 'en'
    ? {
        wren: 'Wren',
        me: 'Me',
        front: 'Front',
        back: 'Back',
        notYet: 'Not yet',
        colon: ': ',
        described: 'Described ',
        closing: "That's on the card, in your words. You can copy it, or invite a doctor to look at the description. Nothing here is a judgement.",
        copied: 'Copied to the clipboard.',
        copyFail: "It didn't copy automatically. The text below is selected, so you can copy it yourself.",
        doctorTitle: 'A doctor has been invited to review your description.',
        doctorNote: 'Illustrative only. No one receives it, and nothing here is a judgement.',
        restarted: 'Started over.',
        copyLabel: 'Description'
      }
    : {
        wren: '小禾',
        me: '我',
        front: '正面',
        back: '背面',
        notYet: '还没有',
        colon: '：',
        described: '说清楚了 ',
        closing: '按你的话，写在右边了。可以复制，也可以请来一位医生看这张描述。这里不做判断。',
        copied: '已复制到剪贴板。',
        copyFail: '没有自动复制。下面的文字已经选中，可以手动复制。',
        doctorTitle: '已请来一位医生看这张描述。',
        doctorNote: '这只是示意。不会有人真的收到，这里也不做任何判断。',
        restarted: '已重新开始。',
        copyLabel: '描述'
      };

  function line(zh, en) {
    return { zh: zh, en: en };
  }

  function opt(id, label, set) {
    return { id: id, label: label, set: set };
  }

  function place(id, label, card, side) {
    return {
      id: id,
      label: label,
      side: side,
      set: { area: card }
    };
  }

  var front = line('正面', 'Front');
  var back = line('背面', 'Back');

  var scenarios = {
    rash: {
      steps: [
        {
          kind: 'body',
          ask: line('在哪儿？', 'Where is it?'),
          hint: line('点轮廓，或点下面的字。', 'Tap the outline, or tap a word below.'),
          options: [
            place('l-forearm', line('左前臂外侧', 'Outer left forearm'), line('左前臂外侧', 'outer left forearm'), front),
            place('r-forearm', line('右前臂外侧', 'Outer right forearm'), line('右前臂外侧', 'outer right forearm'), front),
            place('chest', line('胸口', 'Chest'), line('胸口', 'chest'), front),
            place('abdomen', line('腹部', 'Abdomen'), line('腹部', 'abdomen'), front),
            place('l-shin', line('左小腿', 'Left shin'), line('左小腿', 'left shin'), front),
            place('r-shin', line('右小腿', 'Right shin'), line('右小腿', 'right shin'), front),
            place('nape', line('后颈', 'Nape'), line('后颈', 'nape'), back),
            place('back', line('后背', 'Upper back'), line('后背', 'upper back'), back)
          ]
        },
        {
          kind: 'choice',
          ask: line('是一整片，还是一颗颗？', 'One patch, or separate spots?'),
          options: [
            opt('patch', line('一整片', 'One continuous patch'), { look: line('一整片', 'one continuous patch') }),
            opt('spots', line('一颗颗的小红点', 'Small red spots, one by one'), { look: line('一颗颗的小红点', 'small red spots, one by one') }),
            opt('few', line('几颗大一点的', 'A few larger spots'), { look: line('几颗大一点的', 'a few larger spots') })
          ]
        },
        {
          kind: 'choice',
          ask: line('痒，还是疼？', 'Itchy, or sore?'),
          options: [
            opt('itchy', line('主要是痒', 'Mostly itchy'), { feeling: line('主要是痒', 'mostly itchy') }),
            opt('both', line('又痒又疼', 'Itchy and sore'), { feeling: line('又痒又疼', 'itchy and sore') }),
            opt('sore', line('碰一下会疼', 'Sore when touched'), { feeling: line('碰一下会疼', 'sore when touched') }),
            opt('quiet', line('不太痒也不疼', 'Not very itchy or sore'), { feeling: line('不太痒也不疼', 'not very itchy or sore') })
          ]
        },
        {
          kind: 'choice',
          ask: line('多久了？', 'How long?'),
          options: [
            opt('today', line('今天，白天就有', "Today, and it's there in the daytime"), {
              duration: line('今天', 'today'),
              worse: line('白天就有', "there in the daytime")
            }),
            opt('few-days', line('两三天了，晚上更明显', 'For two or three days, more noticeable at night'), {
              duration: line('两三天了', 'for two or three days'),
              worse: line('晚上更明显', 'more noticeable at night')
            }),
            opt('week', line('一个多星期，时有时无', 'For over a week, on and off'), {
              duration: line('一个多星期', 'for over a week'),
              worse: line('时有时无', 'on and off')
            })
          ]
        }
      ]
    },
    knee: {
      steps: [
        {
          kind: 'choice',
          ask: line('是哪一边？', 'Which side?'),
          options: [
            opt('left', line('左膝', 'Left knee'), { area: line('左膝', 'left knee') }),
            opt('right', line('右膝', 'Right knee'), { area: line('右膝', 'right knee') }),
            opt('both-knees', line('两边都有', 'Both knees'), { area: line('两边膝盖', 'both knees') })
          ]
        },
        {
          kind: 'choice',
          ask: line('什么时候更明显？', 'When is it more noticeable?'),
          options: [
            opt('stairs', line('上下楼梯时更疼', 'Hurts more on stairs'), {
              feeling: line('疼', 'hurts'),
              worse: line('上下楼梯时更明显', 'more noticeable on stairs')
            }),
            opt('sitting', line('坐久了站起来更疼', 'Hurts more after sitting'), {
              feeling: line('疼', 'hurts'),
              worse: line('坐久了站起来更明显', 'more noticeable after sitting')
            }),
            opt('night', line('夜里更疼', 'Hurts more at night'), {
              feeling: line('疼', 'hurts'),
              worse: line('夜里更明显', 'more noticeable at night')
            }),
            opt('walking', line('一走路就疼', 'Hurts whenever I walk'), {
              feeling: line('走路时疼', 'hurts when walking'),
              worse: line('走路的时候一直有', 'there whenever I walk')
            })
          ]
        },
        {
          kind: 'choice',
          ask: line('看起来肿吗？', 'Does it look puffy?'),
          options: [
            opt('puffy', line('看着肿了一点', 'Looks a little puffy'), { look: line('看着肿了一点', 'looks a little puffy') }),
            opt('flat', line('看着没有肿', 'Does not look puffy'), { look: line('看着没有肿', 'does not look puffy') }),
            opt('unsure', line('没对比过', "I haven't compared it"), { look: line('没对比过两边', "hasn't compared the two sides") })
          ]
        },
        {
          kind: 'choice',
          ask: line('从什么时候开始的？', 'Since when?'),
          options: [
            opt('since-today', line('今天开始', 'Since today'), { duration: line('今天开始', 'since today') }),
            opt('since-days', line('两三天了', 'For two or three days'), { duration: line('两三天了', 'for two or three days') }),
            opt('since-week', line('一个多星期了', 'For over a week'), { duration: line('一个多星期了', 'for over a week') }),
            opt('since-unsure', line('说不清从什么时候', 'Not sure since when'), { duration: line('说不清从什么时候', 'not sure since when') })
          ]
        }
      ]
    },
    sleep: {
      steps: [
        {
          kind: 'choice',
          ask: line('是难入睡，还是醒得早？', 'Hard to fall asleep, or waking early?'),
          hint: line('我会把部位记成「不是身上某一处」。', "I'll mark the area as “not one place on the body.”"),
          options: [
            opt('fall', line('躺下很久才睡着', 'Takes a long time to fall asleep'), {
              area: line('不是身上某一处', 'not one place on the body'),
              look: line('躺下很久才睡着', 'takes a long time to fall asleep')
            }),
            opt('early', line('醒得早', 'Waking early'), {
              area: line('不是身上某一处', 'not one place on the body'),
              look: line('醒得早', 'waking early')
            }),
            opt('both-sleep', line('两样都有', 'Both'), {
              area: line('不是身上某一处', 'not one place on the body'),
              look: line('又难入睡，又醒得早', 'hard to fall asleep, and waking early')
            })
          ]
        },
        {
          kind: 'choice',
          ask: line('有几个晚上了？', 'How many nights?'),
          options: [
            opt('nights-few', line('两三晚', 'Two or three nights'), { duration: line('有两三晚了', 'for two or three nights') }),
            opt('nights-week', line('快一周了', 'Nearly a week'), { duration: line('快一周了', 'for nearly a week') }),
            opt('nights-more', line('比一周更久', 'Longer than a week'), { duration: line('比一周更久', 'for longer than a week') })
          ]
        },
        {
          kind: 'choice',
          ask: line('下午三点以后，喝过咖啡或茶吗？', 'Any coffee or tea after 3pm?'),
          options: [
            opt('caff-yes', line('喝过', 'Yes'), { worse: line('下午三点后喝过咖啡或茶', 'had coffee or tea after 3pm') }),
            opt('caff-no', line('没有', 'No'), { worse: line('下午三点后没有喝咖啡或茶', 'no coffee or tea after 3pm') }),
            opt('caff-unsure', line('记不清', 'Not sure'), { worse: line('记不清下午三点后有没有喝', 'not sure about coffee or tea after 3pm') })
          ]
        },
        {
          kind: 'choice',
          ask: line('这几天心情怎样？', 'How has your mood been?'),
          options: [
            opt('mood-ok', line('白天还好', 'Fine during the day'), { feeling: line('白天心情还好', 'mood is fine during the day') }),
            opt('mood-heavy', line('有点沉', 'A bit heavy'), { feeling: line('心情有点沉', 'mood is a bit heavy') }),
            opt('mood-edge', line('容易烦', 'Easily bothered'), { feeling: line('容易心烦', 'easily bothered') })
          ]
        }
      ]
    }
  };

  var scenario = null;
  var stepIndex = 0;
  var done = false;
  var fields = blankFields();
  var announceTimer = 0;

  function blankFields() {
    return { area: '', look: '', feeling: '', duration: '', worse: '' };
  }

  function announce(text) {
    window.clearTimeout(announceTimer);
    liveStatus.textContent = '';
    announceTimer = window.setTimeout(function () {
      liveStatus.textContent = text;
    }, 40);
  }

  function filledCount() {
    var n = 0;
    FIELD_KEYS.forEach(function (key) {
      if (fields[key]) n += 1;
    });
    return n;
  }

  function summaryText() {
    var bits = [];
    FIELD_KEYS.forEach(function (key) {
      if (fields[key]) bits.push(fields[key]);
    });
    if (!bits.length) return '';
    if (lang === 'en') {
      var sentence = bits.join(', ');
      return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
    }
    return bits.join('，') + '。';
  }

  function descriptionText() {
    var lines = [];
    FIELD_KEYS.forEach(function (key) {
      if (!fields[key]) return;
      var dd = document.getElementById('field-' + key);
      var dt = dd ? dd.previousElementSibling : null;
      var label = dt ? dt.textContent.replace(/\s+/g, ' ').trim() : key;
      lines.push(label + ui.colon + fields[key]);
    });
    var sentence = summaryText();
    if (sentence) {
      if (lines.length) lines.push('');
      lines.push(sentence);
    }
    return lines.join('\n');
  }

  function emptyField(dd) {
    dd.textContent = '';
    var dash = document.createElement('span');
    dash.className = 'blank';
    dash.setAttribute('aria-hidden', 'true');
    dash.textContent = '—';
    var miss = document.createElement('span');
    miss.className = 'visually-hidden';
    miss.textContent = ui.notYet;
    dd.appendChild(dash);
    dd.appendChild(miss);
  }

  function paintCard() {
    var n = filledCount();
    FIELD_KEYS.forEach(function (key) {
      var dd = document.getElementById('field-' + key);
      if (!dd) return;
      if (fields[key]) dd.textContent = fields[key];
      else emptyField(dd);
    });
    rulerN.textContent = String(n);
    ruler.setAttribute('aria-valuenow', String(n));
    ruler.setAttribute('aria-valuetext', ui.described + n + '/5');
    rulerFill.style.width = (n / 5 * 100) + '%';
    var sentence = summaryText();
    if (sentence) {
      summaryEl.textContent = sentence;
      summaryEl.classList.remove('is-empty');
    } else {
      summaryEl.textContent = summaryPlaceholder;
      summaryEl.classList.add('is-empty');
    }
    var ready = n > 0;
    askDoctor.disabled = !ready;
    copyBtn.disabled = !ready;
  }

  function appendBubble(who, text) {
    var item = document.createElement('div');
    item.className = 'bubble ' + (who === 'me' ? 'me' : 'wren');
    var name = document.createElement('span');
    name.className = 'who';
    name.textContent = who === 'me' ? ui.me : ui.wren;
    var body = document.createElement('p');
    body.textContent = text;
    item.appendChild(name);
    item.appendChild(body);
    log.appendChild(item);
  }

  function promptText(step) {
    var askText = t(step.ask);
    var hint = step.hint ? t(step.hint) : '';
    if (!hint) return askText;
    return askText + (lang === 'en' ? ' ' : '') + hint;
  }

  function bindArrows(container, cols) {
    container.addEventListener('keydown', function (event) {
      var buttons = Array.prototype.slice.call(container.querySelectorAll('button'));
      var index = buttons.indexOf(document.activeElement);
      if (index < 0 || !buttons.length) return;
      var delta = 0;
      if (event.key === 'ArrowRight') delta = 1;
      else if (event.key === 'ArrowLeft') delta = -1;
      else if (event.key === 'ArrowDown') delta = cols;
      else if (event.key === 'ArrowUp') delta = -cols;
      else if (event.key === 'Home') delta = -index;
      else if (event.key === 'End') delta = buttons.length - 1 - index;
      else return;
      event.preventDefault();
      var next = (index + delta) % buttons.length;
      if (next < 0) next += buttons.length;
      buttons[next].focus();
    });
  }

  function bodySvg() {
    return [
      '<svg class="bodies" viewBox="0 0 360 228" aria-hidden="true" focusable="false">',
      '<text data-caption="front" x="90" y="16" text-anchor="middle"></text>',
      '<text data-caption="back" x="270" y="16" text-anchor="middle"></text>',
      '<circle class="ink" cx="90" cy="42" r="14"/>',
      '<path class="ink" d="M90 56 V66"/>',
      '<path class="body" d="M64 78 Q90 66 116 78 L110 140 Q90 152 70 140 Z"/>',
      '<path class="ink faint" d="M66 82 L48 114"/>',
      '<path class="ink" data-ink="r-forearm" d="M48 114 L34 154"/>',
      '<circle class="ink dot" data-ink="r-forearm" cx="41" cy="134" r="3.2"/>',
      '<circle class="hit" data-part="r-forearm" cx="41" cy="134" r="14"/>',
      '<path class="ink faint" d="M114 82 L132 114"/>',
      '<path class="ink" data-ink="l-forearm" d="M132 114 L146 154"/>',
      '<circle class="ink dot" data-ink="l-forearm" cx="139" cy="134" r="3.2"/>',
      '<circle class="hit" data-part="l-forearm" cx="139" cy="134" r="14"/>',
      '<path class="ink" data-ink="chest" d="M76 98 H104"/>',
      '<circle class="ink dot" data-ink="chest" cx="90" cy="98" r="3.2"/>',
      '<circle class="hit" data-part="chest" cx="90" cy="98" r="14"/>',
      '<path class="ink" data-ink="abdomen" d="M78 120 H102"/>',
      '<circle class="ink dot" data-ink="abdomen" cx="90" cy="120" r="3.2"/>',
      '<circle class="hit" data-part="abdomen" cx="90" cy="120" r="14"/>',
      '<path class="ink faint" d="M78 144 L70 170"/>',
      '<path class="ink" data-ink="r-shin" d="M70 170 L62 208"/>',
      '<circle class="ink dot" data-ink="r-shin" cx="66" cy="189" r="3.2"/>',
      '<circle class="hit" data-part="r-shin" cx="66" cy="189" r="14"/>',
      '<path class="ink faint" d="M102 144 L110 170"/>',
      '<path class="ink" data-ink="l-shin" d="M110 170 L118 208"/>',
      '<circle class="ink dot" data-ink="l-shin" cx="114" cy="189" r="3.2"/>',
      '<circle class="hit" data-part="l-shin" cx="114" cy="189" r="14"/>',
      '<circle class="ink" cx="270" cy="42" r="14"/>',
      '<path class="ink" d="M270 56 V64"/>',
      '<path class="ink" data-ink="nape" d="M260 68 H280"/>',
      '<circle class="ink dot" data-ink="nape" cx="270" cy="68" r="3.2"/>',
      '<circle class="hit" data-part="nape" cx="270" cy="68" r="12"/>',
      '<path class="body" d="M244 78 Q270 66 296 78 L290 140 Q270 152 250 140 Z"/>',
      '<path class="ink faint" d="M246 82 L228 154"/>',
      '<path class="ink faint" d="M294 82 L312 154"/>',
      '<path class="ink" data-ink="back" d="M270 94 V126"/>',
      '<circle class="ink dot" data-ink="back" cx="270" cy="110" r="3.2"/>',
      '<circle class="hit" data-part="back" cx="270" cy="110" r="14"/>',
      '<path class="ink faint" d="M258 144 L250 208"/>',
      '<path class="ink faint" d="M282 144 L290 208"/>',
      '</svg>'
    ].join('');
  }

  function preview(svg, id) {
    Array.prototype.forEach.call(svg.querySelectorAll('[data-ink]'), function (node) {
      node.classList.toggle('is-hot', !!id && node.getAttribute('data-ink') === id);
    });
  }

  function renderBody(step) {
    var wrap = document.createElement('div');
    wrap.className = 'body-map';
    var holder = document.createElement('div');
    holder.innerHTML = bodySvg();
    var svg = holder.querySelector('svg');
    svg.querySelector('[data-caption="front"]').textContent = ui.front;
    svg.querySelector('[data-caption="back"]').textContent = ui.back;
    wrap.appendChild(svg);

    var list = document.createElement('div');
    list.className = 'map-list';
    list.setAttribute('role', 'group');
    list.setAttribute('aria-label', t(step.ask));

    var seenBack = false;
    step.options.forEach(function (option) {
      var onBack = option.side === back;
      if (onBack && !seenBack) {
        seenBack = true;
        var backLabel = document.createElement('p');
        backLabel.className = 'map-side';
        backLabel.textContent = ui.back;
        list.appendChild(backLabel);
      }
      if (!onBack && !list.querySelector('.map-side')) {
        var frontLabel = document.createElement('p');
        frontLabel.className = 'map-side';
        frontLabel.textContent = ui.front;
        list.appendChild(frontLabel);
      }
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'region';
      button.setAttribute('data-region', option.id);
      button.setAttribute('aria-pressed', 'false');
      var sideName = t(option.side);
      var placeName = t(option.label);
      button.textContent = placeName;
      button.setAttribute('aria-label', lang === 'en' ? sideName + ', ' + placeName : sideName + '，' + placeName);
      button.addEventListener('mouseenter', function () { preview(svg, option.id); });
      button.addEventListener('mouseleave', function () { preview(svg, ''); });
      button.addEventListener('focus', function () { preview(svg, option.id); });
      button.addEventListener('blur', function () { preview(svg, ''); });
      button.addEventListener('click', function () {
        Array.prototype.forEach.call(list.querySelectorAll('.region'), function (other) {
          other.setAttribute('aria-pressed', other === button ? 'true' : 'false');
        });
        preview(svg, option.id);
        choose(option);
      });
      list.appendChild(button);
    });

    svg.addEventListener('mouseover', function (event) {
      var part = event.target && event.target.getAttribute && event.target.getAttribute('data-part');
      if (part) preview(svg, part);
    });
    svg.addEventListener('mouseout', function (event) {
      var part = event.target && event.target.getAttribute && event.target.getAttribute('data-part');
      if (part) preview(svg, '');
    });
    svg.addEventListener('click', function (event) {
      var part = event.target && event.target.getAttribute && event.target.getAttribute('data-part');
      if (!part) return;
      var button = list.querySelector('[data-region="' + part + '"]');
      if (button) button.click();
    });

    bindArrows(list, 2);
    wrap.appendChild(list);
    return wrap;
  }

  function renderChoices(step) {
    var box = document.createElement('div');
    box.className = 'answers';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', t(step.ask));
    step.options.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.setAttribute('data-opt', option.id);
      button.textContent = t(option.label);
      button.addEventListener('click', function () { choose(option); });
      box.appendChild(button);
    });
    bindArrows(box, 1);
    return box;
  }

  function showStep() {
    var step = scenario.steps[stepIndex];
    appendBubble('wren', promptText(step));
    ask.textContent = '';
    ask.appendChild(step.kind === 'body' ? renderBody(step) : renderChoices(step));
    var first = ask.querySelector('button');
    if (first) first.focus();
  }

  function applySet(set) {
    Object.keys(set).forEach(function (key) {
      fields[key] = t(set[key]);
    });
  }

  function choose(option) {
    if (!scenario || done || !option) return;
    applySet(option.set || {});
    appendBubble('me', t(option.label));
    paintCard();
    stepIndex += 1;
    if (stepIndex >= scenario.steps.length) {
      done = true;
      ask.textContent = '';
      appendBubble('wren', ui.closing);
      summaryEl.focus();
      return;
    }
    showStep();
  }

  function clearDoctor() {
    doctor.hidden = true;
    doctorTitle.textContent = '';
    doctorNote.textContent = '';
  }

  function clearCopy() {
    copyStatus.textContent = '';
    copyFallback.value = '';
    copyFallback.hidden = true;
  }

  function begin(id, button) {
    var next = scenarios[id];
    if (!next) return;
    scenario = next;
    stepIndex = 0;
    done = false;
    fields = blankFields();
    clearDoctor();
    clearCopy();
    paintCard();
    log.textContent = '';
    logEmpty.hidden = true;
    starts.forEach(function (item) {
      item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
    });
    appendBubble('me', (button.textContent || '').replace(/\s+/g, ' ').trim());
    showStep();
  }

  function reset() {
    scenario = null;
    stepIndex = 0;
    done = false;
    fields = blankFields();
    clearDoctor();
    clearCopy();
    paintCard();
    log.textContent = '';
    ask.textContent = '';
    logEmpty.hidden = false;
    starts.forEach(function (item) {
      item.setAttribute('aria-pressed', 'false');
    });
    announce(ui.restarted);
    if (starts[0]) starts[0].focus();
  }

  function fallbackCopy(text) {
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
    return ok;
  }

  function showCopyFallback(text) {
    copyFallback.hidden = false;
    copyFallback.value = text;
    copyFallback.setAttribute('aria-label', ui.copyLabel);
    copyFallback.focus();
    copyFallback.select();
    copyStatus.textContent = ui.copyFail;
    announce(ui.copyFail);
  }

  function onCopied(ok, text) {
    if (ok) {
      copyFallback.hidden = true;
      copyFallback.value = '';
      copyStatus.textContent = ui.copied;
      announce(ui.copied);
      copyBtn.focus();
      return;
    }
    showCopyFallback(text);
  }

  function copyDescription() {
    var text = descriptionText();
    if (!text) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        onCopied(true, text);
      }, function () {
        onCopied(fallbackCopy(text), text);
      });
      return;
    }
    onCopied(fallbackCopy(text), text);
  }

  function inviteDoctor() {
    if (askDoctor.disabled || !filledCount()) return;
    doctorTitle.textContent = ui.doctorTitle;
    doctorNote.textContent = ui.doctorNote;
    doctor.hidden = false;
    announce(ui.doctorTitle);
  }

  starts.forEach(function (button) {
    button.addEventListener('click', function () {
      begin(button.getAttribute('data-start'), button);
    });
  });
  askDoctor.addEventListener('click', inviteDoctor);
  copyBtn.addEventListener('click', copyDescription);
  startOver.addEventListener('click', reset);
  paintCard();
})();
