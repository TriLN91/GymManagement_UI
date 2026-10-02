import { ArrowLeft, ArrowRight, FileCheck2, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { gymOwnerCopy } from './copy';
import { OnboardingProgress } from './OnboardingProgress';

import { useGymOwnerOnboardingStore } from '@/features/gym-owner-onboarding/model/useGymOwnerOnboardingStore';
import { ROUTES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/button';
import {
  WorkspacePage,
  WorkspacePanel,
  WorkspacePanelContent,
  WorkspaceToolbar,
} from '@/shared/ui/workspace';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg']);

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function GymOwnerLicensePage() {
  const { i18n } = useTranslation();
  const copy = gymOwnerCopy[i18n.resolvedLanguage === 'vi' ? 'vi' : 'en'];
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const license = useGymOwnerOnboardingStore((state) => state.license);
  const saveLicense = useGymOwnerOnboardingStore((state) => state.saveLicense);
  const removeLicense = useGymOwnerOnboardingStore((state) => state.removeLicense);
  const [error, setError] = useState('');

  const chooseFile = (file?: File) => {
    setError('');
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError(copy.license.invalidType);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(copy.license.tooLarge);
      return;
    }

    saveLicense({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    });
  };

  const removeFile = () => {
    removeLicense();
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const continueToReview = () => {
    if (!license) {
      setError(copy.license.requiredError);
      return;
    }
    void navigate(ROUTES.admin.onboardingReview);
  };

  return (
    <WorkspacePage className="owner-onboarding-page">
      <OnboardingProgress copy={copy} />
      <WorkspaceToolbar>
        <span className="owner-step-label">{copy.license.step}</span>
      </WorkspaceToolbar>

      <WorkspacePanel>
        <div className="owner-panel-heading">
          <h1>{copy.license.section}</h1>
          <span>{copy.license.accepted}</span>
        </div>
        <WorkspacePanelContent>
          <div className="owner-license-dropzone">
            <span className="owner-license-icon" aria-hidden="true">
              {license ? <FileCheck2 size={28} /> : <UploadCloud size={28} />}
            </span>

            {license ? (
              <div className="owner-license-file" role="status">
                <div>
                  <strong>{license.name}</strong>
                  <span>
                    {formatFileSize(license.size)} · {copy.license.uploaded}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`${copy.license.remove}: ${license.name}`}
                  onClick={removeFile}
                >
                  <Trash2 aria-hidden="true" size={15} />
                  {copy.license.remove}
                </Button>
              </div>
            ) : (
              <strong>{copy.license.upload}</strong>
            )}

            <label className="owner-file-picker">
              <span>{license ? copy.license.replace : copy.license.upload}</span>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                aria-describedby={error ? 'owner-license-error' : undefined}
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
            </label>
            <small>{copy.license.accepted}</small>
          </div>

          {error ? (
            <div id="owner-license-error" className="owner-form-alert" role="alert">
              {error}
            </div>
          ) : null}
        </WorkspacePanelContent>
      </WorkspacePanel>

      <div className="owner-form-actions">
        <Button variant="ghost" onClick={() => void navigate(ROUTES.admin.onboardingProfile)}>
          <ArrowLeft aria-hidden="true" size={16} />
          {copy.license.back}
        </Button>
        <Button onClick={continueToReview}>
          {copy.license.save}
          <ArrowRight aria-hidden="true" size={16} />
        </Button>
      </div>
    </WorkspacePage>
  );
}
