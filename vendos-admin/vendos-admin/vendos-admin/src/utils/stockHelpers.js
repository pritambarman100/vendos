import { MACHINE_CONFIG, SLOT_STATUS } from '../constants/machineConfig';

export const getSlotStatus = (stock, max = MACHINE_CONFIG.maxCapacityPerSlot) => {
  if (stock === 0)                                    return SLOT_STATUS.EMPTY;
  if (stock <= MACHINE_CONFIG.lowStockThreshold)      return SLOT_STATUS.LOW;
  return SLOT_STATUS.OK;
};

export const getStockPercent = (stock, max = MACHINE_CONFIG.maxCapacityPerSlot) =>
  Math.round((stock / max) * 100);

export const getStatusColor = (status) => {
  switch (status) {
    case SLOT_STATUS.OK:    return 'var(--success)';
    case SLOT_STATUS.LOW:   return 'var(--warn)';
    case SLOT_STATUS.EMPTY: return 'var(--danger)';
    default:                return 'var(--text-dim)';
  }
};

export const generateSlotId = (row, col) => `${row}${col}`;

export const generateAllSlotIds = () => {
  const ids = [];
  for (const row of MACHINE_CONFIG.rows)
    for (const col of MACHINE_CONFIG.cols)
      ids.push(generateSlotId(row, col));
  return ids;
};
