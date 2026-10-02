import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  Dumbbell,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
  getGym,
  getTrainer,
  gymOffers,
  marketplaceGyms,
  marketplaceTrainers,
  ptPackages,
  type GymOffer,
  type LocalizedText,
  type MarketplaceGym,
  type PTPackage,
  type PTTrainer,
} from '../model/marketplaceData';
import {
  resolveCheckout,
  useMarketplaceStore,
  type PaymentMethod,
} from '../model/useMarketplaceStore';

import { ROUTES } from '@/shared/config/constants';

import './marketplace.css';

function getCopy(isVi: boolean) {
  return isVi
    ? {
        marketplace: 'Marketplace',
        discover: 'Khám phá nơi tập phù hợp với bạn',
        discoverBody: 'So sánh phòng tập, ưu đãi và huấn luyện viên từ các đối tác đã xác minh.',
        searchGym: 'Tìm theo tên hoặc khu vực',
        allCities: 'Tất cả thành phố',
        allTypes: 'Tất cả loại hình',
        results: 'kết quả',
        verified: 'Đã xác minh',
        reviews: 'đánh giá',
        from: 'Từ',
        viewGym: 'Xem phòng tập',
        facilities: 'Tiện ích',
        offers: 'Ưu đãi đang mở',
        trainersAtGym: 'Huấn luyện viên tại phòng tập',
        selectOffer: 'Chọn ưu đãi',
        days: 'ngày',
        includesPlus: 'Có thể thêm Fit® Plus',
        popular: 'Phổ biến',
        backMarketplace: 'Về Marketplace',
        allOffers: 'Tất cả ưu đãi',
        allOffersBody: 'So sánh giá dịch vụ Gym và quyền lợi Plus theo từng thành phần.',
        trainers: 'Huấn luyện viên',
        trainersBody: 'Mỗi huấn luyện viên thuộc một phòng tập đã được xác minh.',
        searchTrainer: 'Tìm tên hoặc chuyên môn',
        experience: 'năm kinh nghiệm',
        viewTrainer: 'Xem hồ sơ',
        packages: 'Gói PT',
        packagesBody: 'Chọn gói huấn luyện gắn với một PT và phòng tập cụ thể.',
        sessions: 'buổi',
        validFor: 'Sử dụng trong',
        selectPackage: 'Chọn gói PT',
        checkout: 'Thanh toán',
        checkoutBody: 'Kiểm tra từng thành phần trước khi xác nhận.',
        emptyCheckout: 'Bạn chưa chọn ưu đãi hoặc gói PT.',
        browseOffers: 'Khám phá ưu đãi',
        orderSummary: 'Tóm tắt đơn hàng',
        gymService: 'Dịch vụ Gym / PT',
        serviceDiscount: 'Giảm giá dịch vụ',
        plusDigital: 'Fit® Plus',
        plusCoverage: 'ngày quyền lợi chưa được bao phủ',
        total: 'Tổng thanh toán',
        addPlus: 'Thêm Fit® Plus vào gói',
        plusNote: 'Giá Plus do nền tảng kiểm soát và không tính vào doanh thu dịch vụ Gym.',
        paymentMethod: 'Phương thức thanh toán',
        card: 'Thẻ ngân hàng',
        bank: 'Chuyển khoản',
        cardNumber: 'Số thẻ',
        cardHolder: 'Tên chủ thẻ',
        expiry: 'Hết hạn',
        confirm: 'Xác nhận thanh toán',
        demoPayment: 'Thanh toán đang được mô phỏng cục bộ, không thu tiền thật.',
        paymentSuccess: 'Thanh toán thành công',
        paymentFailed: 'Thanh toán chưa thành công',
        orderId: 'Mã đơn hàng',
        paymentState: 'Trạng thái thanh toán',
        fulfillmentState: 'Trạng thái dịch vụ',
        paid: 'Đã thanh toán',
        pendingGym: 'Chờ Gym xác nhận thực hiện dịch vụ',
        trainerActive: 'Đã kích hoạt quan hệ Trainer–Member',
        resultBodyGym: 'Gym sẽ thực hiện quyền lợi vật lý theo điều kiện của ưu đãi.',
        resultBodyPt: 'Bạn và PT sẽ trao đổi lịch trực tiếp; PT tạo lịch hẹn trên hệ thống.',
        continueMarketplace: 'Tiếp tục khám phá',
        paymentDone: 'Đã ghi nhận giao dịch.',
        noResults: 'Không tìm thấy kết quả phù hợp.',
        location: 'Vị trí',
        gymType: 'Loại hình',
        boutique: 'Boutique',
        strength: 'Sức mạnh',
        fullService: 'Đa dịch vụ',
      }
    : {
        marketplace: 'Marketplace',
        discover: 'Find the right place to train',
        discoverBody: 'Compare gyms, offers and trainers from verified partners.',
        searchGym: 'Search by name or area',
        allCities: 'All cities',
        allTypes: 'All gym types',
        results: 'results',
        verified: 'Verified',
        reviews: 'reviews',
        from: 'From',
        viewGym: 'View gym',
        facilities: 'Facilities',
        offers: 'Available offers',
        trainersAtGym: 'Trainers at this gym',
        selectOffer: 'Select offer',
        days: 'days',
        includesPlus: 'Fit® Plus available',
        popular: 'Popular',
        backMarketplace: 'Back to Marketplace',
        allOffers: 'All offers',
        allOffersBody: 'Compare Gym service and Plus value as separate components.',
        trainers: 'Trainers',
        trainersBody: 'Every trainer belongs to a verified partner gym.',
        searchTrainer: 'Search name or specialty',
        experience: 'years experience',
        viewTrainer: 'View profile',
        packages: 'PT packages',
        packagesBody: 'Choose coaching tied to a specific trainer and gym.',
        sessions: 'sessions',
        validFor: 'Valid for',
        selectPackage: 'Select PT package',
        checkout: 'Checkout',
        checkoutBody: 'Review every component before confirming payment.',
        emptyCheckout: 'No gym offer or PT package has been selected.',
        browseOffers: 'Browse offers',
        orderSummary: 'Order summary',
        gymService: 'Gym / PT service',
        serviceDiscount: 'Service discount',
        plusDigital: 'Fit® Plus',
        plusCoverage: 'uncovered entitlement days',
        total: 'Total payment',
        addPlus: 'Add Fit® Plus to this offer',
        plusNote: 'Plus pricing is platform-controlled and separate from Gym service revenue.',
        paymentMethod: 'Payment method',
        card: 'Bank card',
        bank: 'Bank transfer',
        cardNumber: 'Card number',
        cardHolder: 'Cardholder name',
        expiry: 'Expiry',
        confirm: 'Confirm payment',
        demoPayment: 'Payment is simulated locally and no real charge is made.',
        paymentSuccess: 'Payment successful',
        paymentFailed: 'Payment unsuccessful',
        orderId: 'Order ID',
        paymentState: 'Payment status',
        fulfillmentState: 'Service status',
        paid: 'Paid',
        pendingGym: 'Waiting for Gym service confirmation',
        trainerActive: 'Trainer–Member assignment activated',
        resultBodyGym: 'The Gym fulfills physical benefits under the purchased offer terms.',
        resultBodyPt:
          'Coordinate availability directly; the Trainer creates appointments in the platform.',
        continueMarketplace: 'Continue exploring',
        paymentDone: 'Transaction recorded.',
        noResults: 'No matching results found.',
        location: 'Location',
        gymType: 'Gym type',
        boutique: 'Boutique',
        strength: 'Strength',
        fullService: 'Full service',
      };
}

