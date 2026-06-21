export type OnnxTensorInfo = {
  name: string;
  type: string;
  shape: number[];
};

export type OnnxModelInfo = {
  runtimeVersion: string;
  modelAsset: string;
  inputs: OnnxTensorInfo[];
  outputs: OnnxTensorInfo[];
};

export type OnnxSmokeResult = {
  outputName: string;
  values: number[];
  processingMs: number;
};
