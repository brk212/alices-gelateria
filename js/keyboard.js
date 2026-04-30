var Keyboard = (function () {
  var KEY_FINGER = {
    'q':'l-pinky','a':'l-pinky','z':'l-pinky',
    'w':'l-ring', 's':'l-ring', 'x':'l-ring',
    'e':'l-middle','d':'l-middle','c':'l-middle',
    'r':'l-index','f':'l-index','v':'l-index',
    't':'l-index','g':'l-index','b':'l-index',
    'y':'r-index','h':'r-index','n':'r-index',
    'u':'r-index','j':'r-index','m':'r-index',
    'i':'r-middle','k':'r-middle',',':'r-middle',
    'o':'r-ring',  'l':'r-ring', '.':'r-ring',
    'p':'r-pinky', ';':'r-pinky','/':'r-pinky'
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
    ['z','x','c','v','b','n','m',',','.']
  ];

  var currentPhase = 1;
  var hintVisible = true;

  function render(phase, showHint) {
    currentPhase = phase || 1;
    hintVisible = (showHint !== false);
    var container = document.getElementById('keyboard-hint');
    if (!container) return;

    var unlocked = PHASE_KEYS[currentPhase] || PHASE_KEYS[1];

    var html = '<div class="kb-hint-header">'
      + '<span>Finger guide</span>'
      + '<span class="kb-hint-toggle" id="kb-toggle">' + (hintVisible ? 'Hide ✕' : 'Show') + '</span>'
      + '</div>';

    if (hintVisible) {
      html += '<div class="kb-rows">';
      ROWS.forEach(function (row) {
        html += '<div class="kb-row">';
        row.forEach(function (key) {
          var finger = KEY_FINGER[key] || 'r-pinky';
          var locked = unlocked.indexOf(key) === -1 ? ' locked' : '';
          html += '<div class="kb-key' + locked + '" data-finger="' + finger + '" data-key="' + key + '">'
            + key.toUpperCase() + '</div>';
        });
        html += '</div>';
      });
      html += '</div>';
    }

    container.innerHTML = html;

    var toggle = document.getElementById('kb-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        hintVisible = !hintVisible;
        render(currentPhase, hintVisible);
      });
    }
  }

  function highlightKey(key) {
    var prev = document.querySelectorAll('.kb-key.highlight');
    prev.forEach(function (el) { el.classList.remove('highlight'); });

    if (!key) return;
    var el = document.querySelector('.kb-key[data-key="' + key.toLowerCase() + '"]');
    if (el && !el.classList.contains('locked')) {
      el.classList.add('highlight');
    }
  }

  function getFingerForKey(key) {
    return KEY_FINGER[key.toLowerCase()] || null;
  }

  return { render, highlightKey, getFingerForKey, PHASE_KEYS };
})();
