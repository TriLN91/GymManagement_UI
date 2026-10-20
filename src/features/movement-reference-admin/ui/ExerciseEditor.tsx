import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ExerciseInput, ExerciseMetadataCatalog } from '../api/movementRuntimeApi';
import type { ExerciseDto } from '../api/types';
import { patterns } from '../model/studio';

import { ExerciseMuscleTargets } from './ExerciseMuscleTargets';
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
  catalog,
  supportedPatterns,
  creationSaved = false,
  pattern,
  busy,
  error: requestError,
  onClose,
  onSave,
}: {
  exercise?: ExerciseDto;
  catalog: ExerciseMetadataCatalog;
  supportedPatterns: string[];
  creationSaved?: boolean;
  pattern?: string;
  busy: boolean;
  error?: unknown;
  onClose: () => void;
  onSave: (input: ExerciseInput, footage?: File) => Promise<boolean>;
}) {
  const { t } = useTranslation('movementStudio');
  const [value, setValue] = useState<ExerciseInput>({
    name: exercise?.name ?? '',
    equipment: exercise?.equipment ?? '',
    muscleGroup: exercise?.muscleGroup ?? '',
    instructions: exercise?.instructions ?? '',
    pattern: pattern && patterns.some((item) => item === pattern) ? pattern : 'OTHER',
    isActive: exercise?.isActive ?? true,
    targetMuscles: exercise?.targetMuscles ?? [],
    metadataRevision: exercise?.metadataRevision ?? 0,
  });
  const [footage, setFootage] = useState<File>();
  const [invalidVideo, setInvalidVideo] = useState(false);
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
            void onSave(value, footage)
              .then((saved) => {
                if (saved) onClose();
              })
              .catch(setError);
          }}
        >
          <StudioError error={error ?? requestError} />
          {creationSaved ? <p role="status">{t('creationSaved')}</p> : null}
          <fieldset disabled={busy || creationSaved} className="studio-form">
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
                onChange={(event) => {
                  setValue({ ...value, pattern: event.target.value });
                  if (!supportedPatterns.includes(event.target.value)) setFootage(undefined);
                }}
              >
                {patterns.map((item) => (
                  <option key={item} value={item}>
                    {t(`patterns.${item}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('fields.equipment')}
              <select
                value={value.equipment}
                onChange={(event) => setValue({ ...value, equipment: event.target.value })}
              >
                <option value="">{t('unspecified')}</option>
                {[
                  ...new Set([...catalog.equipment, ...(value.equipment ? [value.equipment] : [])]),
                ].map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <ExerciseMuscleTargets
              value={value.targetMuscles ?? []}
              disabled={busy}
              onChange={(targetMuscles) => setValue({ ...value, targetMuscles })}
            />
            <label>
              {t('fields.instructions')}
              <textarea
                maxLength={4000}
                rows={3}
                value={value.instructions}
                onChange={(event) => setValue({ ...value, instructions: event.target.value })}
              />
            </label>
          </fieldset>
          {!exercise ? (
            <section className="studio-config-section">
              <h3>{t('createFootage')}</h3>
              <p>{t('createFootageHelp')}</p>
              {supportedPatterns.includes(value.pattern) ? (
                <label>
                  {t('chooseVideo')}
                  <input
                    type="file"
                    accept="video/mp4,.mp4"
                    disabled={busy}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      const valid =
                        !!file &&
                        /\.mp4$/i.test(file.name) &&
                        file.size > 0 &&
                        file.size <= 500_000_000;
                      setInvalidVideo(!!file && !valid);
                      setFootage(valid ? file : undefined);
                    }}
                  />
                </label>
              ) : (
                <p>{t('catalogOnlyUnsupported')}</p>
              )}
              {invalidVideo ? <p role="alert">{t('fileTooLarge')}</p> : null}
              <p role="status">
                {busy
                  ? t('creationProcessing')
                  : footage
                    ? t('creationWithFootage')
                    : t('catalogOnly')}
              </p>
            </section>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={
                busy ||
                !value.name.trim() ||
                invalidVideo ||
                !value.targetMuscles?.some((m) => m.role === 'PRIMARY') ||
                (!!footage && !supportedPatterns.includes(value.pattern)) ||
                Boolean(
                  value.targetMuscles?.length &&
                  !value.targetMuscles.some((m) => m.role === 'PRIMARY'),
                )
              }
            >
              {t(
                busy
                  ? 'loading'
                  : exercise
                    ? 'save'
                    : footage
                      ? 'createAndProcess'
                      : 'createCatalog',
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
