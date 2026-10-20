import { Navigate, useParams } from 'react-router-dom';

import { RuntimeAdminWorkspace } from '@/features/movement-reference-admin/ui/RuntimeAdminWorkspace';
import { ROUTES } from '@/shared/config/constants';

export function MovementReferenceSetPage() {
  const { referenceSetId } = useParams();
  if (!referenceSetId) return <Navigate to={ROUTES.superadmin.movementAssessment} replace />;
  return <RuntimeAdminWorkspace referenceSetId={referenceSetId} />;
}
