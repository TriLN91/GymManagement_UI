import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { usePlatformApprovalStore } from '../model/store';

import { platformApprovalsCopy, type PlatformApprovalsCopy } from './copy';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { EmptyState } from '@/shared/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { WorkspacePage } from '@/shared/ui/workspace';

import './platform-approvals.css';

function roleLabel(role: 'gym_owner' | 'trainer' | 'member', copy: PlatformApprovalsCopy) {
  return role === 'gym_owner' ? copy.gymOwner : role === 'trainer' ? copy.trainer : copy.member;
}

export function PlatformAccountsPage() {
  const { i18n } = useTranslation();
  const copy = platformApprovalsCopy[i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'];
  const accounts = usePlatformApprovalStore((state) => state.accounts);
  const suspend = usePlatformApprovalStore((state) => state.suspend);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const selected = accounts.find((account) => account.id === pendingId);
  const locale = i18n.resolvedLanguage === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(value),
    );
  const handleSuspend = () => {
    if (!selected) return;
    suspend(selected.id);
    setPendingId(null);
    toast.success(`${selected.fullName} · ${copy.suspended}`);
  };

  return (
    <WorkspacePage width="wide" className="platform-approvals-page platform-accounts-page">
      <h1 className="sr-only">{copy.accountIdentity}</h1>
      <div className="platform-accounts-note">
        <ShieldAlert aria-hidden="true" size={15} />
        <span>{copy.accountScope}</span>
      </div>
      {accounts.length === 0 ? (
        <EmptyState title={copy.noAccountRecords} />
      ) : (
        <TableContainer className="platform-accounts-table-shell">
          <Table aria-label={copy.accountIdentity} className="platform-accounts-table">
            <TableHeader>
              <TableRow>
                <TableHead>{copy.accountIdentity}</TableHead>
                <TableHead>{copy.accountRole}</TableHead>
                <TableHead>{copy.relationship}</TableHead>
                <TableHead>{copy.created}</TableHead>
                <TableHead>{copy.accountStatus}</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell data-label={copy.accountIdentity}>
                    <div className="platform-account-identity">
                      <span aria-hidden="true">{account.fullName.charAt(0)}</span>
                      <div>
                        <strong>{account.fullName}</strong>
                        <small>{account.email}</small>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell data-label={copy.accountRole}>
                    {roleLabel(account.role, copy)}
                  </TableCell>
                  <TableCell data-label={copy.relationship}>{account.relationship}</TableCell>
                  <TableCell data-label={copy.created}>{formatDate(account.createdAt)}</TableCell>
                  <TableCell data-label={copy.accountStatus}>
                    <Badge variant={account.status === 'active' ? 'accent' : 'destructive'}>
                      {account.status === 'active' ? copy.active : copy.suspended}
                    </Badge>
                  </TableCell>
                  <TableCell data-label="">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={account.status === 'suspended'}
                      onClick={() => setPendingId(account.id)}
                    >
                      {copy.suspend}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setPendingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.confirmSuspend}</DialogTitle>
            <DialogDescription>{copy.confirmSuspendDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingId(null)}>
              {copy.cancel}
            </Button>
            <Button variant="destructive" onClick={handleSuspend}>
              {copy.suspend}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
