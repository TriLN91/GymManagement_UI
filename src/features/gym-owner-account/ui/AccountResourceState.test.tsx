import { render, screen } from '@testing-library/react';

import { AccountResourceStateView } from './AccountResourceState';

describe('AccountResourceStateView', () => {
  it('renders loading, empty, error, and loaded states', () => {
    const { rerender } = render(
      <AccountResourceStateView
        resource={{ state: 'loading' }}
        loadingLabel="Loading account data"
        emptyLabel="No account data"
        errorLabel="Account data error"
      >
        {() => <span>Loaded</span>}
      </AccountResourceStateView>,
    );
    expect(screen.getByRole('status', { name: 'Loading account data' })).toBeInTheDocument();

    rerender(
      <AccountResourceStateView
        resource={{ state: 'empty' }}
        loadingLabel="Loading account data"
        emptyLabel="No account data"
        errorLabel="Account data error"
      >
        {() => <span>Loaded</span>}
      </AccountResourceStateView>,
    );
    expect(screen.getByText('No account data')).toBeInTheDocument();

    rerender(
      <AccountResourceStateView
        resource={{ state: 'error' }}
        loadingLabel="Loading account data"
        emptyLabel="No account data"
        errorLabel="Account data error"
      >
        {() => <span>Loaded</span>}
      </AccountResourceStateView>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Account data error');

    rerender(
      <AccountResourceStateView
        resource={{ state: 'loaded', data: ['ready'] }}
        loadingLabel="Loading account data"
        emptyLabel="No account data"
        errorLabel="Account data error"
      >
        {(data) => <span>{data[0]}</span>}
      </AccountResourceStateView>,
    );
    expect(screen.getByText('ready')).toBeInTheDocument();
  });
});
