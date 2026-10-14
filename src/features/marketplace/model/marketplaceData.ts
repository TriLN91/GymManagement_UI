export const GYM_CITIES = ['ho-chi-minh', 'ha-noi', 'da-nang'] as const;
export type GymCity = (typeof GYM_CITIES)[number];

export interface LocalizedText {
  en: string;
  vi: string;
}

export interface GymOffer {
  id: string;
  gymId: string;
  name: LocalizedText;
  durationDays: number;
  servicePriceVnd: number;
  serviceDiscountVnd: number;
  plusEligible: boolean;
  plusDays: number;
  plusPriceVnd: number;
  features: ReadonlyArray<LocalizedText>;
  popular?: boolean;
  published: boolean;
}

export interface MarketplaceGym {
  id: string;
  name: string;
  city: GymCity;
  area: LocalizedText;
  type: 'boutique' | 'strength' | 'full-service';
  address: LocalizedText;
  description: LocalizedText;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  facilities: ReadonlyArray<LocalizedText>;
  accent: string;
  verified: boolean;
}

export interface PTTrainer {
  id: string;
  gymId: string;
  fullName: string;
  initials: string;
  specialties: ReadonlyArray<LocalizedText>;
  experienceYears: number;
  rating: number;
  bio: LocalizedText;
  accent: string;
}

export interface PTPackage {
  id: string;
  trainerId: string;
  gymId: string;
  name: LocalizedText;
  sessionsIncluded: number;
  durationDays: number;
  servicePriceVnd: number;
  features: ReadonlyArray<LocalizedText>;
  published: boolean;
}

const text = (en: string, vi: string): LocalizedText => ({ en, vi });

export const marketplaceGyms: ReadonlyArray<MarketplaceGym> = [
  {
    id: 'fit-district-thao-dien',
    name: 'Fit District Thảo Điền',
    city: 'ho-chi-minh',
    area: text('Thảo Điền, District 2', 'Thảo Điền, Quận 2'),
    type: 'boutique',
    address: text('18 Nguyễn Văn Hưởng, Thảo Điền', '18 Nguyễn Văn Hưởng, Thảo Điền'),
    description: text(
      'A focused training club for strength, mobility and coached small-group sessions.',
      'Không gian tập trung vào sức mạnh, linh hoạt và các buổi nhóm nhỏ có huấn luyện.',
    ),
    rating: 4.9,
    reviewCount: 184,
    distanceKm: 2.4,
    facilities: [
      text('Free weights', 'Khu tạ tự do'),
      text('Mobility studio', 'Phòng tập linh hoạt'),
      text('Locker & shower', 'Tủ đồ và phòng tắm'),
      text('Body assessment', 'Đánh giá thể trạng'),
    ],
    accent: '#345c32',
    verified: true,
  },
  {
    id: 'northside-strength-lab',
    name: 'Northside Strength Lab',
    city: 'ha-noi',
    area: text('Tây Hồ, Hà Nội', 'Tây Hồ, Hà Nội'),
    type: 'strength',
    address: text('62 Xuân Diệu, Tây Hồ', '62 Xuân Diệu, Tây Hồ'),
    description: text(
      'Performance gym with platforms, calibrated plates and specialist strength coaches.',
      'Phòng tập hiệu suất với sàn nâng tạ, đĩa tạ chuẩn và huấn luyện viên sức mạnh.',
    ),
    rating: 4.8,
    reviewCount: 126,
    distanceKm: 5.8,
    facilities: [
      text('Power racks', 'Khung squat'),
      text('Olympic platforms', 'Sàn cử tạ'),
      text('Recovery zone', 'Khu phục hồi'),
      text('Parking', 'Bãi đỗ xe'),
    ],
    accent: '#1c6a5b',
    verified: true,
  },
  {
    id: 'pulse-247-riverside',
    name: 'Pulse 24/7 Riverside',
    city: 'da-nang',
    area: text('Sơn Trà, Đà Nẵng', 'Sơn Trà, Đà Nẵng'),
    type: 'full-service',
    address: text('104 Ngô Quyền, Sơn Trà', '104 Ngô Quyền, Sơn Trà'),
    description: text(
      'A full-service 24/7 gym with cardio, functional and recovery facilities.',
      'Phòng tập toàn diện 24/7 với khu cardio, functional và phục hồi.',
    ),
    rating: 4.7,
    reviewCount: 231,
    distanceKm: 7.1,
    facilities: [
      text('24/7 access', 'Mở cửa 24/7'),
      text('Cardio floor', 'Khu cardio'),
      text('Functional zone', 'Khu functional'),
      text('Sauna', 'Phòng xông hơi'),
    ],
    accent: '#9cac54',
    verified: true,
  },
];

