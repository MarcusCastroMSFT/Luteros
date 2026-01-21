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

interface CommunitySidebarProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string;
}

export function CommunitySidebar({ onCategorySelect, selectedCategory }: CommunitySidebarProps) {
  const userSections = [
    { id: 'my-posts', label: 'Meus posts', icon: MessageSquare },
    { id: 'my-replies', label: 'Minhas respostas', icon: Reply },
    { id: 'my-bookmarks', label: 'Meus favoritos', icon: Bookmark },
  ];

  const categorySections = [
    {
      title: 'GRAVIDEZ E CUIDADOS COM RECÉM-NASCIDOS',
      items: [
        { id: 'pregnancy', label: 'Gravidez', icon: Baby, color: 'text-brand-600' },
        { id: 'birth-month-groups', label: 'Grupos por mês de nascimento', icon: Users, color: 'text-blue-600' },
        { id: 'postpartum', label: 'Pós-parto', icon: Heart, color: 'text-pink-600' },
      ]
    },
    {
      title: 'SUPORTE CONTÍNUO',
      items: [
        { id: 'ask-provider', label: 'Pergunte a um especialista', icon: Stethoscope, color: 'text-green-600' },
        { id: 'general-health', label: 'Saúde geral', icon: Heart, color: 'text-red-600' },
      ]
    },
    {
      title: 'PATERNIDADE E PEDIATRIA',
      items: [
        { id: 'parenting-pediatrics', label: 'Paternidade e pediatria', icon: Users, color: 'text-indigo-600' },
      ]
    },
    {
      title: 'FERTILIDADE E CONSTRUÇÃO FAMILIAR',
      items: [
        { id: 'ttc-fertility', label: 'TTC e fertilidade', icon: Flower, color: 'text-purple-600' },
        { id: 'fertility-treatment', label: 'Tratamento de fertilidade', icon: Sparkles, color: 'text-brand-600' },
        { id: 'adoption-surrogacy', label: 'Adoção e barriga de aluguel', icon: Heart, color: 'text-rose-600' },
      ]
    },
    {
      title: 'MENOPAUSA E SAÚDE DA MEIA-IDADE',
      items: [
        { id: 'menopause', label: 'Menopausa', icon: Flower, color: 'text-violet-600' },
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* User Sections */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
          MINHA COMUNIDADE
        </h3>
        <div className="space-y-2">
          {userSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onCategorySelect(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  selectedCategory === section.id
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Sections */}
      {categorySections.map((category, categoryIndex) => (
        <div key={categoryIndex} className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            {category.title}
          </h3>
          <div className="space-y-1">
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onCategorySelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    selectedCategory === item.id
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} className={item.color} />
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
