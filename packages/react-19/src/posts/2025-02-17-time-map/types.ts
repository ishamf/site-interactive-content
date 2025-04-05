import type { DateTime } from 'luxon';
import type { renderBehaviors } from './constants';

export interface SunAndEarthState {
  rightAscension: number;
  declination: number;
  gmstHours: number;
}

export type RenderBehavior = (typeof renderBehaviors)[number];

export interface TimeState {
  time: DateTime;
  renderBehavior: RenderBehavior;
  isRapidlyChanging: boolean;
}
