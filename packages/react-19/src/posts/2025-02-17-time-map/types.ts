import type { DateTime } from 'luxon';

export interface SunAndEarthState {
  rightAscension: number;
  declination: number;
  gmstHours: number;
}

export interface TimeState {
  time: DateTime;
  useAnimation: boolean;
  isRapidlyChanging: boolean;
}