function useMarketplaceCopy() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  return { isVi, copy: getCopy(isVi) };
}

function localize(value: LocalizedText, isVi: boolean) {
  return value[isVi ? 'vi' : 'en'];
}

function money(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
}

function GymVisual({ gym, compact = false }: { gym: MarketplaceGym; compact?: boolean }) {
  return (
    <div
      className={`marketplace-gym-visual ${compact ? 'is-compact' : ''}`}
      style={{ '--gym-accent': gym.accent } as CSSProperties}
      aria-hidden="true"
    >
      <span>{gym.name.slice(0, 2).toUpperCase()}</span>
      <Dumbbell size={compact ? 24 : 34} strokeWidth={1.5} />
      <i />
    </div>
  );
}

function GymCard({ gym }: { gym: MarketplaceGym }) {
  const { isVi, copy } = useMarketplaceCopy();
  const offers = gymOffers.filter((offer) => offer.gymId === gym.id && offer.published);
  const lowest = Math.min(
    ...offers.map((offer) => offer.servicePriceVnd - offer.serviceDiscountVnd),
  );
  return (
    <article className="marketplace-gym-card">
      <GymVisual gym={gym} />
      <div className="marketplace-gym-card__body">
        <div className="marketplace-card-flags">
          {gym.verified && (
            <span>
              <BadgeCheck size={13} /> {copy.verified}
            </span>
          )}
          <span>{gym.distanceKm} km</span>
        </div>
        <h2>{gym.name}</h2>
        <p>
          <MapPin size={14} /> {localize(gym.area, isVi)}
        </p>
        <div className="marketplace-rating">
          <Star size={14} fill="currentColor" /> <strong>{gym.rating}</strong>
          <span>
            ({gym.reviewCount} {copy.reviews})
          </span>
        </div>
        <div className="marketplace-card-price">
          <span>{copy.from}</span>
          <strong>{money(lowest)}</strong>
        </div>
        <Link to={ROUTES.member.marketplaceGymPath(gym.id)}>
          {copy.viewGym} <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

function OfferCard({ offer }: { offer: GymOffer }) {
  const { isVi, copy } = useMarketplaceCopy();
  const navigate = useNavigate();
  const selectGymOffer = useMarketplaceStore((state) => state.selectGymOffer);
  return (
    <article className={`marketplace-offer ${offer.popular ? 'is-popular' : ''}`}>
      <header>
        <span>{offer.popular ? copy.popular : `${offer.durationDays} ${copy.days}`}</span>
        {offer.plusEligible && <Sparkles size={17} />}
      </header>
      <h3>{localize(offer.name, isVi)}</h3>
      <strong>{money(offer.servicePriceVnd - offer.serviceDiscountVnd)}</strong>
      {offer.serviceDiscountVnd > 0 && <del>{money(offer.servicePriceVnd)}</del>}
      <ul>
        {offer.features.map((feature) => (
          <li key={feature.en}>
            <Check size={14} /> {localize(feature, isVi)}
          </li>
        ))}
      </ul>
      {offer.plusEligible && (
        <p>
          <Sparkles size={13} /> {copy.includesPlus}
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          selectGymOffer(offer.id, offer.plusEligible);
          void navigate(ROUTES.member.marketplaceCheckout);
        }}
      >
        {copy.selectOffer} <ArrowRight size={15} />
      </button>
    </article>
  );
}

function TrainerCard({ trainer }: { trainer: PTTrainer }) {
  const { isVi, copy } = useMarketplaceCopy();
  const gym = getGym(trainer.gymId);
  return (
    <article className="marketplace-trainer-card">
      <div className="marketplace-trainer-avatar" style={{ background: trainer.accent }}>
        {trainer.initials}
      </div>
      <div>
        <span>{gym?.name}</span>
        <h2>{trainer.fullName}</h2>
        <p>{trainer.specialties.map((item) => localize(item, isVi)).join(' · ')}</p>
        <div>
          <Star size={13} fill="currentColor" /> {trainer.rating} · {trainer.experienceYears}{' '}
          {copy.experience}
        </div>
      </div>
      <Link to={ROUTES.member.marketplaceTrainerPath(trainer.id)}>
        {copy.viewTrainer} <ChevronRight size={15} />
      </Link>
    </article>
  );
}

function PackageCard({ trainerPackage }: { trainerPackage: PTPackage }) {
  const { isVi, copy } = useMarketplaceCopy();
  const navigate = useNavigate();
  const trainer = getTrainer(trainerPackage.trainerId);
  const gym = getGym(trainerPackage.gymId);
  const selectPtPackage = useMarketplaceStore((state) => state.selectPtPackage);
  return (
    <article className="marketplace-package-card">
      <span>
        {trainer?.fullName} · {gym?.name}
      </span>
      <h3>{localize(trainerPackage.name, isVi)}</h3>
      <strong>{money(trainerPackage.servicePriceVnd)}</strong>
      <div>
        <span>
          <Users size={14} /> {trainerPackage.sessionsIncluded} {copy.sessions}
        </span>
        <span>
          <Clock3 size={14} /> {copy.validFor} {trainerPackage.durationDays} {copy.days}
        </span>
      </div>
      <ul>
        {trainerPackage.features.map((feature) => (
          <li key={feature.en}>
            <Check size={14} /> {localize(feature, isVi)}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          selectPtPackage(trainerPackage.id);
          void navigate(ROUTES.member.marketplaceCheckout);
        }}
      >
        {copy.selectPackage} <ArrowRight size={15} />
      </button>
    </article>
  );
}

export function MarketplaceHome() {
  const { isVi, copy } = useMarketplaceCopy();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('all');
  const [type, setType] = useState('all');
  const gyms = marketplaceGyms.filter((gym) => {
    const haystack = `${gym.name} ${localize(gym.area, isVi)}`.toLowerCase();
    return (
      haystack.includes(query.toLowerCase()) &&
      (city === 'all' || gym.city === city) &&
      (type === 'all' || gym.type === type)
    );
  });
  return (
    <div className="marketplace-page">
      <section className="marketplace-filters" aria-label={copy.discover}>
        <label>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchGym}
          />
        </label>
        <label>
          <MapPin size={16} />
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            aria-label={copy.location}
          >
            <option value="all">{copy.allCities}</option>
            <option value="ho-chi-minh">Hồ Chí Minh</option>
            <option value="ha-noi">Hà Nội</option>
            <option value="da-nang">Đà Nẵng</option>
          </select>
        </label>
        <label>
          <Filter size={16} />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label={copy.gymType}
          >
            <option value="all">{copy.allTypes}</option>
            <option value="boutique">{copy.boutique}</option>
            <option value="strength">{copy.strength}</option>
            <option value="full-service">{copy.fullService}</option>
          </select>
        </label>
      </section>
      <div className="marketplace-result-count">
        <strong>{gyms.length}</strong> {copy.results}
      </div>
      {gyms.length > 0 ? (
        <section className="marketplace-gym-grid">
          {gyms.map((gym) => (
            <GymCard gym={gym} key={gym.id} />
          ))}
        </section>
      ) : (
        <div className="marketplace-empty">
          <Search size={25} />
          <span>{copy.noResults}</span>
        </div>
      )}
    </div>
  );
}

export function GymDetailPage() {
  const { gymId = '' } = useParams();
  const { isVi, copy } = useMarketplaceCopy();
  const gym = getGym(gymId);
  if (!gym) return <Navigate to={ROUTES.member.marketplace} replace />;
  const offers = gymOffers.filter((offer) => offer.gymId === gym.id && offer.published);
  const trainers = marketplaceTrainers.filter((trainer) => trainer.gymId === gym.id);
  return (
    <div className="marketplace-page">
      <Link className="marketplace-back" to={ROUTES.member.marketplace}>
        <ArrowLeft size={15} /> {copy.backMarketplace}
      </Link>
      <section className="marketplace-gym-detail-hero">
        <GymVisual gym={gym} />
        <div>
          <span>
            <BadgeCheck size={14} /> {copy.verified}
          </span>
          <h1>{gym.name}</h1>
          <p>
            <MapPin size={15} /> {localize(gym.address, isVi)}
          </p>
          <p>{localize(gym.description, isVi)}</p>
          <div className="marketplace-rating">
            <Star size={15} fill="currentColor" /> <strong>{gym.rating}</strong>
            <span>
              ({gym.reviewCount} {copy.reviews})
            </span>
          </div>
        </div>
      </section>
      <section className="marketplace-section">
        <header>
          <div>
            <span>01</span>
            <h2>{copy.facilities}</h2>
          </div>
        </header>
        <div className="marketplace-facilities">
          {gym.facilities.map((facility) => (
            <span key={facility.en}>
              <Check size={15} /> {localize(facility, isVi)}
            </span>
          ))}
        </div>
      </section>
      <section className="marketplace-section">
        <header>
          <div>
            <span>02</span>
            <h2>{copy.offers}</h2>
          </div>
          <Link to={ROUTES.member.marketplaceOffers}>
            {copy.allOffers} <ArrowRight size={14} />
          </Link>
        </header>
        <div className="marketplace-offer-grid">
          {offers.map((offer) => (
            <OfferCard offer={offer} key={offer.id} />
          ))}
        </div>
      </section>
      <section className="marketplace-section">
        <header>
          <div>
            <span>03</span>
            <h2>{copy.trainersAtGym}</h2>
          </div>
          <Link to={ROUTES.member.marketplaceTrainers}>
            {copy.trainers} <ArrowRight size={14} />
          </Link>
        </header>
        <div className="marketplace-trainer-grid">
          {trainers.map((trainer) => (
            <TrainerCard trainer={trainer} key={trainer.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function GymOffersPage() {
  return (
    <div className="marketplace-page">
      <section className="marketplace-offer-grid is-wide">
        {gymOffers
          .filter((offer) => offer.published)
          .map((offer) => (
            <div key={offer.id}>
              <Link
                className="marketplace-offer-gym"
                to={ROUTES.member.marketplaceGymPath(offer.gymId)}
              >
                {getGym(offer.gymId)?.name}
                <ChevronRight size={14} />
              </Link>
              <OfferCard offer={offer} />
            </div>
          ))}
      </section>
    </div>
  );
}

export function TrainerDiscoveryPage() {
  const { isVi, copy } = useMarketplaceCopy();
  const [query, setQuery] = useState('');
  const trainers = marketplaceTrainers.filter((trainer) =>
    `${trainer.fullName} ${trainer.specialties.map((item) => localize(item, isVi)).join(' ')}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="marketplace-page">
      <section className="marketplace-filters is-single">
        <label>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchTrainer}
          />
        </label>
      </section>
      <section className="marketplace-trainer-grid is-directory">
        {trainers.map((trainer) => (
          <TrainerCard trainer={trainer} key={trainer.id} />
        ))}
      </section>
    </div>
  );
}

export function TrainerDetailPage() {
  const { trainerId = '' } = useParams();
  const { isVi, copy } = useMarketplaceCopy();
  const trainer = getTrainer(trainerId);
  if (!trainer) return <Navigate to={ROUTES.member.marketplaceTrainers} replace />;
  const gym = getGym(trainer.gymId);
  const packages = ptPackages.filter((item) => item.trainerId === trainer.id && item.published);
  return (
    <div className="marketplace-page">
      <Link className="marketplace-back" to={ROUTES.member.marketplaceTrainers}>
        <ArrowLeft size={15} /> {copy.trainers}
      </Link>
      <section className="marketplace-trainer-profile">
        <div className="marketplace-trainer-avatar is-large" style={{ background: trainer.accent }}>
          {trainer.initials}
        </div>
        <div>
          <span>{gym?.name}</span>
          <h1>{trainer.fullName}</h1>
          <p>{trainer.specialties.map((item) => localize(item, isVi)).join(' · ')}</p>
          <div className="marketplace-rating">
            <Star size={14} fill="currentColor" /> {trainer.rating} · {trainer.experienceYears}{' '}
            {copy.experience}
          </div>
          <blockquote>{localize(trainer.bio, isVi)}</blockquote>
        </div>
      </section>
      <section className="marketplace-section">
        <header>
          <div>
            <span>PT</span>
            <h2>{copy.packages}</h2>
          </div>
        </header>
        <div className="marketplace-package-grid">
          {packages.map((item) => (
            <PackageCard trainerPackage={item} key={item.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

export function PTPackagesPage() {
  return (
    <div className="marketplace-page">
      <section className="marketplace-package-grid">
        {ptPackages
          .filter((item) => item.published)
          .map((item) => (
            <PackageCard trainerPackage={item} key={item.id} />
          ))}
      </section>
    </div>
  );
}

export function MarketplaceCheckoutPage() {
  const { copy, isVi } = useMarketplaceCopy();
  const navigate = useNavigate();
  const selection = useMarketplaceStore((state) => state.selection);
  const coverageDays = useMarketplaceStore((state) => state.currentPlusCoverageDays);
  const setIncludePlus = useMarketplaceStore((state) => state.setIncludePlus);
  const completeCheckout = useMarketplaceStore((state) => state.completeCheckout);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [accepted, setAccepted] = useState(false);
  const breakdown = resolveCheckout(selection, coverageDays);
  const selectedOffer =
    selection?.kind === 'gym_offer'
      ? gymOffers.find((offer) => offer.id === selection.productId)
      : undefined;
  const selectedPackage =
    selection?.kind === 'pt_package'
      ? ptPackages.find((trainerPackage) => trainerPackage.id === selection.productId)
      : undefined;
  const displayTitle = selectedOffer
    ? localize(selectedOffer.name, isVi)
    : selectedPackage
      ? localize(selectedPackage.name, isVi)
      : breakdown?.title;
  if (!selection || !breakdown)
    return (
      <div className="marketplace-page">
        <div className="marketplace-empty">
          <CreditCard size={28} />
          <span>{copy.emptyCheckout}</span>
          <Link to={ROUTES.member.marketplaceOffers}>{copy.browseOffers}</Link>
        </div>
      </div>
    );
  const submit = () => {
    if (!accepted) return;
    const order = completeCheckout(method);
    if (!order) return;
    toast.success(copy.paymentDone);
    void navigate(ROUTES.member.marketplacePaymentResultPath(order.id));
  };
  return (
    <div className="marketplace-page">
      <div className="marketplace-checkout">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <section>
            <h2>{copy.paymentMethod}</h2>
            <div className="marketplace-payment-methods">
              <button
                type="button"
                className={method === 'card' ? 'is-active' : ''}
                onClick={() => setMethod('card')}
              >
                <CreditCard size={18} /> {copy.card}
              </button>
              <button
                type="button"
                className={method === 'bank_transfer' ? 'is-active' : ''}
                onClick={() => setMethod('bank_transfer')}
              >
                <Banknote size={18} /> {copy.bank}
              </button>
            </div>
            {method === 'card' && (
              <div className="marketplace-card-fields">
                <label>
                  <span>{copy.cardNumber}</span>
                  <input required inputMode="numeric" placeholder="4242 4242 4242 4242" />
                </label>
                <label>
                  <span>{copy.cardHolder}</span>
                  <input required placeholder="NGUYEN VAN A" />
                </label>
                <label>
                  <span>{copy.expiry}</span>
                  <input required placeholder="12/30" />
                </label>
              </div>
            )}
            <label className="marketplace-terms">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>{copy.demoPayment}</span>
            </label>
            <button className="marketplace-confirm" type="submit" disabled={!accepted}>
              <ShieldCheck size={17} /> {copy.confirm}
            </button>
          </section>
        </form>
        <aside>
          <h2>{copy.orderSummary}</h2>
          <div>
            <strong>{displayTitle}</strong>
            <span>{breakdown.providerName}</span>
          </div>
          {selectedOffer?.plusEligible && (
            <label className="marketplace-plus-toggle">
              <input
                type="checkbox"
                checked={selection.kind === 'gym_offer' && selection.includePlus}
                onChange={(event) => setIncludePlus(event.target.checked)}
              />
              <span>
                <strong>{copy.addPlus}</strong>
                <small>{copy.plusNote}</small>
              </span>
            </label>
          )}
          <dl>
            <div>
              <dt>{copy.gymService}</dt>
              <dd>{money(breakdown.serviceAmountVnd)}</dd>
            </div>
            {breakdown.serviceDiscountVnd > 0 && (
              <div className="is-discount">
                <dt>{copy.serviceDiscount}</dt>
                <dd>−{money(breakdown.serviceDiscountVnd)}</dd>
              </div>
            )}
            <div>
              <dt>
                {copy.plusDigital}
                {breakdown.uncoveredPlusDays > 0 && (
                  <small>
                    {breakdown.uncoveredPlusDays} {copy.plusCoverage}
                  </small>
                )}
              </dt>
              <dd>{money(breakdown.plusAmountVnd)}</dd>
            </div>
            <div className="is-total">
              <dt>{copy.total}</dt>
              <dd>{money(breakdown.totalVnd)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}

export function MarketplacePaymentResultPage() {
  const { orderId = '' } = useParams();
  const { copy, isVi } = useMarketplaceCopy();
  const order = useMarketplaceStore((state) => state.orders.find((item) => item.id === orderId));
  if (!order) return <Navigate to={ROUTES.member.marketplace} replace />;
  const success = order.paymentStatus === 'succeeded';
  const orderedProduct =
    order.selection.kind === 'gym_offer'
      ? gymOffers.find((offer) => offer.id === order.selection.productId)
      : ptPackages.find((trainerPackage) => trainerPackage.id === order.selection.productId);
  const orderTitle = orderedProduct ? localize(orderedProduct.name, isVi) : order.title;
  return (
    <div className="marketplace-page">
      <section className={`marketplace-result ${success ? 'is-success' : 'is-failed'}`}>
        <span className="marketplace-result__icon">
          {success ? <Check size={34} /> : <CreditCard size={34} />}
        </span>
        <span>FIT® / ORDER CONFIRMATION</span>
        <h1>{success ? copy.paymentSuccess : copy.paymentFailed}</h1>
        <strong>{orderTitle}</strong>
        <p>{order.selection.kind === 'pt_package' ? copy.resultBodyPt : copy.resultBodyGym}</p>
        <dl>
          <div>
            <dt>{copy.orderId}</dt>
            <dd>{order.id}</dd>
          </div>
          <div>
            <dt>{copy.paymentState}</dt>
            <dd>{success ? copy.paid : copy.paymentFailed}</dd>
          </div>
          <div>
            <dt>{copy.fulfillmentState}</dt>
            <dd>
              {order.fulfillmentStatus === 'trainer_assignment_active'
                ? copy.trainerActive
                : copy.pendingGym}
            </dd>
          </div>
          <div>
            <dt>{copy.total}</dt>
            <dd>{money(order.totalVnd)}</dd>
          </div>
        </dl>
        <Link to={ROUTES.member.marketplace}>
          {copy.continueMarketplace} <ArrowRight size={15} />
        </Link>
      </section>
    </div>
  );
}
