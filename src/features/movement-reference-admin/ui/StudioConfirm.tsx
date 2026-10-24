import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';

export function StudioConfirm({
  title,
  description,
  action,
  busy,
  danger,
  acknowledge,
  children,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  action: string;
  busy: boolean;
  danger?: boolean;
  acknowledge?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation('movementStudio');
  const [checked, setChecked] = useState(false);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        className="studio-dialog max-h-[90dvh] overflow-y-auto sm:max-w-xl"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
        {acknowledge ? (
          <label className="studio-acknowledge">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
            />
            {acknowledge}
          </label>
        ) : null}
        <DialogFooter>
          <Button variant="outline" disabled={busy} onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            variant={danger ? 'destructive' : 'default'}
            disabled={busy || Boolean(acknowledge && !checked)}
            onClick={onConfirm}
          >
            {busy ? t('loading') : action}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
