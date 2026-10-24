import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';

import { authApi } from '../../api/authApi';

import { EmailStep } from './EmailStep';
import { NewPasswordStep } from './NewPasswordStep';
import { OtpVerificationStep } from './OtpVerificationStep';
vi.mock('../../api/authApi', () => ({
  authApi: { forgotPassword: vi.fn(), resetPassword: vi.fn(), verifyOtp: vi.fn() },
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});
it('forgot password sends once, recovers after failure, and continues with the API OTP response', async () => {
  const user = userEvent.setup();
  const next = vi.fn();
  vi.mocked(authApi.forgotPassword)
    .mockRejectedValueOnce(new Error('Unavailable'))
    .mockResolvedValueOnce({ debugOtpCode: '123456' } as never);
  render(
    <MemoryRouter>
      <EmailStep onSuccess={next} />
    </MemoryRouter>,
  );
  await user.type(screen.getByLabelText('Email đăng ký tài khoản'), 'member@example.test');
  await user.click(screen.getByRole('button', { name: 'Gửi mã xác thực OTP' }));
  await waitFor(() => expect(authApi.forgotPassword).toHaveBeenCalledTimes(1));
  expect(next).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Gửi mã xác thực OTP' }));
  await waitFor(() => expect(next).toHaveBeenCalledWith('member@example.test', '123456'));
  expect(authApi.forgotPassword).toHaveBeenCalledTimes(2);
});
it('reset password preserves the email/token contract and permits retry after rejection', async () => {
  const user = userEvent.setup();
  const next = vi.fn();
  vi.mocked(authApi.resetPassword)
    .mockRejectedValueOnce(new Error('Expired'))
    .mockResolvedValueOnce(true);
  render(
    <NewPasswordStep email="member@example.test" resetToken="verified-reset" onSuccess={next} />,
  );
  await user.type(screen.getByLabelText('Mật khẩu mới'), 'Password1!');
  await user.type(screen.getByLabelText('Xác nhận mật khẩu mới'), 'Password1!');
  await user.click(screen.getByRole('button', { name: /Thiết lập mật khẩu mới/ }));
  await waitFor(() => expect(authApi.resetPassword).toHaveBeenCalledTimes(1));
  expect(next).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: /Thiết lập mật khẩu mới/ }));
  await waitFor(() => expect(next).toHaveBeenCalledOnce());
  expect(authApi.resetPassword).toHaveBeenLastCalledWith({
    email: 'member@example.test',
    resetToken: 'verified-reset',
    newPassword: 'Password1!',
  });
});

it('requires a valid OTP response before allowing password reset and supports retry', async () => {
  const user = userEvent.setup();
  const next = vi.fn();
  vi.mocked(authApi.verifyOtp)
    .mockResolvedValueOnce({ isValid: false, message: 'Invalid OTP', resetToken: '' })
    .mockResolvedValueOnce({ isValid: true, message: 'Verified', resetToken: 'verified-reset' });
  render(
    <OtpVerificationStep
      email="member@example.test"
      cooldown={60}
      onResendOtp={vi.fn()}
      onBackToEmail={vi.fn()}
      onSuccess={next}
    />,
  );
  expect(screen.getByRole('button', { name: /Gửi lại mã sau/ })).toBeDisabled();
  await user.type(screen.getByLabelText('Nhập mã OTP (6 chữ số)'), '000000');
  await user.click(screen.getByRole('button', { name: 'Xác nhận mã OTP' }));
  await screen.findByText('Invalid OTP');
  expect(next).not.toHaveBeenCalled();
  await user.clear(screen.getByLabelText('Nhập mã OTP (6 chữ số)'));
  await user.type(screen.getByLabelText('Nhập mã OTP (6 chữ số)'), '123456');
  await user.click(screen.getByRole('button', { name: 'Xác nhận mã OTP' }));
  await waitFor(() => expect(next).toHaveBeenCalledWith('verified-reset'));
  expect(authApi.verifyOtp).toHaveBeenLastCalledWith({
    email: 'member@example.test',
    otpCode: '123456',
  });
});
