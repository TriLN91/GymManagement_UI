import { useRef, useState } from 'react';
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
  initialInput,
  pattern,
  busy,
  error: requestError,
  uploadProgress,
  onClose,
  onSave,
}: {
  exercise?: ExerciseDto;
  catalog: ExerciseMetadataCatalog;
  supportedPatterns: string[];
  creationSaved?: boolean;
  initialInput?: ExerciseInput;
  pattern?: string;
  busy: boolean;
  error?: unknown;
  uploadProgress?: { loaded: number; total: number };
  onClose: () => void;
  onSave: (input: ExerciseInput, footage?: File) => Promise<boolean>;
}) {
  const { t } = useTranslation('movementStudio');
  const submitting = useRef(false);
  const [value, setValue] = useState<ExerciseInput>(
    initialInput ?? {
      name: exercise?.name ?? '',
      equipment: exercise?.equipment ?? '',
      muscleGroup: exercise?.muscleGroup ?? '',
      instructions: exercise?.instructions ?? '',
      pattern: pattern && patterns.some((item) => item === pattern) ? pattern : 'OTHER',
      isActive: exercise?.isActive ?? true,
      targetMuscles: exercise?.targetMuscles ?? [],
      metadataRevision: exercise?.metadataRevision ?? 0,
    },
  );
  const [variation, setVariation] = useState('');
  const [footage, setFootage] = useState<File>();
  const [invalidVideo, setInvalidVideo] = useState(false);
  const [error, setError] = useState<unknown>();
  const valid = Boolean(
    value.name.trim() && value.targetMuscles?.some((m) => m.role === 'PRIMARY'),
  );
  const submit = async (withVideo: boolean) => {
    if (submitting.current || busy || !valid) return;
    submitting.current = true;
    setError(undefined);
    try {
      const input = variation.trim()
        ? { ...value, name: `${value.name.trim()} — ${variation.trim()}` }
        : value;
      if (await onSave(input, withVideo ? footage : undefined)) onClose();
    } catch (failure) {
      setError(failure);
    } finally {
      submitting.current = false;
    }
  };
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="studio-dialog studio-create-dialog"
        onEscapeKeyDown={(e) => {
          if (busy) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (busy) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t(exercise ? 'edit' : 'create')}</DialogTitle>
          <DialogDescription>{t(exercise ? 'editHelp' : 'createHelp')}</DialogDescription>
        </DialogHeader>
        <form
          className="studio-create-form"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(creationSaved);
          }}
        >
          <div className="studio-create-body">
            <StudioError error={error ?? requestError} />
            {creationSaved ? <p role="status">{t('creationSaved')}</p> : null}
            <div className="studio-create-top">
              <fieldset disabled={busy || creationSaved} className="studio-form">
                <label>
                  {t('fields.name')}
                  <Input
                    autoFocus
                    required
                    maxLength={160}
                    placeholder={t('fields.nameHint')}
                    value={value.name}
                    onChange={(e) => setValue({ ...value, name: e.target.value })}
                  />
                </label>
                {!exercise && !creationSaved ? (
                  <label>
                    {t('variation')}
                    <Input
                      maxLength={35}
                      value={variation}
                      onChange={(e) => setVariation(e.target.value)}
                      placeholder={t('variationHint')}
                    />
                  </label>
                ) : null}
                <label>
                  {t('fields.pattern')}
                  <select
                    value={value.pattern}
                    onChange={(e) => setValue({ ...value, pattern: e.target.value })}
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
                    onChange={(e) => setValue({ ...value, equipment: e.target.value })}
                  >
                    <option value="">{t('unspecified')}</option>
                    {[
                      ...new Set([
                        ...catalog.equipment,
                        ...(value.equipment ? [value.equipment] : []),
                      ]),
                    ].map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
              {!exercise ? (
                <section className="studio-upload-card">
                  <h3>{t('createFootage')}</h3>
                  <p>{t('createFootageHelp')}</p>
                  <label>
                    {t('chooseVideo')}
                    <input
                      type="file"
                      accept="video/mp4,.mp4"
                      disabled={busy}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
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
                  <small>{t('videoGuidance')}</small>
                  {footage ? (
                    <p>
                      {footage.name} · {(footage.size / 1_000_000).toFixed(1)} MB{' '}
                      <button type="button" disabled={busy} onClick={() => setFootage(undefined)}>
                        {t('remove')}
                      </button>
                    </p>
                  ) : null}
                  {invalidVideo ? <p role="alert">{t('fileTooLarge')}</p> : null}
                  {!supportedPatterns.includes(value.pattern) ? (
                    <p>{t('catalogOnlyUnsupported')}</p>
                  ) : null}
                  <p>{t(footage ? 'creationWithFootage' : 'catalogOnly')}</p>
                </section>
              ) : null}
            </div>
            <fieldset disabled={busy || creationSaved} className="studio-form">
              <ExerciseMuscleTargets
                value={value.targetMuscles ?? []}
                disabled={busy || creationSaved}
                onChange={(targetMuscles) => setValue({ ...value, targetMuscles })}
              />
              <label>
                {t('fields.instructions')}
                <textarea
                  maxLength={4000}
                  rows={3}
                  value={value.instructions}
                  onChange={(e) => setValue({ ...value, instructions: e.target.value })}
                />
              </label>
            </fieldset>
          </div>
          {busy ? (
            <div role="status" className="studio-upload-status">
              {uploadProgress ? (
                <>
                  <p>
                    {t('uploadBytes', {
                      loaded: (uploadProgress.loaded / 1_000_000).toFixed(1),
                      total: (uploadProgress.total / 1_000_000).toFixed(1),
                    })}
                  </p>
                  <progress max={uploadProgress.total} value={uploadProgress.loaded} />
                  <small>{t('uploadNotProcessing')}</small>
                </>
              ) : (
                t('savingSubmission')
              )}
            </div>
          ) : null}
          <DialogFooter className="studio-create-footer">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant={exercise ? 'default' : 'outline'}
              disabled={busy || !valid}
            >
              {t(creationSaved ? 'resumeCreation' : exercise ? 'save' : 'createCatalog')}
            </Button>
            {!exercise && !creationSaved ? (
              <Button
                type="button"
                disabled={
                  busy ||
                  !valid ||
                  !footage ||
                  invalidVideo ||
                  !supportedPatterns.includes(value.pattern)
                }
                onClick={() => void submit(true)}
              >
                {t('createAndProcess')}
              </Button>
            ) : null}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
