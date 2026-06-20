export type DeliveryStatus = 'pending' | 'completed';

export type Delivery = {
  id: string;
  orderVendor: string;
  orderVendorTel: string;
  deliveryVendor: string;
  deliveryVendorTel: string;
  productName: string;
  productQuantity: number;
  eventTime: string;
  deliveryDt: string;
  deliveryAddress: string;
  customerRequests: string;
  recipientTel: string;
  status: DeliveryStatus;
  distanceKm: number;
  fee: number;
  latitude: number;
  longitude: number;
};

export type FeeSettings = {
  districtFees: Record<string, number>;
  fuelEfficiency: number;
  themeMode: 'light' | 'dark';
  vehicleModel: string;
  fuelTankCapacity: number;
};

export type FuelLog = {
  id: string;
  date: string;
  pricePerLiter: number;
  liters: number;
  amount: number;
  odometerKm: number;
};

export type MileageLog = {
  id: string;
  date: string;
  odometerKm: number;
  dailyDistanceKm: number;
};

export type OcrForm = {
  orderVendor: string;
  orderVendorTel: string;
  deliveryVendor: string;
  deliveryVendorTel: string;
  productName: string;
  productQuantity: string;
  eventTime: string;
  deliveryDt: string;
  deliveryAddress: string;
  customerRequests: string;
  recipientTel: string;
};

export type OcrFieldKey =
  | 'deliveryDate'
  | 'strictTime'
  | 'eventTime'
  | 'venueName'
  | 'deliveryAddress'
  | 'recipientName'
  | 'recipientTel'
  | 'orderNumber'
  | 'memo';

export type OcrFieldResult = {
  key: OcrFieldKey;
  label: string;
  value: string;
  confidence: number;
  required: boolean;
  sourceText: string;
  alternatives: string[];
  status: 'confirmed' | 'review' | 'warning' | 'missing';
};

export type CaptureQuality = {
  score: number;
  blur: number;
  brightness: number;
  documentCoverage: number;
  skew: number;
  shadow: number;
  passed: boolean;
  messages: string[];
};

export type OcrPipelineResult = {
  engine: 'mlkit-demo' | 'cloud-fallback-demo';
  rawText: string;
  fields: OcrFieldResult[];
  documentConfidence: number;
  quality: CaptureQuality;
  processingMs: number;
  variantsCompared: number;
};
