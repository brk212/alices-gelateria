var UPGRADE_CATALOG = [
  // Flavors
  { id: 'flavor-fragola',       name: 'Fragola',              cost: 80,  type: 'flavor',   description: 'Fresh strawberry, bright and summery.' },
  { id: 'flavor-limone',        name: 'Limone Sfusato',       cost: 90,  type: 'flavor',   description: 'Tart Amalfi lemon sorbet, no cream.' },
  { id: 'flavor-caramello',     name: 'Caramello Salato',     cost: 120, type: 'flavor',   description: 'Sea-salt caramel — sweet and salty perfection.' },
  { id: 'flavor-stracciatella', name: 'Stracciatella',        cost: 140, type: 'flavor',   description: 'Creamy fior di latte with dark chocolate shards.' },
  { id: 'flavor-pistacchio',    name: 'Pistacchio di Bronte', cost: 180, type: 'flavor',   description: 'Rich Sicilian pistachio, slightly sweet.' },
  // Decor
  { id: 'decor-bell',           name: "Campanella d'Ottone",  cost: 90,  type: 'decor',    description: 'A brass door bell — ding!' },
  { id: 'decor-sign',           name: 'Insegna Rosa',         cost: 110, type: 'decor',    description: 'Pastel pink hand-painted shop sign.' },
  { id: 'decor-counter',        name: 'Carrara Counter',      cost: 180, type: 'decor',    description: 'Marble counter — cool white with grey veins.' },
  { id: 'decor-wallpaper',      name: 'Notte Stellata',       cost: 200, type: 'decor',    description: 'Deep blue starry-night wall tiles.' },
  // Customers
  { id: 'cust-cat',             name: 'Macchia the Cat',      cost: 110, type: 'customer', description: 'A tuxedo cat who always orders two scoops.' },
  { id: 'cust-nonna',           name: 'Nonna Concetta',       cost: 130, type: 'customer', description: 'Local legend, has opinions about gelato.' },
  { id: 'cust-dog',             name: 'Bruno il Cane',        cost: 160, type: 'customer', description: 'A golden retriever, always cheerful.' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UPGRADE_CATALOG };
}
