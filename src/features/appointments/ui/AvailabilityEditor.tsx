import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { AvailabilityDto, AvailabilitySlotDto } from '../api/types';
import { errorText } from '../model/format';
import { useMyAvailability, useSetAvailability } from '../model/useAppointments';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

import './appointments.css';

const DAYS = [1, 2, 3, 4, 5, 6, 0];

function Editor({ availability }: { availability: AvailabilityDto }) {
  const { t } = useTranslation('appointments');
  const save = useSetAvailability();
  const [slots, setSlots] = useState<AvailabilitySlotDto[]>(availability.slots);

  const update = (index: number, patch: Partial<AvailabilitySlotDto>) =>
    setSlots((current) => current.map((s, i) => (i === index ? { ...s, ...patch } : s)));

  const submit = async () => {
    try {
      await save.mutateAsync(slots);
      toast.success(t('availability.saved'));
    } catch (error) {
      toast.error(errorText(error, t('toast.failed')));
    }
  };

  return (
    <section className="appointment-section appointment-availability">
      <h2>{t('availability.heading')}</h2>
      <p className="appointment-hint">
        {t('availability.hint', { offset: availability.utcOffsetHours })}
      </p>
      {slots.length === 0 ? <p>{t('availability.empty')}</p> : null}
      {slots.map((slot, index) => (
        <div className="appointment-slot" key={index}>
          <label>
            {t('availability.day')}
            <Select
              value={slot.dayOfWeek}
              onChange={(event) => update(index, { dayOfWeek: Number(event.target.value) })}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {t(`propose.dayShort.${day}`)}
                </option>
              ))}
            </Select>
          </label>
          <label>
            {t('availability.start')}
            <Input
              type="time"
              value={slot.startTime}
              onChange={(event) => update(index, { startTime: event.target.value })}
            />
          </label>
          <label>
            {t('availability.end')}
            <Input
              type="time"
              value={slot.endTime}
              onChange={(event) => update(index, { endTime: event.target.value })}
            />
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setSlots((current) => current.filter((_, i) => i !== index))}
          >
            {t('availability.remove')}
          </Button>
        </div>
      ))}
      <div className="appointment-actions">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            setSlots((current) => [
              ...current,
              { gymBranchId: null, dayOfWeek: 1, startTime: '08:00', endTime: '12:00' },
            ])
          }
        >
          {t('availability.add')}
        </Button>
        <Button type="button" size="sm" disabled={save.isPending} onClick={() => void submit()}>
          {t('availability.save')}
        </Button>
      </div>
    </section>
  );
}

/** Weekly windows (local time) in which a Trainer accepts bookings. */
export function AvailabilityEditor() {
  const { t } = useTranslation('appointments');
  const availability = useMyAvailability();
  if (availability.isPending) return <p role="status">{t('list.loading')}</p>;
  if (availability.isError) return <p role="alert">{t('list.error')}</p>;
  return <Editor availability={availability.data} />;
}
