# PP-OCRv5 Android Compatibility Spike

This branch tests how far RouteLO can adopt PP-OCRv5 without destabilizing
`main`.

## Confirmed working

- Expo SDK 56 local native module autolinking
- React Native 0.85 New Architecture build
- Gradle 9.3.1
- Direct `onnxruntime-android:1.25.1` dependency
- Kotlin compilation of the ONNX bridge
- Full Android debug APK assembly
- Four Android ABIs packaged:
  - arm64-v8a
  - armeabi-v7a
  - x86
  - x86_64
- Bundled ONNX model loading API
- Generic float-tensor inference API
- Web-safe fallback module
- Engine-neutral OCR result contract
- Captured image URI passed into the OCR service

The direct Android dependency avoids the Gradle and React Native autolinking
problems reproduced with `onnxruntime-react-native@1.24.3`.

## Bundled models

The spike pins models from the RapidOCR v3.8.0 model registry.

| Asset | SHA-256 |
|---|---|
| `ch_PP-OCRv5_det_mobile.onnx` | `4d97c44a20d30a81aad087d6a396b08f786c4635742afc391f6621f5c6ae78ae` |
| `korean_PP-OCRv5_rec_mobile.onnx` | `cd6e2ea50f6943ca7271eb8c56a877a5a90720b7047fe9c41a2e541a25773c9b` |
| `ppocrv5_korean_dict.txt` | `a88071c68c01707489baa79ebe0405b7beb5cca229f4fc94cc3ef992328802d7` |

A 130-byte ONNX multiplication model from the official ONNX Runtime test data
is included to verify session creation and tensor execution independently from
the OCR preprocessing pipeline.

## Android diagnostic

In a development Android build, open the receipt scanner and tap:

```text
Android ONNX Runtime 진단
```

The diagnostic:

1. creates sessions for the detector and Korean recognizer;
2. reports model input/output metadata;
3. executes the multiplication smoke model;
4. reports native processing time.

The button is development-only and is not rendered on web.

## Not implemented yet

- Image URI decoding into an Android bitmap
- EXIF rotation correction
- Detector resize and normalization
- DB detector thresholding and contour extraction
- Polygon unclip and perspective crop
- Recognition crop batching
- CTC decoding with the Korean dictionary
- Bounding-box mapping to the original image
- Session cache and memory-pressure policy
- Cancellation and timeout behavior
- Physical-device latency and memory benchmark

`recognizeReceiptWithPpOcr()` deliberately throws until those steps are
implemented. The production OCR flow therefore continues to use the existing
demo adapter.

## Build environment

Keep caches and build outputs on the D drive:

```powershell
$env:GRADLE_USER_HOME='D:\zxhu12\dev-cache\gradle'
$env:npm_config_cache='D:\zxhu12\dev-cache\npm'
$env:ANDROID_HOME='C:\Users\zxhu12\AppData\Local\Android\Sdk'
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'

npx expo prebuild --platform android --clean --no-install
cd android
.\gradlew.bat :app:assembleDebug
```

## Next safe milestone

Implement detector preprocessing and run only the detector model against one
of the synthetic receipt fixtures. Return the probability-map shape and timing
before adding contour extraction or recognition. This keeps each native step
measurable and independently reversible.
