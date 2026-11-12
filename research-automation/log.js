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
        tocLabel: 'Contents'
      }
    : {
        count: function (n) { return n + ' 条 · Asia/Shanghai · 新到旧'; },
        empty: '还没有条目。',
        loadError: '日志没有载入。请用本地服务器打开（python3 -m http.server），然后刷新。',
        untitled: '未命名',
        earlier: function (name) { return '初名「' + name + '」'; },
        cursor: '交互报告',
        notion: '当日归档',
        tocLabel: '目录'
      };

  var sessionOrder = { '盘前': 1, '盘中': 2, '盘后': 3 };
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
      var title = entry.title || copy.untitled;

      var tocItem = document.createElement('li');
      var tocLink = document.createElement('a');
      tocLink.className = 'toc-link';
      tocLink.href = '#' + base;
      tocLink.appendChild(el('span', 'toc-when', when));
      tocLink.appendChild(el('span', 'toc-title', title));
      tocItem.appendChild(tocLink);
      tocEl.appendChild(tocItem);

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

      article.appendChild(el('h2', null, title));
      if (lang === 'en' && entry.titleEn) article.appendChild(el('p', 'log-gloss', entry.titleEn));
      if (entry.aka) article.appendChild(el('p', 'log-aka', copy.earlier(String(entry.aka))));

      var note = lang === 'en' && entry.noteEn ? entry.noteEn : entry.note;
      if (note) article.appendChild(el('p', 'log-note', String(note)));

      var links = el('div', 'log-links');
      addLink(links, entry.canvas, 'Cursor', copy.cursor);
      addLink(links, entry.notion, 'Notion', copy.notion);
      if (links.childNodes.length) article.appendChild(links);

      logEl.appendChild(article);
    });

    bindSpy();
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
      if (!active) return;
      var linkBox = active.getBoundingClientRect();
      if (tocScroll.scrollHeight > tocScroll.clientHeight + 4) {
        var tocBox = tocScroll.getBoundingClientRect();
        if (linkBox.top < tocBox.top) tocScroll.scrollTop -= tocBox.top - linkBox.top;
        else if (linkBox.bottom > tocBox.bottom) tocScroll.scrollTop += linkBox.bottom - tocBox.bottom;
        return;
      }
      var strip = tocScroll.querySelector('.toc-list');
      if (!strip) return;
      var stripBox = strip.getBoundingClientRect();
      if (linkBox.left < stripBox.left) strip.scrollLeft -= stripBox.left - linkBox.left + 8;
      else if (linkBox.right > stripBox.right) strip.scrollLeft += linkBox.right - stripBox.right + 8;
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
