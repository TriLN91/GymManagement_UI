import { Component, type ErrorInfo, type ReactNode } from 'react';

import { ErrorFallback } from './ErrorFallback';

type ErrorBoundaryProps = {
  children: ReactNode;
  /** Optional inline fallback (rarely used; defaults to `<ErrorFallback />`). */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Called once when an error is caught — for telemetry hooks. */
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  error: Error | null;
};

// React's class-component error-catching lifecycle is the only way to
// intercept render-phase errors. Functional equivalents require a third-party
// library and would violate the "Avoid introducing new dependencies" rule.
//
// `getDerivedStateFromError` is declared `static` at runtime, but React 19's
// types surface it on an instance-side `ComponentLifecycle` interface, which
// makes the `override` keyword impossible here — the call site uses runtime
// dispatch. This declaration matches what React actually invokes.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Re-declared as `declare` so TypeScript sees the narrowed type without
  // also requiring the `override` keyword (state is a field, not a method).
  declare state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    if (error === null) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback(error, this.reset);
    return <ErrorFallback error={error} reset={this.reset} />;
  }
}