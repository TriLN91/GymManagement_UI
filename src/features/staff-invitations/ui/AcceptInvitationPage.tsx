import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAcceptInvitation, useInvitationPreview } from '../model/useStaffInvitations';

import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

/** The invited person opens the e-mailed link, checks who invited them and chooses their own password. */
export function AcceptInvitationPage() {
  const { t } = useTranslation('invitations');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const preview = useInvitationPreview(token);
  const accept = useAcceptInvitation();

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const name = fullName || preview.data?.fullName || '';

  const submit = async () => {
    setError('');
    if (password.length < 6) return setError(t('accept.passwordShort'));
    if (password !== confirm) return setError(t('accept.mismatch'));
    try {
      await accept.mutateAsync({ token, fullName: name.trim(), password });
      toast.success(t('accept.done'));
      void navigate(ROUTES.public.login, { replace: true });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t('failed'));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">{t('accept.title')}</h1>

      {token === '' || preview.isError ? (
        <p role="alert">{t('accept.invalid')}</p>
      ) : preview.isPending ? (
        <p role="status">{t('loading')}</p>
      ) : (
        <>
          <p>
            {t('accept.intro', {
              gym: preview.data.gymName,
              branch: preview.data.branchName,
              role: t(`roles.${preview.data.role}`),
            })}
          </p>
          <p>
            <strong>{preview.data.email}</strong>
          </p>
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div>
              <Label htmlFor="accept-name">{t('fullName')}</Label>
              <Input
                id="accept-name"
                required
                value={name}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accept-password">{t('accept.password')}</Label>
              <Input
                id="accept-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accept-confirm">{t('accept.confirm')}</Label>
              <Input
                id="accept-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </div>
            {error ? <p role="alert">{error}</p> : null}
            <Button type="submit" disabled={accept.isPending || name.trim() === ''}>
              {t('accept.submit')}
            </Button>
          </form>
        </>
      )}
      <Link to={ROUTES.public.login}>{t('accept.toLogin')}</Link>
    </main>
  );
}
