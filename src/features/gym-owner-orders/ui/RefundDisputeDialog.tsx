import { useState, type FormEvent } from 'react';

import type { RefundDisputeRequestDraft } from '../model/types';

import type { GymOwnerOrdersCopy } from './copy';

import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

interface RefundDisputeDialogProps {
  open: boolean;
  copy: GymOwnerOrdersCopy;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: RefundDisputeRequestDraft) => void;
}

export function RefundDisputeDialog({
  open,
  copy,
  onOpenChange,
  onSubmit,
}: RefundDisputeDialogProps) {
  const [kind, setKind] = useState<RefundDisputeRequestDraft['kind']>('refund');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!details.trim()) {
      setError(copy.requestRequired);
      return;
    }
    onSubmit({ kind, details: details.trim() });
    setKind('refund');
    setDetails('');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.requestTitle}</DialogTitle>
          <DialogDescription>{copy.requestDescription}</DialogDescription>
        </DialogHeader>
        <form className="gym-request-form" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="request-kind">{copy.requestType}</Label>
            <Select
              id="request-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as RefundDisputeRequestDraft['kind'])}
            >
              <option value="refund">{copy.refund}</option>
              <option value="dispute">{copy.dispute}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="request-details">{copy.requestDetails}</Label>
            <Textarea
              id="request-details"
              value={details}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'request-details-error' : undefined}
              placeholder={copy.requestPlaceholder}
              onChange={(event) => {
                setDetails(event.target.value);
                if (error) setError('');
              }}
            />
            {error ? (
              <p className="gym-request-error" id="request-details-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {copy.cancel}
            </Button>
            <Button type="submit">{copy.submitRequest}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
