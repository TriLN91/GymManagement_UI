import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('render-phase explosion');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ErrorBoundary', () => {
  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <p>normal content</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('normal content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the default fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('render-phase explosion')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalled();
  });

  it('invokes the onError callback with the error and info', () => {
    const onError = vi.fn<(error: Error) => void>();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary onError={onError}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0]?.[0]?.message).toBe('render-phase explosion');
  });

  it('uses a custom fallback when provided', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <ErrorBoundary fallback={(err) => <span>custom: {err.message}</span>}>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('custom: render-phase explosion')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
