import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import type { InvitableRole } from '../api/types';
import {
  useCreateInvitation,
  useInvitableBranches,
  useRevokeInvitation,
  useStaffInvitations,
} from '../model/useStaffInvitations';

import { useLocale } from '@/shared/hooks/useLocale';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select } from '@/shared/ui/select';
import { WorkspacePage, WorkspacePanel } from '@/shared/ui/workspace';

function errorText(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

/** Gym Admin invites Trainers and Branch Managers by e-mail; they set their own password (SRS FR-SH-01). */
export function StaffInvitationsPage() {
  const { t } = useTranslation('invitations');
  const { locale } = useLocale();
  const invitations = useStaffInvitations();
  const branches = useInvitableBranches();
  const create = useCreateInvitation();
  const revoke = useRevokeInvitation();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<InvitableRole>('Trainer');
  const [branchId, setBranchId] = useState('');
  const [debugUrl, setDebugUrl] = useState<string | null>(null);

  const branchOptions = branches.data ?? [];
  const selectedBranch = branchId || branchOptions[0]?.id || '';

  const submit = async () => {
    try {
      const created = await create.mutateAsync({
        email: email.trim(),
        role,
        gymBranchId: selectedBranch,
        fullName: fullName.trim() || undefined,
      });
      toast.success(t('sent'));
      setDebugUrl(created.debugAcceptUrl ?? null);
      setEmail('');
      setFullName('');
    } catch (error) {
      toast.error(errorText(error, t('failed')));
    }
  };

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    );

  return (
    <WorkspacePage className="gym-training-page">
      <h1>{t('title')}</h1>
      <p>{t('intro')}</p>

      <WorkspacePanel>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          <div>
            <Label htmlFor="invite-email">{t('email')}</Label>
            <Input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="invite-name">{t('fullName')}</Label>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="invite-role">{t('role')}</Label>
            <Select
              id="invite-role"
              value={role}
              onChange={(event) => setRole(event.target.value as InvitableRole)}
            >
              <option value="Trainer">{t('roles.Trainer')}</option>
              <option value="BranchManager">{t('roles.BranchManager')}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="invite-branch">{t('branch')}</Label>
            <Select
              id="invite-branch"
              value={selectedBranch}
              onChange={(event) => setBranchId(event.target.value)}
            >
              {branchOptions.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.branchName}
                </option>
              ))}
            </Select>
            {branches.isSuccess && branchOptions.length === 0 ? (
              <small>{t('noBranches')}</small>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={create.isPending || selectedBranch === '' || email === ''}
          >
            {t('send')}
          </Button>
        </form>
        {debugUrl ? (
          <p role="status">
            {t('devLink')} <a href={debugUrl}>{debugUrl}</a>
          </p>
        ) : null}
      </WorkspacePanel>

      <WorkspacePanel>
        <h2>{t('listTitle')}</h2>
        {invitations.isPending ? <p role="status">{t('loading')}</p> : null}
        {invitations.isError ? <p role="alert">{t('loadFailed')}</p> : null}
        {invitations.isSuccess && invitations.data.length === 0 ? <p>{t('empty')}</p> : null}
        <ul className="space-y-2">
          {(invitations.data ?? []).map((item) => (
            <li key={item.id} data-testid="invitation">
              <strong>{item.email}</strong> · {t(`roles.${item.role}`)} · {item.branchName}
              {' · '}
              <span>{t(`status.${item.status}`)}</span>
              {' · '}
              <small>{t('expires', { when: fmt(item.expiresAtUtc) })}</small>
              {item.status === 'Pending' ? (
                <Button
                  size="sm"
                  variant="outline"
                  style={{ marginLeft: 8 }}
                  disabled={revoke.isPending}
                  onClick={() =>
                    revoke.mutate(item.id, {
                      onSuccess: () => toast.success(t('revoked')),
                      onError: (error) => toast.error(errorText(error, t('failed'))),
                    })
                  }
                >
                  {t('revoke')}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
