import { ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { PlatformDashboardPreferences, PlatformWidgetId } from '../model/types';
import {
  DEFAULT_PLATFORM_PREFERENCES,
  usePlatformDashboardPreferences,
} from '../model/usePlatformDashboardPreferences';

import type { PlatformCopy } from './copy';

import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

interface Props {
  copy: PlatformCopy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function moveWidget(
  preferences: PlatformDashboardPreferences,
  id: PlatformWidgetId,
  direction: -1 | 1,
): PlatformDashboardPreferences {
  const current = preferences.order.indexOf(id);
  const target = current + direction;
  if (current < 0 || target < 0 || target >= preferences.order.length) return preferences;
  const order = [...preferences.order];
  [order[current], order[target]] = [order[target]!, order[current]!];
  return { ...preferences, order };
}

export function PlatformDashboardCustomizationDialog({ copy, open, onOpenChange }: Props) {
  const order = usePlatformDashboardPreferences((state) => state.order);
  const hidden = usePlatformDashboardPreferences((state) => state.hidden);
  const applyPreferences = usePlatformDashboardPreferences((state) => state.applyPreferences);
  const [draft, setDraft] = useState<PlatformDashboardPreferences>({ order, hidden });

  useEffect(() => {
    if (open) setDraft({ order: [...order], hidden: [...hidden] });
  }, [hidden, open, order]);

  const toggleWidget = (id: PlatformWidgetId, visible: boolean) => {
    setDraft((current) => ({
      ...current,
      hidden: visible
        ? current.hidden.filter((item) => item !== id)
        : [...new Set([...current.hidden, id])],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="platform-customization">
        <DialogHeader>
          <DialogTitle>{copy.customizeTitle}</DialogTitle>
          <DialogDescription>{copy.customizeDescription}</DialogDescription>
        </DialogHeader>
        <ol className="platform-customization__list">
          {draft.order.map((id, index) => (
            <li key={id}>
              <label>
                <Checkbox
                  checked={!draft.hidden.includes(id)}
                  onChange={(event) => toggleWidget(id, event.target.checked)}
                />
                <span>{copy.widgetTitles[id]}</span>
              </label>
              <div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={index === 0}
                  aria-label={`${copy.moveUp}: ${copy.widgetTitles[id]}`}
                  onClick={() => setDraft((current) => moveWidget(current, id, -1))}
                >
                  <ArrowUp aria-hidden="true" size={17} />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={index === draft.order.length - 1}
                  aria-label={`${copy.moveDown}: ${copy.widgetTitles[id]}`}
                  onClick={() => setDraft((current) => moveWidget(current, id, 1))}
                >
                  <ArrowDown aria-hidden="true" size={17} />
                </Button>
              </div>
            </li>
          ))}
        </ol>
        <DialogFooter className="platform-customization__footer">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDraft({ order: [...DEFAULT_PLATFORM_PREFERENCES.order], hidden: [] })}
          >
            {copy.reset}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {copy.cancel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => {
              applyPreferences(draft);
              onOpenChange(false);
            }}
          >
            {copy.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
