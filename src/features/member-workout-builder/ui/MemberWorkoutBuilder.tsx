import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Dumbbell,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { isMuscleRelated, MUSCLES, type MuscleId } from '../model/muscleMapData';
import {
  memberExerciseCatalog,
  useMemberWorkoutBuilderStore,
  WEEKDAYS,
  type BuilderExercise,
  type BuilderSaveMode,
  type ExerciseCatalogItem,
  type Weekday,
} from '../model/useMemberWorkoutBuilderStore';

import { MaleAnatomyMuscleMap } from './MaleAnatomyMuscleMap';

import './member-workout-builder.css';

function getCopy(isVi: boolean) {
  return isVi
    ? {
        library: 'Thư viện bài tập',
        search: 'Tìm bài tập',
        category: 'Nhóm cơ mục tiêu',
        all: 'Tất cả nhóm cơ',
        builder: 'Tự tạo lịch tập',
        name: 'Đặt tên lịch tập',
        autosave: 'Bản nháp tự lưu trên thiết bị',
        exercises: 'bài tập',
        sets: 'tổng hiệp',
        targetSets: 'Số hiệp',
        reorder: 'Sắp xếp thứ tự',
        empty: 'Thêm bài tập từ thư viện để bắt đầu.',
        summary: 'Tổng quan lịch tập',
        estimated: 'Phút dự kiến',
        muscle: 'Khối lượng theo nhóm cơ',
        save: 'Lưu lịch tập',
        clear: 'Xóa bản nháp',
        saved: 'Đã lưu lịch tập cá nhân.',
        invalid: 'Hãy nhập tên và thêm ít nhất một bài tập.',
        target: 'Mục tiêu',
        reps: 'Số lần',
        load: 'Mức tạ',
        rest: 'Nghỉ',
        duration: 'Thời lượng',
        distance: 'Quãng đường',
        rounds: 'Số vòng',
        work: 'Thời gian tập',
        remove: 'Xóa bài tập',
        liveMuscleMap: 'Bản đồ nhóm cơ',
        clearMuscle: 'Xem tất cả',
        days: 'Ngày tập',
        newPlan: 'Tạo plan mới',
        optionalAddon: 'Thêm bài tập bổ sung',
        savedAddon: 'Đã thêm vào lịch cá nhân và không ảnh hưởng tiến độ plan chính.',
        scheduleMissing:
          'Hãy chọn ít nhất một ngày cho mỗi bài và không lặp cùng bài trong một ngày.',
        chooseDay: 'Chọn ít nhất một ngày tập',
        primary: 'Bài tác động chính',
        related: 'Bài tác động phụ',
      }
    : {
        library: 'Exercise library',
        search: 'Search exercises',
        category: 'Target muscle',
        all: 'All categories',
        builder: 'Build your workout',
        name: 'Name your workout',
        autosave: 'Draft auto-saved on this device',
        exercises: 'exercises',
        sets: 'total sets',
        targetSets: 'Sets',
        reorder: 'Reorder exercises',
        empty: 'Add exercises from the library to begin.',
        summary: 'Workout summary',
        estimated: 'Est. min',
        muscle: 'Volume by muscle',
        save: 'Save workout',
        clear: 'Clear draft',
        saved: 'Personal workout saved.',
        invalid: 'Enter a workout name and add at least one exercise.',
        target: 'Target',
        reps: 'Reps',
        load: 'Load',
        rest: 'Rest',
        duration: 'Duration',
        distance: 'Distance',
        rounds: 'Rounds',
        work: 'Work',
        remove: 'Remove exercise',
        liveMuscleMap: 'Live muscle map',
        clearMuscle: 'View all',
        days: 'Training days',
        newPlan: 'Create new plan',
        optionalAddon: 'Add as optional exercises',
        savedAddon: 'Added to your schedule without affecting main plan progress.',
        scheduleMissing:
          'Choose at least one day per exercise and do not repeat an exercise on the same day.',
        chooseDay: 'Choose at least one training day',
        primary: 'Primary exercises',
        related: 'Related exercises',
      };
}

