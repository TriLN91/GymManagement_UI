import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReferenceSetProfileDto } from '../api/types';

import { ProfileCard, SourceVideos } from './ReferenceSetWorkspace';

import i18n from '@/i18n';
import { ApiError } from '@/shared/api/errorTypes';

const hooks = vi.hoisted(() => ({ confirm: vi.fn(), activate: vi.fn() }));
vi.mock('../model/useMovementReferences', () => ({
  useConfirmReferenceProfile: hooks.confirm,
  useActivateReferenceProfile: hooks.activate,
}));

const profile = (status: ReferenceSetProfileDto['status']): ReferenceSetProfileDto => ({
  id: 'profile-1',
  version: 2,
  view: 'SIDE',
  status,
  sourceVideoCount: 2,
  acceptedVideoCount: 1,
  acceptedRepCount: 5,
  aggregateProfile: {},
  normalizedReference: {},
  qualitySummary: {},
});

describe('ReferenceSetWorkspace parts', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    hooks.confirm.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    });
    hooks.activate.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      error: null,
    });
  });

  it('renders source processing and decision independently with review evidence', () => {
    render(
      <SourceVideos
        sources={[
          {
            id: 'source-1',
            fileName: 'good.mp4',
            detectedView: 'SIDE',
            detectedViewConfidence: 0.9,
            processingStatus: 'PROCESSED',
            acceptedRepCount: 4,
            rejectedRepCount: 1,
            decision: 'AMBIGUOUS',
            action: 'REQUIRES_REVIEW',
            reviewReason: 'Borderline outlier',
            dataQuality: { usable: true },
            deterministicEvidence: { outlier: true },
            adjudication: null,
            warnings: [],
            failureMessage: null,
          },
        ]}
      />,
    );
    expect(screen.getByText('Processed')).toBeInTheDocument();
    expect(screen.getByText('Ambiguous')).toBeInTheDocument();
    expect(screen.getByText('Needs review')).toBeInTheDocument();
    expect(screen.getByText(/Borderline outlier/)).toBeInTheDocument();
  });

  it('confirms review-required profiles and activates only confirmed profiles', async () => {
    const confirmMutation = vi.fn().mockResolvedValue({});
    const activateMutation = vi.fn().mockResolvedValue({});
    hooks.confirm.mockReturnValue({ mutateAsync: confirmMutation, isPending: false, error: null });
    hooks.activate.mockReturnValue({
      mutateAsync: activateMutation,
      isPending: false,
      error: null,
    });
    const { rerender } = render(
      <ProfileCard profile={profile('REVIEW_REQUIRED')} referenceSetId="set-1" />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(confirmMutation).toHaveBeenCalledWith('profile-1'));
    rerender(<ProfileCard profile={profile('CONFIRMED')} referenceSetId="set-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Activate' }));
    await waitFor(() => expect(activateMutation).toHaveBeenCalledWith('profile-1'));
  });

  it('shows a useful lifecycle conflict and backend code', () => {
    hooks.confirm.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: new ApiError(
        409,
        'Only review-required profiles can be confirmed.',
        'INVALID_REFERENCE_PROFILE_TRANSITION',
      ),
    });
    render(<ProfileCard profile={profile('REVIEW_REQUIRED')} referenceSetId="set-1" />);
    expect(
      screen.getByText('This lifecycle action is not allowed in the current state.'),
    ).toBeInTheDocument();
    expect(screen.getByText('INVALID_REFERENCE_PROFILE_TRANSITION')).toBeInTheDocument();
  });
});
