import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { AuthGuard } from '@/app/router/guards/AuthGuard';
import { RoleGuard } from '@/app/router/guards/RoleGuard';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

afterEach(() => useAuthStore.getState().clear());
describe('error navigation', () => {
  it.each([
    ['member', '/app'],
    ['pt', '/pt'],
    ['gym_admin', '/admin'],
    ['super_admin', '/superadmin'],
    ['branch_manager', '/'],
  ] as const)('uses the %s home instead of the Member portal', (role, home) => {
    useAuthStore
      .getState()
      .setSession({ id: role, fullName: role, email: 'test@example.com', roles: [role] });
    const router = createMemoryRouter([{ path: '*', element: <ForbiddenPage /> }], {
      initialEntries: ['/403'],
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole('link', { name: /home|trang chủ/i })).toHaveAttribute('href', home);
  });

  it('404 sends a guest to the public home', () => {
    const router = createMemoryRouter([{ path: '*', element: <NotFoundPage /> }], {
      initialEntries: ['/missing'],
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole('link', { name: /home|trang chủ/i })).toHaveAttribute('href', '/');
  });

  it('Back falls back to role home when no app history is available', async () => {
    const router = createMemoryRouter(
      [
        { path: '/403', element: <ForbiddenPage /> },
        { path: '/', element: <p>Public home</p> },
      ],
      { initialEntries: ['/403'] },
    );
    render(<RouterProvider router={router} />);
    fireEvent.click(screen.getByRole('button', { name: /back|quay lại/i }));
    expect(await screen.findByText('Public home')).toBeInTheDocument();
  });

  it('protects direct routes and preserves search/hash for login', async () => {
    useAuthStore.setState({ isHydrated: true });
    const router = createMemoryRouter(
      [
        { element: <AuthGuard />, children: [{ path: '/app/private', element: <p>Private</p> }] },
        { path: '/login', element: <p>Login</p> },
      ],
      { initialEntries: ['/app/private?day=2#sets'] },
    );
    render(<RouterProvider router={router} />);
    expect(await screen.findByText('Login')).toBeInTheDocument();
    expect(router.state.location.state).toEqual({ returnTo: '/app/private?day=2#sets' });
  });

  it('does not grant Gym Admin routes to Branch Manager', async () => {
    useAuthStore.getState().setSession({
      id: 'branch',
      email: 'b@example.com',
      fullName: 'Branch',
      roles: ['branch_manager'],
    });
    const router = createMemoryRouter(
      [
        {
          element: <RoleGuard allow="gym_admin" />,
          children: [{ path: '/admin', element: <p>Owner</p> }],
        },
        { path: '/403', element: <p>Forbidden</p> },
      ],
      { initialEntries: ['/admin'] },
    );
    render(<RouterProvider router={router} />);
    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
  });
});
