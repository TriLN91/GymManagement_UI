import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import './workout-flow.css';

interface WorkoutFlowShellProps {
  backTo: string;
  backLabel: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function WorkoutFlowShell({ backTo, backLabel, actions, children }: WorkoutFlowShellProps) {
  return (
    <div className="workout-flow">
      <header className="workout-flow__header">
        <Link className="workout-flow__back" to={backTo}>
          <ArrowLeft aria-hidden="true" size={16} /> {backLabel}
        </Link>
        {actions && <div className="workout-flow__actions">{actions}</div>}
      </header>
      {children}
    </div>
  );
}
