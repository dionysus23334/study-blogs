(function () {
  var root = document.getElementById('gallery');
  if (!root) return;

  var grid = document.getElementById('app-grid');
  var countEl = document.getElementById('gallery-count');
  var fallback = document.getElementById('gallery-fallback');
  if (!grid || !countEl) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var catalogUrl = root.getAttribute('data-catalog') || 'catalog.json';
  var base = root.getAttribute('data-base') || '';
  var copy = lang === 'en'
    ? {
        count: function (n, updated) {
          var line = n + (n === 1 ? ' demo' : ' demos') + ' · Asia/Shanghai · newest first';
          if (updated) line += ' · updated ' + updated;
          return line;
        },
        empty: 'No demos yet.',
        loadError: 'The gallery did not load. Serve this folder with a local web server (python3 -m http.server), then refresh.',
        untitled: 'Untitled',
        report: 'Report',
        reportLabel: function (name) { return 'Research report: ' + name; },
        open: 'Open demo',
        openLabel: function (name) { return 'Open the demo: ' + name; },
        weekdayLocale: 'en-US'
      }
    : {
        count: function (n, updated) {
          var line = n + ' 则 · Asia/Shanghai · 新到旧';
          if (updated) line += ' · 更新于 ' + updated;
          return line;
        },
        empty: '还没有演示。',
        loadError: '画廊没有载入。请用本地服务器打开（python3 -m http.server），然后刷新。',
        untitled: '未命名',
        report: '研报',
        reportLabel: function (name) { return '研报：' + name; },
        open: '打开演示',
        openLabel: function (name) { return '打开演示：' + name; },
        weekdayLocale: 'zh-CN'
      };

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function isHttp(url) {
    return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
  }

  function weekday(dateStr) {
    var parsed = new Date(dateStr + 'T12:00:00+08:00');
    if (isNaN(parsed.getTime())) return '';
    try {
      return new Intl.DateTimeFormat(copy.weekdayLocale, {
        weekday: 'short',
        timeZone: 'Asia/Shanghai'
      }).format(parsed);
    } catch (err) {
      return '';
    }
  }

  function folio(dateStr) {
    var parts = String(dateStr || '').split('-');
    var year = parts[0] || '';
    var monthIndex = Number(parts[1]) - 1;
    var day = String(Number(parts[2]) || '');
    return {
      day: day,
      month: months[monthIndex] || parts[1] || '',
      year: year
    };
  }

  function titles(entry) {
    var enName = entry.name ? String(entry.name).trim() : '';
    var zhName = entry.name_zh ? String(entry.name_zh).trim() : '';
    if (lang === 'en') {
      return {
        title: enName || zhName || copy.untitled,
        gloss: (enName && zhName && enName !== zhName) ? zhName : ''
      };
    }
    return {
      title: zhName || enName || copy.untitled,
      gloss: ''
    };
  }

  function resolvePath(path) {
    if (!path) return '';
    var value = String(path).trim();
    if (isHttp(value)) return value;
    return base + value.replace(/^\//, '');
  }

  function sortEntries(list) {
    return list.map(function (entry, index) {
      return { entry: entry, index: index };
    }).sort(function (a, b) {
      var aDate = String(a.entry.date || '');
      var bDate = String(b.entry.date || '');
      if (aDate !== bDate) return aDate < bDate ? 1 : -1;
      return a.index - b.index;
    }).map(function (item) {
      return item.entry;
    });
  }

  function addTextLink(parent, href, className, label, aria, external) {
    var link = document.createElement('a');
    link.className = className;
    link.href = href;
    if (aria) link.setAttribute('aria-label', aria);
    if (external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.appendChild(document.createTextNode(label));
    parent.appendChild(link);
    return link;
  }

  function render(entries, updated) {
    grid.textContent = '';
    if (!entries.length) {
      countEl.textContent = copy.empty;
      grid.setAttribute('aria-busy', 'false');
      return;
    }
    countEl.textContent = copy.count(entries.length, updated);
    entries.forEach(function (entry, index) {
      var names = titles(entry);
      var demoHref = resolvePath(lang === 'en' ? (entry.demo_en || entry.demo) : (entry.demo || entry.demo_en));
      var date = String(entry.date || '');
      var mark = folio(date);
      var dayName = weekday(date);
      var card = el('article', 'app-card');
      card.id = 'app-' + String(entry.id || index);
      card.style.animationDelay = (index * 45) + 'ms';

      var link = document.createElement('a');
      link.className = 'app-card-link';
      if (demoHref) {
        link.href = demoHref;
        link.setAttribute('aria-label', copy.openLabel(names.title));
      } else {
        link.classList.add('is-static');
      }

      var dateEl = el('div', 'app-date');
      var time = document.createElement('time');
      if (date) time.dateTime = date;
      time.className = 'app-folio';
      time.appendChild(el('span', 'app-day', mark.day || '—'));
      time.appendChild(el('span', 'app-month', mark.month));
      time.appendChild(el('span', 'app-year', mark.year));
      dateEl.appendChild(time);
      link.appendChild(dateEl);

      var copyCol = el('div', 'app-copy');
      var meta = el('p', 'app-meta');
      if (dayName) meta.appendChild(el('span', 'app-weekday', dayName));
      if (entry.publisher) meta.appendChild(el('span', 'app-pub', String(entry.publisher)));
      if (meta.childNodes.length) copyCol.appendChild(meta);
      copyCol.appendChild(el('h2', null, names.title));
      if (names.gloss) copyCol.appendChild(el('p', 'app-gloss', names.gloss));
      var hook = lang === 'en' ? entry.one_liner_en : entry.one_liner_zh;
      if (!hook) hook = entry.one_liner_zh || entry.one_liner_en;
      if (hook) copyCol.appendChild(el('p', 'app-hook', String(hook)));
      if (Array.isArray(entry.tags) && entry.tags.length) {
        var tags = el('ul', 'app-tags');
        entry.tags.forEach(function (tag) {
          if (!tag) return;
          tags.appendChild(el('li', null, String(tag)));
        });
        if (tags.childNodes.length) copyCol.appendChild(tags);
      }
      link.appendChild(copyCol);
      card.appendChild(link);

      var foot = el('div', 'app-card-foot');
      if (isHttp(entry.report)) {
        var report = addTextLink(
          foot,
          String(entry.report).trim(),
          'app-report',
          copy.report,
          copy.reportLabel(names.title),
          true
        );
        report.appendChild(el('span', 'app-external', '↗'));
      }
      if (demoHref) {
        var open = addTextLink(foot, demoHref, 'app-go', copy.open, copy.openLabel(names.title), false);
        open.appendChild(el('span', null, '→'));
      }
      if (foot.childNodes.length) card.appendChild(foot);
      grid.appendChild(card);
    });
    grid.setAttribute('aria-busy', 'false');
    if (fallback) fallback.hidden = true;
  }

  function showFallback() {
    if (fallback) fallback.hidden = false;
  }

  fetch(catalogUrl, { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then(function (data) {
      var list = data && Array.isArray(data.entries) ? data.entries : null;
      if (!list) throw new Error('shape');
      var usable = list.filter(function (entry) {
        return entry && (entry.name || entry.name_zh || entry.id);
      });
      render(sortEntries(usable), data.updated ? String(data.updated) : '');
    })
    .catch(function () {
      countEl.textContent = copy.loadError;
      grid.setAttribute('aria-busy', 'false');
      showFallback();
    });

  var header = document.querySelector('.site-header');
  var inner = header && header.querySelector('.header-inner');
  var h1 = document.querySelector('.notes-wrap h1');
  if (header && inner && h1 && !inner.querySelector('.header-page-title')) {
    var crumb = document.createElement('a');
    crumb.className = 'header-page-title';
    crumb.href = '#top';
    crumb.textContent = (h1.textContent || '').trim();
    var nav = inner.querySelector('.site-nav');
    if (nav) inner.insertBefore(crumb, nav);
    else inner.appendChild(crumb);
    var ticking = false;
    function syncTitle() {
      header.classList.toggle('is-title-away', h1.getBoundingClientRect().bottom <= header.getBoundingClientRect().bottom);
    }
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        syncTitle();
        ticking = false;
      });
    }, { passive: true });
    window.addEventListener('resize', syncTitle);
    syncTitle();
  }
})();
