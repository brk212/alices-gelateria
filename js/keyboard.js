var Keyboard = (function () {
  var KEY_FINGER = {
    'q':'pinky','a':'pinky','z':'pinky',
    'w':'ring', 's':'ring', 'x':'ring',
    'e':'middle','d':'middle','c':'middle',
    'r':'index','f':'index','v':'index',
    't':'index','g':'index','b':'index',
    'y':'index','h':'index','n':'index',
    'u':'index','j':'index','m':'index',
    'i':'middle','k':'middle',',':'middle',
    'o':'ring',  'l':'ring', '.':'ring',
    'p':'pinky', ';':'pinky','/':'pinky'
  };

  var PHASE_KEYS = {
    1: ['a','s','d','f','j','k','l',';'],
    2: ['a','s','d','f','g','h','j','k','l',';'],
    3: ['a','s','d','e','f','g','h','i','j','k','l',';'],
    4: ['a','s','d','e','f','g','h','i','j','k','l','r','u',';'],
    5: ['a','s','d','e','f','g','h','i','j','k','l','r','t','u','y',';'],
    6: ['a','d','e','f','g','h','i','j','k','l','o','p','q','r','s','t','u','w','y',';'],
    7: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',';',',','.'],
    8: ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',';',',','.','/']
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

    var unlocked = PHASE_KEYS[currentPhase] || PHASE_KEYS[1];

    var html = '<div class="counter">'
      + '<div class="counter-head">'
      + '<div class="counter-title">Il banco · keyboard</div>'
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
        var fingerLabel = finger ? finger + ' finger' : '';
        hintEl.innerHTML = 'next: <span class="key-inline">' + key.toUpperCase() + '</span>'
          + (fingerLabel ? ' <span style="opacity:0.7">' + fingerLabel + '</span>' : '');
      }
    }
  }

  function getFingerForKey(key) {
    if (!key) return null;
    return KEY_FINGER[key.toLowerCase()] || null;
  }

  return { render, highlightKey, getFingerForKey, PHASE_KEYS };
})();
