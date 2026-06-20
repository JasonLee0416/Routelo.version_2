import { CaptureQuality, OcrFieldKey, OcrFieldResult, OcrPipelineResult } from '../models';

type ImageAssetInfo = {
  width?: number;
  height?: number;
  fileSize?: number;
};

const LABELS: Record<OcrFieldKey, string> = {
  deliveryDate: '배송 날짜',
  strictTime: '배달 엄수 시간',
  eventTime: '예식 시간',
  venueName: '상호명 / 예식장명',
  deliveryAddress: '배송 주소',
  recipientName: '수령자 / 담당자',
  recipientTel: '연락처',
  orderNumber: '주문번호',
  memo: '특이사항 / 메모',
};

const REQUIRED = new Set<OcrFieldKey>([
  'deliveryDate',
  'strictTime',
  'venueName',
  'deliveryAddress',
  'recipientTel',
]);

export const DEMO_RECEIPT_TEXT = `
배송 인수증
주문번호 FL-20260621-1842
배송일자 2026.06.21
업체명 더채플앳청담
배송주소 서울 강남구 선릉로 757 더채플앳청담 3층
받는 분 김민준 실장
연락처 010-4821-7732
배달 엄수 10:30까지
예식 시간 오전 11시
상품 축하 3단 화환 2개
요청사항 예식 시작 30분 전 설치 완료, 설치 후 사진 전송
`;

const normalizeTime = (value: string) => {
  const compact = value.replace(/\s/g, '');
  const colon = compact.match(/(\d{1,2}):(\d{2})/);
  if (colon) return `${colon[1].padStart(2, '0')}:${colon[2]}`;
  const korean = compact.match(/(오전|오후)?(\d{1,2})시(?:(\d{1,2})분)?/);
  if (!korean) return value;
  let hour = Number(korean[2]);
  if (korean[1] === '오후' && hour < 12) hour += 12;
  if (korean[1] === '오전' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(Number(korean[3] || 0)).padStart(2, '0')}`;
};

const normalizePhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('010') && digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.startsWith('02') && (digits.length === 9 || digits.length === 10)) {
    return `${digits.slice(0, 2)}-${digits.slice(2, -4)}-${digits.slice(-4)}`;
  }
  if (digits.length === 10 || digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, -4)}-${digits.slice(-4)}`;
  }
  return value;
};

const lineNear = (lines: string[], keywords: string[]) =>
  lines.find((line) => keywords.some((keyword) => line.includes(keyword))) || '';

const candidates = (text: string, pattern: RegExp) =>
  [...text.matchAll(pattern)].map((match) => match[0]);

function field(
  key: OcrFieldKey,
  value: string,
  confidence: number,
  sourceText: string,
  alternatives: string[] = [],
): OcrFieldResult {
  const required = REQUIRED.has(key);
  const status = !value
    ? 'missing'
    : confidence >= 85
      ? 'confirmed'
      : confidence >= 60
        ? 'review'
        : 'warning';
  return {
    key,
    label: LABELS[key],
    value,
    confidence: value ? confidence : 0,
    required,
    sourceText,
    alternatives,
    status,
  };
}

export function inspectCaptureQuality(asset: ImageAssetInfo): CaptureQuality {
  const width = asset.width || 1200;
  const height = asset.height || 1600;
  const pixels = width * height;
  const coverage = Math.min(98, Math.max(52, (Math.min(width, height) / Math.max(width, height)) * 145));
  const resolutionScore = Math.min(100, pixels / 18000);
  const blur = Math.round(Math.min(96, 62 + resolutionScore * 0.34));
  const brightness = 82;
  const skew = 93;
  const shadow = 87;
  const score = Math.round((blur + brightness + coverage + skew + shadow) / 5);
  const messages: string[] = [];
  if (blur < 65) messages.push('사진이 흔들렸습니다. 다시 촬영해주세요.');
  if (brightness < 60) messages.push('인수증이 너무 어둡습니다. 밝은 곳에서 촬영해주세요.');
  if (coverage < 60) messages.push('인수증 전체가 화면에 들어오도록 맞춰주세요.');
  if (pixels < 900000) messages.push('글자가 너무 작습니다. 조금 더 가까이 촬영해주세요.');
  return {
    score,
    blur,
    brightness,
    documentCoverage: Math.round(coverage),
    skew,
    shadow,
    passed: score >= 65 && messages.length === 0,
    messages,
  };
}

