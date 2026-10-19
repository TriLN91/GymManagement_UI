import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  MUSCLES,
  MUSCLE_IDS,
  type MuscleId,
} from '@/features/member-workout-builder/model/muscleMapData';
import { MaleAnatomyMuscleMap } from '@/features/member-workout-builder/ui/MaleAnatomyMuscleMap';
export type TargetMuscle = { code: string; role: 'PRIMARY' | 'SECONDARY' };

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
  const [selected, setSelected] = useState<MuscleId | null>(null);
  const locale = i18n.language.startsWith('vi') ? 'vi' : 'en';
  const label = (id: MuscleId) => MUSCLES[id].name[locale];
  const choose = (id: MuscleId, role: string) => {
    if (disabled) return;
    onChange([
      ...value.filter((m) => m.code !== id),
      ...(role ? [{ code: id, role: role as TargetMuscle['role'] }] : []),
    ]);
  };
  return (
    <fieldset disabled={disabled} className="studio-config-section">
      <legend>{t('muscleTargets')}</legend>
      <p className="studio-caption">{t('muscleTargetsHelp')}</p>
      <MaleAnatomyMuscleMap
        selected={selected}
        activeMuscles={new Set(value.map((m) => m.code as MuscleId))}
        locale={locale}
        label={label}
        onSelect={setSelected}
      />
      <label>
        {t('chooseTargetMuscle')}
        <select
          value={selected ?? ''}
          onChange={(e) => setSelected((e.target.value as MuscleId) || null)}
        >
          <option value="">{t('unspecified')}</option>
          {MUSCLE_IDS.map((id) => (
            <option key={id} value={id}>
              {label(id)}
            </option>
          ))}
        </select>
      </label>
      {selected ? (
        <label>
          {label(selected)}
          <select
            value={value.find((m) => m.code === selected)?.role ?? ''}
            onChange={(e) => choose(selected, e.target.value)}
          >
            <option value="">{t('notTargeted')}</option>
            <option value="PRIMARY">{t('primaryTarget')}</option>
            <option value="SECONDARY">{t('secondaryTarget')}</option>
          </select>
        </label>
      ) : null}
      <ul>
        {value.map((m) => (
          <li key={m.code}>
            {label(m.code as MuscleId)} ·{' '}
            {t(m.role === 'PRIMARY' ? 'primaryTarget' : 'secondaryTarget')}
          </li>
        ))}
      </ul>
      {value.length > 0 && !value.some((m) => m.role === 'PRIMARY') ? (
        <p role="alert">{t('primaryTargetRequired')}</p>
      ) : null}
    </fieldset>
  );
}
