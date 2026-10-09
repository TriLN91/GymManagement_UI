import { Navigate, useParams } from 'react-router-dom';

import { ReferenceSetWorkspace } from '@/features/movement-reference-admin';
import { ROUTES } from '@/shared/config/constants';

export function MovementReferenceSetPage() {
  const { referenceSetId } = useParams();
  if (!referenceSetId) return <Navigate to={ROUTES.superadmin.movementAssessment} replace />;
  return <ReferenceSetWorkspace referenceSetId={referenceSetId} />;
}
