import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExerciseInput } from '../api/movementRuntimeApi';
import type { ExerciseDto } from '../api/types';
import { patterns } from '../model/studio';

import { StudioError } from './StudioPrimitives';

import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';

export function ExerciseEditor({
  exercise,
  pattern,
  busy,
  error: requestError,
  onClose,
  onSave,
}: {
  exercise?: ExerciseDto;
  pattern?: string;
  busy: boolean;
  error?: unknown;
  onClose: () => void;
  onSave: (input: ExerciseInput) => Promise<boolean>;
}) {
  const { t } = useTranslation('movementStudio');
  const [value, setValue] = useState<ExerciseInput>({
    name: exercise?.name ?? '',
    equipment: exercise?.equipment ?? '',
    muscleGroup: exercise?.muscleGroup ?? '',
    instructions: exercise?.instructions ?? '',
    pattern: pattern && patterns.some((item) => item === pattern) ? pattern : 'OTHER',
    isActive: exercise?.isActive ?? true,
  });
  const [error, setError] = useState<unknown>();
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="studio-dialog max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t(exercise ? 'edit' : 'create')}</DialogTitle>
          <DialogDescription>{t(exercise ? 'editHelp' : 'createHelp')}</DialogDescription>
        </DialogHeader>
        <form
          className="studio-form"
          onSubmit={(event) => {
            event.preventDefault();
            setError(undefined);
            void onSave(value)
              .then((saved) => {
                if (saved) onClose();
              })
              .catch(setError);
          }}
        >
          <StudioError error={error ?? requestError} />
          <label>
            {t('fields.name')}
            <Input
              autoFocus
              required
              maxLength={200}
              placeholder={t('fields.nameHint')}
              value={value.name}
              onChange={(event) => setValue({ ...value, name: event.target.value })}
            />
            <small>{t('fields.nameHelp')}</small>
          </label>
          <label>
            {t('fields.pattern')}
            <select
              value={value.pattern}
              onChange={(event) => setValue({ ...value, pattern: event.target.value })}
            >
              {patterns.map((item) => (
                <option key={item} value={item}>
                  {t(`patterns.${item}`)}
                </option>
              ))}
            </select>
          </label>
          <div className="studio-form-pair">
            {(['equipment', 'muscleGroup'] as const).map((key) => (
              <label key={key}>
                {t(`fields.${key}`)}
                <Input
                  maxLength={200}
                  value={value[key]}
                  onChange={(event) => setValue({ ...value, [key]: event.target.value })}
                />
              </label>
            ))}
          </div>
          <label>
            {t('fields.instructions')}
            <textarea
              maxLength={4000}
              rows={3}
              value={value.instructions}
              onChange={(event) => setValue({ ...value, instructions: event.target.value })}
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={busy || !value.name.trim()}>
              {t(busy ? 'loading' : exercise ? 'save' : 'create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
