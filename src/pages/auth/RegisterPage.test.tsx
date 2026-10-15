import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { RegisterPage } from './RegisterPage';

function renderRegisterPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function submit(email: string, password: string, confirmPassword: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Email đăng ký'), email);
  await user.type(screen.getByLabelText('Mật khẩu khởi tạo'), password);
  await user.type(screen.getByLabelText('Nhập lại mật khẩu'), confirmPassword);
  await user.click(screen.getByRole('button', { name: /tiếp tục tạo tài khoản/i }));
}

describe('RegisterPage', () => {
  it('requires at least 6 password characters', async () => {
    renderRegisterPage();
    await submit('new@demo.gym', '12345', '12345');
    expect(await screen.findByText('Mật khẩu phải có ít nhất 6 ký tự.')).toBeInTheDocument();
  });

  it('requires the confirmation to match the password', async () => {
    renderRegisterPage();
    await submit('new@demo.gym', '123456', '654321');
    expect(await screen.findByText('Mật khẩu nhập lại không khớp.')).toBeInTheDocument();
  });

  it('accepts a 6-character password that matches its confirmation', async () => {
    renderRegisterPage();
    await submit('new@demo.gym', '123456', '123456');
    expect(screen.queryByText('Mật khẩu phải có ít nhất 6 ký tự.')).not.toBeInTheDocument();
    expect(screen.queryByText('Mật khẩu nhập lại không khớp.')).not.toBeInTheDocument();
  });
});

describe('RegisterPage roles', () => {
  it('offers Member and Gym Admin but no Trainer self-registration', () => {
    renderRegisterPage();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
    expect(screen.queryByText(/Huấn Luyện Viên/i)).not.toBeInTheDocument();
  });

  it('asks for a name and gym name only for Gym Admin', async () => {
    renderRegisterPage();
    expect(screen.queryByLabelText('Tên phòng gym')).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: /Gym Admin/i }));
    expect(screen.getByLabelText('Tên phòng gym')).toBeInTheDocument();
    expect(screen.getByLabelText('Họ và tên')).toBeInTheDocument();
  });

  it('requires the gym name for Gym Admin before submitting', async () => {
    renderRegisterPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole('radio', { name: /Gym Admin/i }));
    await submit('boss@demo.gym', '123456', '123456');
    expect(await screen.findByText('Vui lòng nhập tên phòng gym.')).toBeInTheDocument();
  });
});
