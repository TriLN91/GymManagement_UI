import type { TFunction } from 'i18next';
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
  GYM_CITIES,
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

import { BRAND_MARK, ROUTES, type Language } from '@/shared/config/constants';
import { useLocale } from '@/shared/hooks/useLocale';

import './marketplace.css';

function getCopy(t: TFunction) {
  return {
    marketplace: t('marketplace:marketplacePages.copy.marketplace'),
    discover: t('marketplace:marketplacePages.copy.discover'),
    discoverBody: t('marketplace:marketplacePages.copy.discoverBody'),
    searchGym: t('marketplace:marketplacePages.copy.searchGym'),
    allCities: t('marketplace:marketplacePages.copy.allCities'),
    cities: {
      'ho-chi-minh': t('marketplace:marketplacePages.copy.cityHoChiMinh'),
      'ha-noi': t('marketplace:marketplacePages.copy.cityHaNoi'),
      'da-nang': t('marketplace:marketplacePages.copy.cityDaNang'),
    },
    cardHolderPlaceholder: t('marketplace:marketplacePages.copy.cardHolderPlaceholder'),
    orderConfirmation: t('marketplace:marketplacePages.copy.orderConfirmation'),
    allTypes: t('marketplace:marketplacePages.copy.allTypes'),
    results: t('marketplace:marketplacePages.copy.results'),
    verified: t('marketplace:marketplacePages.copy.verified'),
    reviews: t('marketplace:marketplacePages.copy.reviews'),
    from: t('marketplace:marketplacePages.copy.from'),
    viewGym: t('marketplace:marketplacePages.copy.viewGym'),
    facilities: t('marketplace:marketplacePages.copy.facilities'),
    offers: t('marketplace:marketplacePages.copy.offers'),
    trainersAtGym: t('marketplace:marketplacePages.copy.trainersAtGym'),
    selectOffer: t('marketplace:marketplacePages.copy.selectOffer'),
    days: t('marketplace:marketplacePages.copy.days'),
    includesPlus: t('marketplace:marketplacePages.copy.includesPlus'),
    popular: t('marketplace:marketplacePages.copy.popular'),
    backMarketplace: t('marketplace:marketplacePages.copy.backMarketplace'),
    allOffers: t('marketplace:marketplacePages.copy.allOffers'),
    allOffersBody: t('marketplace:marketplacePages.copy.allOffersBody'),
    trainers: t('marketplace:marketplacePages.copy.trainers'),
    trainersBody: t('marketplace:marketplacePages.copy.trainersBody'),
    searchTrainer: t('marketplace:marketplacePages.copy.searchTrainer'),
    experience: t('marketplace:marketplacePages.copy.experience'),
    viewTrainer: t('marketplace:marketplacePages.copy.viewTrainer'),
    packages: t('marketplace:marketplacePages.copy.packages'),
    packagesBody: t('marketplace:marketplacePages.copy.packagesBody'),
    sessions: t('marketplace:marketplacePages.copy.sessions'),
    validFor: t('marketplace:marketplacePages.copy.validFor'),
    selectPackage: t('marketplace:marketplacePages.copy.selectPackage'),
    checkout: t('marketplace:marketplacePages.copy.checkout'),
    checkoutBody: t('marketplace:marketplacePages.copy.checkoutBody'),
    emptyCheckout: t('marketplace:marketplacePages.copy.emptyCheckout'),
    browseOffers: t('marketplace:marketplacePages.copy.browseOffers'),
    orderSummary: t('marketplace:marketplacePages.copy.orderSummary'),
    gymService: t('marketplace:marketplacePages.copy.gymService'),
    serviceDiscount: t('marketplace:marketplacePages.copy.serviceDiscount'),
    plusDigital: t('marketplace:marketplacePages.copy.plusDigital'),
    plusCoverage: t('marketplace:marketplacePages.copy.plusCoverage'),
    total: t('marketplace:marketplacePages.copy.total'),
    addPlus: t('marketplace:marketplacePages.copy.addPlus'),
    plusNote: t('marketplace:marketplacePages.copy.plusNote'),
    paymentMethod: t('marketplace:marketplacePages.copy.paymentMethod'),
    card: t('marketplace:marketplacePages.copy.card'),
    bank: t('marketplace:marketplacePages.copy.bank'),
    cardNumber: t('marketplace:marketplacePages.copy.cardNumber'),
    cardHolder: t('marketplace:marketplacePages.copy.cardHolder'),
    expiry: t('marketplace:marketplacePages.copy.expiry'),
    confirm: t('marketplace:marketplacePages.copy.confirm'),
    demoPayment: t('marketplace:marketplacePages.copy.demoPayment'),
    paymentSuccess: t('marketplace:marketplacePages.copy.paymentSuccess'),
    paymentFailed: t('marketplace:marketplacePages.copy.paymentFailed'),
    orderId: t('marketplace:marketplacePages.copy.orderId'),
    paymentState: t('marketplace:marketplacePages.copy.paymentState'),
    fulfillmentState: t('marketplace:marketplacePages.copy.fulfillmentState'),
    paid: t('marketplace:marketplacePages.copy.paid'),
    pendingGym: t('marketplace:marketplacePages.copy.pendingGym'),
    trainerActive: t('marketplace:marketplacePages.copy.trainerActive'),
    resultBodyGym: t('marketplace:marketplacePages.copy.resultBodyGym'),
    resultBodyPt: t('marketplace:marketplacePages.copy.resultBodyPt'),
    continueMarketplace: t('marketplace:marketplacePages.copy.continueMarketplace'),
    paymentDone: t('marketplace:marketplacePages.copy.paymentDone'),
    noResults: t('marketplace:marketplacePages.copy.noResults'),
    location: t('marketplace:marketplacePages.copy.location'),
    gymType: t('marketplace:marketplacePages.copy.gymType'),
    boutique: t('marketplace:marketplacePages.copy.boutique'),
    strength: t('marketplace:marketplacePages.copy.strength'),
    fullService: t('marketplace:marketplacePages.copy.fullService'),
  };
}

