import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/shared/ui/button';

export function LandingButton({
  children,
  to,
  outline = false,
}: {
  children: React.ReactNode;
  to: string;
  outline?: boolean;
}) {
  return (
    <Button asChild className={`fit-button ${outline ? 'fit-button--outline' : ''}`}>
      <Link to={to}>
        {children}
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </Button>
  );
}
