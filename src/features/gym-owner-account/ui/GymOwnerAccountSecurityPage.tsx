import { KeyRound, MailCheck, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { importantActivityResource } from '../model/mockData';

import { AccountResourceStateView } from './AccountResourceState';
import { gymOwnerAccountCopy } from './copy';

import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { Badge } from '@/shared/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { WorkspacePage, WorkspacePanel } from '@/shared/ui/workspace';

import './gym-owner-account.css';

function maskEmail(email: string) {
  const [local = '', domain = ''] = email.split('@');
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
}

export function GymOwnerAccountSecurityPage() {
  const { i18n } = useTranslation();
  const isVi = i18n.resolvedLanguage === 'vi';
  const text = gymOwnerAccountCopy[isVi ? 'vi' : 'en'];
  const locale = isVi ? 'vi-VN' : 'en-US';
  const email = useAuthStore((state) => state.user?.email ?? '');

  return (
    <WorkspacePage width="wide" className="gym-account-page">
      <h1 className="sr-only">{text.accountSecurity}</h1>

      <WorkspacePanel className="gym-security-verification">
        <div className="gym-security-verification__icon">
          <MailCheck aria-hidden="true" size={24} />
        </div>
        <div>
          <span>{text.emailOtp}</span>
          <strong>{text.mandatoryEverySession}</strong>
          <p>{text.backendPolicy}</p>
        </div>
        <dl>
          <div>
            <dt>{text.registeredEmail}</dt>
            <dd>{maskEmail(email)}</dd>
          </div>
        </dl>
        <Badge variant="accent">
          <ShieldCheck aria-hidden="true" size={13} />
          {text.protected}
        </Badge>
      </WorkspacePanel>

      <WorkspacePanel className="gym-activity-panel">
        <div className="gym-activity-panel__header">
          <div>
            <KeyRound aria-hidden="true" size={18} />
            <h2>{text.importantActivity}</h2>
          </div>
          <span>{text.activityBoundary}</span>
        </div>
        <AccountResourceStateView
          resource={importantActivityResource}
          loadingLabel={text.loadingActivity}
          emptyLabel={text.emptyActivity}
          errorLabel={text.errorActivity}
        >
          {(records) => (
            <TableContainer className="gym-activity-table-shell">
              <Table aria-label={text.importantActivity} className="gym-activity-table">
                <TableHeader>
                  <TableRow>
                    <TableHead>{text.dateTime}</TableHead>
                    <TableHead>{text.activity}</TableHead>
                    <TableHead>{text.context}</TableHead>
                    <TableHead>{text.result}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell data-label={text.dateTime}>
                        <time dateTime={record.occurredAt}>
                          {new Intl.DateTimeFormat(locale, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(record.occurredAt))}
                        </time>
                      </TableCell>
                      <TableCell data-label={text.activity}>
                        <strong>{record.activity[isVi ? 'vi' : 'en']}</strong>
                      </TableCell>
                      <TableCell data-label={text.context}>
                        {record.context[isVi ? 'vi' : 'en']}
                      </TableCell>
                      <TableCell data-label={text.result}>
                        <Badge variant={record.result === 'success' ? 'accent' : 'neutral'}>
                          {record.result === 'success' ? text.success : text.submitted}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccountResourceStateView>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
