import { LabelPosition } from './store';

export const DAY_LENGTH = 24 * 3600 * 1000;

export const EPOCH_START_DAY = 4; // Thursday

export const canvasWidth = 3600;
export const canvasHeight = 1800;

export const dayColors: Record<number, string> = {
  // 0 - sunday
  0: 'oklch(94% 0.1707 113.29)',
  1: 'oklch(58.67% 0.1707 260.47)',
  2: 'oklch(46.67% 0.1707 353.65)',
  3: 'oklch(61.33% 0.1707 142.94)',
  4: 'oklch(62.67% 0.1707 321.88)',
  5: 'oklch(68.67% 0.1707 45.53)',
  6: 'oklch(88% 0.1707 165.18)',
};
dayColors[7] = dayColors[0];

export const dayLightTextColors: Record<number, string> = {
  // 0 - sunday
  0: 'oklch(60.53% 0.1175 113.29)',
  1: 'oklch(60.53% 0.1175 260.47)',
  2: 'oklch(60.53% 0.1175 353.65)',
  3: 'oklch(60.53% 0.1175 142.94)',
  4: 'oklch(60.53% 0.1175 321.88)',
  5: 'oklch(60.53% 0.1175 45.53)',
  6: 'oklch(60.53% 0.1175 165.18)',
};
dayLightTextColors[7] = dayLightTextColors[0];

export const dayDarkTextColors: Record<number, string> = {
  // 0 - sunday
  0: 'oklch(82.05% 0.0829 113.29)',
  1: 'oklch(82.05% 0.0829 260.47)',
  2: 'oklch(82.05% 0.0829 353.65)',
  3: 'oklch(82.05% 0.0829 142.94)',
  4: 'oklch(82.05% 0.0829 321.88)',
  5: 'oklch(82.05% 0.0829 45.53)',
  6: 'oklch(82.05% 0.0829 165.18)',
};
dayDarkTextColors[7] = dayDarkTextColors[0];

export const dayBorderColors = dayLightTextColors;

export const renderBehaviors = ['instant', 'animated', 'deferred'] as const;

interface PossibleOffsets {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export const offsetsByPosition: Record<LabelPosition, PossibleOffsets> = {
  topleft: {
    bottom: 2,
    right: 8,
  },
  topright: {
    bottom: 2,
    left: 8,
  },
  bottomleft: {
    top: 2,
    right: 8,
  },
  bottomright: {
    top: 2,
    left: 8,
  },
  left: {
    right: 8,
  },
  top: {
    bottom: 4,
  },
  right: {
    left: 8,
  },
  bottom: {
    top: 4,
  },
};
