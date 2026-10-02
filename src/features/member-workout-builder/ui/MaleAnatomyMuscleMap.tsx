import { Maximize2 } from 'lucide-react';
import { useRef, useState, type CSSProperties } from 'react';

import { MALE_MUSCLE_REGIONS } from '../model/maleMuscleRegions';
import { MUSCLES, type MuscleId } from '../model/muscleMapData';

import { cn } from '@/shared/lib/cn';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';

import './male-anatomy-muscle-map.css';

interface MaleAnatomyMuscleMapProps {
  selected: MuscleId | null;
  activeMuscles: ReadonlySet<MuscleId>;
  volumeByMuscle?: Partial<Record<MuscleId, number>>;
  locale: 'vi' | 'en';
  label: (muscle: MuscleId) => string;
  onSelect: (muscle: MuscleId) => void;
  zoomed?: boolean;
}

const imageUrl = `${import.meta.env.BASE_URL}male-anatomy-map.png`;

export function MaleAnatomyMuscleMap({
  selected,
  activeMuscles,
  volumeByMuscle,
  locale,
  label,
  onSelect,
  zoomed = false,
}: MaleAnatomyMuscleMapProps) {
  const [hovered, setHovered] = useState<MuscleId | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const zoomTitleRef = useRef<HTMLHeadingElement>(null);
  const maxVolume = Math.max(1, ...Object.values(volumeByMuscle ?? {}));

  return (
    <>
      <div
        className={cn('muscle-map__canvas', 'muscle-map__canvas--anatomy', zoomed && 'is-zoomed')}
      >
        {!zoomed && (
          <button
            className="muscle-map__zoom-button"
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label={locale === 'vi' ? 'Phóng lớn bản đồ cơ' : 'Expand muscle map'}
          >
            <Maximize2 aria-hidden="true" size={14} />
          </button>
        )}
        <div className="muscle-map__figures">
          {(['front', 'back'] as const).map((view) => (
            <figure className="muscle-map__figure" key={view}>
              <svg
                className="muscle-map muscle-map--anatomy"
                viewBox={view === 'front' ? '100 0 480 835' : '660 0 480 835'}
                role="img"
                aria-label={
                  locale === 'vi'
                    ? view === 'front'
                      ? 'Bản đồ cơ mặt trước'
                      : 'Bản đồ cơ mặt sau'
                    : view === 'front'
                      ? 'Anterior anatomy muscle map'
                      : 'Posterior anatomy muscle map'
                }
              >
                <image href={imageUrl} x="0" y="0" width="1220" height="841" pointerEvents="none" />
                {MALE_MUSCLE_REGIONS[view].map(({ id, paths }) => {
                  const parent = MUSCLES[id].parent;
                  const volume =
                    volumeByMuscle?.[id] ?? (parent ? volumeByMuscle?.[parent] : 0) ?? 0;
                  const isActive =
                    activeMuscles.has(id) || Boolean(parent && activeMuscles.has(parent));
                  const className = [
                    'muscle-map__region',
                    selected === id ? 'is-selected' : '',
                    volume > 0 ? 'has-volume' : '',
                    isActive ? 'has-exercises' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  const style = {
                    '--heat-opacity': Math.min(0.76, 0.2 + (volume / maxVolume) * 0.56),
                    outline: 'none',
                  } as CSSProperties;

                  return (
                    <g
                      className={className}
                      data-muscle={id}
                      role="button"
                      tabIndex={0}
                      aria-label={label(id)}
                      aria-pressed={selected === id}
                      style={style}
                      key={id}
                      onClick={() => onSelect(id)}
                      onPointerEnter={() => setHovered(id)}
                      onPointerLeave={() => setHovered(null)}
                      onFocus={() => setHovered(id)}
                      onBlur={() => setHovered(null)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelect(id);
                        }
                      }}
                    >
                      <title>{label(id)}</title>
                      {paths.map((path, index) => (
                        <path
                          d={path}
                          fill={
                            selected === id
                              ? 'rgba(229, 247, 150, 0.82)'
                              : hovered === id
                                ? 'rgba(167, 240, 221, 0.65)'
                                : volume > 0
                                  ? `rgba(229, 247, 150, ${Math.min(0.76, 0.2 + (volume / maxVolume) * 0.56)})`
                                  : 'transparent'
                          }
                          stroke={selected === id || hovered === id ? '#173917' : 'transparent'}
                          strokeWidth={selected === id ? 5 : hovered === id ? 4 : 0}
                          key={index}
                        />
                      ))}
                    </g>
                  );
                })}
              </svg>
              <figcaption>
                {locale === 'vi'
                  ? view === 'front'
                    ? 'Mặt trước'
                    : 'Mặt sau'
                  : view === 'front'
                    ? 'Front'
                    : 'Back'}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="muscle-map__legend" aria-hidden="true">
          <span>{locale === 'vi' ? 'Thấp' : 'Low'}</span>
          <i />
          <span>{locale === 'vi' ? 'Lượng tập cao' : 'High volume'}</span>
        </div>
        {hovered && (
          <span className="muscle-map__tooltip" role="status">
            {label(hovered)}
          </span>
        )}
      </div>
      {!zoomed && (
        <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
          <DialogContent
            className="muscle-map__zoom-dialog"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              zoomTitleRef.current?.focus();
            }}
          >
            <DialogHeader>
              <DialogTitle ref={zoomTitleRef} tabIndex={-1}>
                {locale === 'vi' ? 'Bản đồ cơ nam' : 'Male muscle map'}
              </DialogTitle>
            </DialogHeader>
            <MaleAnatomyMuscleMap
              selected={selected}
              activeMuscles={activeMuscles}
              volumeByMuscle={volumeByMuscle}
              locale={locale}
              label={label}
              onSelect={(muscle) => {
                onSelect(muscle);
                setZoomOpen(false);
              }}
              zoomed
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
