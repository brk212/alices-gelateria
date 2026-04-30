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
      html += '<div class="upgrade-card' + (owned ? ' owned' : '') + '">'
        + '<div style="font-size:1.8em;margin-bottom:8px">' + _iconFor(upgrade.type) + '</div>'
        + '<h3>' + upgrade.name + '</h3>'
        + '<p>' + upgrade.description + '</p>'
        + '<div class="upgrade-cost">🪙 ' + upgrade.cost + '</div>';
      if (owned) {
        html += '<div style="color:#43a047;font-weight:700">✓ Owned</div>';
      } else {
        html += '<button class="btn-primary" data-id="' + upgrade.id + '" '
          + (canAfford ? '' : 'disabled style="opacity:0.5"') + '>Buy</button>';
      }
      html += '</div>';
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
