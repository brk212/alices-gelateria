var Shop = (function () {

  var activeTab = 'all';

  var TYPE_LABELS = {
    flavor: '★ flavor unlock',
    decor: '⌂ shop upgrade',
    customer: '♥ new customer'
  };

  var ART_BG = {
    flavor: 'linear-gradient(135deg, #fff0d4 0%, #ffcce0 100%)',
    decor: 'linear-gradient(135deg, #d4f0e8 0%, #9be0c8 100%)',
    customer: 'linear-gradient(135deg, #e8d4f0 0%, #c8a8e0 100%)'
  };

  var TABS = [
    { id: 'all',      label: 'All' },
    { id: 'flavor',   label: 'Flavors' },
    { id: 'decor',    label: 'Shop Decor' },
    { id: 'customer', label: 'Customers' }
  ];

  function render(state) {
    var coinsEl = document.getElementById('upgrades-coins');
    if (coinsEl) coinsEl.textContent = '🪙 ' + state.coins;

    var list = document.getElementById('upgrades-list');
    if (!list) return;

    var html = '<div class="up-tabs">';
    TABS.forEach(function (tab) {
      var count = UPGRADE_CATALOG.filter(function (u) {
        return (tab.id === 'all' || u.type === tab.id) && state.unlocks.indexOf(u.id) === -1;
      }).length;
      html += '<button class="up-tab' + (activeTab === tab.id ? ' active' : '') + '" data-tab="' + tab.id + '">'
        + tab.label + ' <span class="count">' + count + '</span></button>';
    });
    html += '</div>';

    var items = UPGRADE_CATALOG.filter(function (u) {
      return activeTab === 'all' || u.type === activeTab;
    });

    html += '<div class="up-grid">';
    items.forEach(function (upgrade) {
      var owned = state.unlocks.indexOf(upgrade.id) !== -1;
      var canAfford = state.coins >= upgrade.cost;
      var cardCls = 'up-card' + (owned ? ' owned' : '') + (!canAfford && !owned ? ' locked' : '');
      var artBg = ART_BG[upgrade.type] || 'var(--pink-soft)';

      html += '<div class="' + cardCls + '">'
        + '<div class="up-art-frame" style="background:' + artBg + '">' + _iconFor(upgrade.type) + '</div>'
        + '<div class="up-tag">' + (TYPE_LABELS[upgrade.type] || upgrade.type) + '</div>'
        + '<div class="up-name">' + upgrade.name + '</div>'
        + '<div class="up-desc">' + upgrade.description + '</div>'
        + '<div class="up-buy">'
        + '<div class="up-price">🪙 ' + upgrade.cost + '</div>';

      if (owned) {
        html += '<button class="up-buy-btn owned-tag" disabled>Installed ✓</button>';
      } else {
        html += '<button class="up-buy-btn' + (!canAfford ? '" disabled' : '"') + ' data-id="' + upgrade.id + '">Buy →</button>';
      }

      html += '</div></div>';
    });
    html += '</div>';

    list.innerHTML = html;

    list.querySelectorAll('button[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        render(state);
      });
    });

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
