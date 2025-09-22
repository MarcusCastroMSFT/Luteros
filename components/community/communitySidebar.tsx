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
        { id: 'pregnancy', label: 'Gravidez', icon: Baby, color: 'text-teal-600 dark:text-teal-400' },
        { id: 'birth-month-groups', label: 'Grupos por mês de nascimento', icon: Users, color: 'text-blue-600 dark:text-blue-400' },
        { id: 'postpartum', label: 'Pós-parto', icon: Heart, color: 'text-pink-600 dark:text-pink-400' },
      ]
    },
    {
      title: 'SUPORTE CONTÍNUO',
      items: [
        { id: 'ask-provider', label: 'Pergunte a um especialista', icon: Stethoscope, color: 'text-green-600 dark:text-green-400' },
        { id: 'general-health', label: 'Saúde geral', icon: Heart, color: 'text-red-600 dark:text-red-400' },
      ]
    },
    {
      title: 'PATERNIDADE E PEDIATRIA',
      items: [
        { id: 'parenting-pediatrics', label: 'Paternidade e pediatria', icon: Users, color: 'text-indigo-600 dark:text-indigo-400' },
      ]
    },
    {
      title: 'FERTILIDADE E CONSTRUÇÃO FAMILIAR',
      items: [
        { id: 'ttc-fertility', label: 'TTC e fertilidade', icon: Flower, color: 'text-purple-600 dark:text-purple-400' },
        { id: 'fertility-treatment', label: 'Tratamento de fertilidade', icon: Sparkles, color: 'text-orange-600 dark:text-orange-400' },
        { id: 'adoption-surrogacy', label: 'Adoção e barriga de aluguel', icon: Heart, color: 'text-rose-600 dark:text-rose-400' },
      ]
    },
    {
      title: 'MENOPAUSA E SAÚDE DA MEIA-IDADE',
      items: [
        { id: 'menopause', label: 'Menopausa', icon: Flower, color: 'text-violet-600 dark:text-violet-400' },
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* User Sections */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
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
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
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
                      ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