export function parseReceiptText(rawText: string, quality: CaptureQuality): OcrPipelineResult {
  const started = Date.now();
  const text = rawText.replace(/[ \t]+/g, ' ').trim();
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  const timeMatches = candidates(
    text,
    /(?:오전|오후)?\s*\d{1,2}(?::\d{2}|시(?:\s*\d{1,2}분)?)(?:까지)?/g,
  );
  const strictLine = lineNear(lines, ['배달 엄수', '배송 시간', '도착 시간', '납품 시간', '마감', '까지']);
  const eventLine = lineNear(lines, ['예식 시간', '예식', '본식', '웨딩', '행사 시간']);
  const strictMatch = strictLine.match(/(?:오전|오후)?\s*\d{1,2}(?::\d{2}|시(?:\s*\d{1,2}분)?)/);
  const eventMatch = eventLine.match(/(?:오전|오후)?\s*\d{1,2}(?::\d{2}|시(?:\s*\d{1,2}분)?)/);

  const dateLine = lineNear(lines, ['배송일', '배달일', '납품일', '예식일']);
  const dateMatch =
    dateLine.match(/20\d{2}[.\-/]\d{1,2}[.\-/]\d{1,2}/) ||
    text.match(/20\d{2}[.\-/]\d{1,2}[.\-/]\d{1,2}/);
  const normalizedDate = dateMatch?.[0].replace(/[./]/g, '-') || '';

  const phoneMatches = candidates(text, /(?:01[016789][-\s]?\d{3,4}[-\s]?\d{4}|0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4})/g);
  const recipientLine = lineNear(lines, ['수령자', '담당자', '인수자', '받는 분', '고객명']);
  const phoneLine = lineNear(lines, ['연락처', '휴대폰', '전화']);
  const phone = normalizePhone(phoneLine.match(/0[\d\-\s]{8,13}/)?.[0] || phoneMatches[0] || '');

  const addressLine = lineNear(lines, ['배송주소', '배달주소', '배송지', '주소']);
  const address = addressLine.replace(/^(배송주소|배달주소|배송지|주소)\s*[:：]?\s*/, '');
  const venueLine = lineNear(lines, ['업체명', '상호명', '예식장', '웨딩홀', '배송처']);
  const venue = venueLine.replace(/^(업체명|상호명|예식장|웨딩홀|배송처)\s*[:：]?\s*/, '');
  const recipient = recipientLine
    .replace(/^(수령자|담당자|인수자|받는 분|고객명)\s*[:：]?\s*/, '')
    .replace(/\s*(실장|팀장|담당자)$/, ' $1');
  const orderLine = lineNear(lines, ['주문번호', '접수번호', '관리번호', 'Order', 'No.']);
  const orderNumber =
    orderLine.match(/[A-Z]{1,5}[-\d]{5,}/i)?.[0] ||
    orderLine.replace(/^(주문번호|접수번호|관리번호|Order|No\.)\s*[:：]?\s*/i, '');
  const memoLine = lineNear(lines, ['특이사항', '요청사항', '메모', '주의', '비고', '전달사항']);
  const memo = memoLine.replace(/^(특이사항|요청사항|메모|주의|비고|전달사항)\s*[:：]?\s*/, '');

  const strictTime = strictMatch ? normalizeTime(strictMatch[0]) : '';
  const eventTime = eventMatch ? normalizeTime(eventMatch[0]) : '';
  const logicalTimeBonus =
    strictTime && eventTime && strictTime < eventTime ? 8 : strictTime && eventTime ? -18 : 0;

  const fields = [
    field('deliveryDate', normalizedDate, dateLine ? 94 : 70, dateLine || dateMatch?.[0] || ''),
    field(
      'strictTime',
      strictTime,
      Math.max(45, 89 + logicalTimeBonus),
      strictLine,
      timeMatches.map(normalizeTime).filter((value) => value !== strictTime),
    ),
    field(
      'eventTime',
      eventTime,
      Math.max(45, 91 + logicalTimeBonus),
      eventLine,
      timeMatches.map(normalizeTime).filter((value) => value !== eventTime),
    ),
    field('venueName', venue, venueLine ? 91 : 48, venueLine),
    field('deliveryAddress', address, addressLine ? 88 : 42, addressLine),
    field('recipientName', recipient, recipientLine ? 82 : 40, recipientLine),
    field('recipientTel', phone, phoneLine ? 96 : 72, phoneLine, phoneMatches.map(normalizePhone)),
    field('orderNumber', orderNumber, orderLine ? 93 : 50, orderLine),
    field('memo', memo, memoLine ? 86 : 45, memoLine),
  ];

  const requiredFields = fields.filter((item) => item.required);
  const documentConfidence = Math.round(
    requiredFields.reduce((sum, item) => sum + item.confidence, 0) /
      Math.max(requiredFields.length, 1),
  );
  return {
    engine: documentConfidence >= 72 ? 'mlkit-demo' : 'cloud-fallback-demo',
    rawText: text,
    fields,
    documentConfidence,
    quality,
    processingMs: Date.now() - started + 860,
    variantsCompared: 6,
  };
}

export async function runHybridOcr(
  asset: ImageAssetInfo,
  rawText = DEMO_RECEIPT_TEXT,
): Promise<OcrPipelineResult> {
  const quality = inspectCaptureQuality(asset);
  await new Promise((resolve) => setTimeout(resolve, 900));
  return parseReceiptText(rawText, quality);
}
