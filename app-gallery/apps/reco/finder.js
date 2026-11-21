/* 帖子里藏着什么 — find the places, films and things tucked into a post. */

(function () {
  var root = document.querySelector('.finder');
  var tabs = root ? Array.prototype.slice.call(root.querySelectorAll('.post-tab')) : [];
  var postBody = document.getElementById('post-body');
  var byline = document.getElementById('post-byline');
  var findBtn = document.getElementById('find-recs');
  var foundEmpty = document.getElementById('found-empty');
  var foundList = document.getElementById('found-list');
  var nameInput = document.getElementById('collection-name');
  var keptEmpty = document.getElementById('kept-empty');
  var keptList = document.getElementById('kept-list');
  var clearBtn = document.getElementById('finder-clear');
  if (!root || !postBody || !byline || !findBtn || !foundEmpty || !foundList || !nameInput || !keptEmpty || !keptList || !clearBtn || !tabs.length) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  var ui = lang === 'en'
    ? {
        keep: 'Keep',
        type: { place: 'Place', film: 'Film', book: 'Book', thing: 'Thing', podcast: 'Podcast', drink: 'Drink' }
      }
    : {
        keep: '收进清单',
        type: { place: '地点', film: '电影', book: '书', thing: '物件', podcast: '播客', drink: '饮品' }
      };

  function line(zh, en) {
    return { zh: zh, en: en };
  }

  function mention(spec) {
    spec.mention = true;
    return spec;
  }

  var posts = [
    {
      id: 'xiaoman',
      author: line('小满', 'Xiaoman'),
      segments: [
        line('周六去', 'Saturday: a bowl of crab-roe noodles at '),
        mention({
          id: 'hekou',
          type: 'place',
          name: line('河口', 'Hekou'),
          text: line('河口', 'Hekou'),
          quote: line('周六去河口吃了一碗蟹黄面', 'a bowl of crab-roe noodles at Hekou')
        }),
        line('吃了一碗蟹黄面，排队二十分钟值了。回家路上把《', ' — twenty minutes in line, worth it. Finished '),
        mention({
          id: 'fog',
          type: 'film',
          italic: true,
          name: line('雾港', 'Harbour in Fog'),
          text: line('雾港', 'Harbour in Fog'),
          quote: line('回家路上把《雾港》看完', 'Finished Harbour in Fog on the way home')
        }),
        line('》看完，结尾比预告片好。顺手买了把', ' on the way home; the ending beats the trailer. Picked up a '),
        mention({
          id: 'umbrella',
          type: 'thing',
          name: line('竹柄雨伞', 'Bamboo-handle umbrella'),
          text: line('竹柄雨伞', 'bamboo-handle umbrella'),
          quote: line('顺手买了把竹柄雨伞，轻。', 'Picked up a bamboo-handle umbrella too — light.')
        }),
        line('，轻。', ' too — light.')
      ]
    },
    {
      id: 'jie',
      author: line('阿杰', 'Jie'),
      segments: [
        line('备考三周，最有用的是一本《', 'Three weeks of exam prep: the most useful things were a book called '),
        mention({
          id: 'geometry',
          type: 'book',
          italic: true,
          name: line('慢读几何', 'Slow Geometry'),
          text: line('慢读几何', 'Slow Geometry'),
          quote: line('最有用的是一本《慢读几何》', 'a book called Slow Geometry')
        }),
        line('》和', ' and '),
        mention({
          id: 'window-row',
          type: 'place',
          name: line('图书馆四楼靠窗那排座位', "The window row on the library's fourth floor"),
          text: line('图书馆四楼靠窗那排座位', "the window row on the library's fourth floor"),
          quote: line('图书馆四楼靠窗那排座位', "the window row on the library's fourth floor")
        }),
        line('。咖啡只喝', '. Coffee: only '),
        mention({
          id: 'cold-brew',
          type: 'drink',
          name: line('楼下那家的冷萃', 'The cold brew downstairs'),
          text: line('楼下那家的冷萃', 'the cold brew downstairs'),
          quote: line('咖啡只喝楼下那家的冷萃。', 'only the cold brew downstairs.')
        }),
        line('。', '.')
      ]
    },
    {
      id: 'lin',
      author: line('林林', 'Lin'),
      segments: [
        line('第一次自己露营：', 'First solo camping trip: windy '),
        mention({
          id: 'lakeside',
          type: 'place',
          name: line('湖边营地', 'Lakeside campsite'),
          text: line('湖边营地', 'lakeside campsite'),
          quote: line('湖边营地风大', 'windy lakeside campsite')
        }),
        line('风大，带的那盏', ', the '),
        mention({
          id: 'lamp',
          type: 'thing',
          name: line('折叠灯', 'Folding lamp'),
          text: line('折叠灯', 'folding lamp'),
          quote: line('带的那盏折叠灯救了命', 'the folding lamp I packed saved the night')
        }),
        line('救了命。晚上听完了播客《', ' I packed saved the night. Finished episode three of the podcast '),
        mention({
          id: 'night-flight',
          type: 'podcast',
          italic: true,
          name: line('夜航', 'Night Flight'),
          text: line('夜航', 'Night Flight'),
          quote: line('晚上听完了播客《夜航》第三集。', 'Finished episode three of the podcast Night Flight.')
        }),
        line('》第三集。', '.')
      ]
    }
  ];

  var postById = {};
  var recByKey = {};
  posts.forEach(function (post) {
    postById[post.id] = post;
    post.segments.forEach(function (seg) {
      if (!seg.mention) return;
      recByKey[post.id + ':' + seg.id] = { postId: post.id, seg: seg };
    });
  });

  var timers = [];
  var token = 0;
  var currentId = 'xiaoman';
  var keptOrder = [];

  function prefersReduced() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function clearTimers() {
    timers.forEach(function (id) { window.clearTimeout(id); });
    timers = [];
  }

  function typeName(type) {
    return ui.type[type] || type;
  }

  function appendText(parent, seg) {
    var value = seg.text ? seg.text[lang] : seg[lang];
    if (seg.italic && lang === 'en') {
      var em = document.createElement('em');
      em.textContent = value;
      parent.appendChild(em);
      return;
    }
    parent.appendChild(document.createTextNode(value));
  }

  function renderPost(post, marked) {
    postBody.textContent = '';
    var marks = [];
    post.segments.forEach(function (seg) {
      if (!seg.mention) {
        appendText(postBody, seg);
        return;
      }
      if (!marked) {
        appendText(postBody, seg);
        return;
      }
      var mark = document.createElement('mark');
      mark.className = 'mention';
      mark.dataset.rec = seg.id;
      mark.tabIndex = 0;
      mark.setAttribute('aria-label', typeName(seg.type) + (lang === 'en' ? ': ' : '：') + seg.name[lang]);
      appendText(mark, seg);
      postBody.appendChild(mark);
      marks.push(mark);
    });
    byline.textContent = post.author[lang];
    return marks;
  }

  function showPrompt() {
    foundList.textContent = '';
    foundList.hidden = true;
    foundEmpty.hidden = false;
  }

  function syncKeptEmpty() {
    keptEmpty.hidden = keptOrder.length > 0;
  }

  function keptItem(key) {
    var rec = recByKey[key];
    var item = document.createElement('li');
    item.dataset.key = key;
    var type = document.createElement('span');
    type.className = 'kept-type';
    type.textContent = typeName(rec.seg.type);
    var name = document.createElement('span');
    name.className = 'kept-name';
    name.textContent = rec.seg.name[lang];
    item.appendChild(type);
    item.appendChild(document.createTextNode(' · '));
    item.appendChild(name);
    return item;
  }

  function buildCard(post, seg) {
    var key = post.id + ':' + seg.id;
    var card = document.createElement('li');
    card.className = 'cat-slip';
    card.dataset.rec = seg.id;

    var stamp = document.createElement('p');
    stamp.className = 'type-stamp';
    stamp.textContent = typeName(seg.type);

    var name = document.createElement('p');
    name.className = 'slip-name';
    name.textContent = seg.name[lang];

    var quote = document.createElement('blockquote');
    quote.className = 'slip-quote';
    quote.textContent = (lang === 'en' ? '“' : '「') + seg.quote[lang] + (lang === 'en' ? '”' : '」');

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn keep-btn';
    var pressed = keptOrder.indexOf(key) !== -1;
    button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    button.textContent = ui.keep;
    button.setAttribute('aria-label', ui.keep + (lang === 'en' ? ': ' : '：') + seg.name[lang]);
    button.addEventListener('click', function () {
      var index = keptOrder.indexOf(key);
      if (index === -1) {
        keptOrder.push(key);
        button.setAttribute('aria-pressed', 'true');
        keptList.appendChild(keptItem(key));
      } else {
        keptOrder.splice(index, 1);
        button.setAttribute('aria-pressed', 'false');
        var row = keptList.querySelector('[data-key="' + key + '"]');
        if (row) row.remove();
      }
      syncKeptEmpty();
    });

    card.appendChild(stamp);
    card.appendChild(name);
    card.appendChild(quote);
    card.appendChild(button);
    return card;
  }

  function selectPost(id) {
    token += 1;
    clearTimers();
    currentId = id;
    tabs.forEach(function (tab) {
      tab.setAttribute('aria-pressed', tab.getAttribute('data-post') === id ? 'true' : 'false');
    });
    renderPost(postById[id], false);
    showPrompt();
  }

  function runFind() {
    var post = postById[currentId];
    if (!post) return;
    token += 1;
    var run = token;
    clearTimers();
    var marks = renderPost(post, true);
    foundList.textContent = '';
    foundEmpty.hidden = true;
    foundList.hidden = false;
    var mentions = post.segments.filter(function (seg) { return seg.mention; });
    var cards = mentions.map(function (seg) {
      var card = buildCard(post, seg);
      card.hidden = true;
      foundList.appendChild(card);
      return card;
    });

    function reveal(index) {
      if (run !== token) return;
      if (marks[index]) marks[index].classList.add('is-lit');
      if (cards[index]) {
        cards[index].hidden = false;
        cards[index].classList.add('is-in');
      }
    }

    if (prefersReduced()) {
      mentions.forEach(function (_, index) { reveal(index); });
      return;
    }
    mentions.forEach(function (_, index) {
      if (index === 0) {
        reveal(0);
        return;
      }
      timers.push(window.setTimeout(function () { reveal(index); }, index * 350));
    });
  }

  var hoverId = '';
  var focusId = '';

  function applyPair() {
    var id = hoverId || focusId;
    var nodes = root.querySelectorAll('[data-rec]');
    Array.prototype.forEach.call(nodes, function (node) {
      node.classList.toggle('is-paired', !!id && node.getAttribute('data-rec') === id);
    });
  }

  function pairTarget(node) {
    if (!node || !node.closest) return null;
    var el = node.closest('[data-rec]');
    if (!el || !root.contains(el)) return null;
    return el;
  }

  root.addEventListener('pointerover', function (event) {
    var el = pairTarget(event.target);
    hoverId = el ? el.getAttribute('data-rec') : '';
    applyPair();
  });

  root.addEventListener('pointerout', function (event) {
    if (event.relatedTarget && root.contains(event.relatedTarget)) return;
    hoverId = '';
    applyPair();
  });

  root.addEventListener('focusin', function (event) {
    var el = pairTarget(event.target);
    focusId = el ? el.getAttribute('data-rec') : '';
    applyPair();
  });

  root.addEventListener('focusout', function (event) {
    var next = pairTarget(event.relatedTarget);
    focusId = next ? next.getAttribute('data-rec') : '';
    applyPair();
  });

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      selectPost(tab.getAttribute('data-post'));
    });
  });

  findBtn.addEventListener('click', runFind);

  clearBtn.addEventListener('click', function () {
    keptOrder = [];
    keptList.textContent = '';
    syncKeptEmpty();
    nameInput.value = nameInput.defaultValue;
    selectPost('xiaoman');
  });

  selectPost('xiaoman');
  syncKeptEmpty();
})();
