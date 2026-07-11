export const MACHINE_CONFIG = {
  totalSlots: 20,
  rows: ['A', 'B', 'C', 'D'],
  cols: [1, 2, 3, 4, 5],
  maxCapacityPerSlot: 20,
  lowStockThreshold: 3,
  motorRotationTime: 600, // ms for 360 degrees
  dispensingDelay: 1500,  // ms between items
};

export const SLOT_STATUS = {
  OK:    'ok',
  LOW:   'low',
  EMPTY: 'empty',
  OFF:   'off',
};

export const CATEGORIES = [
  'Drinks',
  'Snacks',
  'Food',
  'Stationery',
  'Other',
];

export const OFFER_TYPES = [
  '% Discount',
  'Flat Off (₹)',
  'Buy X Get Y Free',
];
