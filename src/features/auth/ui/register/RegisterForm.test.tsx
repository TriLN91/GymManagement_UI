import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as RouterModule from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { authApi } from '../../api/authApi';

import { RegisterForm } from './RegisterForm';
const mocks = vi.hoisted(() => ({ verify: vi.fn(), navigate: vi.fn() }));
vi.mock('../../api/authApi', () => ({ authApi: { sendRegisterOtp: vi.fn() } }));
vi.mock('../../model/useAuth', () => ({
  useVerifyRegisterOtp: () => ({ mutateAsync: mocks.verify, isPending: false }),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('react-router-dom', async (original) => ({
  ...(await original<typeof RouterModule>()),
  useNavigate: () => mocks.navigate,
}));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.resetAllMocks();
  vi.restoreAllMocks();
});
it('registers via OTP, enforces resend cooldown, and recovers from send/verification failures', async () => {
  let tick: () => void = () => {};
  const interval = globalThis.setInterval.bind(globalThis);
  vi.spyOn(globalThis, 'setInterval').mockImplementation((handler, ms) => {
    if (ms === 1000) {
      tick = handler;
      return 987654 as never;
    }
    return interval(handler, ms);
  });
  const user = userEvent.setup();
  vi.mocked(authApi.sendRegisterOtp)
    .mockRejectedValueOnce(new Error('Email service unavailable'))
    .mockResolvedValue({
      email: 'member@example.test',
      expiryMinutes: 15,
      message: 'OTP sent',
      isEmailSent: true,
      debugOtpCode: '123456',
    });
  mocks.verify.mockRejectedValueOnce(new Error('Invalid OTP')).mockResolvedValueOnce({});
  render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  );
  await user.type(screen.getByLabelText('auth:register.email'), 'member@example.test');
  await user.type(screen.getByLabelText('auth:register.password'), 'Password1!');
  await user.type(screen.getByLabelText('auth:register.confirmPassword'), 'Password1!');
  await user.click(screen.getByRole('button', { name: 'auth:register.submit' }));
  await screen.findByText('Email service unavailable');
  await user.dblClick(screen.getByRole('button', { name: 'auth:register.submit' }));
  await screen.findByLabelText('auth:register.otp.label');
  expect(authApi.sendRegisterOtp).toHaveBeenCalledTimes(2);
  expect(authApi.sendRegisterOtp).toHaveBeenLastCalledWith({
    email: 'member@example.test',
    password: 'Password1!',
    fullName: 'member',
    role: 'Member',
  });
  expect(screen.getByRole('button', { name: /auth:register.otp.resendIn/ })).toBeDisabled();
  act(() => {
    for (let second = 0; second < 60; second++) tick();
  });
  await user.click(screen.getByRole('button', { name: 'auth:register.otp.resend' }));
  await waitFor(() => expect(authApi.sendRegisterOtp).toHaveBeenCalledTimes(3));
  await user.type(screen.getByLabelText('auth:register.otp.label'), '000000');
  await user.click(screen.getByRole('button', { name: 'auth:register.otp.verify' }));
  await screen.findByText('Invalid OTP');
  await user.clear(screen.getByLabelText('auth:register.otp.label'));
  await user.type(screen.getByLabelText('auth:register.otp.label'), '123456');
  await user.click(screen.getByRole('button', { name: 'auth:register.otp.verify' }));
  await waitFor(() =>
    expect(mocks.navigate).toHaveBeenCalledWith('/app/profile/setup', { replace: true }),
  );
  expect(mocks.verify).toHaveBeenLastCalledWith({
    email: 'member@example.test',
    otpCode: '123456',
  });
});
