import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AccountSecurityPage, WearableConnectionsPage } from './MemberProfilePages';

import { authApi } from '@/features/auth/api/authApi';
import { useMemberProfileStore } from '@/features/member-profile';
import i18n from '@/i18n';

const notices = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('sonner', () => ({ toast: notices }));
vi.mock('@/features/auth/api/authApi', () => ({ authApi: { changePassword: vi.fn() } }));

beforeEach(async () => {
  vi.clearAllMocks();
  await i18n.changeLanguage('en');
  useMemberProfileStore.setState({
    security: {
      twoFactorEnabled: false,
      loginAlerts: false,
      sessionTimeoutMinutes: 30,
      lastPasswordChangedAt: null,
    },
  });
});
describe('account interactions', () => {
  it('keeps the form and password history unchanged when the server rejects the request', async () => {
    vi.mocked(authApi.changePassword).mockRejectedValue(new Error('Current password is incorrect'));
    const { container } = render(
      <MemoryRouter>
        <AccountSecurityPage />
      </MemoryRouter>,
    );
    const fields = [...container.querySelectorAll('input')];
    ['old-password', 'new-password', 'new-password'].forEach((value, index) =>
      fireEvent.change(fields[index]!, { target: { value } }),
    );
    fireEvent.click(screen.getByRole('button', { name: /update password/i }));
    await waitFor(() =>
      expect(notices.error).toHaveBeenCalledWith('Current password is incorrect'),
    );
    expect(notices.success).not.toHaveBeenCalled();
    expect(fields[0]).toHaveValue('old-password');
    expect(fields[1]).toHaveValue('new-password');
    expect(useMemberProfileStore.getState().security.lastPasswordChangedAt).toBeNull();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('does not offer simulated provider connections on Web', () => {
    render(
      <MemoryRouter>
        <WearableConnectionsPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('No connection has been changed');
    expect(screen.queryByRole('button', { name: /connect|sync/i })).not.toBeInTheDocument();
  });
});
