import { FileVideo, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Capability } from '../api/movementRuntimeApi';

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

export function ReferenceUpload({
  capability,
  busy,
  error,
  onClose,
  onUpload,
  uploadProgress,
}: {
  capability: Capability;
  busy: boolean;
  error: unknown;
  onClose: () => void;
  onUpload: (file: File) => Promise<boolean>;
  uploadProgress?: { loaded: number; total: number };
}) {
  const { t } = useTranslation('movementStudio');
  const [file, setFile] = useState<File>();
  const [invalid, setInvalid] = useState(false);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="studio-dialog"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t('uploadTitle')}</DialogTitle>
          <DialogDescription>{t('uploadHelp')}</DialogDescription>
        </DialogHeader>
        <StudioError error={error} />
        <div className="studio-upload-guidance">
          <strong>
            {t(`capabilities.${capability.code}`, { defaultValue: capability.label })}
          </strong>
          <p>
            {capability.views
              ?.map((view) => t(`views.${view}`, { defaultValue: view }))
              .join(' · ')}
          </p>
          <p>
            {capability.requiredRegions
              .map((region) => t(`regions.${region}`, { defaultValue: region }))
              .join(' · ')}
          </p>
        </div>
        <label className="studio-file-drop">
          <UploadCloud size={32} aria-hidden />
          <strong>{t('chooseVideo')}</strong>
          <span>{t('uploadLimit')}</span>
          <input
            type="file"
            accept="video/mp4,.mp4"
            aria-label={t('chooseVideo')}
            disabled={busy}
            onChange={(event) => {
              const next = event.target.files?.[0];
              const valid = Boolean(
                next && /\.mp4$/i.test(next.name) && next.size <= 500_000_000 && next.size > 0,
              );
              setInvalid(Boolean(next && !valid));
              setFile(valid ? next : undefined);
            }}
          />
        </label>
        {file ? (
          <div className="studio-selected-file">
            <FileVideo size={22} aria-hidden />
            <strong>{file.name}</strong>
            <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          </div>
        ) : null}
        {invalid ? (
          <p role="alert" className="text-sm text-destructive">
            {t('fileTooLarge')}
          </p>
        ) : null}
        {busy ? (
          <p role="status" className="studio-inline-warning">
            {uploadProgress
              ? t('uploadBytes', {
                  loaded: (uploadProgress.loaded / 1e6).toFixed(1),
                  total: (uploadProgress.total / 1e6).toFixed(1),
                })
              : t('savingSubmission')}
          </p>
        ) : null}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            disabled={!file || busy}
            onClick={() => {
              if (file)
                void onUpload(file).then((saved) => {
                  if (saved) onClose();
                });
            }}
          >
            {t(busy ? 'loading' : 'process')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
