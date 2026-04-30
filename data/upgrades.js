var UPGRADE_CATALOG = [
  { id: 'sign_pink',    name: 'Pink Sign',       cost: 50,  type: 'decor',   description: 'A cheerful pink shop sign.' },
  { id: 'sign_rainbow', name: 'Rainbow Sign',    cost: 120, type: 'decor',   description: 'Every color of the rainbow!' },
  { id: 'counter_marble', name: 'Marble Counter', cost: 80, type: 'decor',  description: 'A fancy marble countertop.' },
  { id: 'flavor_choc',  name: 'Chocolate',       cost: 40,  type: 'flavor',  description: 'Unlock chocolate ice cream.' },
  { id: 'flavor_mint',  name: 'Mint Chip',       cost: 60,  type: 'flavor',  description: 'Cool and refreshing!' },
  { id: 'flavor_straw', name: 'Strawberry',      cost: 40,  type: 'flavor',  description: 'Classic summer flavor.' },
  { id: 'flavor_lemon', name: 'Lemon Sorbet',    cost: 70,  type: 'flavor',  description: 'Tangy and sweet.' },
  { id: 'flavor_caramel', name: 'Salted Caramel', cost: 90, type: 'flavor', description: 'Rich and buttery.' },
  { id: 'customer_cat', name: 'Cat Customer',    cost: 100, type: 'customer', description: 'A very particular cat shows up sometimes.' },
  { id: 'customer_dog', name: 'Dog Customer',    cost: 100, type: 'customer', description: 'Loves any flavor with "bone" in the name.' },
  { id: 'wallpaper_stars', name: 'Star Wallpaper', cost: 75, type: 'decor', description: 'Sparkly star wallpaper for the shop.' },
  { id: 'wallpaper_ice',  name: 'Ice Crystal Walls', cost: 150, type: 'decor', description: 'Frosty crystal-blue walls.' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UPGRADE_CATALOG };
}
