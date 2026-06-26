import {
  DEMO_RECEIPT_TEXT,
  OcrRecognizerUnavailableError,
  parseReceiptText,
  runReceiptOcr,
} from '../ocr';

const quality = {
  score: 90,
  blur: 90,
  brightness: 90,
  documentCoverage: 90,
  skew: 90,
  shadow: 90,
  passed: true,
  messages: [],
};

describe('OCR zero-fabrication guard', () => {
  it('rejects a real capture when no recognizer text exists', async () => {
    const recognizer = jest.fn().mockRejectedValue(
      new Error('Native recognizer unavailable'),
    );

    await expect(
      runReceiptOcr({
        uri: 'file:///captured-receipt.jpg',
        width: 1440,
        height: 1920,
      }, undefined, recognizer),
    ).rejects.toBeInstanceOf(OcrRecognizerUnavailableError);
  });

  it('keeps the explicit demo fixture available only when supplied', () => {
    const result = parseReceiptText(DEMO_RECEIPT_TEXT, quality);

    expect(result.rawText).toContain('FL-20260621-1842');
    expect(result.fields.length).toBeGreaterThan(0);
  });

  it('parses actual PP-OCR text returned for a captured image', async () => {
    const recognizer = jest.fn().mockResolvedValue({
      fullText: DEMO_RECEIPT_TEXT,
      lines: [{ text: '주문번호 FL-20260621-1842' }],
      processingMs: 321,
    });

    const result = await runReceiptOcr({
      uri: 'file:///captured-receipt.jpg',
      width: 1440,
      height: 1920,
    }, undefined, recognizer);

    expect(recognizer).toHaveBeenCalledWith(
      'file:///captured-receipt.jpg',
    );
    expect(result.engine).toBe('ppocrv5');
    expect(result.processingMs).toBe(321);
    expect(result.rawText).toContain('FL-20260621-1842');
    expect(result.recognizedLines?.[0].text).toContain('주문번호');
  });

  it('uses PP-OCR geometry to associate labels with values', async () => {
    const recognizer = jest.fn().mockResolvedValue({
      fullText: '김민준\n받는 분\n010-4821-7732\n수령인 전화',
      lines: [
        { text: '김민준', boundingBox: { x: 180, y: 10, width: 80, height: 20 } },
        { text: '받는 분', boundingBox: { x: 10, y: 12, width: 90, height: 20 } },
        { text: '010-4821-7732', boundingBox: { x: 180, y: 50, width: 130, height: 20 } },
        { text: '수령인 전화', boundingBox: { x: 10, y: 48, width: 100, height: 20 } },
      ],
      processingMs: 120,
    });

    const result = await runReceiptOcr(
      { uri: 'file:///layout-receipt.jpg', width: 1200, height: 1600 },
      undefined,
      recognizer,
    );

    expect(result.rawText).toContain('받는 분 김민준');
    expect(
      result.fields.find(({ key }) => key === 'recipientName')?.value,
    ).toBe('김민준');
    expect(
      result.fields.find(({ key }) => key === 'recipientTel')?.value,
    ).toBe('010-4821-7732');
  });
});
