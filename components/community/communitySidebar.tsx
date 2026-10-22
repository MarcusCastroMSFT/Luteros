'use client';

import { 
  MessageSquare, 
  Reply, 
  Bookmark, 
  Baby, 
  Stethoscope, 
  Heart, 
  Users, 
  FlowerIcon as Flower,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunitySidebarProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
  isMobile?: boolean;
}

export function CommunitySidebar({ onCategorySelect, selectedCategory, isMobile = false }: CommunitySidebarProps) {
  const userSections = [
    { id: 'my-posts', label: 'Meus posts', icon: MessageSquare },
    { id: 'my-replies', label: 'Minhas respostas', icon: Reply },
    { id: 'my-bookmarks', label: 'Meus favoritos', icon: Bookmark },
  ];

  const categorySections = [
    {
      title: 'GRAVIDEZ E CUIDADOS COM RECÉM-NASCIDOS',
      items: [
        { id: 'pregnancy', label: 'Gravidez', icon: Baby },
        { id: 'birth-month-groups', label: 'Grupos por mês de nascimento', icon: Users },
        { id: 'postpartum', label: 'Pós-parto', icon: Heart },
      ]
    },
    {
      title: 'SUPORTE CONTÍNUO',
      items: [
        { id: 'ask-provider', label: 'Pergunte a um especialista', icon: Stethoscope },
        { id: 'general-health', label: 'Saúde geral', icon: Heart },
      ]
    },
    {
      title: 'PATERNIDADE E PEDIATRIA',
      items: [
        { id: 'parenting-pediatrics', label: 'Paternidade e pediatria', icon: Users },
      ]
    },
    {
      title: 'FERTILIDADE E CONSTRUÇÃO FAMILIAR',
      items: [
        { id: 'ttc-fertility', label: 'TTC e fertilidade', icon: Flower },
        { id: 'fertility-treatment', label: 'Tratamento de fertilidade', icon: Sparkles },
        { id: 'adoption-surrogacy', label: 'Adoção e barriga de aluguel', icon: Heart },
      ]
    },
    {
      title: 'MENOPAUSA E SAÚDE DA MEIA-IDADE',
      items: [
        { id: 'menopause', label: 'Menopausa', icon: Flower },
      ]
    }
  ];

  const itemClass = (active: boolean, bordered = false) => cn(
    'flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
    active ? 'bg-brand-600 text-white' : 'text-brand-900 hover:bg-white/70',
    bordered && !active && 'border border-brand-600/20',
  );

  return (
    <div className={isMobile ? '' : 'rounded-[12px_40px_12px_12px] border border-brand-600/15 bg-[#e4eeeb]/40 p-6'}>
      {/* User Sections - Hide on mobile since we have quick access tabs */}
      {!isMobile && (
        <div className="mb-8">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-brand-700">
            MINHA COMUNIDADE
          </h3>
          <div className="space-y-2">
            {userSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => onCategorySelect(section.id)}
                  aria-pressed={selectedCategory === section.id}
                  className={itemClass(selectedCategory === section.id)}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Sections */}
      {categorySections.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-6">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-brand-700">
            {category.title}
          </h3>
          <div className={isMobile ? 'grid grid-cols-2 gap-2' : 'space-y-1'}>
            {category.items.map((item) => {
              const Icon = item.icon;
              const active = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onCategorySelect(item.id)}
                  aria-pressed={active}
                  className={itemClass(active, isMobile)}
                >
                  <Icon size={16} aria-hidden="true" className={active ? 'text-white' : 'text-brand-600'} />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
