import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReferenceSetProfileDto } from '../api/types';

import {
  GeneratedReferenceCard,
  ReferenceFootage,
  ReferencePreparationWorkspace,
} from './ReferencePreparationWorkspace';

import i18n from '@/i18n';

const hooks = vi.hoisted(() => ({
  referenceSet: vi.fn(),
  upload: vi.fn(),
  confirm: vi.fn(),
  activate: vi.fn(),
}));

vi.mock('../model/useMovementReferences', () => ({
  useReferenceSet: hooks.referenceSet,
  useUploadReferenceSource: hooks.upload,
  useConfirmReferenceProfile: hooks.confirm,
  useActivateReferenceProfile: hooks.activate,
}));

const candidate: ReferenceSetProfileDto = {
  id: 'profile-2',
  version: 2,
  view: 'SIDE',
  status: 'REVIEW_REQUIRED',
  sourceVideoCount: 1,
  acceptedVideoCount: 1,
  acceptedRepCount: 6,
  aggregateProfile: { audit: { sourceReferenceIds: ['source-1'] } },
  normalizedReference: {},
  qualitySummary: { warnings: ['Check hip depth variance'] },
};

const footage = {
  id: 'source-1',
  fileName: 'trusted-side.mp4',
  detectedView: 'SIDE',
  detectedViewConfidence: 0.94,
  processingStatus: 'PROCESSED' as const,
  acceptedRepCount: 6,
  rejectedRepCount: 1,
  decision: 'CLEAR_ACCEPT' as const,
  action: 'DOWN_WEIGHT' as const,
  reviewReason: 'Minor quality variance',
  dataQuality: { stability: 'good' },
  deterministicEvidence: { mad: 0.14 },
  adjudication: null,
  warnings: [],
  failureMessage: null,
};

describe('ReferencePreparationWorkspace', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    hooks.confirm.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null });
    hooks.activate.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null });
    hooks.upload.mockReturnValue({ mutateAsync: vi.fn(), isPending: false, error: null });
    hooks.referenceSet.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        id: 'set-1',
        exerciseId: 'exercise-1',
        exerciseName: 'Back Squat',
        pattern: 'SQUAT',
        status: 'REVIEW_REQUIRED',
        sources: [footage],
        profiles: [candidate],
      },
    });
  });

  it('shows the current exercise in breadcrumbs and presents sections by task', () => {
    render(
      <MemoryRouter>
        <ReferencePreparationWorkspace referenceSetId="set-1" />
      </MemoryRouter>,
    );
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(breadcrumb).toHaveTextContent('Assessment standards');
    expect(breadcrumb).toHaveTextContent('Exercise references');
    expect(breadcrumb).toHaveTextContent('Back Squat');
    expect(screen.getByRole('heading', { name: 'Reference footage' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Analysis readiness' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Generated references' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Publish' })).toBeInTheDocument();
  });

  it('shows one operational outcome and keeps raw states in technical details', () => {
    render(<ReferenceFootage sources={[footage]} />);
    expect(screen.getByText('Usable with reduced weight')).toBeInTheDocument();
    expect(screen.getByText('Processed')).not.toBeVisible();
    fireEvent.click(screen.getByText('Review evidence and quality'));
    fireEvent.click(screen.getByText('Technical audit details'));
    expect(screen.getByText('Processed')).toBeInTheDocument();
    expect(screen.getByText('Down-weight')).toBeInTheDocument();
  });

  it('uses approve wording and presents contributing footage', () => {
    render(
      <GeneratedReferenceCard
        profile={candidate}
        referenceSetId="set-1"
        role="candidate"
        sources={[footage]}
      />,
    );
    fireEvent.click(screen.getAllByText('Contributing footage')[1]!);
    expect(screen.getByText('trusted-side.mp4')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Approve this reference version' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('I reviewed the footage, analysis, and warnings');
    expect(
      within(dialog).getByRole('button', { name: 'Approve this reference version' }),
    ).toBeInTheDocument();
  });

  it('uses publish wording and explains replacement history', () => {
    render(
      <GeneratedReferenceCard
        profile={{ ...candidate, status: 'CONFIRMED' }}
        referenceSetId="set-1"
        role="candidate"
        sources={[footage]}
        replacingLive
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Publish as live' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('future matching Member assessments');
    expect(dialog).toHaveTextContent('previous live version becomes historical');
  });
});