function useMarketplaceCopy() {
  const { t } = useTranslation();
  const { language } = useLocale();
  return { language, copy: getCopy(t) };
}

function localize(value: LocalizedText, language: Language) {
  return value[language];
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
  const { language, copy } = useMarketplaceCopy();
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
          <MapPin size={14} /> {localize(gym.area, language)}
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
  const { language, copy } = useMarketplaceCopy();
  const navigate = useNavigate();
  const selectGymOffer = useMarketplaceStore((state) => state.selectGymOffer);
  return (
    <article className={`marketplace-offer ${offer.popular ? 'is-popular' : ''}`}>
      <header>
        <span>{offer.popular ? copy.popular : `${offer.durationDays} ${copy.days}`}</span>
        {offer.plusEligible && <Sparkles size={17} />}
      </header>
      <h3>{localize(offer.name, language)}</h3>
      <strong>{money(offer.servicePriceVnd - offer.serviceDiscountVnd)}</strong>
      {offer.serviceDiscountVnd > 0 && <del>{money(offer.servicePriceVnd)}</del>}
      <ul>
        {offer.features.map((feature) => (
          <li key={feature.en}>
            <Check size={14} /> {localize(feature, language)}
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
  const { language, copy } = useMarketplaceCopy();
  const gym = getGym(trainer.gymId);
  return (
    <article className="marketplace-trainer-card">
      <div className="marketplace-trainer-avatar" style={{ background: trainer.accent }}>
        {trainer.initials}
      </div>
      <div>
        <span>{gym?.name}</span>
        <h2>{trainer.fullName}</h2>
        <p>{trainer.specialties.map((item) => localize(item, language)).join(' · ')}</p>
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
  const { language, copy } = useMarketplaceCopy();
  const navigate = useNavigate();
  const trainer = getTrainer(trainerPackage.trainerId);
  const gym = getGym(trainerPackage.gymId);
  const selectPtPackage = useMarketplaceStore((state) => state.selectPtPackage);
  return (
    <article className="marketplace-package-card">
      <span>
        {trainer?.fullName} · {gym?.name}
      </span>
      <h3>{localize(trainerPackage.name, language)}</h3>
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
            <Check size={14} /> {localize(feature, language)}
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
  const { language, copy } = useMarketplaceCopy();
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('all');
  const [type, setType] = useState('all');
  const gyms = marketplaceGyms.filter((gym) => {
    const haystack = `${gym.name} ${localize(gym.area, language)}`.toLowerCase();
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
            {GYM_CITIES.map((item) => (
              <option key={item} value={item}>
                {copy.cities[item]}
              </option>
            ))}
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
  const { language, copy } = useMarketplaceCopy();
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
            <MapPin size={15} /> {localize(gym.address, language)}
          </p>
          <p>{localize(gym.description, language)}</p>
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
              <Check size={15} /> {localize(facility, language)}
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
  const { language, copy } = useMarketplaceCopy();
  const [query, setQuery] = useState('');
  const trainers = marketplaceTrainers.filter((trainer) =>
    `${trainer.fullName} ${trainer.specialties.map((item) => localize(item, language)).join(' ')}`
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
  const { language, copy } = useMarketplaceCopy();
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
          <p>{trainer.specialties.map((item) => localize(item, language)).join(' · ')}</p>
          <div className="marketplace-rating">
            <Star size={14} fill="currentColor" /> {trainer.rating} · {trainer.experienceYears}{' '}
            {copy.experience}
          </div>
          <blockquote>{localize(trainer.bio, language)}</blockquote>
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
  const { copy, language } = useMarketplaceCopy();
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
    ? localize(selectedOffer.name, language)
    : selectedPackage
      ? localize(selectedPackage.name, language)
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
                  <input required placeholder={copy.cardHolderPlaceholder} />
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
  const { copy, language } = useMarketplaceCopy();
  const order = useMarketplaceStore((state) => state.orders.find((item) => item.id === orderId));
  if (!order) return <Navigate to={ROUTES.member.marketplace} replace />;
  const success = order.paymentStatus === 'succeeded';
  const orderedProduct =
    order.selection.kind === 'gym_offer'
      ? gymOffers.find((offer) => offer.id === order.selection.productId)
      : ptPackages.find((trainerPackage) => trainerPackage.id === order.selection.productId);
  const orderTitle = orderedProduct ? localize(orderedProduct.name, language) : order.title;
  return (
    <div className="marketplace-page">
      <section className={`marketplace-result ${success ? 'is-success' : 'is-failed'}`}>
        <span className="marketplace-result__icon">
          {success ? <Check size={34} /> : <CreditCard size={34} />}
        </span>
        <span>
          {BRAND_MARK.toUpperCase()} / {copy.orderConfirmation}
        </span>
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
