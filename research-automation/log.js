(function () {
  var root = document.getElementById('log-root');
  var tocEl = document.getElementById('toc-list');
  var logEl = document.getElementById('log-list');
  var countEl = document.getElementById('log-count');
  if (!root || !tocEl || !logEl || !countEl) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var entriesUrl = root.getAttribute('data-entries') || 'entries.json';
  var copy = lang === 'en'
    ? {
        count: function (n) { return n + (n === 1 ? ' entry' : ' entries') + ' · Asia/Shanghai · newest first'; },
        empty: 'No entries yet.',
        loadError: 'The log did not load. Serve this folder with a local web server (python3 -m http.server), then refresh.',
        untitled: 'Untitled',
        earlier: function (name) { return 'Earlier title: ' + name; },
        cursor: 'Interactive report',
        notion: 'Filing for this day',
        tocLabel: 'Contents',
        timeline: 'Timeline'
      }
    : {
        count: function (n) { return n + ' 条 · Asia/Shanghai · 新到旧'; },
        empty: '还没有条目。',
        loadError: '日志没有载入。请用本地服务器打开（python3 -m http.server），然后刷新。',
        untitled: '未命名',
        earlier: function (name) { return '初名「' + name + '」'; },
        cursor: '交互报告',
        notion: '当日归档',
        tocLabel: '目录',
        timeline: '时间轴'
      };

  var sessionOrder = { '盘前': 1, '盘中': 2, '盘后': 3 };
  var renderedItems = [];
  var timelineFracs = {};
  var placedNarrow = null;
  var timelineBuiltParent = 0;
  var scrubbing = false;
  var timelineEl = document.getElementById('toc-timeline');
  var sessionEn = { '盘前': 'Pre-market', '盘中': 'Intraday', '盘后': 'After the close' };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function isHttp(url) {
    return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  }

  function sessionLabel(session) {
    if (lang === 'en' && sessionEn[session]) return sessionEn[session];
    return session || '—';
  }

  function entryTitles(entry) {
    var zhTitle = entry.title ? String(entry.title).trim() : '';
    var enTitle = entry.titleEn ? String(entry.titleEn).trim() : '';
    if (lang === 'en') {
      return {
        primary: enTitle || zhTitle || copy.untitled,
        gloss: (enTitle && zhTitle && enTitle !== zhTitle) ? zhTitle : ''
      };
    }
    return { primary: zhTitle || copy.untitled, gloss: '' };
  }

  function sessionSlug(session) {
    if (session === '盘前') return 'pre';
    if (session === '盘中') return 'mid';
    if (session === '盘后') return 'post';
    return 'x';
  }

  function weekday(dateStr) {
    var parsed = new Date(dateStr + 'T12:00:00+08:00');
    if (isNaN(parsed.getTime())) return '';
    try {
      return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'zh-CN', {
        weekday: 'short',
        timeZone: 'Asia/Shanghai'
      }).format(parsed);
    } catch (err) {
      return '';
    }
  }

  function sortEntries(list) {
    return list.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return (sessionOrder[b.session] || 0) - (sessionOrder[a.session] || 0);
    });
  }

  function addLink(parent, url, kicker, label) {
    if (!isHttp(url)) return;
    var link = document.createElement('a');
    link.href = url.trim();
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.appendChild(el('span', 'log-link-kicker', kicker));
    link.appendChild(el('span', 'log-link-label', label));
    var arrow = el('span', 'log-link-go', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    link.appendChild(arrow);
    parent.appendChild(link);
  }

  function render(entries) {
    tocEl.textContent = '';
    logEl.textContent = '';
    if (!entries.length) {
      countEl.textContent = copy.empty;
      return;
    }
    countEl.textContent = copy.count(entries.length);
    renderedItems = [];
    var seen = {};

    entries.forEach(function (entry, index) {
      var date = String(entry.date);
      var base = 'entry-' + (date.replace(/[^0-9-]/g, '') || ('n' + index)) + '-' + sessionSlug(entry.session);
      if (seen[base]) {
        seen[base] += 1;
        base = base + '-' + seen[base];
      } else {
        seen[base] = 1;
      }

      var when = date + ' · ' + sessionLabel(entry.session);
      var day = weekday(date);
      if (day) when += ' · ' + day;
      var titles = entryTitles(entry);

      var tocItem = document.createElement('li');
      var tocLink = document.createElement('a');
      tocLink.className = 'toc-link';
      tocLink.href = '#' + base;
      tocLink.appendChild(el('span', 'toc-when', when));
      tocLink.appendChild(el('span', 'toc-title', titles.primary));
      tocItem.appendChild(tocLink);
      tocEl.appendChild(tocItem);
      renderedItems.push({
        id: base,
        date: date,
        session: entry.session || '',
        sessionRank: sessionOrder[entry.session] || 0,
        title: titles.primary,
        label: when
      });

      var article = el('article', 'log-entry');
      article.id = base;

      var meta = el('p', 'log-meta');
      var time = document.createElement('time');
      time.dateTime = date;
      time.textContent = date;
      meta.appendChild(time);
      if (day) meta.appendChild(el('span', 'log-day', day));
      meta.appendChild(el('span', 'session-pill', sessionLabel(entry.session)));
      article.appendChild(meta);

      article.appendChild(el('h2', null, titles.primary));
      if (titles.gloss) article.appendChild(el('p', 'log-gloss', titles.gloss));
      if (entry.aka) article.appendChild(el('p', 'log-aka', copy.earlier(String(entry.aka))));

      var note = lang === 'en' && entry.noteEn ? entry.noteEn : entry.note;
      if (note) article.appendChild(el('p', 'log-note', String(note)));

      var links = el('div', 'log-links');
      addLink(links, entry.canvas, 'Cursor', copy.cursor);
      addLink(links, entry.notion, 'Notion', copy.notion);
      if (links.childNodes.length) article.appendChild(links);

      logEl.appendChild(article);
    });

    buildTimeline();
    bindSpy();
    syncTocOverflow();
    syncStickyOffset();
    if (location.hash) {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) target.scrollIntoView();
    }
  }

  function bindSpy() {
    var tocScroll = document.getElementById('toc') || tocEl;
    var links = tocEl.querySelectorAll('.toc-link');
    var entries = logEl.querySelectorAll('.log-entry');
    if (!entries.length) return;

    function update() {
      var line = Math.min(168, window.innerHeight * 0.28);
      if (window.matchMedia('(max-width: 900px)').matches) {
        var sticky = document.getElementById('toc');
        if (sticky) line = Math.max(line, sticky.getBoundingClientRect().bottom + 24);
      }
      var current = entries[0];
      var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
      if (atBottom) {
        current = entries[entries.length - 1];
      } else {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].getBoundingClientRect().top <= line) current = entries[i];
        }
      }
      var active = null;
      for (var j = 0; j < links.length; j++) {
        var on = links[j].getAttribute('href') === '#' + current.id;
        links[j].classList.toggle('is-current', on);
        if (on) {
          links[j].setAttribute('aria-current', 'location');
          active = links[j];
        } else {
          links[j].removeAttribute('aria-current');
        }
      }
      syncTimelinePlayhead(current.id);
      if (!active) return;
      var linkBox = active.getBoundingClientRect();
      if (tocScroll.scrollHeight > tocScroll.clientHeight + 4) {
        var tocBox = tocScroll.getBoundingClientRect();
        if (linkBox.top < tocBox.top) tocScroll.scrollTop -= tocBox.top - linkBox.top;
        else if (linkBox.bottom > tocBox.bottom) tocScroll.scrollTop += linkBox.bottom - tocBox.bottom;
        syncTocStripEdges();
        return;
      }
      var strip = tocScroll.querySelector('.toc-list');
      if (!strip) return;
      var stripBox = strip.getBoundingClientRect();
      var edge = 28;
      if (linkBox.left < stripBox.left + edge) strip.scrollLeft -= stripBox.left + edge - linkBox.left;
      else if (linkBox.right > stripBox.right - edge) strip.scrollLeft += linkBox.right - (stripBox.right - edge);
      syncTocStripEdges();
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }, { passive: true });
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        for (var i = 0; i < links.length; i++) links[i].classList.remove('is-current');
        link.classList.add('is-current');
      });
    });
    update();
  }

  function syncTocStripEdges() {
    var toc = document.getElementById('toc');
    if (!toc) return;
    if (!window.matchMedia('(max-width: 900px)').matches) {
      toc.classList.remove('can-scroll-left', 'can-scroll-right');
      return;
    }
    var slack = tocEl.scrollWidth - tocEl.clientWidth;
    toc.classList.toggle('can-scroll-left', tocEl.scrollLeft > 2);
    toc.classList.toggle('can-scroll-right', slack - tocEl.scrollLeft > 2);
  }

  function syncTocOverflow() {
    var toc = document.getElementById('toc');
    if (!toc) return;
    if (window.matchMedia('(max-width: 900px)').matches) {
      toc.classList.remove('is-overflowing');
      syncTocStripEdges();
      return;
    }
    toc.classList.add('is-overflowing');
    var overflows = toc.scrollHeight > toc.clientHeight + 1;
    toc.classList.toggle('is-overflowing', overflows);
    syncTocStripEdges();
  }

  function onTocWheel(event) {
    var toc = event.currentTarget;
    if (!toc.classList.contains('is-overflowing')) return;
    if (event.ctrlKey || event.metaKey) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    var delta = event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= toc.clientHeight || window.innerHeight;
    if (!delta) return;
    var maxScroll = toc.scrollHeight - toc.clientHeight;
    var atStart = toc.scrollTop <= 0;
    var atEnd = toc.scrollTop >= maxScroll - 1;
    if ((delta < 0 && !atStart) || (delta > 0 && !atEnd)) return;
    var rootStyle = document.documentElement.style;
    var previous = rootStyle.scrollBehavior;
    rootStyle.scrollBehavior = 'auto';
    window.scrollBy(0, delta);
    rootStyle.scrollBehavior = previous;
    if (event.cancelable) event.preventDefault();
  }

  function bindHeaderTitle() {
    var header = document.querySelector('.site-header');
    var inner = header && header.querySelector('.header-inner');
    var h1 = document.querySelector('.notes-wrap h1');
    if (!header || !inner || !h1 || inner.querySelector('.header-page-title')) return;
    var crumb = document.createElement('a');
    crumb.className = 'header-page-title';
    crumb.href = '#top';
    crumb.textContent = (h1.textContent || '').trim();
    var nav = inner.querySelector('.site-nav');
    if (nav) inner.insertBefore(crumb, nav);
    else inner.appendChild(crumb);

    var ticking = false;
    function sync() {
      header.classList.toggle('is-title-away', h1.getBoundingClientRect().bottom <= 1);
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        sync();
        ticking = false;
      });
    }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  function dateMs(dateStr) {
    var parsed = new Date(dateStr + 'T12:00:00+08:00');
    return parsed.getTime();
  }

  function monthShort(ym) {
    var parsed = new Date(ym + '-01T12:00:00+08:00');
    try {
      return new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'Asia/Shanghai' }).format(parsed);
    } catch (err) {
      return ym.slice(5);
    }
  }

  function axisText(kind, key, spanYears) {
    if (kind === 'year') return key;
    if (kind === 'month') {
      if (spanYears) return key;
      if (lang === 'en') return monthShort(key);
      return String(Number(key.slice(5))) + '月';
    }
    if (spanYears) return key;
    return key.slice(5);
  }

  function placeTimeline() {
    if (!timelineEl) return;
    var narrow = window.matchMedia('(max-width: 900px)').matches;
    var strip = document.querySelector('.toc-strip');
    var log = document.getElementById('log');
    if (narrow && strip && strip.parentNode) {
      if (timelineEl.nextElementSibling !== strip) strip.parentNode.insertBefore(timelineEl, strip);
    } else if (!narrow && log && timelineEl.parentNode !== log) {
      log.insertBefore(timelineEl, log.firstChild);
    }
    placedNarrow = narrow;
  }

  function timelineModel(items, width) {
    var points = items.map(function (item) {
      return {
        id: item.id,
        date: item.date,
        month: item.date.slice(0, 7),
        year: item.date.slice(0, 4),
        time: dateMs(item.date),
        session: item.session,
        sessionRank: item.sessionRank,
        title: item.title,
        label: item.label
      };
    }).filter(function (point) { return !isNaN(point.time); });
    points.sort(function (a, b) {
      if (a.time !== b.time) return a.time - b.time;
      return a.sessionRank - b.sessionRank;
    });
    if (!points.length) return null;
    var span = points[points.length - 1].time - points[0].time;
    var spanYears = points[0].year !== points[points.length - 1].year;
    points.forEach(function (point, index) {
      point.frac = !span ? (points.length === 1 ? 0.5 : index / (points.length - 1)) : (point.time - points[0].time) / span;
    });

    function minGap(list) {
      var gap = Infinity;
      for (var i = 1; i < list.length; i++) {
        var size = (list[i].frac - list[i - 1].frac) * width;
        if (size > 0.5) gap = Math.min(gap, size);
      }
      return gap === Infinity ? width : gap;
    }

    function groupBy(keyFn) {
      var order = [];
      var index = {};
      points.forEach(function (point) {
        var key = keyFn(point);
        if (!index[key]) {
          index[key] = { key: key, members: [] };
          order.push(index[key]);
        }
        index[key].members.push(point);
      });
      order.forEach(function (group) {
        var sum = 0;
        var target = group.members[0];
        group.members.forEach(function (member) {
          sum += member.frac;
          if (member.time > target.time || (member.time === target.time && member.sessionRank > target.sessionRank)) target = member;
        });
        group.frac = sum / group.members.length;
        group.id = target.id;
        group.target = target;
      });
      order.sort(function (a, b) { return a.frac - b.frac; });
      return order;
    }

    var mode = 'entry';
    var groups = null;
    if (!((points.length <= 20 && minGap(points) >= 8) || points.length <= 4)) {
      var days = groupBy(function (point) { return point.date; });
      if (days.length <= 42 && minGap(days) >= 8) {
        mode = 'day';
        groups = days;
      } else {
        var weeks = groupBy(function (point) { return String(Math.floor(point.time / 604800000)); });
        if (weeks.length <= 26 && minGap(weeks) >= 12) {
          mode = 'week';
          groups = weeks;
        } else {
          var months = groupBy(function (point) { return point.month; });
          if (months.length <= 18 && minGap(months) >= 14) {
            mode = 'month';
            groups = months;
          } else {
            mode = 'year';
            groups = groupBy(function (point) { return point.year; });
          }
        }
      }
    }

    var ticks = [];
    if (mode === 'entry') {
      var byDate = {};
      points.forEach(function (point) {
        if (!byDate[point.date]) byDate[point.date] = [];
        byDate[point.date].push(point);
      });
      points.forEach(function (point) {
        var group = byDate[point.date];
        var index = group.indexOf(point);
        ticks.push({
          id: point.id,
          ids: point.id,
          frac: point.frac,
          nudge: (index - (group.length - 1) / 2) * 6,
          aria: point.label + ' · ' + point.title
        });
      });
    } else {
      groups.forEach(function (group) {
        var count = group.members.length;
        var aria = group.target.label + ' · ' + group.target.title;
        if (count > 1) aria += ' · ' + count;
        ticks.push({
          id: group.id,
          ids: group.members.map(function (member) { return member.id; }).join(','),
          frac: group.frac,
          nudge: 0,
          aria: aria
        });
      });
    }

    var kind = mode === 'year' ? 'year' : (mode === 'month' ? 'month' : 'date');
    var startKey = kind === 'year' ? points[0].year : (kind === 'month' ? points[0].month : points[0].date);
    var endKey = kind === 'year' ? points[points.length - 1].year : (kind === 'month' ? points[points.length - 1].month : points[points.length - 1].date);
    var fracs = {};
    points.forEach(function (point) { fracs[point.id] = point.frac; });
    return {
      mode: mode,
      ticks: ticks,
      fracs: fracs,
      startLabel: axisText(kind, startKey, spanYears),
      endLabel: axisText(kind, endKey, spanYears)
    };
  }

  function paintTimeline(model) {
    timelineFracs = model.fracs;
    timelineEl.textContent = '';
    timelineEl.setAttribute('role', 'group');
    timelineEl.setAttribute('aria-label', copy.timeline);
    var track = el('div', 'toc-timeline-track');
    track.appendChild(el('span', 'toc-timeline-end', model.startLabel));
    var rail = el('div', 'toc-timeline-rail');
    rail.appendChild(el('div', 'toc-timeline-axis'));
    model.ticks.forEach(function (tick) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toc-timeline-tick';
      btn.setAttribute('data-id', tick.id);
      btn.setAttribute('data-ids', tick.ids);
      btn.setAttribute('aria-label', tick.aria);
      btn.title = tick.aria;
      btn.style.left = (tick.frac * 100) + '%';
      if (tick.nudge) btn.style.marginLeft = tick.nudge + 'px';
      rail.appendChild(btn);
    });
    var head = el('div', 'toc-timeline-playhead');
    head.setAttribute('aria-hidden', 'true');
    rail.appendChild(head);
    track.appendChild(rail);
    if (model.endLabel !== model.startLabel) track.appendChild(el('span', 'toc-timeline-end', model.endLabel));
    timelineEl.appendChild(track);
    var current = tocEl.querySelector('.toc-link.is-current');
    var id = current ? (current.getAttribute('href') || '').slice(1) : (renderedItems[0] && renderedItems[0].id);
    syncTimelinePlayhead(id);
  }

  function buildTimeline() {
    if (!timelineEl) return;
    if (!renderedItems.length) {
      timelineEl.textContent = '';
      return;
    }
    placeTimeline();
    var parentWidth = timelineEl.parentElement ? timelineEl.parentElement.clientWidth : 320;
    timelineBuiltParent = parentWidth;
    var width = Math.max(120, parentWidth - 88);
    var model = timelineModel(renderedItems, width);
    if (!model) return;
    paintTimeline(model);
    requestAnimationFrame(function () {
      var rail = timelineEl.querySelector('.toc-timeline-rail');
      var actual = rail ? rail.clientWidth : 0;
      if (actual > 40 && Math.abs(actual - width) > 48) {
        var next = timelineModel(renderedItems, actual);
        if (next) paintTimeline(next);
      }
      syncStickyOffset();
    });
  }

  function syncTimelinePlayhead(id) {
    if (!timelineEl || !id || timelineFracs[id] == null) return;
    var head = timelineEl.querySelector('.toc-timeline-playhead');
    if (head) head.style.left = (timelineFracs[id] * 100) + '%';
    var ticks = timelineEl.querySelectorAll('.toc-timeline-tick');
    for (var i = 0; i < ticks.length; i++) {
      var ids = (ticks[i].getAttribute('data-ids') || '').split(',');
      var on = false;
      for (var k = 0; k < ids.length; k++) if (ids[k] === id) on = true;
      ticks[i].classList.toggle('is-current', on);
      if (on) ticks[i].setAttribute('aria-current', 'true');
      else ticks[i].removeAttribute('aria-current');
    }
  }

  function revealChip(link) {
    if (!link) return;
    var narrow = window.matchMedia('(max-width: 900px)').matches;
    if (narrow) {
      var linkBox = link.getBoundingClientRect();
      var stripBox = tocEl.getBoundingClientRect();
      var edge = 28;
      if (linkBox.left < stripBox.left + edge) tocEl.scrollLeft -= stripBox.left + edge - linkBox.left;
      else if (linkBox.right > stripBox.right - edge) tocEl.scrollLeft += linkBox.right - (stripBox.right - edge);
      return;
    }
    var toc = document.getElementById('toc');
    if (!toc || !toc.classList.contains('is-overflowing')) return;
    var linkBoxDesktop = link.getBoundingClientRect();
    var tocBox = toc.getBoundingClientRect();
    if (linkBoxDesktop.top < tocBox.top) toc.scrollTop -= tocBox.top - linkBoxDesktop.top;
    else if (linkBoxDesktop.bottom > tocBox.bottom) toc.scrollTop += linkBoxDesktop.bottom - tocBox.bottom;
  }

  function jumpToEntry(id) {
    if (!id) return;
    var entry = document.getElementById(id);
    if (!entry) return;
    var links = tocEl.querySelectorAll('.toc-link');
    var link = null;
    for (var i = 0; i < links.length; i++) {
      var on = links[i].getAttribute('href') === '#' + id;
      links[i].classList.toggle('is-current', on);
      if (on) {
        links[i].setAttribute('aria-current', 'location');
        link = links[i];
      } else {
        links[i].removeAttribute('aria-current');
      }
    }
    var rootStyle = document.documentElement.style;
    var previous = rootStyle.scrollBehavior;
    rootStyle.scrollBehavior = 'auto';
    entry.scrollIntoView();
    rootStyle.scrollBehavior = previous;
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    revealChip(link);
    syncTimelinePlayhead(id);
    syncTocStripEdges();
  }

  function nearestTick(clientX) {
    if (!timelineEl) return null;
    var ticks = timelineEl.querySelectorAll('.toc-timeline-tick');
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < ticks.length; i++) {
      var box = ticks[i].getBoundingClientRect();
      var dist = Math.abs(clientX - (box.left + box.width / 2));
      if (dist < bestDist) {
        bestDist = dist;
        best = ticks[i];
      }
    }
    return best;
  }

  function onTimelinePointerDown(event) {
    if (!timelineEl || !timelineEl.querySelector('.toc-timeline-tick')) return;
    if (event.button != null && event.button !== 0) return;
    var tick = nearestTick(event.clientX);
    if (!tick) return;
    scrubbing = true;
    timelineEl.classList.add('is-scrubbing');
    timelineEl.setAttribute('data-scrub', tick.getAttribute('data-id') || '');
    if (timelineEl.setPointerCapture) {
      try { timelineEl.setPointerCapture(event.pointerId); } catch (err) {}
    }
    jumpToEntry(tick.getAttribute('data-id'));
    if (event.cancelable) event.preventDefault();
  }

  function onTimelinePointerMove(event) {
    if (!scrubbing) return;
    var tick = nearestTick(event.clientX);
    if (!tick) return;
    var id = tick.getAttribute('data-id');
    if (timelineEl.getAttribute('data-scrub') === id) return;
    timelineEl.setAttribute('data-scrub', id || '');
    jumpToEntry(id);
  }

  function onTimelinePointerUp(event) {
    if (!scrubbing) return;
    scrubbing = false;
    if (timelineEl) {
      timelineEl.classList.remove('is-scrubbing');
      timelineEl.removeAttribute('data-scrub');
      if (timelineEl.releasePointerCapture) {
        try { timelineEl.releasePointerCapture(event.pointerId); } catch (err) {}
      }
    }
  }

  function syncStickyOffset() {
    var rootStyle = document.documentElement.style;
    if (!window.matchMedia('(max-width: 900px)').matches) return;
    var toc = document.getElementById('toc');
    if (!toc) return;
    var top = parseFloat(getComputedStyle(toc).top) || 0;
    var offset = Math.ceil(top + toc.getBoundingClientRect().height + 12);
    rootStyle.setProperty('--notes-sticky-offset', Math.max(140, offset) + 'px');
  }

  var tocNav = document.getElementById('toc');
  if (tocNav) tocNav.addEventListener('wheel', onTocWheel, { passive: false });
  if (timelineEl) {
    timelineEl.addEventListener('pointerdown', onTimelinePointerDown);
    timelineEl.addEventListener('pointermove', onTimelinePointerMove);
    timelineEl.addEventListener('pointerup', onTimelinePointerUp);
    timelineEl.addEventListener('pointercancel', onTimelinePointerUp);
    timelineEl.addEventListener('click', function (event) {
      var target = event.target;
      var tick = target && target.closest ? target.closest('.toc-timeline-tick') : null;
      if (!tick || !timelineEl.contains(tick)) return;
      jumpToEntry(tick.getAttribute('data-id'));
    });
  }
  var stripTicking = false;
  tocEl.addEventListener('scroll', function () {
    if (stripTicking) return;
    stripTicking = true;
    requestAnimationFrame(function () {
      syncTocStripEdges();
      stripTicking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', function () {
    requestAnimationFrame(function () {
      var before = placedNarrow;
      placeTimeline();
      var parentWidth = timelineEl && timelineEl.parentElement ? timelineEl.parentElement.clientWidth : 0;
      if (renderedItems.length && before !== null && (placedNarrow !== before || Math.abs(parentWidth - timelineBuiltParent) > 48)) buildTimeline();
      syncTocOverflow();
      syncStickyOffset();
    });
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      syncTocOverflow();
      syncStickyOffset();
    });
  }
  bindHeaderTitle();
  syncTocOverflow();

  document.querySelectorAll('.lang-switch a').forEach(function (anchor) {
    anchor.addEventListener('click', function () {
      if (!location.hash) return;
      var base = anchor.getAttribute('href').split('#')[0];
      anchor.href = base + location.hash;
    });
  });

  fetch(entriesUrl, { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then(function (data) {
      var list = Array.isArray(data) ? data : (data && Array.isArray(data.entries) ? data.entries : null);
      if (!list) throw new Error('shape');
      var usable = list.filter(function (entry) {
        return entry && typeof entry.date === 'string' && entry.date;
      });
      render(sortEntries(usable));
    })
    .catch(function () {
      countEl.textContent = copy.loadError;
    });
})();