function targetFields(
  item: ExerciseCatalogItem,
  exercise: BuilderExercise,
  update: (patch: Partial<BuilderExercise>) => void,
  copy: ReturnType<typeof getCopy>,
) {
  const field = (label: string, key: keyof BuilderExercise, suffix: string) => (
    <label>
      <span>{label}</span>
      <div>
        <input
          type="number"
          min="0"
          step={key === 'distanceKm' || key === 'loadKg' ? 0.5 : 1}
          value={exercise[key]}
          onChange={(event) => update({ [key]: Number(event.target.value) })}
        />
        <small>{suffix}</small>
      </div>
    </label>
  );

  if (item.trackingType === 'duration') {
    return (
      <>
        {field(copy.targetSets, 'sets', '')}
        {field(copy.duration, 'durationSeconds', 'sec')}
        {field(copy.rest, 'restSeconds', 'sec')}
      </>
    );
  }
  if (item.trackingType === 'distance') {
    return (
      <>
        {field(copy.distance, 'distanceKm', 'km')}
        {field(copy.duration, 'durationSeconds', 'sec')}
      </>
    );
  }
  if (item.trackingType === 'interval') {
    return (
      <>
        {field(copy.rounds, 'rounds', '')}
        {field(copy.work, 'workSeconds', 'sec')}
        {field(copy.rest, 'restSeconds', 'sec')}
      </>
    );
  }
  return (
    <>
      {field(copy.targetSets, 'sets', '')}
      {field(copy.reps, 'reps', '')}
      {field(copy.load, 'loadKg', 'kg')}
      {field(copy.rest, 'restSeconds', 'sec')}
    </>
  );
}

function toggleDay(days: Weekday[], day: Weekday): Weekday[] {
  return days.includes(day) ? days.filter((item) => item !== day) : [...days, day];
}

function weekdayLabel(day: Weekday, isVi: boolean): string {
  const labels: Record<Weekday, { en: string; vi: string }> = {
    monday: { en: 'Mon', vi: 'T2' },
    tuesday: { en: 'Tue', vi: 'T3' },
    wednesday: { en: 'Wed', vi: 'T4' },
    thursday: { en: 'Thu', vi: 'T5' },
    friday: { en: 'Fri', vi: 'T6' },
    saturday: { en: 'Sat', vi: 'T7' },
    sunday: { en: 'Sun', vi: 'CN' },
  };
  return labels[day][isVi ? 'vi' : 'en'];
}

function hasDuplicateExerciseDay(exercises: ReadonlyArray<BuilderExercise>): boolean {
  const keys = exercises.flatMap((exercise) =>
    exercise.days.map((day) => `${exercise.exerciseId}:${day}`),
  );
  return new Set(keys).size !== keys.length;
}

