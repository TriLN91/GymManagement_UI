import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, expect, it, vi } from 'vitest';

import { GymOwnerLayout } from './admin/components/GymOwnerLayout';
import { MemberLayout } from './member/components/MemberLayout';

import i18n from '@/i18n';

const approval = vi.hoisted(() => vi.fn(() => ({ approved: true })));
vi.mock('@/features/gym-owner-onboarding', () => ({ useGymOwnerApproved: approval }));
vi.mock('@/features/auth/model/useAuth', () => ({ useLogout: () => ({ mutate: vi.fn() }) }));
vi.mock('@/features/notifications', () => ({ NotificationBell: () => null }));

beforeEach(async () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  await i18n.changeLanguage('en');
});

it('approved owners do not see the obsolete onboarding menu', () => {
  const router = createMemoryRouter(
    [{ element: <GymOwnerLayout />, children: [{ path: '/admin', element: <p>Workspace</p> }] }],
    { initialEntries: ['/admin'] },
  );
  render(<RouterProvider router={router} />);
  expect(document.querySelector('[aria-controls="owner-nav-onboarding"]')).toBeNull();
  expect(document.querySelector('aside a[href="/admin/analytics"]')).toBeNull();
});

it('Branch workspace exposes only scoped Pass destinations and skips owner approval requests', () => {
  const router = createMemoryRouter(
    [
      {
        element: <GymOwnerLayout branchWorkspace />,
        children: [{ path: '/branch/pass-distribution/offers', element: <p>Offers</p> }],
      },
    ],
    { initialEntries: ['/branch/pass-distribution/offers'] },
  );
  const { container } = render(<RouterProvider router={router} />);
  expect(approval).toHaveBeenCalledWith(false);
  expect([...container.querySelectorAll('aside a')].map((a) => a.getAttribute('href'))).toEqual([
    '/branch/pass-distribution/offers',
    '/branch/pass-distribution',
  ]);
  expect(container.querySelector('a[href="/admin"]')).toBeNull();
});

it('Member detail navigation opens its owning group and selects one specific destination', async () => {
  const router = createMemoryRouter(
    [
      {
        element: <MemberLayout />,
        children: [
          { path: '/app/workout/schedule', element: <p>Schedule content</p> },
          { path: '/app/profile/assessments', element: <p>Assessment content</p> },
        ],
      },
    ],
    { initialEntries: ['/app/workout/schedule'] },
  );
  const { container } = render(<RouterProvider router={router} />);
  expect(container.querySelectorAll('aside a.is-active')).toHaveLength(1);
  expect(container.querySelector('aside a.is-active')).toHaveAttribute(
    'href',
    '/app/workout/schedule',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Coaching & assessment' }));
  fireEvent.click(screen.getByRole('link', { name: 'Assessment history' }));
  expect(await screen.findByText('Assessment content')).toBeInTheDocument();
  expect(container.querySelector('[aria-controls="member-nav-coach"]')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  expect(container.querySelectorAll('aside a.is-active')).toHaveLength(1);
  expect(container.querySelectorAll('aside a[href="/app/ai-pass"]')).toHaveLength(1);
});

it('mobile menu dismisses with Escape and on route transitions', async () => {
  const router = createMemoryRouter(
    [
      {
        element: <MemberLayout />,
        children: [
          { path: '/app', element: <p>Home</p> },
          { path: '/app/ai-pass', element: <p>Pass</p> },
        ],
      },
    ],
    { initialEntries: ['/app'] },
  );
  const { container } = render(<RouterProvider router={router} />);
  const menuToggle = container.querySelector<HTMLButtonElement>('.member-mobile-header button')!;
  fireEvent.click(menuToggle);
  expect(container.querySelector('aside')).toHaveClass('is-open');
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(container.querySelector('aside')).not.toHaveClass('is-open');
  fireEvent.click(menuToggle);
  fireEvent.click(screen.getByRole('link', { name: 'My AI Pass' }));
  expect(await screen.findByText('Pass')).toBeInTheDocument();
  expect(container.querySelector('aside')).not.toHaveClass('is-open');
});
