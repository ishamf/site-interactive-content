export interface WorkerMessage {
  type: 'renderAlpha';
  id: number;
  width: number;
  height: number;
  time: number;
}

export interface WorkerResponse {
  id: number;
  imageData: ImageData;
}
