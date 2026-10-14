import type { TFunction } from 'i18next';
import { ArrowLeft, CheckCircle2, Film, ScanLine, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAssessmentStore } from '../model/useAssessmentStore';

import { getWorkoutDay } from '@/features/workout-plans/model/demoWorkoutFlow';
import { useWorkoutSessionStore } from '@/features/workout-plans/model/useWorkoutSessionStore';
import { ROUTES } from '@/shared/config/constants';

import './ai-assessment.css';

interface AssessmentLocationState {
  returnTo?: string;
}

function getCopy(t: TFunction) {
  return {
    upload: t('assessment:aIAssessment.copy.upload'),
    replace: t('assessment:aIAssessment.copy.replace'),
    empty: t('assessment:aIAssessment.copy.empty'),
    formats: t('assessment:aIAssessment.copy.formats'),
    file: t('assessment:aIAssessment.copy.file'),
    size: t('assessment:aIAssessment.copy.size'),
    queue: t('assessment:aIAssessment.copy.queue'),
    queued: t('assessment:aIAssessment.copy.queued'),
    pendingTitle: t('assessment:aIAssessment.copy.pendingTitle'),
    pendingBody: t('assessment:aIAssessment.copy.pendingBody'),
    resume: t('assessment:aIAssessment.copy.resume'),
    schedule: t('assessment:aIAssessment.copy.schedule'),
    noExercise: t('assessment:aIAssessment.copy.noExercise'),
  };
}

export function AIAssessmentPage() {
  const { exerciseId: routeExerciseId } = useParams();
  const { t } = useTranslation('workout');
  const copy = getCopy(t);
  const navigate = useNavigate();
  const location = useLocation();
  const activeSession = useWorkoutSessionStore((state) => state.activeSession);
  const queueAssessment = useAssessmentStore((state) => state.queueAssessment);
  const [video, setVideo] = useState<File | null>(null);
  const [queued, setQueued] = useState(false);
  const previewUrl = useMemo(() => (video ? URL.createObjectURL(video) : null), [video]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const day = activeSession ? getWorkoutDay(activeSession.dayId) : undefined;
  const sessionExerciseId = day?.exercises[activeSession?.currentExerciseIndex ?? 0]?.id;
  const exerciseId = routeExerciseId ?? sessionExerciseId;
  const state = location.state as AssessmentLocationState | null;
  const returnTo =
    state?.returnTo ??
    (activeSession
      ? ROUTES.member.workoutSessionPath(activeSession.dayId)
      : ROUTES.member.workoutSchedule);
  const exerciseName = exerciseId
    ? t(`flow.exercises.${exerciseId}`, { defaultValue: exerciseId })
    : copy.noExercise;

  const handleQueue = () => {
    if (!video || !exerciseId) return;
    queueAssessment({
      exerciseId,
      sessionId: activeSession?.id,
      fileName: video.name,
      fileSize: video.size,
    });
    setQueued(true);
    toast.success(copy.queued);
  };

  return (
    <div className="ai-assessment">
      <header className="ai-assessment__header">
        <button type="button" onClick={() => navigate(returnTo)}>
          <ArrowLeft size={17} /> {activeSession ? copy.resume : copy.schedule}
        </button>
      </header>

      <main className="ai-assessment__main">
        <div className="ai-assessment__exercise-context">
          <ScanLine aria-hidden="true" size={28} />
          <strong>{exerciseName}</strong>
        </div>

        <section className="ai-assessment__workspace">
          <div className="ai-assessment__preview">
            {previewUrl ? (
              <video src={previewUrl} controls preload="metadata" aria-label={exerciseName} />
            ) : (
              <div>
                <Film aria-hidden="true" size={42} />
                <span>{copy.empty}</span>
              </div>
            )}
          </div>

          <aside className="ai-assessment__controls">
            <label className="ai-assessment__upload">
              <Upload aria-hidden="true" size={18} />
              {video ? copy.replace : copy.upload}
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/*"
                onChange={(event) => {
                  setVideo(event.target.files?.[0] ?? null);
                  setQueued(false);
                }}
              />
            </label>
            <span>{copy.formats}</span>

            {video && (
              <dl>
                <div>
                  <dt>{copy.file}</dt>
                  <dd>{video.name}</dd>
                </div>
                <div>
                  <dt>{copy.size}</dt>
                  <dd>{(video.size / 1024 / 1024).toFixed(1)} MB</dd>
                </div>
              </dl>
            )}

            <button
              className="ai-assessment__submit"
              type="button"
              disabled={!video || !exerciseId || queued}
              onClick={handleQueue}
            >
              {queued ? <CheckCircle2 size={18} /> : <ScanLine size={18} />}
              {queued ? copy.queued : copy.queue}
            </button>

            {queued && (
              <div className="ai-assessment__pending" role="status">
                <strong>{copy.pendingTitle}</strong>
                <span>{copy.pendingBody}</span>
              </div>
            )}
          </aside>
        </section>

        <button className="ai-assessment__resume" type="button" onClick={() => navigate(returnTo)}>
          <ArrowLeft size={17} /> {activeSession ? copy.resume : copy.schedule}
        </button>
      </main>
    </div>
  );
}
