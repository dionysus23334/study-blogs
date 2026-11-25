/* 等天亮 — load a roll, shoot blind, wait for the next sunrise. No camera, no payments. */

(function () {
  var root = document.getElementById('dawn');
  if (!root || typeof document === 'undefined') return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';

  function el(id) { return document.getElementById(id); }

  var camera = el('camera');
  var canisterCount = el('canister-count');
  var rollLabel = el('roll-label');
  var counterNum = el('counter-num');
  var ticks = el('ticks');
  var finder = el('finder');
  var finderLeft = el('finder-left');
  var nowScene = el('now-scene');
  var cameraHint = el('camera-hint');
  var shutter = el('shutter');
  var advanceBtn = el('advance');
  var sendEarly = el('send-early');
  var labWait = el('lab-wait');
  var labSlip = el('lab-slip');
  var slipRoll = el('slip-roll');
  var slipCount = el('slip-count');
  var sunriseCity = el('sunrise-city');
  var sunriseDate = el('sunrise-date');
  var sunriseTime = el('sunrise-time');
  var countdown = el('countdown');
  var sky = el('sky');
  var fastBtn = el('fast');
  var sheet = el('sheet');
  var sheetHeading = el('sheet-heading');
  var stripEdge = el('strip-edge');
  var stripFoot = el('strip-foot');
  var framesEl = el('frames');
  var reloadBtn = el('reload');
  var frameDialog = el('frame-dialog');
  var frameCaption = el('frame-caption');
  var frameLarge = el('frame-large');
  var frameClose = el('frame-close');
  var liveStatus = el('live-status');

  if (!camera || !canisterCount || !rollLabel || !counterNum || !ticks || !finder || !finderLeft || !nowScene || !cameraHint || !shutter || !advanceBtn || !sendEarly || !labWait || !labSlip || !slipRoll || !slipCount || !sunriseCity || !sunriseDate || !sunriseTime || !countdown || !sky || !fastBtn || !sheet || !sheetHeading || !stripEdge || !stripFoot || !framesEl || !reloadBtn || !frameDialog || !frameCaption || !frameLarge || !frameClose || !liveStatus) return;

  var countButtons = Array.prototype.slice.call(root.querySelectorAll('[data-count]'));
  var sceneButtons = Array.prototype.slice.call(root.querySelectorAll('[data-scene]'));
  var cityButtons = Array.prototype.slice.call(root.querySelectorAll('[data-city]'));
  if (!countButtons.length || !sceneButtons.length || !cityButtons.length) return;

  var fastLabel = fastBtn.textContent;
  var NIGHT_MS = 12000;
  var STAMP = "'26 11 25";

  var CITIES = [
    { id: 'taipei', zh: '台北', en: 'Taipei', lat: 25.0330, lon: 121.5654, tz: 8 },
    { id: 'hongkong', zh: '香港', en: 'Hong Kong', lat: 22.3193, lon: 114.1694, tz: 8 },
    { id: 'tokyo', zh: '东京', en: 'Tokyo', lat: 35.6762, lon: 139.6503, tz: 9 },
    { id: 'london', zh: '伦敦', en: 'London', lat: 51.5074, lon: -0.1278, tz: 0 },
    { id: 'newyork', zh: '纽约', en: 'New York', lat: 40.7128, lon: -74.0060, tz: -5 }
  ];

  var SCENES = [
    { id: 'lanterns', zh: '夜市灯笼', en: 'Night-market lanterns' },
    { id: 'seawall', zh: '海边堤防', en: 'Seawall' },
    { id: 'cat', zh: '窗边的猫', en: 'Cat by the window' },
    { id: 'rain', zh: '雨后街角', en: 'Street corner after rain' }
  ];

  var copy = lang === 'en'
    ? {
        finderLoad: 'Load a roll',
        finderLeft: function (n) { return n + ' left'; },
        finderSent: 'Sent',
        finderDawn: 'Developed',
        pickAfterLoad: 'Load a roll, then pick a scene. The viewfinder never shows the picture.',
        thisFrame: function (name) { return 'This frame: ' + name + '. You still will not see it.'; },
        loadFirst: 'Choose 12, 24 or 36 exposures first.',
        loaded: function (n) { return 'A ' + n + '-exposure roll is loaded. The viewfinder stays empty.'; },
        advanceFirst: 'Advance the film before the next shot. The shutter is locked.',
        advanced: 'Advanced. You can take the next frame.',
        nothingToAdvance: 'Nothing to advance yet. Take a frame first.',
        alreadyAdvanced: 'Already advanced. The shutter is open.',
        shot: function (n, left) {
          return 'Frame ' + n + ' is taken. You cannot see it. ' + left + ' left. Advance before the next shot.';
        },
        rollDone: 'The roll is full. You cannot see the frames. It is going to the lab.',
        alreadySent: 'This roll has already been sent.',
        shootFirst: 'Take at least one frame before sending the roll.',
        exposures: function (n, cap) { return n + ' of ' + cap; },
        sent: function (roll, n, city, time) {
          return roll + ' is at Corner Lab. ' + n + ' frames, and you still cannot see them. Pick-up is the next sunrise in ' + city + ', about ' + time + '. Approximate.';
        },
        cityChanged: function (city, time) {
          return 'City set to ' + city + '. Approximate sunrise ' + time + '.';
        },
        forwarding: 'Fast-forwarding the night. The countdown is running down.',
        forwardingBtn: 'Night is moving…',
        developed: function (n) { return 'Dawn. All ' + n + ' frames are developed at once.'; },
        reset: 'Another roll is ready to load. The last one is gone.',
        frameLabel: function (n, name) { return 'Frame ' + n + ', ' + name; },
        frameCaption: function (n, name) { return 'Frame ' + n + ' · ' + name; },
        stripFoot: function (n) { return '01–' + pad2(n) + ' · Daybreak · contact sheet'; },
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      }
    : {
        finderLoad: '先装一卷',
        finderLeft: function (n) { return '剩 ' + n + ' 张'; },
        finderSent: '已送洗',
        finderDawn: '已冲好',
        pickAfterLoad: '装好一卷之后选一个场景。取景器不会显示画面。',
        thisFrame: function (name) { return '这一张：' + name + '。拍下之后也看不到。'; },
        loadFirst: '先选 12、24 或 36 张。',
        loaded: function (n) { return '已装入 ' + n + ' 张的一卷。取景器里什么都看不到。'; },
        advanceFirst: '先过片，再拍下一张。快门还锁着。',
        advanced: '已过片。可以拍下一张。',
        nothingToAdvance: '还没拍，不用过片。',
        alreadyAdvanced: '已经过片了。可以按快门。',
        shot: function (n, left) {
          return '第 ' + n + ' 张已拍下，看不到成片。剩 ' + left + ' 张。请过片再拍。';
        },
        rollDone: '这卷拍完了，看不到成片，正送到转角冲印。',
        alreadySent: '这卷已经送洗。',
        shootFirst: '先拍至少一张，再送洗。',
        exposures: function (n, cap) { return n + ' 张，一卷 ' + cap + ' 张'; },
        sent: function (roll, n, city, time) {
          return roll + ' 已送到转角冲印。拍了 ' + n + ' 张，成片还看不到。取件约为' + city + '的下一次日出 ' + time + '，这是近似值。';
        },
        cityChanged: function (city, time) {
          return '改到' + city + '。近似日出 ' + time + '。';
        },
        forwarding: '开始快转这一夜。倒计时在往下走。',
        forwardingBtn: '这一夜在往前走…',
        developed: function (n) { return '天亮了。' + n + ' 张一起冲好了。'; },
        reset: '可以再装一卷。上一卷没有留下。',
        frameLabel: function (n, name) { return '第 ' + n + ' 张，' + name; },
        frameCaption: function (n, name) { return '第 ' + n + ' 张 · ' + name; },
        stripFoot: function (n) { return '01–' + pad2(n) + ' · 晨灯 · 接触印样'; },
        months: []
      };

  var state = {
    phase: 'load',
    capacity: 0,
    frames: [],
    needsAdvance: false,
    scene: null,
    rollIndex: 0,
    city: 'taipei',
    sunriseMs: 0,
    timer: 0,
    raf: 0,
    opener: null
  };

  function pad2(n) {
    n = Math.floor(Math.abs(n));
    return (n < 10 ? '0' : '') + n;
  }

  function motionReduced() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function announce(message) {
    if (!message) return;
    liveStatus.textContent = '';
    window.setTimeout(function () { liveStatus.textContent = message; }, 30);
  }

  function hint(text, warn) {
    cameraHint.textContent = text || '';
    cameraHint.classList.toggle('is-warn', !!warn && !!text);
  }

  function sceneName(id) {
    var i;
    for (i = 0; i < SCENES.length; i++) {
      if (SCENES[i].id === id) return lang === 'en' ? SCENES[i].en : SCENES[i].zh;
    }
    return id;
  }

  function cityById(id) {
    var i;
    for (i = 0; i < CITIES.length; i++) if (CITIES[i].id === id) return CITIES[i];
    return CITIES[0];
  }

  function cityName(city) {
    return lang === 'en' ? city.en : city.zh;
  }

  function rollName() {
    var letter = String.fromCharCode(65 + (state.rollIndex % 26));
    return lang === 'en'
      ? 'Roll ' + letter + ' · 2026-11-25'
      : '卷 ' + letter + ' · 2026-11-25';
  }

  function finderCopy() {
    if (state.phase === 'load') return copy.finderLoad;
    if (state.phase === 'shoot') return copy.finderLeft(state.capacity - state.frames.length);
    if (state.phase === 'dawn') return copy.finderDawn;
    return copy.finderSent;
  }

  function renderTicks() {
    ticks.textContent = '';
    var n = state.capacity;
    var i, mark;
    for (i = 0; i < n; i++) {
      mark = document.createElement('span');
      mark.className = 'tick' + (i < state.frames.length ? ' is-shot' : '');
      ticks.appendChild(mark);
    }
  }

  function render() {
    var shot = state.frames.length;
    var active = document.activeElement;
    root.setAttribute('data-phase', state.phase);
    canisterCount.textContent = state.capacity ? String(state.capacity) : '—';
    counterNum.textContent = pad2(shot) + ' / ' + (state.capacity ? String(state.capacity) : '—');
    renderTicks();
    finderLeft.textContent = finderCopy();
    nowScene.textContent = (state.phase === 'shoot' && state.scene)
      ? copy.thisFrame(sceneName(state.scene))
      : copy.pickAfterLoad;
    if (state.capacity) {
      rollLabel.hidden = false;
      rollLabel.textContent = rollName();
    } else {
      rollLabel.hidden = true;
      rollLabel.textContent = '';
    }
    countButtons.forEach(function (btn) {
      var n = Number(btn.getAttribute('data-count'));
      var locked = shot > 0 || (state.phase !== 'load' && state.phase !== 'shoot');
      btn.disabled = locked;
      btn.setAttribute('aria-pressed', state.capacity === n && n > 0 ? 'true' : 'false');
    });
    sceneButtons.forEach(function (btn) {
      btn.disabled = state.phase !== 'shoot';
      btn.setAttribute('aria-pressed', state.phase === 'shoot' && btn.getAttribute('data-scene') === state.scene ? 'true' : 'false');
    });
    cityButtons.forEach(function (btn) {
      btn.disabled = state.phase !== 'lab';
      btn.setAttribute('aria-pressed', btn.getAttribute('data-city') === state.city ? 'true' : 'false');
    });
    shutter.disabled = !(state.phase === 'shoot' && !state.needsAdvance && shot < state.capacity);
    advanceBtn.disabled = !(state.phase === 'shoot' && state.needsAdvance);
    sendEarly.disabled = !(state.phase === 'shoot' && shot > 0 && shot < state.capacity);
    fastBtn.disabled = state.phase !== 'lab';
    fastBtn.textContent = state.phase === 'night' ? copy.forwardingBtn : fastLabel;
    holdCameraFocus(active);
  }

  function holdCameraFocus(previous) {
    if (!previous || !camera.contains(previous) || previous === camera) return;
    if (!previous.disabled) return;
    var next = null;
    if (!advanceBtn.disabled) next = advanceBtn;
    else if (!shutter.disabled) next = shutter;
    else if (!sendEarly.disabled) next = sendEarly;
    if (next) next.focus();
    else if (state.phase === 'shoot' || state.phase === 'load') camera.focus();
  }

  function chooseCount(n) {
    if (n !== 12 && n !== 24 && n !== 36) return;
    if (state.frames.length > 0) return;
    if (state.phase !== 'load' && state.phase !== 'shoot') return;
    if (state.capacity === n && state.phase === 'shoot') return;
    state.capacity = n;
    state.phase = 'shoot';
    if (!state.scene) state.scene = 'lanterns';
    render();
    hint(copy.loaded(n), false);
    announce(copy.loaded(n));
  }

  function selectScene(id) {
    if (state.phase !== 'shoot') return;
    state.scene = id;
    render();
  }

  function blink() {
    if (motionReduced()) return;
    finder.classList.add('is-blink');
    window.setTimeout(function () { finder.classList.remove('is-blink'); }, 150);
  }

  function shoot() {
    if (state.phase === 'load') {
      hint(copy.loadFirst, true);
      announce(copy.loadFirst);
      return;
    }
    if (state.phase !== 'shoot') {
      hint(copy.alreadySent, true);
      announce(copy.alreadySent);
      return;
    }
    if (state.needsAdvance) {
      hint(copy.advanceFirst, true);
      announce(copy.advanceFirst);
      return;
    }
    if (!state.scene) {
      hint(copy.pickAfterLoad, true);
      announce(copy.pickAfterLoad);
      return;
    }
    if (state.frames.length >= state.capacity) {
      hint(copy.rollDone, true);
      announce(copy.rollDone);
      return;
    }
    state.frames.push(state.scene);
    var left = state.capacity - state.frames.length;
    state.needsAdvance = left > 0;
    render();
    blink();
    if (left === 0) {
      hint(copy.rollDone, false);
      window.setTimeout(function () {
        if (state.phase === 'shoot' && state.frames.length === state.capacity) send();
      }, motionReduced() ? 0 : 180);
    } else {
      hint(copy.advanceFirst, true);
      announce(copy.shot(state.frames.length, left));
    }
  }

  function advance() {
    if (state.phase === 'load') {
      hint(copy.loadFirst, true);
      announce(copy.loadFirst);
      return;
    }
    if (state.phase !== 'shoot') {
      hint(copy.alreadySent, true);
      announce(copy.alreadySent);
      return;
    }
    if (!state.needsAdvance) {
      var msg = state.frames.length === 0 ? copy.nothingToAdvance : copy.alreadyAdvanced;
      hint(msg, true);
      announce(msg);
      return;
    }
    state.needsAdvance = false;
    render();
    hint(copy.advanced, false);
    announce(copy.advanced);
  }

  /* NOAA sunrise, longitude positive east. One refinement pass. Offsets are standard time. */
  function sunriseUtcMinutes(lat, lonEast, year, month, day) {
    function calcJD(y, m, d) {
      if (m <= 2) { y -= 1; m += 12; }
      var A = Math.floor(y / 100);
      var B = 2 - A + Math.floor(A / 4);
      return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
    }
    function once(jd) {
      var t = (jd - 2451545.0) / 36525.0;
      var L0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360;
      if (L0 < 0) L0 += 360;
      var M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
      var e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
      var Mr = M * Math.PI / 180;
      var eqC = Math.sin(Mr) * (1.914602 - t * (0.004817 + 0.000014 * t))
        + Math.sin(2 * Mr) * (0.019993 - 0.000101 * t)
        + Math.sin(3 * Mr) * 0.000289;
      var omega = 125.04 - 1934.136 * t;
      var sunApp = L0 + eqC - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);
      var seconds = 21.448 - t * (46.8150 + t * (0.00059 - t * 0.001813));
      var obliq = 23 + (26 + seconds / 60) / 60 + 0.00256 * Math.cos(omega * Math.PI / 180);
      var decl = Math.asin(Math.sin(obliq * Math.PI / 180) * Math.sin(sunApp * Math.PI / 180));
      var l0 = L0 * Math.PI / 180;
      var yTerm = Math.tan((obliq * Math.PI / 180) / 2);
      yTerm *= yTerm;
      var eqTime = (yTerm * Math.sin(2 * l0) - 2 * e * Math.sin(Mr) + 4 * e * yTerm * Math.sin(Mr) * Math.cos(2 * l0)
        - 0.5 * yTerm * yTerm * Math.sin(4 * l0) - 1.25 * e * e * Math.sin(2 * Mr)) * 4 * 180 / Math.PI;
      var latRad = lat * Math.PI / 180;
      var haArg = Math.cos(90.833 * Math.PI / 180) / (Math.cos(latRad) * Math.cos(decl)) - Math.tan(latRad) * Math.tan(decl);
      if (haArg > 1) haArg = 1;
      if (haArg < -1) haArg = -1;
      var ha = Math.acos(haArg) * 180 / Math.PI;
      return 720 - 4 * (lonEast + ha) - eqTime;
    }
    var jd = calcJD(year, month, day);
    var mins = once(jd);
    return once(jd + mins / 1440);
  }

  function localParts(ms, tzHours) {
    var shifted = new Date(ms + tzHours * 3600000);
    return {
      y: shifted.getUTCFullYear(),
      m: shifted.getUTCMonth() + 1,
      d: shifted.getUTCDate()
    };
  }

  function partsAfter(parts, days) {
    var t = new Date(Date.UTC(parts.y, parts.m - 1, parts.d + days));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }

  function sunriseMsOn(city, parts) {
    var utcMinutes = sunriseUtcMinutes(city.lat, city.lon, parts.y, parts.m, parts.d);
    var localMinutes = utcMinutes + city.tz * 60;
    return Date.UTC(parts.y, parts.m - 1, parts.d) - city.tz * 3600000 + localMinutes * 60000;
  }

  function nextSunriseMs(city, nowMs) {
    var today = sunriseMsOn(city, localParts(nowMs, city.tz));
    if (today > nowMs + 15000) return today;
    return sunriseMsOn(city, partsAfter(localParts(nowMs, city.tz), 1));
  }

  function formatTime(ms, tz) {
    var shifted = new Date(ms + tz * 3600000);
    return pad2(shifted.getUTCHours()) + ':' + pad2(shifted.getUTCMinutes());
  }

  function formatDate(ms, tz) {
    var parts = localParts(ms, tz);
    if (lang === 'en') return parts.d + ' ' + copy.months[parts.m - 1];
    return parts.m + ' 月 ' + parts.d + ' 日';
  }

  function formatRemain(ms) {
    var total = Math.ceil(Math.max(0, ms) / 1000);
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }

  function stopTick() {
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = 0;
    }
  }

  function stopRaf() {
    if (state.raf) {
      window.cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
  }

  function updateSunrise() {
    var city = cityById(state.city);
    state.sunriseMs = nextSunriseMs(city, Date.now());
    sunriseCity.textContent = cityName(city);
    if (!isFinite(state.sunriseMs)) {
      sunriseDate.textContent = '';
      sunriseTime.textContent = '—';
      return;
    }
    sunriseDate.textContent = formatDate(state.sunriseMs, city.tz);
    sunriseTime.textContent = formatTime(state.sunriseMs, city.tz);
  }

  function tickCountdown() {
    if (state.phase !== 'lab') return;
    var remain = state.sunriseMs - Date.now();
    if (!(remain > 0)) {
      showDawn();
      return;
    }
    countdown.textContent = formatRemain(remain);
  }

  function startCountdown() {
    stopTick();
    tickCountdown();
    state.timer = window.setInterval(tickCountdown, 1000);
  }

  function showSlip() {
    labWait.hidden = true;
    sheet.hidden = true;
    labSlip.hidden = false;
    sky.classList.remove('is-forward');
    slipRoll.textContent = rollName();
    slipCount.textContent = copy.exposures(state.frames.length, state.capacity);
    updateSunrise();
    startCountdown();
    var city = cityById(state.city);
    announce(copy.sent(rollName(), state.frames.length, cityName(city), sunriseTime.textContent));
    if (!fastBtn.disabled && (document.activeElement === document.body || document.activeElement === camera || (document.activeElement && document.activeElement.disabled))) {
      fastBtn.focus();
    }
    if (window.matchMedia('(max-width: 759px)').matches && labSlip.scrollIntoView) {
      labSlip.scrollIntoView({ block: 'nearest' });
    }
  }

  function send() {
    if (state.phase !== 'shoot' || !state.frames.length) {
      hint(copy.shootFirst, true);
      announce(copy.shootFirst);
      return;
    }
    state.phase = 'lab';
    state.needsAdvance = false;
    hint(copy.alreadySent, false);
    render();
    showSlip();
  }

  function selectCity(id) {
    if (state.phase !== 'lab') return;
    var city = cityById(id);
    if (!city || city.id !== id) return;
    if (state.city === id) return;
    state.city = id;
    render();
    updateSunrise();
    tickCountdown();
    announce(copy.cityChanged(cityName(city), sunriseTime.textContent));
  }

  function fastForward() {
    if (state.phase !== 'lab') return;
    state.phase = 'night';
    render();
    stopTick();
    announce(copy.forwarding);
    if (motionReduced()) {
      countdown.textContent = '00:00:00';
      showDawn();
      return;
    }
    sky.classList.remove('is-forward');
    void sky.offsetWidth;
    sky.classList.add('is-forward');
    var from = Math.max(0, state.sunriseMs - Date.now());
    var start = window.performance.now();
    function step(now) {
      if (state.phase !== 'night') return;
      var t = Math.min(1, (now - start) / NIGHT_MS);
      countdown.textContent = formatRemain(from * (1 - t));
      if (t < 1) state.raf = window.requestAnimationFrame(step);
      else showDawn();
    }
    state.raf = window.requestAnimationFrame(step);
  }

  function showDawn() {
    if (state.phase === 'dawn') return;
    if (state.phase !== 'lab' && state.phase !== 'night') return;
    stopTick();
    stopRaf();
    state.phase = 'dawn';
    render();
    labSlip.hidden = true;
    labWait.hidden = true;
    sheet.hidden = false;
    stripEdge.textContent = rollName();
    stripFoot.textContent = copy.stripFoot(state.frames.length);
    buildFrames();
    announce(copy.developed(state.frames.length));
    if (sheetHeading.focus) sheetHeading.focus();
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

  function seedFor(frameNumber, salt) {
    return ((state.rollIndex + 1) * 1315423911 + frameNumber * 2654435761 + salt) >>> 0;
  }

  function drawInto(canvas, sceneId, frameNumber, w, h) {
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    paintFrame(ctx, w, h, sceneId, frameNumber);
  }

  function paintFrame(ctx, w, h, sceneId, frameNumber) {
    drawScene(ctx, w, h, sceneId, frameNumber);
    var casts = {
      lanterns: 'rgba(255, 120, 40, 0.16)',
      seawall: 'rgba(70, 140, 160, 0.18)',
      cat: 'rgba(176, 84, 112, 0.13)',
      rain: 'rgba(64, 110, 86, 0.16)'
    };
    ctx.fillStyle = 'rgba(255, 236, 214, 0.07)';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = casts[sceneId] || 'rgba(255, 220, 180, 0.08)';
    ctx.fillRect(0, 0, w, h);
    var vg = ctx.createRadialGradient(w * 0.5, h * 0.48, w * 0.22, w * 0.5, h * 0.5, w * 0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.58)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    lightLeak(ctx, w, h, frameNumber, mulberry32(seedFor(frameNumber, 9)));
    addGrain(ctx, w, h, mulberry32(seedFor(frameNumber, 3)));
    dateStamp(ctx, w, h);
  }

  function drawScene(ctx, w, h, id, frameNumber) {
    if (id === 'lanterns') drawLanterns(ctx, w, h, frameNumber);
    else if (id === 'seawall') drawSeawall(ctx, w, h, frameNumber);
    else if (id === 'cat') drawCat(ctx, w, h, frameNumber);
    else drawRain(ctx, w, h, frameNumber);
  }

  function drawLanterns(ctx, w, h, frameNumber) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#120c24');
    g.addColorStop(1, '#3a1c34');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1a110e';
    ctx.fillRect(0, h * 0.74, w, h * 0.26);
    var shift = ((frameNumber % 5) - 2) * w * 0.02;
    ctx.fillStyle = '#7a3028';
    ctx.beginPath();
    ctx.moveTo(w * 0.06 + shift, h * 0.76);
    ctx.lineTo(w * 0.16 + shift, h * 0.58);
    ctx.lineTo(w * 0.7 + shift, h * 0.58);
    ctx.lineTo(w * 0.8 + shift, h * 0.76);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(w * 0.22 + shift, h * 0.64, w * 0.4, h * 0.12);
    ctx.strokeStyle = '#e6c98a';
    ctx.lineWidth = Math.max(1, w * 0.006);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.18);
    ctx.bezierCurveTo(w * 0.28, h * 0.3, w * 0.62, h * 0.08, w, h * 0.2);
    ctx.stroke();
    var colors = ['#e25822', '#c4332c', '#f0a03a', '#d24b45'];
    var i;
    for (i = 0; i < 4; i++) {
      var x = w * (0.16 + i * 0.22) + shift * 0.3;
      var y = h * (0.22 + (i % 2) * 0.045);
      ctx.strokeStyle = '#e6c98a';
      ctx.beginPath();
      ctx.moveTo(x, y - h * 0.06);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.ellipse(x, y + h * 0.055, w * 0.055, h * 0.075, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f4d7a2';
      ctx.fillRect(x - w * 0.028, y - h * 0.005, w * 0.056, h * 0.016);
      ctx.fillRect(x - w * 0.01, y + h * 0.12, w * 0.02, h * 0.03);
    }
  }

  function drawSeawall(ctx, w, h, frameNumber) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#d5e3ee');
    g.addColorStop(0.4, '#b7cdda');
    g.addColorStop(0.4, '#4e8496');
    g.addColorStop(1, '#2c6274');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,.38)';
    ctx.lineWidth = Math.max(1, h * 0.01);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.bezierCurveTo(w * 0.3, h * 0.46, w * 0.55, h * 0.54, w, h * 0.48);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, h * 0.58);
    ctx.bezierCurveTo(w * 0.25, h * 0.63, w * 0.6, h * 0.54, w, h * 0.6);
    ctx.stroke();
    var bob = ((frameNumber % 4) - 1.5) * h * 0.012;
    ctx.fillStyle = '#c8c2b6';
    ctx.fillRect(0, h * 0.66 + bob, w, h * 0.15);
    ctx.fillStyle = '#b0aa9e';
    ctx.fillRect(0, h * 0.66 + bob, w, h * 0.018);
    ctx.strokeStyle = '#8d877c';
    ctx.lineWidth = Math.max(1, w * 0.005);
    var i;
    for (i = 1; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(w * i / 7, h * 0.66 + bob);
      ctx.lineTo(w * i / 7, h * 0.81 + bob);
      ctx.stroke();
    }
    ctx.fillStyle = '#b7b1a4';
    ctx.fillRect(0, h * 0.81 + bob, w, h);
    ctx.fillStyle = '#6e6a62';
    ctx.fillRect(w * 0.73, h * 0.72 + bob, w * 0.018, h * 0.12);
    ctx.beginPath();
    ctx.arc(w * 0.739, h * 0.72 + bob, w * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCat(ctx, w, h, frameNumber) {
    ctx.fillStyle = '#f3e6d8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e7d3c2';
    ctx.fillRect(0, 0, w * 0.1, h);
    var x = w * 0.16;
    var y = h * 0.08;
    var ww = w * 0.7;
    var wh = h * 0.6;
    ctx.fillStyle = '#5c5148';
    ctx.fillRect(x - w * 0.012, y - h * 0.012, ww + w * 0.024, wh + h * 0.024);
    ctx.fillStyle = '#8eafc4';
    ctx.fillRect(x, y, ww * 0.5, wh * 0.5);
    ctx.fillStyle = '#7ea3b8';
    ctx.fillRect(x + ww * 0.5, y, ww * 0.5, wh * 0.5);
    ctx.fillStyle = '#6e93aa';
    ctx.fillRect(x, y + wh * 0.5, ww * 0.5, wh * 0.5);
    ctx.fillStyle = '#6288a0';
    ctx.fillRect(x + ww * 0.5, y + wh * 0.5, ww * 0.5, wh * 0.5);
    ctx.fillStyle = '#4f6e82';
    ctx.fillRect(x, y + wh * 0.78, ww * 0.5, wh * 0.22);
    ctx.fillRect(x + ww * 0.62, y + wh * 0.66, ww * 0.16, wh * 0.34);
    ctx.fillRect(x + ww * 0.78, y + wh * 0.58, ww * 0.22, wh * 0.42);
    ctx.fillStyle = '#5c5148';
    ctx.fillRect(x + ww * 0.5 - w * 0.007, y, w * 0.014, wh);
    ctx.fillRect(x, y + wh * 0.5 - h * 0.007, ww, h * 0.014);
    ctx.fillStyle = '#ddc7b0';
    ctx.fillRect(x - w * 0.04, y + wh, ww + w * 0.08, h * 0.045);
    var shift = ((frameNumber % 5) - 2) * w * 0.012;
    var cx = x + ww * 0.66 + shift;
    var base = y + wh + h * 0.012;
    ctx.fillStyle = '#2a241f';
    ctx.strokeStyle = '#2a241f';
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(2, w * 0.016);
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.01, base - h * 0.03);
    ctx.quadraticCurveTo(cx + w * 0.16, base - h * 0.02, cx + w * 0.11, base - h * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx, base - h * 0.075, w * 0.095, h * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - w * 0.03, base - h * 0.16, Math.min(w, h) * 0.052, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.068, base - h * 0.185);
    ctx.lineTo(cx - w * 0.05, base - h * 0.265);
    ctx.lineTo(cx - w * 0.028, base - h * 0.195);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.02, base - h * 0.2);
    ctx.lineTo(cx + w * 0.002, base - h * 0.28);
    ctx.lineTo(cx + w * 0.024, base - h * 0.185);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f3e6d8';
    ctx.lineWidth = Math.max(1, w * 0.006);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.048, base - h * 0.162);
    ctx.lineTo(cx - w * 0.032, base - h * 0.162);
    ctx.moveTo(cx - w * 0.02, base - h * 0.158);
    ctx.lineTo(cx - w * 0.006, base - h * 0.158);
    ctx.stroke();
  }

  function drawRain(ctx, w, h, frameNumber) {
    ctx.fillStyle = '#a7b0b8';
    ctx.fillRect(0, 0, w, h);
    var shift = ((frameNumber % 3) - 1) * w * 0.015;
    ctx.fillStyle = '#4a525a';
    ctx.fillRect(0, h * 0.16, w * 0.48 + shift, h * 0.84);
    ctx.fillStyle = '#3c444c';
    ctx.fillRect(w * 0.48 + shift, h * 0.3, w, h * 0.7);
    ctx.fillStyle = '#d5dbe1';
    var r, c;
    for (r = 0; r < 3; r++) {
      for (c = 0; c < 2; c++) {
        ctx.fillRect(w * (0.08 + c * 0.16), h * (0.28 + r * 0.14), w * 0.07, h * 0.07);
      }
    }
    ctx.fillStyle = '#e6b15a';
    ctx.fillRect(w * 0.6 + shift, h * 0.42, w * 0.07, h * 0.065);
    ctx.fillRect(w * 0.78 + shift, h * 0.52, w * 0.07, h * 0.065);
    ctx.fillStyle = '#2c3338';
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
    ctx.strokeStyle = '#1c2226';
    ctx.lineWidth = Math.max(1.5, w * 0.01);
    ctx.beginPath();
    ctx.moveTo(w * 0.7, h * 0.78);
    ctx.lineTo(w * 0.7, h * 0.4);
    ctx.stroke();
    ctx.fillStyle = '#f0c36a';
    ctx.beginPath();
    ctx.arc(w * 0.7, h * 0.385, w * 0.028, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a474f';
    ctx.beginPath();
    ctx.ellipse(w * 0.56, h * 0.9, w * 0.2, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(240, 195, 106, .8)';
    ctx.fillRect(w * 0.52, h * 0.888, w * 0.05, h * 0.012);
  }

  function lightLeak(ctx, w, h, frameNumber, rand) {
    var roll = rand();
    var mag = rand();
    var side = rand();
    var strength = frameNumber <= 2 ? 0.5 + mag * 0.28 : (roll < 0.42 ? 0.12 + mag * 0.22 : 0);
    if (strength <= 0) return;
    var left = side < 0.5;
    var grad = ctx.createLinearGradient(left ? 0 : w, h * 0.05, left ? w * 0.72 : w * 0.28, h * 0.35);
    grad.addColorStop(0, 'rgba(255, 88, 36, ' + strength + ')');
    grad.addColorStop(0.38, 'rgba(255, 168, 64, ' + (strength * 0.42) + ')');
    grad.addColorStop(1, 'rgba(255, 168, 64, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  function addGrain(ctx, w, h, rand) {
    var image;
    try { image = ctx.getImageData(0, 0, w, h); }
    catch (err) { return; }
    var data = image.data;
    var start = Math.floor(rand() * 4) * 4;
    var i, n;
    for (i = start; i < data.length; i += 16) {
      n = (rand() - 0.5) * 46;
      data[i] = clampByte(data[i] + n);
      data[i + 1] = clampByte(data[i + 1] + n);
      data[i + 2] = clampByte(data[i + 2] + n);
    }
    ctx.putImageData(image, 0, 0);
  }

  function clampByte(v) {
    if (v < 0) return 0;
    if (v > 255) return 255;
    return v;
  }

  function dateStamp(ctx, w, h) {
    var size = Math.max(12, Math.round(h * 0.055));
    ctx.font = '600 ' + size + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
    ctx.textBaseline = 'alphabetic';
    var gap = size * 0.12;
    var width = 0;
    var i;
    for (i = 0; i < STAMP.length; i++) width += ctx.measureText(STAMP.charAt(i)).width + gap;
    var x = w - w * 0.06 - width;
    var y = h - h * 0.07;
    function write(color, ox, oy) {
      var cursor = x + ox;
      ctx.fillStyle = color;
      var k;
      for (k = 0; k < STAMP.length; k++) {
        var ch = STAMP.charAt(k);
        ctx.fillText(ch, cursor, y + oy);
        cursor += ctx.measureText(ch).width + gap;
      }
    }
    write('rgba(70, 24, 8, .45)', size * 0.06, size * 0.06);
    write('rgba(226, 88, 34, .94)', 0, 0);
  }

  function buildFrames() {
    framesEl.textContent = '';
    state.frames.forEach(function (sceneId, index) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'frame-btn';
      var label = copy.frameLabel(index + 1, sceneName(sceneId));
      button.setAttribute('aria-label', label);
      var num = document.createElement('span');
      num.className = 'frame-no';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = pad2(index + 1);
      var canvas = document.createElement('canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', label);
      drawInto(canvas, sceneId, index + 1, 400, 300);
      button.appendChild(num);
      button.appendChild(canvas);
      button.addEventListener('click', function () { openFrame(index, button); });
      framesEl.appendChild(button);
    });
  }

  function openFrame(index, opener) {
    var sceneId = state.frames[index];
    if (!sceneId) return;
    var label = copy.frameLabel(index + 1, sceneName(sceneId));
    frameCaption.textContent = copy.frameCaption(index + 1, sceneName(sceneId));
    frameLarge.setAttribute('role', 'img');
    frameLarge.setAttribute('aria-label', label);
    drawInto(frameLarge, sceneId, index + 1, 960, 720);
    state.opener = opener || null;
    if (typeof frameDialog.showModal === 'function') {
      if (!frameDialog.open) frameDialog.showModal();
    } else {
      frameDialog.setAttribute('open', '');
    }
    frameClose.focus();
  }

  function reset() {
    if (frameDialog.open && frameDialog.close) frameDialog.close();
    else frameDialog.removeAttribute('open');
    stopTick();
    stopRaf();
    state.rollIndex += 1;
    state.phase = 'load';
    state.capacity = 0;
    state.frames = [];
    state.needsAdvance = false;
    state.scene = null;
    state.city = 'taipei';
    sky.classList.remove('is-forward');
    labSlip.hidden = true;
    sheet.hidden = true;
    labWait.hidden = false;
    framesEl.textContent = '';
    countdown.textContent = '—';
    sunriseTime.textContent = '—';
    sunriseDate.textContent = '';
    sunriseCity.textContent = '';
    hint('', false);
    render();
    announce(copy.reset);
    if (countButtons[0] && countButtons[0].focus) countButtons[0].focus();
  }

  countButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      chooseCount(Number(btn.getAttribute('data-count')));
    });
  });
  sceneButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectScene(btn.getAttribute('data-scene'));
    });
  });
  cityButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectCity(btn.getAttribute('data-city'));
    });
  });
  shutter.addEventListener('click', shoot);
  advanceBtn.addEventListener('click', advance);
  sendEarly.addEventListener('click', send);
  fastBtn.addEventListener('click', fastForward);
  reloadBtn.addEventListener('click', reset);

  camera.addEventListener('keydown', function (event) {
    if (frameDialog.open) return;
    if (event.repeat) return;
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      shoot();
    } else if ((event.key === 'a' || event.key === 'A') && !event.metaKey && !event.ctrlKey && !event.altKey) {
      event.preventDefault();
      advance();
    }
  });

  frameClose.addEventListener('click', function () {
    if (frameDialog.open && frameDialog.close) frameDialog.close();
    else frameDialog.removeAttribute('open');
  });
  frameDialog.addEventListener('click', function (event) {
    if (event.target === frameDialog && frameDialog.open && frameDialog.close) frameDialog.close();
  });
  frameDialog.addEventListener('close', function () {
    var opener = state.opener;
    state.opener = null;
    if (opener && document.contains(opener) && opener.focus) opener.focus();
  });
  frameDialog.addEventListener('keydown', function (event) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    frameClose.focus();
  });

  labSlip.hidden = true;
  sheet.hidden = true;
  labWait.hidden = false;
  render();
})();
