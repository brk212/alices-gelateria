var Shop = (function () {

  function render(state) {
    var coinsEl = document.getElementById('upgrades-coins');
    if (coinsEl) coinsEl.textContent = '🪙 ' + state.coins;

    var list = document.getElementById('upgrades-list');
    if (!list) return;

    var html = '';
    UPGRADE_CATALOG.forEach(function (upgrade) {
      var owned = state.unlocks.indexOf(upgrade.id) !== -1;
      var canAfford = state.coins >= upgrade.cost;
      var cardCls = 'up-card' + (owned ? ' owned' : '') + (!canAfford && !owned ? ' locked' : '');

      html += '<div class="' + cardCls + '">'
        + '<div class="up-art-frame">' + _iconFor(upgrade.type) + '</div>'
        + '<div class="up-name">' + upgrade.name + '</div>'
        + '<div class="up-type">' + upgrade.type + '</div>'
        + '<div class="up-desc">' + upgrade.description + '</div>'
        + '<div class="up-buy">'
        + '<div class="up-price">🪙 ' + upgrade.cost + '</div>';

      if (owned) {
        html += '<button class="up-buy-btn owned-tag" disabled>✓ Owned</button>';
      } else {
        html += '<button class="up-buy-btn' + (!canAfford ? '" disabled' : '"') + ' data-id="' + upgrade.id + '">Compra!</button>';
      }

      html += '</div></div>';
    });

    list.innerHTML = html;

    list.querySelectorAll('button[data-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        purchase(btn.getAttribute('data-id'));
      });
    });
  }

  function purchase(upgradeId) {
    var state = State.loadState();
    var upgrade = UPGRADE_CATALOG.find(function (u) { return u.id === upgradeId; });
    if (!upgrade) return;
    if (state.unlocks.indexOf(upgradeId) !== -1) return;
    if (state.coins < upgrade.cost) return;

    State.updateState({
      coins: state.coins - upgrade.cost,
      unlocks: state.unlocks.concat([upgradeId])
    });
    render(State.loadState());
  }

  function _iconFor(type) {
    var icons = { flavor: '🍦', decor: '🎨', customer: '🧑' };
    return icons[type] || '⭐';
  }

  return { render, purchase };
})();