export const gymOffers: ReadonlyArray<GymOffer> = [
  {
    id: 'fit-district-30',
    gymId: 'fit-district-thao-dien',
    name: text('30-day Flex', 'Linh hoạt 30 ngày'),
    durationDays: 30,
    servicePriceVnd: 890_000,
    serviceDiscountVnd: 0,
    plusEligible: true,
    plusDays: 30,
    plusPriceVnd: 149_000,
    features: [
      text('Unlimited gym entry', 'Không giới hạn lượt vào'),
      text('1 body scan', '1 lần đo cơ thể'),
    ],
    published: true,
  },
  {
    id: 'fit-district-90',
    gymId: 'fit-district-thao-dien',
    name: text('90-day Progress', 'Tiến bộ 90 ngày'),
    durationDays: 90,
    servicePriceVnd: 2_490_000,
    serviceDiscountVnd: 200_000,
    plusEligible: true,
    plusDays: 90,
    plusPriceVnd: 399_000,
    features: [
      text('Unlimited gym entry', 'Không giới hạn lượt vào'),
      text('3 body scans', '3 lần đo cơ thể'),
    ],
    popular: true,
    published: true,
  },
  {
    id: 'northside-90',
    gymId: 'northside-strength-lab',
    name: text('Strength Quarter', 'Sức mạnh 3 tháng'),
    durationDays: 90,
    servicePriceVnd: 2_790_000,
    serviceDiscountVnd: 150_000,
    plusEligible: true,
    plusDays: 90,
    plusPriceVnd: 399_000,
    features: [
      text('Open gym access', 'Tập tự do'),
      text('Technique induction', 'Hướng dẫn kỹ thuật đầu kỳ'),
    ],
    popular: true,
    published: true,
  },
  {
    id: 'pulse-30',
    gymId: 'pulse-247-riverside',
    name: text('24/7 Monthly', 'Gói tháng 24/7'),
    durationDays: 30,
    servicePriceVnd: 690_000,
    serviceDiscountVnd: 0,
    plusEligible: false,
    plusDays: 0,
    plusPriceVnd: 0,
    features: [text('24/7 entry', 'Ra vào 24/7'), text('Sauna access', 'Sử dụng phòng xông hơi')],
    published: true,
  },
];

export const marketplaceTrainers: ReadonlyArray<PTTrainer> = [
  {
    id: 'linh-nguyen',
    gymId: 'fit-district-thao-dien',
    fullName: 'Linh Nguyễn',
    initials: 'LN',
    specialties: [text('Strength', 'Sức mạnh'), text('Body recomposition', 'Cải thiện vóc dáng')],
    experienceYears: 7,
    rating: 4.9,
    bio: text(
      'Strength coach focused on sustainable progress, technique and confidence under the bar.',
      'HLV sức mạnh tập trung vào tiến bộ bền vững, kỹ thuật và sự tự tin khi tập tạ.',
    ),
    accent: '#345c32',
  },
  {
    id: 'minh-tran',
    gymId: 'fit-district-thao-dien',
    fullName: 'Minh Trần',
    initials: 'MT',
    specialties: [text('Mobility', 'Linh hoạt'), text('Beginner fitness', 'Thể chất cơ bản')],
    experienceYears: 5,
    rating: 4.8,
    bio: text(
      'Beginner-friendly coach combining mobility and progressive resistance training.',
      'HLV thân thiện với người mới, kết hợp vận động linh hoạt và tập kháng lực tăng tiến.',
    ),
    accent: '#1c6a5b',
  },
  {
    id: 'anh-pham',
    gymId: 'northside-strength-lab',
    fullName: 'Anh Phạm',
    initials: 'AP',
    specialties: [text('Powerlifting', 'Powerlifting'), text('Strength', 'Sức mạnh')],
    experienceYears: 9,
    rating: 4.9,
    bio: text(
      'Powerlifting specialist helping members build strong, repeatable competition lifts.',
      'Chuyên gia powerlifting giúp người tập xây dựng kỹ thuật thi đấu ổn định.',
    ),
    accent: '#183f38',
  },
  {
    id: 'mai-le',
    gymId: 'pulse-247-riverside',
    fullName: 'Mai Lê',
    initials: 'ML',
    specialties: [text('Fat loss', 'Giảm mỡ'), text('Conditioning', 'Thể lực')],
    experienceYears: 6,
    rating: 4.7,
    bio: text(
      'Conditioning coach building practical routines around busy work schedules.',
      'HLV thể lực xây dựng lịch tập thực tế cho người có lịch làm việc bận rộn.',
    ),
    accent: '#73813e',
  },
];

