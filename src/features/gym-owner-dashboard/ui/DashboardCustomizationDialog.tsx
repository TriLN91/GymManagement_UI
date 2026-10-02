import { ArrowDown, ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { GymOwnerDashboardCopy } from './copy';

import type {
  DashboardPreferences,
  DashboardWidgetId,
} from '@/features/gym-owner-dashboard/model/types';
import {
  DEFAULT_DASHBOARD_PREFERENCES,
  useGymOwnerDashboardPreferences,
} from '@/features/gym-owner-dashboard/model/useGymOwnerDashboardPreferences';
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

interface DashboardCustomizationDialogProps {
  copy: GymOwnerDashboardCopy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function moveWidget(
  preferences: DashboardPreferences,
  widgetId: DashboardWidgetId,
  direction: -1 | 1,
) {
  const index = preferences.order.indexOf(widgetId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= preferences.order.length) return preferences;
  const order = [...preferences.order];
  [order[index], order[target]] = [order[target]!, order[index]!];
  return { ...preferences, order };
}

export function DashboardCustomizationDialog({
  copy,
  open,
  onOpenChange,
  onSaved,
}: DashboardCustomizationDialogProps) {
  const order = useGymOwnerDashboardPreferences((state) => state.order);
  const hidden = useGymOwnerDashboardPreferences((state) => state.hidden);
  const applyPreferences = useGymOwnerDashboardPreferences((state) => state.applyPreferences);
  const [draft, setDraft] = useState<DashboardPreferences>({ order, hidden });

  useEffect(() => {
    if (open) setDraft({ order: [...order], hidden: [...hidden] });
  }, [hidden, open, order]);

  const toggleWidget = (widgetId: DashboardWidgetId, visible: boolean) => {
    setDraft((current) => ({
      ...current,
      hidden: visible
        ? current.hidden.filter((id) => id !== widgetId)
        : [...new Set([...current.hidden, widgetId])],
    }));
  };

  const handleSave = () => {
    applyPreferences(draft);
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gym-dashboard-customization">
        <DialogHeader>
          <DialogTitle>{copy.customization.title}</DialogTitle>
          <DialogDescription>{copy.customization.description}</DialogDescription>
        </DialogHeader>

        <ol className="gym-dashboard-customization__list">
          {draft.order.map((widgetId, index) => {
            const visible = !draft.hidden.includes(widgetId);
            return (
              <li key={widgetId}>
                <label>
                  <Checkbox
                    checked={visible}
                    onChange={(event) => toggleWidget(widgetId, event.target.checked)}
                  />
                  <span>
                    <strong>{copy.widgets[widgetId]}</strong>
                    <small>{copy.customization.showWidget}</small>
                  </span>
                </label>
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === 0}
                    aria-label={`${copy.customization.moveUp}: ${copy.widgets[widgetId]}`}
                    onClick={() => setDraft((current) => moveWidget(current, widgetId, -1))}
                  >
                    <ArrowUp aria-hidden="true" size={17} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={index === draft.order.length - 1}
                    aria-label={`${copy.customization.moveDown}: ${copy.widgets[widgetId]}`}
                    onClick={() => setDraft((current) => moveWidget(current, widgetId, 1))}
                  >
                    <ArrowDown aria-hidden="true" size={17} />
                  </Button>
                </div>
              </li>
            );
          })}
        </ol>

        <DialogFooter className="gym-dashboard-customization__footer">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setDraft({
                order: [...DEFAULT_DASHBOARD_PREFERENCES.order],
                hidden: [],
              })
            }
          >
            {copy.customization.reset}
          </Button>
          <span />
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {copy.customization.cancel}
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            {copy.customization.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
