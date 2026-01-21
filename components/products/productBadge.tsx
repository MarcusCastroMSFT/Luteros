import { Badge } from '@/components/ui/badge';
import { Crown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductBadgeProps {
  availability: 'all' | 'members';
  className?: string;
}

export function ProductBadge({ availability, className }: ProductBadgeProps) {
  return (
    <Badge
      variant={availability === 'members' ? 'default' : 'secondary'}
      className={cn(
        'flex items-center gap-1 text-xs font-medium px-2 py-1',
        availability === 'members' 
          ? 'bg-gradient-to-r from-cta-highlight to-brand-600 text-white border-cta-highlight' 
          : 'bg-green-100 text-green-800 border-green-200',
        className
      )}
    >
      {availability === 'members' ? (
        <>
          <Crown size={12} />
          Exclusivo Membros
        </>
      ) : (
        <>
          <Users size={12} />
          Para Todos
        </>
      )}
    </Badge>
  );
}
