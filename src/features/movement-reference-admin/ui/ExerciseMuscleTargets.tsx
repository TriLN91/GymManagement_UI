import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MUSCLES, type MuscleId } from '@/features/member-workout-builder/model/muscleMapData';
import { MaleAnatomyMuscleMap } from '@/features/member-workout-builder/ui/MaleAnatomyMuscleMap';
export type TargetMuscle = { code: string; role: 'PRIMARY' | 'SECONDARY' };
const canonicalMuscle = (code: string) => MUSCLES[code as MuscleId]?.parent ?? code;
export function ExerciseMuscleTargets({
  value,
  onChange,
  disabled,
}: {
  value: TargetMuscle[];
  onChange: (value: TargetMuscle[]) => void;
  disabled?: boolean;
}) {
  const { t, i18n } = useTranslation('movementStudio');
  const [error, setError] = useState('');
  const locale = i18n.language.startsWith('vi') ? 'vi' : 'en';
  const label = (id: MuscleId) => MUSCLES[id]?.name[locale] ?? id;
  const update = (next: TargetMuscle[]) => {
    if (disabled) return;
    if (
      next.length > 3 ||
      next.filter((m) => m.role === 'PRIMARY').length > 2 ||
      next.filter((m) => m.role === 'SECONDARY').length > 2
    ) {
      setError(t('muscleLimit'));
      return;
    }
    setError('');
    onChange(next);
  };
  return (
    <fieldset disabled={disabled} className="studio-config-section studio-targets">
      <legend>
        {t('muscleTargets')} · {value.length}/3
      </legend>
      <p>{t('muscleTargetsHelp')}</p>
      <p className="studio-caption">{t('mapToggleHelp')}</p>
      <MaleAnatomyMuscleMap
        selected={null}
        selectionMode
        showVolumeLegend={false}
        activeMuscles={new Set(value.map((m) => canonicalMuscle(m.code) as MuscleId))}
        locale={locale}
        label={label}
        onSelect={(id) => {
          const code = canonicalMuscle(id);
          update(
            value.some((m) => canonicalMuscle(m.code) === code)
              ? value.filter((m) => canonicalMuscle(m.code) !== code)
              : [
                  ...value,
                  { code, role: value.some((m) => m.role === 'PRIMARY') ? 'SECONDARY' : 'PRIMARY' },
                ],
          );
        }}
      />
      <ul className="studio-target-list">
        {value.map((m) => (
          <li key={m.code}>
            <strong>{label(m.code as MuscleId)}</strong>
            <select
              aria-label={t('muscleRole', { name: label(m.code as MuscleId) })}
              value={m.role}
              onChange={(e) =>
                update(
                  value.map((item) =>
                    item.code === m.code
                      ? { ...item, role: e.target.value as TargetMuscle['role'] }
                      : item,
                  ),
                )
              }
            >
              <option value="PRIMARY">{t('primaryTarget')}</option>
              <option value="SECONDARY">{t('secondaryTarget')}</option>
            </select>
            <button
              type="button"
              aria-label={t('removeMuscle', { name: label(m.code as MuscleId) })}
              onClick={() => update(value.filter((item) => item.code !== m.code))}
            >
              {t('remove')}
            </button>
          </li>
        ))}
      </ul>
      {error ? <p role="alert">{error}</p> : null}
      {!value.some((m) => m.role === 'PRIMARY') ? (
        <p role="alert">{t('primaryTargetRequired')}</p>
      ) : null}
    </fieldset>
  );
}
