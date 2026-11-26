/* 拍后换卷 — shoot first, keep a digital negative, change the look later.
   Nothing is stored. No camera. Photos are drawn here. */

(function () {
  var root = document.getElementById('gloam');
  if (!root) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';

  function el(id) { return document.getElementById(id); }

  var camera = el('camera');
  var finder = el('finder');
  var finderCanvas = el('finder-canvas');
  var cameraLooks = el('camera-looks');
  var shutter = el('shutter');
  var cameraHint = el('camera-hint');
  var processEl = el('process');
  var counter = el('counter');
  var strip = el('strip');
  var stripEdge = el('strip-edge');
  var stripEmpty = el('strip-empty');
  var framesEl = el('frames');
  var newRollBtn = el('new-roll');
  var darkroomEmpty = el('darkroom-empty');
  var darkroomWork = el('darkroom-work');
  var darkLooks = el('dark-looks');
  var compare = el('compare');
  var compareAfter = el('compare-after');
  var compareBefore = el('compare-before');
  var divider = el('divider');
  var negativeLine = el('negative-line');
  var bakedNote = el('baked-note');
  var toneInput = el('tone');
  var toneReadout = el('tone-readout');
  var wbInput = el('wb');
  var wbReadout = el('wb-readout');
  var clearAsk = el('clear-ask');
  var clearConfirm = el('clear-confirm');
  var clearQ = el('clear-q');
  var clearYes = el('clear-yes');
  var clearNo = el('clear-no');
  var liveStatus = el('live-status');

  if (!camera || !finder || !finderCanvas || !cameraLooks || !shutter || !cameraHint || !processEl || !counter || !strip || !stripEdge || !stripEmpty || !framesEl || !newRollBtn || !darkroomEmpty || !darkroomWork || !darkLooks || !compare || !compareAfter || !compareBefore || !divider || !negativeLine || !bakedNote || !toneInput || !toneReadout || !wbInput || !wbReadout || !clearAsk || !clearConfirm || !clearQ || !clearYes || !clearNo || !liveStatus) return;

  var sceneButtons = Array.prototype.slice.call(camera.querySelectorAll('[data-scene]'));
  var shootLooks = Array.prototype.slice.call(cameraLooks.querySelectorAll('[data-look]'));
  var darkLookButtons = Array.prototype.slice.call(darkLooks.querySelectorAll('[data-look]'));
  if (!sceneButtons.length || !shootLooks.length || !darkLookButtons.length) return;

  var INSET = 0.08;
  var FULL_W = 500;
  var FULL_H = 375;
  var CROP_X = Math.round(FULL_W * INSET);
  var CROP_Y = Math.round(FULL_H * INSET);
  var CROP_W = FULL_W - CROP_X * 2;
  var CROP_H = FULL_H - CROP_Y * 2;
  var MAX_FRAMES = 8;
  var STAMP = "'26 11 26";

  var SCENES = [
    { id: 'arcade', zh: '骑楼午后', en: 'Arcade afternoon' },
    { id: 'railing', zh: '海边栏杆', en: 'Seaside railing' },
    { id: 'plant', zh: '窗台盆栽', en: 'Windowsill plant' },
    { id: 'store', zh: '夜里的便利店', en: 'Corner store at night' }
  ];

  var LOOKS = [
    { id: 'warm', zh: '暖调负片', en: 'Warm Negative' },
    { id: 'cool', zh: '冷调反转', en: 'Cool Slide' },
    { id: 'ccd', zh: '数码 CCD', en: 'Early CCD' },
    { id: 'mono', zh: '黑白颗粒', en: 'Grainy Mono' }
  ];

  var copy = lang === 'en'
    ? {
        processing: 'Processing…',
        shot: function (n, scene, look, last) {
          var line = 'Frame ' + n + ' taken, ' + scene + ', ' + look + '. The negative is kept, so the look can change.';
          if (last) line += ' The roll is full, eight frames.';
          return line;
        },
        lookChanged: function (n, look) { return 'Frame ' + n + ' changed to ' + look + '.'; },
        cleared: function (n) { return 'Frame ' + n + ' negative cleared. This frame is final.'; },
        reset: 'New roll. The contact strip is clear.',
        full: 'This roll has eight frames. Start a new roll to shoot again.',
        ready: function (scene, look) {
          return 'This frame will shoot ' + scene + ' with ' + look + '. You can still change it afterwards.';
        },
        landed: function (n) { return 'Frame ' + n + ' is on the contact strip. Open it to change the look.'; },
        fullHint: 'Eight frames. Start a new roll to shoot again.',
        emptyEdge: 'Dusk · empty roll',
        edge: function (n) { return 'Dusk · ' + n + ' / 8'; },
        finderLabel: function (scene, look) {
          return 'Viewfinder, ' + scene + ', neutral, ready to shoot with ' + look + '. Not a frame yet. The area inside the frame line is what will be captured.';
        },
        splitText: function (n) { return 'Negative covers the left ' + n + ' percent'; },
        toneValue: function (v) { return 'Tone ' + formatSigned(v); },
        wbValue: function (v) {
          if (v === 0) return 'White balance, neutral, 0';
          if (v < 0) return 'White balance, cool ' + formatSigned(v);
          return 'White balance, warm ' + formatSigned(v);
        },
        frame: function (n, scene, look, extra) {
          return 'Frame ' + n + ', ' + scene + ', ' + look + extra;
        },
        negative: function (n, scene) {
          return 'Frame ' + n + ' negative, ' + scene + ', no look applied';
        },
        clearedExtra: ', negative cleared',
        toneExtra: function (v) { return ', tone ' + formatSigned(v); },
        wbExtra: function (v) { return ', white balance ' + formatSigned(v); }
      }
    : {
        processing: '冲片中…',
        shot: function (n, scene, look, last) {
          var line = '第 ' + n + ' 张已拍下，' + scene + '，' + look + '。底片留着，可以换色调。';
          if (last) line += '这一卷八张已满。';
          return line;
        },
        lookChanged: function (n, look) { return '第 ' + n + ' 张换成' + look + '。'; },
        cleared: function (n) { return '第 ' + n + ' 张的底片已清除，这张定稿了。'; },
        reset: '换了一卷。接触印样已清空。',
        full: '这一卷已经八张，不能再拍。换一卷可以继续。',
        ready: function (scene, look) {
          return '这一张会用「' + look + '」拍下「' + scene + '」。拍完还能换。';
        },
        landed: function (n) { return '第 ' + n + ' 张在接触印样上。点开它，可以换色调。'; },
        fullHint: '八张拍满了。换一卷再拍。',
        emptyEdge: '暮色 · 空卷',
        edge: function (n) { return '暮色 · ' + n + ' / 8'; },
        finderLabel: function (scene, look) {
          return '取景器，' + scene + '，中性画面，预备色调' + look + '，尚未成张。细框以内会被拍下。';
        },
        splitText: function (n) { return '底片占左边 ' + n + '%'; },
        toneValue: function (v) { return '影调 ' + formatSigned(v); },
        wbValue: function (v) {
          if (v === 0) return '白平衡，中性，0';
          if (v < 0) return '白平衡，偏冷 ' + formatSigned(v);
          return '白平衡，偏暖 ' + formatSigned(v);
        },
        frame: function (n, scene, look, extra) {
          return '第 ' + n + ' 张，' + scene + '，' + look + extra;
        },
        negative: function (n, scene) {
          return '第 ' + n + ' 张的底片，' + scene + '，还没有色调';
        },
        clearedExtra: '，底片已清除',
        toneExtra: function (v) { return '，影调 ' + formatSigned(v); },
        wbExtra: function (v) { return '，白平衡 ' + formatSigned(v); }
      };

  var state = {
    scene: 'arcade',
    look: 'warm',
    frames: [],
    selected: -1,
    split: 50,
    processing: false,
    token: 0
  };

  var paintQueued = false;
  var announceTimer = 0;
  var dragId = null;
  var gradeBuffer = document.createElement('canvas');

  finder.style.setProperty('--inset', (INSET * 100) + '%');

  function pad2(n) {
    n = Math.floor(Math.abs(n));
    return (n < 10 ? '0' : '') + n;
  }

  function round1(v) {
    return Math.round(Number(v) * 10) / 10;
  }

  function formatSigned(v) {
    var n = round1(v);
    if (n === 0) return '0';
    var body = Math.abs(n).toFixed(1).replace(/\.0$/, '');
    return (n > 0 ? '+' : '−') + body;
  }

  function motionReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function announce(message) {
    if (!message) return;
    window.clearTimeout(announceTimer);
    liveStatus.textContent = '';
    announceTimer = window.setTimeout(function () {
      liveStatus.textContent = message;
    }, 40);
  }

  function hint(text) {
    cameraHint.textContent = text || '';
  }

  function sceneName(id) {
    var i;
    for (i = 0; i < SCENES.length; i++) {
      if (SCENES[i].id === id) return lang === 'en' ? SCENES[i].en : SCENES[i].zh;
    }
    return id;
  }

  function lookName(id) {
    var i;
    for (i = 0; i < LOOKS.length; i++) {
      if (LOOKS[i].id === id) return lang === 'en' ? LOOKS[i].en : LOOKS[i].zh;
    }
    return id;
  }

  function pressOnly(buttons, attr, value) {
    var i;
    for (i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute(attr) === value ? 'true' : 'false');
    }
  }

  function current() {
    if (state.selected < 0 || state.selected >= state.frames.length) return null;
    return state.frames[state.selected];
  }

  function describeFrame(frame, index) {
    var extra = '';
    if (frame.tone) extra += copy.toneExtra(frame.tone);
    if (frame.wb) extra += copy.wbExtra(frame.wb);
    if (frame.cleared) extra += copy.clearedExtra;
    return copy.frame(index + 1, sceneName(frame.scene), lookName(frame.look), extra);
  }

  function labelCanvas(canvas, text) {
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', text);
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function seedFor(index, sceneId) {
    var h = (index + 1) * 2654435761;
    var i;
    for (i = 0; i < sceneId.length; i++) h = Math.imul(h ^ sceneId.charCodeAt(i), 16777619);
    h = h >>> 0;
    return h || 1;
  }

  function clamp01(v) {
    if (v < 0) return 0;
    if (v > 1) return 1;
    return v;
  }

  function toByte(v) {
    v = clamp01(v) * 255;
    return v + 0.5 | 0;
  }

  function grainAmount(look) {
    if (look === 'mono') return 64;
    if (look === 'warm') return 26;
    if (look === 'ccd') return 16;
    return 14;
  }

  function gradePixel(r8, g8, b8, look, tone, wb) {
    var r = r8 / 255;
    var g = g8 / 255;
    var b = b8 / 255;
    var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    var shadow;
    var hi;
    var avg;
    var c;
    var sh;
    var x;
    var smooth;
    var deep;
    var s;

    if (look === 'warm') {
      shadow = (1 - lum) * (1 - lum);
      r += 0.09 * shadow;
      g += 0.13 * shadow;
      b += 0.04 * shadow;
      hi = lum * lum;
      r += 0.12 * hi;
      g += 0.04 * hi;
      b -= 0.08 * hi;
      r = 0.06 + r * 0.9;
      g = 0.07 + g * 0.88;
      b = 0.04 + b * 0.82;
    } else if (look === 'cool') {
      c = 1.38;
      r = (r - 0.5) * c + 0.48;
      g = (g - 0.5) * c + 0.5;
      b = (b - 0.5) * c + 0.54;
      sh = clamp01((0.6 - lum) / 0.6);
      r -= 0.08 * sh;
      g += 0.01 * sh;
      b += 0.16 * sh;
      avg = (r + g + b) / 3;
      r = avg + (r - avg) * 1.22;
      g = avg + (g - avg) * 1.22;
      b = avg + (b - avg) * 1.45;
    } else if (look === 'ccd') {
      avg = (r + g + b) / 3;
      r = avg + (r - avg) * 1.5;
      g = avg + (g - avg) * 1.45;
      b = avg + (b - avg) * 1.5;
      r += 0.045;
      b += 0.05;
      g -= 0.03;
      r = (r - 0.5) * 1.18 + 0.5;
      g = (g - 0.5) * 1.18 + 0.5;
      b = (b - 0.5) * 1.18 + 0.5;
    } else {
      x = lum;
      smooth = x * x * (3 - 2 * x);
      deep = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
      s = x * 0.4 + smooth * 0.2 + deep * 0.4;
      r = s;
      g = s;
      b = s;
    }

    c = Math.pow(2, tone * 0.35);
    r *= c;
    g *= c;
    b *= c;
    r += wb * 0.055;
    g += wb * 0.008;
    b -= wb * 0.055;

    return [toByte(r), toByte(g), toByte(b)];
  }

  function bloomAndSharpen(graded, w, h) {
    var bloomed = new Uint8ClampedArray(graded);
    var y;
    var x;
    var i;
    var lum;
    var spill;
    var offsets = [
      [0, 0, 0.4],
      [-1, 0, 0.55], [1, 0, 0.55], [0, -1, 0.55], [0, 1, 0.55],
      [-2, 0, 0.28], [2, 0, 0.28], [0, -2, 0.28], [0, 2, 0.28],
      [-1, -1, 0.32], [1, -1, 0.32], [-1, 1, 0.32], [1, 1, 0.32]
    ];
    var o;
    var nx;
    var ny;
    var j;
    var a;
    var k;
    var sharp;
    var center;
    var near;
    var v;

    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        i = (y * w + x) * 4;
        lum = (graded[i] * 0.2126 + graded[i + 1] * 0.7152 + graded[i + 2] * 0.0722) / 255;
        if (lum <= 0.78) continue;
        spill = (lum - 0.78) * 56;
        for (o = 0; o < offsets.length; o++) {
          nx = x + offsets[o][0];
          ny = y + offsets[o][1];
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          j = (ny * w + nx) * 4;
          a = spill * offsets[o][2];
          bloomed[j] = bloomed[j] + a;
          bloomed[j + 1] = bloomed[j + 1] + a * 0.94;
          bloomed[j + 2] = bloomed[j + 2] + a * 0.78;
        }
      }
    }

    sharp = new Uint8ClampedArray(bloomed);
    for (y = 1; y < h - 1; y++) {
      for (x = 1; x < w - 1; x++) {
        i = (y * w + x) * 4;
        for (k = 0; k < 3; k++) {
          center = bloomed[i + k];
          near = (bloomed[i + k - 4] + bloomed[i + k + 4] + bloomed[i + k - w * 4] + bloomed[i + k + w * 4]) * 0.25;
          v = center + (center - near) * 0.72;
          sharp[i + k] = v;
        }
      }
    }
    return sharp;
  }

  function addGrain(data, w, h, seed, amount) {
    var rand = mulberry32(seed);
    var i;
    var n;
    var last = w * h;
    var p;
    for (p = 0; p < last; p++) {
      n = (rand() - 0.5) * amount;
      i = p * 4;
      data[i] = data[i] + n;
      data[i + 1] = data[i + 1] + n;
      data[i + 2] = data[i + 2] + n;
    }
  }

  function renderLook(negative, look, tone, wb, seed) {
    var w = negative.width;
    var h = negative.height;
    var src = negative.data;
    var graded = new Uint8ClampedArray(src.length);
    var y;
    var x;
    var i;
    var px;
    var out;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        i = (y * w + x) * 4;
        px = gradePixel(src[i], src[i + 1], src[i + 2], look, tone, wb);
        graded[i] = px[0];
        graded[i + 1] = px[1];
        graded[i + 2] = px[2];
        graded[i + 3] = 255;
      }
    }
    out = look === 'ccd' ? bloomAndSharpen(graded, w, h) : graded;
    addGrain(out, w, h, seed, grainAmount(look));
    return out;
  }

  function gradedPixels(frame) {
    if (frame.cleared && frame.baked) {
      return { w: frame.baked.width, h: frame.baked.height, data: frame.baked.data };
    }
    return {
      w: frame.negative.width,
      h: frame.negative.height,
      data: renderLook(frame.negative, frame.look, frame.tone, frame.wb, frame.seed)
    };
  }

  function blit(canvas, pixels, w, h) {
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return null;
    var img = ctx.createImageData(w, h);
    img.data.set(pixels);
    ctx.putImageData(img, 0, 0);
    return ctx;
  }

  function dateStamp(ctx, w, h) {
    var size = Math.max(11, Math.round(h * 0.07));
    var gap;
    var width;
    var i;
    var guard = 0;
    ctx.textBaseline = 'alphabetic';
    function measure() {
      ctx.font = '600 ' + size + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      gap = size * 0.12;
      width = 0;
      for (i = 0; i < STAMP.length; i++) width += ctx.measureText(STAMP.charAt(i)).width + gap;
    }
    measure();
    while (width > w * 0.48 && size > 10 && guard < 24) {
      size -= 1;
      guard += 1;
      measure();
    }
    var x = w - w * 0.06 - width;
    var y = h - h * 0.075;
    function write(color, ox, oy) {
      var cursor = x + ox;
      var k;
      var ch;
      ctx.fillStyle = color;
      for (k = 0; k < STAMP.length; k++) {
        ch = STAMP.charAt(k);
        ctx.fillText(ch, cursor, y + oy);
        cursor += ctx.measureText(ch).width + gap;
      }
    }
    write('rgba(70, 24, 8, .45)', size * 0.07, size * 0.07);
    write('rgba(226, 88, 34, .95)', 0, 0);
  }

  function vignette(ctx, w, h) {
    var g = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.18, w * 0.5, h * 0.5, w * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.26)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function drawScene(ctx, w, h, id) {
    if (id === 'arcade') drawArcade(ctx, w, h);
    else if (id === 'railing') drawRailing(ctx, w, h);
    else if (id === 'plant') drawPlant(ctx, w, h);
    else drawStore(ctx, w, h);
    vignette(ctx, w, h);
  }

  function drawArcade(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    var i;
    var x;
    g.addColorStop(0, '#c5d6e4');
    g.addColorStop(0.46, '#f2dcc8');
    g.addColorStop(1, '#e4c7aa');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f6e7b6';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.16, Math.min(w, h) * 0.075, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9c4ae';
    ctx.fillRect(0, h * 0.4, w, h * 0.1);
    ctx.fillStyle = '#b9a894';
    ctx.fillRect(w * 0.08, h * 0.3, w * 0.16, h * 0.2);
    ctx.fillRect(w * 0.7, h * 0.26, w * 0.22, h * 0.24);
    ctx.fillStyle = '#6d584a';
    ctx.fillRect(0, h * 0.56, w, h * 0.16);
    ctx.fillStyle = '#a89280';
    ctx.fillRect(0, h * 0.38, w, h * 0.2);
    ctx.fillStyle = '#7d6758';
    for (i = 0; i < 5; i++) {
      x = w * (0.02 + i * 0.24);
      ctx.fillRect(x, h * 0.36, w * 0.045, h * 0.36);
    }
    ctx.fillStyle = '#4c3c34';
    for (i = 0; i < 4; i++) {
      x = w * (0.065 + i * 0.24);
      ctx.beginPath();
      ctx.moveTo(x, h * 0.58);
      ctx.lineTo(x, h * 0.48);
      ctx.quadraticCurveTo(x + w * 0.075, h * 0.38, x + w * 0.15, h * 0.48);
      ctx.lineTo(x + w * 0.15, h * 0.58);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#e8c478';
    ctx.fillRect(w * 0.3, h * 0.5, w * 0.08, h * 0.08);
    ctx.fillStyle = '#cbb79f';
    ctx.fillRect(0, h * 0.72, w, h * 0.28);
    ctx.fillStyle = '#b5a288';
    ctx.fillRect(0, h * 0.72, w, h * 0.018);
    ctx.strokeStyle = '#2c2622';
    ctx.lineWidth = Math.max(1.4, w * 0.006);
    ctx.beginPath();
    ctx.arc(w * 0.6, h * 0.84, w * 0.034, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.84, w * 0.034, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w * 0.6, h * 0.84);
    ctx.lineTo(w * 0.66, h * 0.76);
    ctx.lineTo(w * 0.72, h * 0.84);
    ctx.moveTo(w * 0.66, h * 0.76);
    ctx.lineTo(w * 0.64, h * 0.84);
    ctx.stroke();
  }

  function drawRailing(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    var i;
    var x;
    g.addColorStop(0, '#d7e8f2');
    g.addColorStop(0.4, '#9fc3d6');
    g.addColorStop(0.4, '#3e86a0');
    g.addColorStop(0.7, '#1c5a70');
    g.addColorStop(0.7, '#e6dccb');
    g.addColorStop(1, '#d2c6b4');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f7f1df';
    ctx.beginPath();
    ctx.arc(w * 0.2, h * 0.14, w * 0.042, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = Math.max(1, h * 0.01);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.bezierCurveTo(w * 0.28, h * 0.46, w * 0.46, h * 0.56, w, h * 0.49);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, h * 0.6);
    ctx.bezierCurveTo(w * 0.32, h * 0.66, w * 0.58, h * 0.56, w, h * 0.62);
    ctx.stroke();
    ctx.fillStyle = '#f4f1ea';
    ctx.beginPath();
    ctx.moveTo(w * 0.68, h * 0.45);
    ctx.lineTo(w * 0.78, h * 0.45);
    ctx.lineTo(w * 0.76, h * 0.48);
    ctx.lineTo(w * 0.7, h * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f4f1ea';
    ctx.lineWidth = Math.max(1, w * 0.004);
    ctx.beginPath();
    ctx.moveTo(w * 0.73, h * 0.45);
    ctx.lineTo(w * 0.73, h * 0.38);
    ctx.stroke();
    ctx.strokeStyle = '#5f5b56';
    ctx.lineWidth = Math.max(2, w * 0.008);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.78);
    ctx.lineTo(w, h * 0.78);
    ctx.moveTo(0, h * 0.86);
    ctx.lineTo(w, h * 0.86);
    ctx.stroke();
    ctx.lineWidth = Math.max(2, w * 0.011);
    for (i = 0; i < 9; i++) {
      x = w * (0.02 + i * 0.125);
      ctx.beginPath();
      ctx.moveTo(x, h * 0.73);
      ctx.lineTo(x, h * 0.98);
      ctx.stroke();
    }
  }

  function drawPlant(ctx, w, h) {
    var x = w * 0.16;
    var y = h * 0.07;
    var ww = w * 0.68;
    var wh = h * 0.5;
    var px = w * 0.46;
    var py = h * 0.64;
    ctx.fillStyle = '#efe6da';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e3d4c4';
    ctx.fillRect(0, 0, w * 0.1, h);
    ctx.fillStyle = '#5c5148';
    ctx.fillRect(x - w * 0.016, y - h * 0.012, ww + w * 0.032, wh + h * 0.028);
    ctx.fillStyle = '#8eb6cc';
    ctx.fillRect(x, y, ww, wh);
    ctx.fillStyle = '#c4a090';
    ctx.fillRect(x + ww * 0.52, y + wh * 0.38, ww * 0.48, wh * 0.62);
    ctx.fillStyle = '#d8c2b2';
    ctx.fillRect(x + ww * 0.6, y + wh * 0.5, ww * 0.1, wh * 0.12);
    ctx.fillRect(x + ww * 0.78, y + wh * 0.5, ww * 0.1, wh * 0.12);
    ctx.fillRect(x + ww * 0.6, y + wh * 0.7, ww * 0.1, wh * 0.12);
    ctx.fillStyle = '#5c5148';
    ctx.fillRect(x + ww * 0.5 - w * 0.006, y, w * 0.012, wh);
    ctx.fillRect(x, y + wh * 0.5, ww, h * 0.012);
    ctx.fillStyle = '#d7c6b2';
    ctx.fillRect(x - w * 0.05, y + wh, ww + w * 0.12, h * 0.05);
    ctx.fillStyle = '#c45a3c';
    ctx.beginPath();
    ctx.moveTo(px - w * 0.08, py);
    ctx.lineTo(px + w * 0.1, py);
    ctx.lineTo(px + w * 0.07, py + h * 0.15);
    ctx.lineTo(px - w * 0.05, py + h * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#a6462e';
    ctx.fillRect(px - w * 0.09, py - h * 0.02, w * 0.2, h * 0.03);
    ctx.fillStyle = '#245233';
    ctx.beginPath();
    ctx.ellipse(px + w * 0.01, py - h * 0.16, w * 0.032, h * 0.06, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2f6a40';
    ctx.beginPath();
    ctx.ellipse(px, py - h * 0.07, w * 0.05, h * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3e7d4c';
    ctx.beginPath();
    ctx.ellipse(px - w * 0.07, py - h * 0.04, w * 0.055, h * 0.04, -0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6aa05c';
    ctx.beginPath();
    ctx.ellipse(px + w * 0.065, py - h * 0.05, w * 0.06, h * 0.036, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c45a3c';
    ctx.fillRect(w * 0.02, h * 0.78, w * 0.07, h * 0.09);
    ctx.fillStyle = '#3e7d4c';
    ctx.beginPath();
    ctx.ellipse(w * 0.055, h * 0.76, w * 0.045, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStore(ctx, w, h) {
    var glow;
    var spots = [
      [0.06, 0.34], [0.14, 0.34], [0.08, 0.46], [0.16, 0.52],
      [0.84, 0.32], [0.91, 0.4], [0.85, 0.5]
    ];
    var i;
    ctx.fillStyle = '#141820';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d5d8e0';
    ctx.beginPath();
    ctx.arc(w * 0.84, h * 0.12, w * 0.028, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c2430';
    ctx.fillRect(0, h * 0.2, w * 0.28, h * 0.8);
    ctx.fillRect(w * 0.76, h * 0.16, w * 0.24, h * 0.84);
    ctx.fillStyle = '#c9a15a';
    for (i = 0; i < spots.length; i++) {
      ctx.globalAlpha = i % 2 ? 0.55 : 1;
      ctx.fillRect(w * spots[i][0], h * spots[i][1], w * 0.035, h * 0.045);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#2a313c';
    ctx.fillRect(w * 0.2, h * 0.32, w * 0.58, h * 0.5);
    ctx.fillStyle = '#e7e1d6';
    ctx.fillRect(w * 0.2, h * 0.32, w * 0.58, h * 0.07);
    ctx.fillStyle = '#c4553a';
    ctx.fillRect(w * 0.26, h * 0.338, w * 0.07, h * 0.034);
    ctx.fillStyle = '#2a313c';
    ctx.fillRect(w * 0.38, h * 0.345, w * 0.18, h * 0.022);
    ctx.fillStyle = '#f3d48a';
    ctx.fillRect(w * 0.25, h * 0.43, w * 0.32, h * 0.25);
    ctx.fillStyle = 'rgba(90, 58, 24, .4)';
    ctx.fillRect(w * 0.27, h * 0.48, w * 0.28, h * 0.012);
    ctx.fillRect(w * 0.27, h * 0.55, w * 0.28, h * 0.012);
    ctx.fillRect(w * 0.27, h * 0.62, w * 0.28, h * 0.012);
    ctx.fillStyle = '#d4554a';
    ctx.fillRect(w * 0.29, h * 0.495, w * 0.03, h * 0.04);
    ctx.fillStyle = '#3d6ea5';
    ctx.fillRect(w * 0.35, h * 0.495, w * 0.03, h * 0.04);
    ctx.fillStyle = '#f7f4ee';
    ctx.fillRect(w * 0.41, h * 0.565, w * 0.03, h * 0.04);
    ctx.fillStyle = '#3a2e28';
    ctx.fillRect(w * 0.6, h * 0.44, w * 0.13, h * 0.3);
    ctx.fillStyle = '#f3d48a';
    ctx.fillRect(w * 0.62, h * 0.48, w * 0.09, h * 0.16);
    ctx.fillStyle = '#23282f';
    ctx.fillRect(0, h * 0.82, w, h * 0.18);
    ctx.strokeStyle = '#8d93a0';
    ctx.lineWidth = Math.max(1.5, w * 0.008);
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.82);
    ctx.lineTo(w * 0.1, h * 0.46);
    ctx.lineTo(w * 0.17, h * 0.46);
    ctx.stroke();
    ctx.fillStyle = '#f6e2a8';
    ctx.beginPath();
    ctx.arc(w * 0.17, h * 0.48, w * 0.026, 0, Math.PI * 2);
    ctx.fill();
    glow = ctx.createRadialGradient(w * 0.17, h * 0.5, w * 0.01, w * 0.17, h * 0.58, w * 0.18);
    glow.addColorStop(0, 'rgba(246, 214, 140, .55)');
    glow.addColorStop(1, 'rgba(246, 214, 140, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, h * 0.4, w * 0.4, h * 0.42);
  }

  function paintFinder() {
    finderCanvas.width = FULL_W;
    finderCanvas.height = FULL_H;
    var ctx = finderCanvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    drawScene(ctx, FULL_W, FULL_H, state.scene);
    labelCanvas(finderCanvas, copy.finderLabel(sceneName(state.scene), lookName(state.look)));
  }

  function drawSceneButtons() {
    var i;
    var canvas;
    var ctx;
    for (i = 0; i < sceneButtons.length; i++) {
      canvas = sceneButtons[i].querySelector('canvas');
      if (!canvas) continue;
      canvas.width = 160;
      canvas.height = 110;
      ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) continue;
      drawScene(ctx, 160, 110, sceneButtons[i].getAttribute('data-scene'));
      canvas.setAttribute('aria-label', sceneName(sceneButtons[i].getAttribute('data-scene')));
    }
  }

  function captureNegative(sceneId) {
    gradeBuffer.width = FULL_W;
    gradeBuffer.height = FULL_H;
    var ctx = gradeBuffer.getContext('2d', { alpha: false });
    if (!ctx) return null;
    drawScene(ctx, FULL_W, FULL_H, sceneId);
    try { return ctx.getImageData(CROP_X, CROP_Y, CROP_W, CROP_H); }
    catch (err) { return null; }
  }

  function paintFrameVisuals(index) {
    var frame = state.frames[index];
    var button = framesEl.children[index];
    var g;
    var thumb;
    var tctx;
    var tw;
    var th;
    var label;
    var actx;
    if (!frame || !button) return;
    g = gradedPixels(frame);
    if (!blit(gradeBuffer, g.data, g.w, g.h)) return;
    label = describeFrame(frame, index);
    if (index === state.selected) {
      compareAfter.width = g.w;
      compareAfter.height = g.h;
      actx = compareAfter.getContext('2d', { alpha: false });
      if (actx) {
        actx.drawImage(gradeBuffer, 0, 0);
        dateStamp(actx, g.w, g.h);
      }
      labelCanvas(compareAfter, label);
      if (!frame.cleared && frame.negative) {
        compareBefore.width = frame.negative.width;
        compareBefore.height = frame.negative.height;
        actx = compareBefore.getContext('2d', { alpha: false });
        if (actx) actx.putImageData(frame.negative, 0, 0);
        labelCanvas(compareBefore, copy.negative(index + 1, sceneName(frame.scene)));
      }
    }
    thumb = button.querySelector('canvas');
    if (!thumb) return;
    tw = 300;
    th = Math.round(tw * g.h / g.w);
    thumb.width = tw;
    thumb.height = th;
    tctx = thumb.getContext('2d', { alpha: false });
    if (!tctx) return;
    tctx.imageSmoothingEnabled = true;
    tctx.drawImage(gradeBuffer, 0, 0, tw, th);
    dateStamp(tctx, tw, th);
    labelCanvas(thumb, label);
    button.setAttribute('aria-label', label);
  }

  function queuePaint() {
    if (paintQueued) return;
    paintQueued = true;
    window.requestAnimationFrame(function () {
      paintQueued = false;
      if (state.selected >= 0) paintFrameVisuals(state.selected);
    });
  }

  function setSplit(pct) {
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    pct = Math.round(pct * 10) / 10;
    state.split = pct;
    compareBefore.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    compareBefore.style.webkitClipPath = compareBefore.style.clipPath;
    divider.style.left = pct + '%';
    divider.setAttribute('aria-valuenow', String(Math.round(pct)));
    divider.setAttribute('aria-valuetext', copy.splitText(Math.round(pct)));
  }

  function refreshChrome() {
    var n = state.frames.length;
    counter.textContent = pad2(n) + ' / 08';
    stripEdge.textContent = n ? copy.edge(n) : copy.emptyEdge;
    stripEmpty.hidden = n > 0;
    if (!state.processing) shutter.disabled = n >= MAX_FRAMES;
    newRollBtn.disabled = n === 0;
  }

  function syncSliders(frame) {
    var locked = !!(frame && frame.cleared);
    toneInput.value = frame ? String(frame.tone) : '0';
    wbInput.value = frame ? String(frame.wb) : '0';
    toneReadout.textContent = formatSigned(frame ? frame.tone : 0);
    wbReadout.textContent = formatSigned(frame ? frame.wb : 0);
    toneInput.setAttribute('aria-valuetext', copy.toneValue(frame ? frame.tone : 0));
    wbInput.setAttribute('aria-valuetext', copy.wbValue(frame ? frame.wb : 0));
    toneInput.disabled = locked;
    wbInput.disabled = locked;
  }

  function syncDarkroom() {
    var frame = current();
    var locked;
    var i;
    if (!frame) {
      darkroomWork.hidden = true;
      darkroomEmpty.hidden = false;
      return;
    }
    darkroomEmpty.hidden = true;
    darkroomWork.hidden = false;
    pressOnly(darkLookButtons, 'data-look', frame.look);
    locked = !!frame.cleared;
    for (i = 0; i < darkLookButtons.length; i++) darkLookButtons[i].disabled = locked;
    syncSliders(frame);
    clearAsk.hidden = locked;
    clearConfirm.hidden = true;
    bakedNote.hidden = !locked;
    negativeLine.hidden = locked;
    divider.hidden = locked;
    compareBefore.hidden = locked;
    if (locked) darkLooks.setAttribute('aria-describedby', 'baked-note');
    else darkLooks.removeAttribute('aria-describedby');
    paintFrameVisuals(state.selected);
  }

  function selectFrame(index, focusBtn) {
    var i;
    var button;
    if (index < 0 || index >= state.frames.length) return;
    state.selected = index;
    for (i = 0; i < framesEl.children.length; i++) {
      framesEl.children[i].setAttribute('aria-pressed', i === index ? 'true' : 'false');
    }
    syncDarkroom();
    button = framesEl.children[index];
    if (focusBtn && button && button.focus) button.focus();
    if (button && button.scrollIntoView) {
      button.scrollIntoView({
        inline: 'nearest',
        block: 'nearest',
        behavior: motionReduced() ? 'auto' : 'smooth'
      });
    }
  }

  function buildFrameButton(index) {
    var frame = state.frames[index];
    var button = document.createElement('button');
    var num = document.createElement('span');
    var canvas = document.createElement('canvas');
    button.type = 'button';
    button.className = 'frame-btn';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', describeFrame(frame, index));
    num.className = 'frame-no';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = pad2(index + 1);
    labelCanvas(canvas, describeFrame(frame, index));
    button.appendChild(num);
    button.appendChild(canvas);
    button.addEventListener('click', function () { selectFrame(index, false); });
    return button;
  }

  function shoot() {
    var token;
    var delay;
    if (state.processing) return;
    if (state.frames.length >= MAX_FRAMES) {
      hint(copy.fullHint);
      announce(copy.full);
      return;
    }
    state.processing = true;
    shutter.disabled = true;
    camera.setAttribute('aria-busy', 'true');
    token = ++state.token;
    delay = motionReduced() ? 0 : 600;
    if (!motionReduced()) {
      finder.classList.add('is-blink');
      processEl.textContent = copy.processing;
      announce(copy.processing);
      window.setTimeout(function () {
        if (token !== state.token) return;
        finder.classList.remove('is-blink');
      }, 120);
    } else {
      processEl.textContent = '';
    }
    window.setTimeout(function () {
      var index;
      var negative;
      var frame;
      var last;
      if (token !== state.token) return;
      processEl.textContent = '';
      negative = captureNegative(state.scene);
      state.processing = false;
      camera.removeAttribute('aria-busy');
      if (!negative) {
        refreshChrome();
        return;
      }
      index = state.frames.length;
      frame = {
        scene: state.scene,
        look: state.look,
        tone: 0,
        wb: 0,
        seed: seedFor(index, state.scene),
        cleared: false,
        negative: negative,
        baked: null
      };
      state.frames.push(frame);
      framesEl.appendChild(buildFrameButton(index));
      last = state.frames.length >= MAX_FRAMES;
      refreshChrome();
      selectFrame(index, false);
      announce(copy.shot(index + 1, sceneName(frame.scene), lookName(frame.look), last));
      hint(last ? copy.fullHint : copy.landed(index + 1));
    }, delay);
  }

  function newRoll() {
    if (!state.frames.length && !state.processing) return;
    state.token += 1;
    state.processing = false;
    processEl.textContent = '';
    finder.classList.remove('is-blink');
    camera.removeAttribute('aria-busy');
    state.frames = [];
    state.selected = -1;
    framesEl.textContent = '';
    refreshChrome();
    syncDarkroom();
    hint(copy.ready(sceneName(state.scene), lookName(state.look)));
    announce(copy.reset);
    if (shutter.focus) shutter.focus();
  }

  function onTone() {
    var frame = current();
    if (!frame || frame.cleared) return;
    frame.tone = round1(toneInput.value);
    toneReadout.textContent = formatSigned(frame.tone);
    toneInput.setAttribute('aria-valuetext', copy.toneValue(frame.tone));
    queuePaint();
  }

  function onWb() {
    var frame = current();
    if (!frame || frame.cleared) return;
    frame.wb = round1(wbInput.value);
    wbReadout.textContent = formatSigned(frame.wb);
    wbInput.setAttribute('aria-valuetext', copy.wbValue(frame.wb));
    queuePaint();
  }

  function clearNegative() {
    var frame = current();
    var pixels;
    var ctx;
    var img;
    if (!frame || frame.cleared || !frame.negative) return;
    pixels = renderLook(frame.negative, frame.look, frame.tone, frame.wb, frame.seed);
    gradeBuffer.width = frame.negative.width;
    gradeBuffer.height = frame.negative.height;
    ctx = gradeBuffer.getContext('2d', { alpha: false });
    if (!ctx) return;
    img = ctx.createImageData(frame.negative.width, frame.negative.height);
    img.data.set(pixels);
    frame.baked = img;
    frame.negative = null;
    frame.cleared = true;
    syncDarkroom();
    announce(copy.cleared(state.selected + 1));
    if (bakedNote.focus) bakedNote.focus();
  }

  function moveSplitFromEvent(event) {
    var rect = compare.getBoundingClientRect();
    if (!rect.width) return;
    setSplit(((event.clientX - rect.left) / rect.width) * 100);
  }

  sceneButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-scene');
      if (!id || state.scene === id) return;
      state.scene = id;
      pressOnly(sceneButtons, 'data-scene', id);
      paintFinder();
      if (!state.processing && state.frames.length < MAX_FRAMES) {
        hint(copy.ready(sceneName(state.scene), lookName(state.look)));
      }
    });
  });

  shootLooks.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-look');
      if (!id || state.look === id) return;
      state.look = id;
      pressOnly(shootLooks, 'data-look', id);
      labelCanvas(finderCanvas, copy.finderLabel(sceneName(state.scene), lookName(state.look)));
      if (!state.processing && state.frames.length < MAX_FRAMES) {
        hint(copy.ready(sceneName(state.scene), lookName(state.look)));
      }
    });
  });

  darkLookButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var frame = current();
      var id = btn.getAttribute('data-look');
      if (!frame || frame.cleared || !id || frame.look === id) return;
      frame.look = id;
      pressOnly(darkLookButtons, 'data-look', id);
      paintFrameVisuals(state.selected);
      announce(copy.lookChanged(state.selected + 1, lookName(id)));
    });
  });

  shutter.addEventListener('click', shoot);
  newRollBtn.addEventListener('click', newRoll);
  toneInput.addEventListener('input', onTone);
  wbInput.addEventListener('input', onWb);
  clearAsk.addEventListener('click', function () {
    var frame = current();
    if (!frame || frame.cleared) return;
    clearAsk.hidden = true;
    clearConfirm.hidden = false;
    if (clearQ.focus) clearQ.focus();
  });
  clearNo.addEventListener('click', function () {
    clearConfirm.hidden = true;
    clearAsk.hidden = false;
    if (clearAsk.focus) clearAsk.focus();
  });
  clearYes.addEventListener('click', clearNegative);

  camera.addEventListener('keydown', function (event) {
    if (event.repeat) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      shoot();
    }
  });

  strip.addEventListener('keydown', function (event) {
    var n;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target && event.target.tagName === 'INPUT') return;
    if (event.key < '1' || event.key > '8') return;
    n = Number(event.key);
    if (n > state.frames.length) return;
    event.preventDefault();
    selectFrame(n - 1, true);
  });

  divider.addEventListener('pointerdown', function (event) {
    if (divider.hidden) return;
    if (event.button !== undefined && event.button !== 0) return;
    dragId = event.pointerId;
    if (divider.setPointerCapture) divider.setPointerCapture(event.pointerId);
    moveSplitFromEvent(event);
    event.preventDefault();
  });
  divider.addEventListener('pointermove', function (event) {
    if (dragId !== event.pointerId) return;
    moveSplitFromEvent(event);
  });
  function endDrag(event) {
    if (dragId !== event.pointerId) return;
    dragId = null;
  }
  divider.addEventListener('pointerup', endDrag);
  divider.addEventListener('pointercancel', endDrag);
  divider.addEventListener('keydown', function (event) {
    var step = event.shiftKey ? 12 : 4;
    var next = null;
    if (event.key === 'ArrowLeft') next = state.split - step;
    else if (event.key === 'ArrowRight') next = state.split + step;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 100;
    else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      return;
    } else return;
    event.preventDefault();
    setSplit(next);
  });

  pressOnly(sceneButtons, 'data-scene', state.scene);
  pressOnly(shootLooks, 'data-look', state.look);
  drawSceneButtons();
  paintFinder();
  refreshChrome();
  syncDarkroom();
  setSplit(50);
  hint(copy.ready(sceneName(state.scene), lookName(state.look)));
})();
