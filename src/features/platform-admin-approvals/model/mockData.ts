import type { PlatformAccountRecord, PlatformApprovalRecord } from './types';

export const initialPlatformApprovals: ReadonlyArray<PlatformApprovalRecord> = [
  {
    id: 'gym-1042',
    kind: 'gym_application',
    reference: 'GYM-1042',
    applicantName: 'Minh Nguyen',
    applicantEmail: 'm.nguyen@northstar.fit',
    organizationName: 'Northstar Fitness',
    submittedAt: '2026-10-07T08:20:00.000Z',
    status: 'pending',
    identity: [
      { label: 'Applicant', value: 'Minh Nguyen' },
      { label: 'Email', value: 'm.nguyen@northstar.fit' },
      { label: 'Gym', value: 'Northstar Fitness' },
    ],
    submission: [
      { label: 'Legal name', value: 'Northstar Fitness Joint Stock Company' },
      { label: 'Registration number', value: '0318456721' },
      { label: 'Registered address', value: 'District 7, Ho Chi Minh City' },
      { label: 'Primary contact', value: 'Minh Nguyen' },
    ],
    documents: [
      {
        id: 'doc-1042-a',
        label: 'Business registration',
        category: 'Legal document',
        submittedAt: '2026-10-07T08:20:00.000Z',
        viewUrl: '/demo-documents/business-registration.pdf',
      },
      {
        id: 'doc-1042-b',
        label: 'Operator authorization',
        category: 'Legal document',
        submittedAt: '2026-10-07T08:20:00.000Z',
        viewUrl: '/demo-documents/operator-authorization.pdf',
      },
    ],
    timeline: [
      { id: 'event-1042', at: '2026-10-07T08:20:00.000Z', label: 'Application submitted' },
    ],
  },
  {
    id: 'legal-1043',
    kind: 'legal_change',
    reference: 'LC-1043',
    applicantName: 'Lan Pham',
    applicantEmail: 'operations@pulsecollective.vn',
    organizationName: 'Pulse Collective',
    submittedAt: '2026-10-07T04:35:00.000Z',
    status: 'pending',
    identity: [
      { label: 'Submitted by', value: 'Lan Pham' },
      { label: 'Email', value: 'operations@pulsecollective.vn' },
      { label: 'Gym', value: 'Pulse Collective' },
    ],
    submission: [
      { label: 'Change requested', value: 'Registered address' },
      { label: 'Current address', value: 'District 3, Ho Chi Minh City' },
      { label: 'Requested address', value: 'Thu Duc City, Ho Chi Minh City' },
      { label: 'Reason supplied', value: 'Registered office relocation' },
    ],
    documents: [
      {
        id: 'doc-1043-a',
        label: 'Updated registration extract',
        category: 'Legal document',
        submittedAt: '2026-10-07T04:35:00.000Z',
        viewUrl: '/demo-documents/updated-registration-extract.pdf',
      },
    ],
    timeline: [
      { id: 'event-1043', at: '2026-10-07T04:35:00.000Z', label: 'Legal change submitted' },
    ],
  },
  {
    id: 'trainer-2041',
    kind: 'trainer_application',
    reference: 'TR-2041',
    applicantName: 'Tuan Le',
    applicantEmail: 'tuan.le@coachmail.vn',
    organizationName: 'Northstar Fitness',
    submittedAt: '2026-10-06T10:00:00.000Z',
    status: 'pending',
    identity: [
      { label: 'Trainer', value: 'Tuan Le' },
      { label: 'Email', value: 'tuan.le@coachmail.vn' },
      { label: 'Linked gym', value: 'Northstar Fitness' },
    ],
    submission: [
      { label: 'Coaching focus', value: 'Strength and general fitness' },
      { label: 'Years of experience', value: '6 years' },
      { label: 'Certification', value: 'National Personal Training Certificate' },
      { label: 'Linked gym', value: 'Northstar Fitness' },
    ],
    documents: [
      {
        id: 'doc-2041-a',
        label: 'Professional certification',
        category: 'Trainer document',
        submittedAt: '2026-10-06T10:00:00.000Z',
        viewUrl: '/demo-documents/professional-certification.pdf',
      },
      {
        id: 'doc-2041-b',
        label: 'Identity verification',
        category: 'Trainer document',
        submittedAt: '2026-10-06T10:00:00.000Z',
        viewUrl: '/demo-documents/identity-verification.pdf',
      },
    ],
    timeline: [
      { id: 'event-2041', at: '2026-10-06T10:00:00.000Z', label: 'Trainer profile submitted' },
    ],
  },
];

export const initialPlatformAccounts: ReadonlyArray<PlatformAccountRecord> = [
  {
    id: 'account-001',
    fullName: 'Minh Nguyen',
    email: 'm.nguyen@northstar.fit',
    role: 'gym_owner',
    relationship: 'Northstar Fitness',
    createdAt: '2026-10-07T08:20:00.000Z',
    status: 'active',
  },
  {
    id: 'account-002',
    fullName: 'Tuan Le',
    email: 'tuan.le@coachmail.vn',
    role: 'trainer',
    relationship: 'Northstar Fitness',
    createdAt: '2026-10-06T10:00:00.000Z',
    status: 'active',
  },
  {
    id: 'account-003',
    fullName: 'Anh Tran',
    email: 'anh.tran@example.com',
    role: 'member',
    relationship: 'Member account',
    createdAt: '2026-09-21T09:00:00.000Z',
    status: 'active',
  },
  {
    id: 'account-004',
    fullName: 'Linh Ho',
    email: 'linh.ho@example.com',
    role: 'member',
    relationship: 'Member account',
    createdAt: '2026-09-18T09:00:00.000Z',
    status: 'suspended',
  },
];
