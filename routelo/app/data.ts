import { Delivery, FeeSettings, FuelLog, MileageLog, OcrForm } from './models';

export const SEOUL_DISTRICTS = [
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
  '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구',
  '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구',
  '종로구', '중구', '중랑구',
] as const;

export const GYEONGGI_DISTRICTS = [
  '가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시',
  '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시',
  '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시',
  '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시',
  '하남시', '화성시',
] as const;

export const ALL_DISTRICTS = [...SEOUL_DISTRICTS, ...GYEONGGI_DISTRICTS];

const DEFAULT_DISTRICT_FEES = Object.fromEntries(
  ALL_DISTRICTS.map((district) => [district, 15000]),
);

export const DEFAULT_SETTINGS: FeeSettings = {
  districtFees: DEFAULT_DISTRICT_FEES,
  fuelEfficiency: 12.4,
  themeMode: 'light',
  vehicleModel: '현대 포터2',
  fuelTankCapacity: 65,
};

export const SAMPLE_DELIVERIES: Delivery[] = [
  {
    id: 'delivery-1',
    orderVendor: '행복꽃집',
    orderVendorTel: '02-345-7788',
    deliveryVendor: '로즈플라워',
    deliveryVendorTel: '02-2038-1188',
    productName: '축하 3단 화환',
    productQuantity: 2,
    eventTime: '11:00',
    deliveryDt: '2026-06-19 10:30',
    deliveryAddress: '서울 강남구 테헤란로 152',
    customerRequests: '도착 후 사진 전송 부탁드립니다.',
    recipientTel: '010-4821-7732',
    status: 'pending',
    distanceKm: 4.2,
    fee: 10000,
    latitude: 37.5009,
    longitude: 127.0364,
  },
  {
    id: 'delivery-2',
    orderVendor: '그린화원',
    orderVendorTel: '02-442-5510',
    deliveryVendor: '로즈플라워',
    deliveryVendorTel: '02-2038-1188',
    productName: '근조 화환',
    productQuantity: 1,
    eventTime: '',
    deliveryDt: '2026-06-19 12:00',
    deliveryAddress: '서울 송파구 올림픽로 240',
    customerRequests: '빈소 앞 설치 후 연락',
    recipientTel: '010-2315-9480',
    status: 'pending',
    distanceKm: 8.7,
    fee: 15000,
    latitude: 37.5112,
    longitude: 127.0982,
  },
  {
    id: 'delivery-3',
    orderVendor: '봄날플라워',
    orderVendorTel: '031-701-1004',
    deliveryVendor: '로즈플라워',
    deliveryVendorTel: '02-2038-1188',
    productName: '관엽 화분',
    productQuantity: 1,
    eventTime: '',
    deliveryDt: '2026-06-19 14:20',
    deliveryAddress: '서울 서초구 서초대로 77길 54',
    customerRequests: '안내 데스크에 맡겨주세요.',
    recipientTel: '010-9024-1166',
    status: 'pending',
    distanceKm: 12.3,
    fee: 25000,
    latitude: 37.4979,
    longitude: 127.0276,
  },
  {
    id: 'delivery-4',
    orderVendor: '라온꽃배달',
    orderVendorTel: '02-553-7020',
    deliveryVendor: '로즈플라워',
    deliveryVendorTel: '02-2038-1188',
    productName: '꽃바구니',
    productQuantity: 1,
    eventTime: '',
    deliveryDt: '2026-06-19 09:10',
    deliveryAddress: '서울 강남구 학동로 343',
    customerRequests: '수령인 직접 전달',
    recipientTel: '010-5590-2031',
    status: 'completed',
    distanceKm: 5.6,
    fee: 15000,
    latitude: 37.5174,
    longitude: 127.0473,
  },
];

export const SAMPLE_FUEL_LOGS: FuelLog[] = [
  {
    id: 'fuel-1',
    date: '2026-06-17',
    pricePerLiter: 1685,
    liters: 10,
    amount: 16850,
    odometerKm: 82450,
  },
  {
    id: 'fuel-2',
    date: '2026-06-19',
    pricePerLiter: 1692,
    liters: 8,
    amount: 13536,
    odometerKm: 82660,
  },
];

export const SAMPLE_MILEAGE_LOGS: MileageLog[] = [
  { id: 'mileage-1', date: '2026-06-17', odometerKm: 82450, dailyDistanceKm: 126 },
  { id: 'mileage-2', date: '2026-06-18', odometerKm: 82576, dailyDistanceKm: 126 },
  { id: 'mileage-3', date: '2026-06-19', odometerKm: 82660, dailyDistanceKm: 84 },
];

export const SAMPLE_OCR_FORM: OcrForm = {
  orderVendor: '마음꽃화원',
  orderVendorTel: '02-518-2400',
  deliveryVendor: '로즈플라워',
  deliveryVendorTel: '02-2038-1188',
  productName: '축하 3단 화환',
  productQuantity: '2',
  eventTime: '17:00',
  deliveryDt: '2026-06-19 16:30',
  deliveryAddress: '서울 강남구 봉은사로 524',
  customerRequests: '행사장 입구 설치 후 사진 전송',
  recipientTel: '010-7742-1930',
};
