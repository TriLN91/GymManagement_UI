import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  useCreateTrainerService,
  useSetTrainerServiceActive,
  useTrainerServices,
} from '../model/useTrainerServices';

import { useOwnerTrainers } from '@/features/gym-owner-training';
import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { WorkspacePage, WorkspacePanel } from '@/shared/ui/workspace';

const errorText = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

/** Gym Admin defines what each Trainer sells: a named session with a duration and a price (FR-CF03 / CF04 package). */
export function TrainerServicesPage() {
  const { t } = useTranslation('trainerServices');
  const { locale } = useLocale();
  const trainers = useOwnerTrainers();
  const [chosen, setChosen] = useState('');
  const trainerId = chosen || trainers.data?.[0]?.trainerProfileId || '';

  const services = useTrainerServices(trainerId);
  const create = useCreateTrainerService(trainerId);
  const toggle = useSetTrainerServiceActive(trainerId);

  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState(60);
  const [price, setPrice] = useState(0);

  const money = (value: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

  const submit = async () => {
    try {
      await create.mutateAsync({ name: name.trim(), durationMinutes: minutes, price });
      toast.success(t('created'));
      setName('');
    } catch (error) {
      toast.error(errorText(error, t('failed')));
    }
  };

  return (
    <WorkspacePage className="gym-training-page">
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>

      <WorkspacePanel>
        {trainers.isSuccess && trainers.data.length === 0 ? <p>{t('noTrainers')}</p> : null}
        <Label htmlFor="service-trainer">{t('trainer')}</Label>
        <Select id="service-trainer" value={trainerId} onChange={(e) => setChosen(e.target.value)}>
          {(trainers.data ?? []).map((trainer) => (
            <option key={trainer.trainerProfileId} value={trainer.trainerProfileId}>
              {trainer.fullName}
            </option>
          ))}
        </Select>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div>
            <Label htmlFor="service-name">{t('name')}</Label>
            <Input
              id="service-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="service-minutes">{t('minutes')}</Label>
            <Input
              id="service-minutes"
              type="number"
              min={15}
              max={480}
              required
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="service-price">{t('price')}</Label>
            <Input
              id="service-price"
              type="number"
              min={0}
              step={1000}
              required
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>
          <Button
            type="submit"
            disabled={create.isPending || trainerId === '' || name.trim() === ''}
          >
            {t('add')}
          </Button>
        </form>
      </WorkspacePanel>

      <WorkspacePanel>
        <h2>{t('listTitle')}</h2>
        {services.isPending && trainerId !== '' ? <p role="status">{t('loading')}</p> : null}
        {services.isError ? <p role="alert">{t('loadFailed')}</p> : null}
        {services.isSuccess && services.data.length === 0 ? <p>{t('empty')}</p> : null}
        <ul className="space-y-2">
          {(services.data ?? []).map((service) => (
            <li key={service.id} data-testid="trainer-service">
              <strong>{service.name}</strong> ·{' '}
              {t('minutesShort', { count: service.durationMinutes })} ·{' '}
              {money(service.price, service.currencyCode)} ·{' '}
              <span>{service.isActive ? t('active') : t('inactive')}</span>
              <Button
                size="sm"
                variant="outline"
                style={{ marginLeft: 8 }}
                disabled={toggle.isPending}
                onClick={() =>
                  toggle.mutate(
                    { serviceId: service.id, active: !service.isActive },
                    { onError: (error) => toast.error(errorText(error, t('failed'))) },
                  )
                }
              >
                {service.isActive ? t('deactivate') : t('activate')}
              </Button>
            </li>
          ))}
        </ul>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
