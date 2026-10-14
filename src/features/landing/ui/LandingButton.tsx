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
  const className = `fit-button ${outline ? 'fit-button--outline' : ''}`;
  // In-page anchors ("#section") are plain links; routes go through the router.
  return (
    <Button asChild className={className}>
      {to.startsWith('#') ? (
        <a href={to}>
          {children}
          <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      ) : (
        <Link to={to}>
          {children}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      )}
    </Button>
  );
}