export function MemberWorkoutBuilder() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const copy = getCopy(isVi);
  const [search, setSearch] = useState('');
  const [muscle, setMuscle] = useState<MuscleId | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saveMode, setSaveMode] = useState<BuilderSaveMode>('new_plan');
  const name = useMemberWorkoutBuilderStore((state) => state.name);
  const exercises = useMemberWorkoutBuilderStore((state) => state.exercises);
  const setName = useMemberWorkoutBuilderStore((state) => state.setName);
  const addExercise = useMemberWorkoutBuilderStore((state) => state.addExercise);
  const removeExercise = useMemberWorkoutBuilderStore((state) => state.removeExercise);
  const moveExercise = useMemberWorkoutBuilderStore((state) => state.moveExercise);
  const updateExercise = useMemberWorkoutBuilderStore((state) => state.updateExercise);
  const clearDraft = useMemberWorkoutBuilderStore((state) => state.clearDraft);
  const savePlan = useMemberWorkoutBuilderStore((state) => state.savePlan);

  const muscles = useMemo(
    () =>
      Array.from(
        new Set(memberExerciseCatalog.flatMap((item) => item.muscles.map((target) => target.id))),
      ),
    [],
  );
  const filtered = memberExerciseCatalog.filter(
    (item) =>
      (muscle === 'all' || item.muscles.some((target) => isMuscleRelated(muscle, target.id))) &&
      item.name[isVi ? 'vi' : 'en'].toLowerCase().includes(search.toLowerCase()),
  );
  const counts = exercises.reduce<Record<string, number>>((result, exercise) => {
    const item = memberExerciseCatalog.find((candidate) => candidate.id === exercise.exerciseId);
    item?.muscles.forEach((target) => {
      const weight = target.role === 'primary' ? 1 : target.activation;
      result[target.id] = (result[target.id] ?? 0) + exercise.sets * weight;
    });
    return result;
  }, {});
  const totalSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const estimatedMinutes = Math.max(0, Math.round(totalSets * 2.3));
  const maxMuscleVolume = Math.max(1, ...Object.values(counts));
  const activeMuscles = useMemo(
    () => new Set(memberExerciseCatalog.flatMap((item) => item.muscles.map((target) => target.id))),
    [],
  );
  const localizeMeta = (value: string) => {
    if (!isVi) return value;
    const labels: Record<string, string> = {
      Barbell: 'Tạ đòn',
      Bodyweight: 'Trọng lượng cơ thể',
      Treadmill: 'Máy chạy bộ',
      Dumbbells: 'Tạ đơn',
      Cable: 'Máy cáp',
      Machine: 'Máy tập',
      Beginner: 'Cơ bản',
      Intermediate: 'Trung cấp',
      Advanced: 'Nâng cao',
      'All levels': 'Mọi trình độ',
      Quads: 'Đùi trước',
      Chest: 'Ngực',
      Hamstrings: 'Đùi sau',
      Glutes: 'Mông',
      Lats: 'Xô',
      Core: 'Cơ trung tâm',
      Cardio: 'Tim mạch',
      'Full body': 'Toàn thân',
      Shoulders: 'Vai',
      Biceps: 'Tay trước',
      Triceps: 'Tay sau',
      Forearms: 'Cẳng tay',
      Obliques: 'Cơ liên sườn',
      Calves: 'Bắp chân',
      Traps: 'Cầu vai',
      'Rear delts': 'Vai sau',
      'Lower back': 'Lưng dưới',
      strength: 'Sức mạnh',
      duration: 'Thời lượng',
      distance: 'Quãng đường',
      interval: 'Ngắt quãng',
    };
    return labels[value] ?? value;
  };

  const handleSave = () => {
    if (!savePlan(saveMode)) {
      toast.error(
        exercises.some((exercise) => exercise.days.length === 0) ||
          hasDuplicateExerciseDay(exercises)
          ? copy.scheduleMissing
          : copy.invalid,
      );
      return;
    }
    toast.success(saveMode === 'new_plan' ? copy.saved : copy.savedAddon);
  };

  const selectedMuscle = muscle === 'all' ? null : MUSCLES[muscle];

  return (
    <div className="member-builder">
      <aside className="member-builder__library">
        <header>
          <h1>{copy.library}</h1>
          <strong>{memberExerciseCatalog.length}</strong>
        </header>
        <label className="member-builder__search">
          <Search aria-hidden="true" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.search}
          />
        </label>
        <label className="member-builder__filter">
          <span>{copy.category}</span>
          <select
            value={muscle}
            onChange={(event) => setMuscle(event.target.value as MuscleId | 'all')}
          >
            <option value="all">{copy.all}</option>
            {muscles.map((item) => (
              <option value={item} key={item}>
                {MUSCLES[item].name[isVi ? 'vi' : 'en']}
              </option>
            ))}
          </select>
        </label>
        <div className="member-builder__catalog">
          {filtered.map((item) => {
            const count = exercises.filter((exercise) => exercise.exerciseId === item.id).length;
            return (
              <article key={item.id}>
                <div className="member-builder__thumb">
                  <Dumbbell size={20} />
                </div>
                <div>
                  <strong>{item.name[isVi ? 'vi' : 'en']}</strong>
                </div>
                {count > 0 && <small>×{count}</small>}
                <button
                  type="button"
                  onClick={() => addExercise(item)}
                  aria-label={`Add ${item.name.en}`}
                >
                  <Plus size={18} />
                </button>
              </article>
            );
          })}
        </div>
      </aside>

      <main className="member-builder__canvas">
        <header>
          <span>WORKOUT BUILDER</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={copy.name}
            aria-label={copy.name}
          />
          <div>
            <strong>
              {exercises.length} {copy.exercises} · {totalSets} {copy.sets}
            </strong>
            <span>✓ {copy.autosave}</span>
          </div>
        </header>

        <div className="member-builder__sequence">
          <div className="member-builder__sequence-label">
            <strong>
              {exercises.length} {copy.exercises}
            </strong>
            <span>{copy.reorder}</span>
          </div>
          {exercises.length === 0 && (
            <div className="member-builder__empty">
              <Plus size={24} />
              <span>{copy.empty}</span>
            </div>
          )}
          {exercises.map((exercise, index) => {
            const item = memberExerciseCatalog.find(
              (candidate) => candidate.id === exercise.exerciseId,
            );
            if (!item) return null;
            const isOpen = expanded === exercise.uid;
            return (
              <article className="member-builder__exercise" key={exercise.uid}>
                <div className="member-builder__exercise-head">
                  <span>{index + 1}</span>
                  <button
                    className="member-builder__exercise-toggle"
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : exercise.uid)}
                    aria-expanded={isOpen}
                  >
                    <strong>{item.name[isVi ? 'vi' : 'en']}</strong>
                  </button>
                  <div className="member-builder__reorder">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveExercise(exercise.uid, -1)}
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={index === exercises.length - 1}
                      onClick={() => moveExercise(exercise.uid, 1)}
                    >
                      <ArrowDown size={15} />
                    </button>
                  </div>
                  <button
                    className="member-builder__expand"
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : exercise.uid)}
                    aria-expanded={isOpen}
                  >
                    <ChevronDown className={isOpen ? 'is-open' : ''} size={18} />
                  </button>
                </div>
                {isOpen && (
                  <div className="member-builder__prescription">
                    <header>
                      <strong>{copy.target}</strong>
                      <button type="button" onClick={() => removeExercise(exercise.uid)}>
                        <Trash2 size={15} /> {copy.remove}
                      </button>
                    </header>
                    <div>
                      {targetFields(
                        item,
                        exercise,
                        (patch) => updateExercise(exercise.uid, patch),
                        copy,
                      )}
                    </div>
                    <fieldset
                      className={`member-builder__days ${exercise.days.length === 0 ? 'has-error' : ''}`}
                      aria-invalid={exercise.days.length === 0}
                    >
                      <legend>{copy.days}</legend>
                      <div>
                        {WEEKDAYS.map((day) => (
                          <button
                            type="button"
                            className={exercise.days.includes(day) ? 'is-active' : ''}
                            aria-pressed={exercise.days.includes(day)}
                            disabled={exercises.some(
                              (other) =>
                                other.uid !== exercise.uid &&
                                other.exerciseId === exercise.exerciseId &&
                                other.days.includes(day),
                            )}
                            key={day}
                            onClick={() =>
                              updateExercise(exercise.uid, { days: toggleDay(exercise.days, day) })
                            }
                          >
                            {weekdayLabel(day, isVi)}
                          </button>
                        ))}
                      </div>
                      {exercise.days.length === 0 && (
                        <p className="member-builder__days-error">{copy.chooseDay}</p>
                      )}
                    </fieldset>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <footer>
          <div className="member-builder__save-mode" role="group" aria-label={copy.save}>
            <button
              type="button"
              className={saveMode === 'new_plan' ? 'is-active' : ''}
              onClick={() => setSaveMode('new_plan')}
            >
              {copy.newPlan}
            </button>
            <button
              type="button"
              className={saveMode === 'optional_addon' ? 'is-active' : ''}
              onClick={() => setSaveMode('optional_addon')}
            >
              {copy.optionalAddon}
            </button>
          </div>
          <button type="button" className="is-clear" onClick={clearDraft}>
            <RotateCcw size={16} /> {copy.clear}
          </button>
          <button type="button" className="is-save" onClick={handleSave}>
            <Save size={17} /> {copy.save}
          </button>
        </footer>
      </main>

      <aside className="member-builder__summary">
        <section>
          <header>
            <h2>{copy.liveMuscleMap}</h2>
            <span className="muscle-map__gender">{isVi ? 'Nam' : 'Male'}</span>
          </header>
          <MaleAnatomyMuscleMap
            selected={muscle === 'all' ? null : muscle}
            activeMuscles={activeMuscles}
            volumeByMuscle={counts}
            locale={isVi ? 'vi' : 'en'}
            label={(id) => MUSCLES[id].name[isVi ? 'vi' : 'en']}
            onSelect={(selectedMuscle) => {
              setMuscle((current) => (current === selectedMuscle ? 'all' : selectedMuscle));
            }}
          />
          <div className="muscle-map__filters" aria-label={copy.category}>
            <button
              type="button"
              className={muscle === 'all' ? 'is-active' : ''}
              onClick={() => setMuscle('all')}
            >
              {copy.clearMuscle}
              <span>{memberExerciseCatalog.length}</span>
            </button>
            {muscles.map((item) => (
              <button
                type="button"
                className={muscle === item ? 'is-active' : ''}
                aria-pressed={muscle === item}
                onClick={() => setMuscle(item)}
                key={item}
              >
                {MUSCLES[item].name[isVi ? 'vi' : 'en']}
                <span>
                  {
                    memberExerciseCatalog.filter((exercise) =>
                      exercise.muscles.some((target) => isMuscleRelated(item, target.id)),
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
          {selectedMuscle && (
            <div className="muscle-map__selection" role="status">
              <strong>{selectedMuscle.name[isVi ? 'vi' : 'en']}</strong>
              <span>{selectedMuscle.description[isVi ? 'vi' : 'en']}</span>
              <small>
                {
                  memberExerciseCatalog.filter((exercise) =>
                    exercise.muscles.some(
                      (target) =>
                        target.role === 'primary' && isMuscleRelated(selectedMuscle.id, target.id),
                    ),
                  ).length
                }{' '}
                {copy.primary}
              </small>
            </div>
          )}
        </section>
        <section>
          <h2>{copy.summary}</h2>
          <div className="member-builder__totals">
            <div>
              <strong>{exercises.length}</strong>
              <span>{copy.exercises}</span>
            </div>
            <div>
              <strong>{totalSets}</strong>
              <span>{copy.sets}</span>
            </div>
            <div>
              <strong>~{estimatedMinutes}</strong>
              <span>{copy.estimated}</span>
            </div>
          </div>
        </section>
        <section>
          <h2>{copy.muscle}</h2>
          <div className="member-builder__muscles">
            {Object.keys(counts).length === 0 && <span>—</span>}
            {Object.entries(counts).map(([label, value]) => (
              <div key={label}>
                <span>{localizeMeta(label)}</span>
                <i>
                  <b style={{ width: `${(value / maxMuscleVolume) * 100}%` }} />
                </i>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
