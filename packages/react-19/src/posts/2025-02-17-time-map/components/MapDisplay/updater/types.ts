import { SunAndEarthState } from '../../../types';

export interface WorkerMessage {
  type: 'renderAlpha';
  id: number;
  width: number;
  height: number;
  state: SunAndEarthState;
}

export interface WorkerResponse {
  id: number;
  imageData: ImageData;
}
