import Link from 'next/link';
import { FileText, Calendar, Package, BookOpen } from 'lucide-react';

const actions = [
  { href: '/admin/articles/new', label: 'Novo artigo', icon: FileText },
  { href: '/admin/courses/new', label: 'Novo curso', icon: BookOpen },
  { href: '/admin/events', label: 'Novo evento', icon: Calendar },
  { href: '/admin/products/new', label: 'Novo produto', icon: Package },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </Link>
      ))}
    </div>
  );
}
