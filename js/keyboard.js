var Keyboard = (function () {
  var KEY_FINGER = {
    'q':'pinky','a':'pinky','z':'pinky',
    'w':'ring', 's':'ring', 'x':'ring',
    'e':'middle','d':'middle','c':'middle',
    'r':'index-l','f':'index-l','v':'index-l',
    't':'index-l','g':'index-l','b':'index-l',
    'y':'index-r','h':'index-r','n':'index-r',
    'u':'index-r','j':'index-r','m':'index-r',
    'i':'middle','k':'middle',',':'middle',
    'o':'ring',  'l':'ring', '.':'ring',
    'p':'pinky', ';':'pinky','/':'pinky'
  };

  var FINGER_DISPLAY = {
    'pinky':   'pinky',
    'ring':    'ring',
    'middle':  'middle',
    'index-l': 'left index',
    'index-r': 'right index'
  };

  var PHASE_KEYS = {
    1: ['a','s','d','f','j','k','l',';'],
    2: ['a','s','d','f','g','h','j','k','l',';'],
    3: ['a','s','d','e','f','g','h','i','j','k','l',';'],
    4: ['a','s','d','e','f','g','h','i','j','k','l','r','u',';'],
    5: ['a','s','d','e','f','g','h','i','j','k','l','r','t','u','y',';'],
    6: ['a','d','e','f','g','h','i','j','k','l','o','p','q','r','s','t','u','w','y',';'],
    7: ['a','d','e','f','g','h','i','j','k','l','m','o','p','q','r','s','t','u','v','w','y',';'],
    8: ['a','b','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','y',';'],
    9: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',';',',','.'],
    10: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',';',',','.','/']
  };

  var ROWS = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l',';'],
    ['z','x','c','v','b','n','m',',','.','/']
  ];

  var ROW_CLASSES = ['r1', 'r2', 'r3'];

  var currentPhase = 1;

  function render(phase) {
    currentPhase = phase || 1;
    var container = document.getElementById('keyboard-hint');
    if (!container) return;

    var unlocked = currentPhase === 'full'
      ? ROWS.reduce(function(a, r) { return a.concat(r); }, [])
      : (PHASE_KEYS[currentPhase] || PHASE_KEYS[1]);

    var html = '<div class="counter">'
      + '<div class="counter-head">'
      + '<div class="counter-title">Keyboard</div>'
      + '<div class="counter-hint" id="kb-next-hint"></div>'
      + '</div>'
      + '<div class="kb">';

    ROWS.forEach(function (row, ri) {
      html += '<div class="kb-row ' + ROW_CLASSES[ri] + '">';
      row.forEach(function (key) {
        var finger = KEY_FINGER[key];
        var locked = unlocked.indexOf(key) === -1;
        var cls = 'key';
        if (locked) {
          cls += ' locked';
        } else if (finger) {
          cls += ' f-' + finger;
        }
        html += '<div class="' + cls + '" data-key="' + key + '">' + key.toUpperCase() + '</div>';
      });
      html += '</div>';
    });

    html += '</div></div>';
    container.innerHTML = html;
  }

  function highlightKey(key) {
    var prev = document.querySelectorAll('.key.next');
    prev.forEach(function (el) { el.classList.remove('next'); });

    var hintEl = document.getElementById('kb-next-hint');
    if (!key) {
      if (hintEl) hintEl.innerHTML = '';
      return;
    }

    var el = document.querySelector('.key[data-key="' + key.toLowerCase() + '"]');
    if (el && !el.classList.contains('locked')) {
      el.classList.add('next');
      if (hintEl) {
        var finger = KEY_FINGER[key.toLowerCase()] || '';
        var fingerLabel = finger ? (FINGER_DISPLAY[finger] || finger) + ' finger' : '';
        hintEl.innerHTML = 'next: <span class="key-inline">' + key.toUpperCase() + '</span>'
          + (fingerLabel ? ' <span style="opacity:0.7">' + fingerLabel + '</span>' : '');
      }
    }
  }

  function getFingerForKey(key) {
    if (!key) return null;
    return KEY_FINGER[key.toLowerCase()] || null;
  }

  function renderToggle() {
    var head = document.querySelector('#keyboard-hint .counter-head');
    if (!head || head.querySelector('.kb-toggle')) return;

    var btn = document.createElement('button');
    btn.className = 'kb-toggle';
    btn.textContent = '▼';
    btn.title = 'Toggle keyboard guide';

    btn.addEventListener('click', function() {
      var kb = document.querySelector('#keyboard-hint .kb');
      var hint = document.getElementById('kb-next-hint');
      var isVisible = kb && kb.style.display !== 'none';
      if (kb) kb.style.display = isVisible ? 'none' : '';
      if (hint) hint.style.display = isVisible ? 'none' : '';
      btn.textContent = isVisible ? '▶' : '▼';
    });

    head.appendChild(btn);
  }

  return { render, highlightKey, getFingerForKey, renderToggle, PHASE_KEYS };
})();
