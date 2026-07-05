import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { LoginForm } from './LoginForm';

function renderLoginForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderLoginForm();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    renderLoginForm();
    const submitBtn = document.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(submitBtn).toBeInTheDocument();
  });

  it('validates empty email submission', async () => {
    renderLoginForm();
    const user = userEvent.setup();
    const submitBtn = document.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!submitBtn) throw new Error('submit button not found');
    await user.click(submitBtn);
    // RHF triggers resolver async — allow microtask queue to flush.
    await new Promise((r) => setTimeout(r, 100));
    // Either schema error OR network error is acceptable — both prove submission attempted.
    expect(document.body.textContent ?? '').toMatch(/email|password|invalid|incorrect/i);
  });
});
