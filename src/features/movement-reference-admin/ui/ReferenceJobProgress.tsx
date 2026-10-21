import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { referenceJobsApi, type ReferenceJob } from '../api/referenceJobsApi';
import { rememberJob } from '../model/creationSession';

import { StudioError } from './StudioPrimitives';

import { Button } from '@/shared/ui/button';
export function ReferenceJobProgress({
  id,
  owner,
  onReady,
  onOpen,
}: {
  id: string;
  owner: string;
  onReady: () => void;
  onOpen: (job: ReferenceJob) => void;
}) {
  const { t } = useTranslation('movementStudio');
  const [job, setJob] = useState<ReferenceJob>();
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const [bytes, setBytes] = useState<{ loaded: number; total: number }>();
  const [replacementName, setReplacementName] = useState('');
  const inFlight = useRef(false);
  const replacement = useRef<{ file: File; key: string } | undefined>(undefined);
  const ready = useRef(onReady);
  ready.current = onReady;
  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const result = await referenceJobsApi.get(id);
        if (!alive) return;
        setJob(result);
        setError(undefined);
        rememberJob(owner, result);
        if (result.state === 'QUEUED' || result.state === 'PROCESSING')
          timer = setTimeout(() => void poll(), 1500);
        else ready.current();
      } catch (failure) {
        if (alive) {
          setError(failure);
          timer = setTimeout(() => void poll(), 5000);
        }
      }
    };
    setJob(undefined);
    replacement.current = undefined;
    setReplacementName('');
    void poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [id, owner]);
  const run = async (work: () => Promise<ReferenceJob>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(undefined);
    try {
      const result = await work();
      rememberJob(owner, result);
      onOpen(result);
    } catch (failure) {
      setError(failure);
    } finally {
      inFlight.current = false;
      setBusy(false);
      setBytes(undefined);
    }
  };
  return (
    <section className="studio-job" aria-label={t('referenceProgress')}>
      <h2>{t('referenceProgress')}</h2>
      <p>{job?.fileName}</p>
      <p role="status">{t(`jobStates.${job?.state ?? 'LOADING'}`)}</p>
      <p>{t('jobReturnHelp')}</p>
      {job?.errorMessage ? <p role="alert">{job.errorMessage}</p> : null}
      <StudioError error={error} />
      {bytes ? (
        <p role="status">
          {t('uploadBytes', {
            loaded: (bytes.loaded / 1e6).toFixed(1),
            total: (bytes.total / 1e6).toFixed(1),
          })}
        </p>
      ) : null}
      {job?.state === 'COMPLETED' ? (
        <Button
          onClick={() => {
            document.querySelector('.studio-source-strip')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {t('reviewExtracted')}
        </Button>
      ) : null}
      {job?.canRetry ? (
        <div className="studio-job-actions">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void run(() => referenceJobsApi.retry(id, `retry:${id}`))}
          >
            {t('retryStoredVideo')}
          </Button>
          <label>
            {t('replaceVideo')}
            <input
              type="file"
              accept=".mp4,video/mp4"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!/\.mp4$/i.test(file.name) || file.size <= 0 || file.size > 500_000_000) {
                  setError(new Error(t('fileTooLarge')));
                  return;
                }
                replacement.current = {
                  file,
                  key: `replace:${id}:${file.size}:${file.lastModified}`,
                };
                setReplacementName(`${file.name} · ${(file.size / 1e6).toFixed(1)} MB`);
              }}
            />
          </label>
          {replacementName ? <p>{replacementName}</p> : null}
          <Button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const saved = replacement.current;
                if (!saved) throw new Error(t('selectReplacement'));
                const existing = await referenceJobsApi.byClient(saved.key);
                return (
                  existing ??
                  referenceJobsApi.queue(
                    job.referenceSetId,
                    saved.file,
                    saved.key,
                    (loaded, total) => setBytes({ loaded, total }),
                    id,
                  )
                );
              })
            }
          >
            {t('uploadReplacement')}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
