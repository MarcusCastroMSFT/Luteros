import React from 'react';
import { Book, Users, Search, CheckCircle, MessageCircle, Mail, Phone } from 'lucide-react';
import type { QuickAction } from '@/types/help';

interface QuickActionsProps {
  actions: QuickAction[];
}

// Icon mapping function to convert string names to components
const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    Book,
    Users,
    Search,
    CheckCircle,
    MessageCircle,
    Mail,
    Phone
  };
  return icons[iconName] || Book;
};

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Precisa de Ajuda Rápida?
        </h2>
        <p className="text-gray-600">
          Nossa equipe está pronta para ajudar você
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {actions.map((action, index) => {
          const Icon = getIconComponent(action.icon);
          return (
            <button
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-cta-highlight hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-cta-highlight/10 p-3 rounded-lg group-hover:bg-cta-highlight/20 transition-colors">
                  <Icon className="text-cta-highlight" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
