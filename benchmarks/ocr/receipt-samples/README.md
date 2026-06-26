# RouteLO OCR receipt sample benchmark

This benchmark dataset is intentionally kept outside `routelo/app` and
`routelo/assets` so it is not bundled into the mobile application.

It contains photographed receipt samples and model-readable golden text files
for OCR pipeline development. The current golden text is `raw_golden_answer_text`:
human-readable line-level text that should be recognized from each image.

Some source images are rotated, skewed, folded, or partially occluded. When a
glyph is not reliably readable from the image, the golden text uses `[불명]`.
Benchmark code should treat those spans as human-review placeholders rather
than exact OCR targets.

## Layout

```text
benchmarks/ocr/receipt-samples/
  images/
    KakaoTalk_20260621_070828835.jpg
    ...
  golden/raw_golden_answer_text/
    KakaoTalk_20260621_070828835.txt
    ...
  manifest.json
  scripts/validate-dataset.mjs
```

## Validate

```bash
cd benchmarks/ocr/receipt-samples
node scripts/validate-dataset.mjs
```

The validator checks that every manifest image exists, has a matching raw
golden text file, and records the expected SHA-256 for reproducibility.

