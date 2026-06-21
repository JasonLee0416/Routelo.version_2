import { Platform } from 'react-native';
import RouteloOnnxModule from '../../modules/my-module/src/RouteloOnnxModule';
import {
  OnnxModelInfo,
  OnnxSmokeResult,
} from '../../modules/my-module/src/RouteloOnnx.types';

export type RecognizedLine = {
  text: string;
  confidence?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cornerPoints?: Array<{ x: number; y: number }>;
};

export type RecognizerResult = {
  engine: 'demo' | 'mlkit' | 'ppocrv5';
  fullText: string;
  lines: RecognizedLine[];
  processingMs: number;
};

export type PpOcrRuntimeProbe = {
  available: boolean;
  model?: OnnxModelInfo;
  detector?: OnnxModelInfo;
  recognizer?: OnnxModelInfo;
  smoke?: OnnxSmokeResult;
  error?: string;
};

const SMOKE_MODEL_ASSET = 'models/mul_1.onnx';
const DETECTOR_MODEL_ASSET = 'models/ch_PP-OCRv5_det_mobile.onnx';
const KOREAN_RECOGNIZER_MODEL_ASSET = 'models/korean_PP-OCRv5_rec_mobile.onnx';

export function isNativeOnnxAvailable() {
  return Platform.OS === 'android' && RouteloOnnxModule.isAvailable();
}

export async function probePpOcrRuntime(): Promise<PpOcrRuntimeProbe> {
  if (!isNativeOnnxAvailable()) {
    return {
      available: false,
      error: 'ONNX Runtime requires the Android development build.',
    };
  }

  try {
    const [model, detector, recognizer] = await Promise.all([
      RouteloOnnxModule.inspectBundledModel(SMOKE_MODEL_ASSET),
      RouteloOnnxModule.inspectBundledModel(DETECTOR_MODEL_ASSET),
      RouteloOnnxModule.inspectBundledModel(KOREAN_RECOGNIZER_MODEL_ASSET),
    ]);
    const smoke = await RouteloOnnxModule.runFloatModel(
      SMOKE_MODEL_ASSET,
      'X',
      [1, 1, 1, 1, 1, 1],
      [3, 2],
    );
    return { available: true, model, detector, recognizer, smoke };
  } catch (error) {
    return {
      available: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function recognizeReceiptWithPpOcr(
  _imageUri: string,
): Promise<RecognizerResult> {
  throw new Error(
    'PP-OCR model preprocessing and decoding are not enabled in this compatibility spike.',
  );
}
