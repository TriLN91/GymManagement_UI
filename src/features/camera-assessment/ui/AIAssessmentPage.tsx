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

function getCopy(isVi: boolean) {
  return isVi
    ? {
        upload: 'Chọn video bài tập',
        replace: 'Chọn video khác',
        empty: 'Chọn video quay toàn thân và nhìn rõ khớp vận động.',
        formats: 'Hỗ trợ video MP4, MOV hoặc WebM trên thiết bị.',
        file: 'Tệp đã chọn',
        size: 'Dung lượng',
        queue: 'Gửi video để đánh giá',
        queued: 'Video đã được đưa vào hàng chờ.',
        pendingTitle: 'Video đã sẵn sàng',
        pendingBody: 'Điểm và nhận xét sẽ xuất hiện khi dịch vụ phân tích động tác được kết nối.',
        resume: 'Quay lại buổi tập',
        schedule: 'Về lịch tập',
        noExercise: 'Chưa chọn bài tập',
      }
    : {
        upload: 'Choose workout video',
        replace: 'Choose another video',
        empty: 'Choose a full-body video with the working joints clearly visible.',
        formats: 'Supports MP4, MOV, or WebM video from this device.',
        file: 'Selected file',
        size: 'File size',
        queue: 'Submit for assessment',
        queued: 'Video added to the assessment queue.',
        pendingTitle: 'Video is ready',
        pendingBody: 'Scores and feedback will appear when the form-analysis service is connected.',
        resume: 'Resume workout',
        schedule: 'Back to schedule',
        noExercise: 'No exercise selected',
      };
}

export function AIAssessmentPage() {
  const { exerciseId: routeExerciseId } = useParams();
  const { i18n, t } = useTranslation('workout');
  const copy = getCopy(i18n.resolvedLanguage === 'vi');
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
