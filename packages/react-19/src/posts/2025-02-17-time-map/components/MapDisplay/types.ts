export interface RenderArgs {
  time: number;
  partIndex: number;
  parts: number;
  alphaSize: number;
}

export interface WorkerMessage {
  type: 'render';
  id: number;
  renderArgs: RenderArgs;
}

export interface WorkerResponse {
  id: number;
  imageData: ImageData;
}