export const ptPackages: ReadonlyArray<PTPackage> = [
  {
    id: 'linh-foundation-8',
    trainerId: 'linh-nguyen',
    gymId: 'fit-district-thao-dien',
    name: text('Strength Foundation · 8 sessions', 'Nền tảng sức mạnh · 8 buổi'),
    sessionsIncluded: 8,
    durationDays: 45,
    servicePriceVnd: 3_600_000,
    features: [
      text('Initial assessment', 'Đánh giá đầu kỳ'),
      text('Personal workout plan', 'Kế hoạch tập cá nhân'),
    ],
    published: true,
  },
  {
    id: 'linh-progress-16',
    trainerId: 'linh-nguyen',
    gymId: 'fit-district-thao-dien',
    name: text('Progress Coaching · 16 sessions', 'Huấn luyện tiến bộ · 16 buổi'),
    sessionsIncluded: 16,
    durationDays: 90,
    servicePriceVnd: 6_600_000,
    features: [
      text('Progress reviews', 'Đánh giá tiến độ'),
      text('Plan adjustments', 'Điều chỉnh kế hoạch'),
    ],
    published: true,
  },
  {
    id: 'minh-start-8',
    trainerId: 'minh-tran',
    gymId: 'fit-district-thao-dien',
    name: text('Confident Start · 8 sessions', 'Khởi đầu tự tin · 8 buổi'),
    sessionsIncluded: 8,
    durationDays: 45,
    servicePriceVnd: 3_200_000,
    features: [
      text('Movement screen', 'Sàng lọc vận động'),
      text('Technique coaching', 'Hướng dẫn kỹ thuật'),
    ],
    published: true,
  },
  {
    id: 'anh-power-12',
    trainerId: 'anh-pham',
    gymId: 'northside-strength-lab',
    name: text('Power Cycle · 12 sessions', 'Chu kỳ sức mạnh · 12 buổi'),
    sessionsIncluded: 12,
    durationDays: 75,
    servicePriceVnd: 5_400_000,
    features: [
      text('Lift analysis', 'Phân tích kỹ thuật'),
      text('Meet preparation', 'Chuẩn bị thi đấu'),
    ],
    published: true,
  },
  {
    id: 'mai-condition-10',
    trainerId: 'mai-le',
    gymId: 'pulse-247-riverside',
    name: text('Conditioning Reset · 10 sessions', 'Tái tạo thể lực · 10 buổi'),
    sessionsIncluded: 10,
    durationDays: 60,
    servicePriceVnd: 3_900_000,
    features: [
      text('Fitness baseline', 'Đo thể lực nền'),
      text('Weekly check-in', 'Theo dõi hàng tuần'),
    ],
    published: true,
  },
];

export function getGym(gymId: string) {
  return marketplaceGyms.find((gym) => gym.id === gymId);
}

export function getTrainer(trainerId: string) {
  return marketplaceTrainers.find((trainer) => trainer.id === trainerId);
}
