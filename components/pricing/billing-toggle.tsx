import { memo } from 'react';

interface BillingToggleProps {
  isYearly: boolean;
  onToggle: (isYearly: boolean) => void;
  discount: string;
}

export const BillingToggle = memo<BillingToggleProps>(function BillingToggle({
  isYearly,
  onToggle,
  discount
}) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={`font-medium transition-colors ${
        !isYearly 
          ? 'text-gray-900 dark:text-gray-100' 
          : 'text-gray-500 dark:text-gray-400'
      }`}>
        Mensal
      </span>
      
      <button
        onClick={() => onToggle(!isYearly)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cta-highlight focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer ${
          isYearly 
            ? 'bg-cta-highlight' 
            : 'bg-gray-200 dark:bg-gray-700'
        }`}
        role="switch"
        aria-checked={isYearly}
        aria-label="Alternar entre cobrança mensal e anual"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isYearly ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      <div className="flex items-center gap-2">
        <span className={`font-medium transition-colors ${
          isYearly 
            ? 'text-gray-900 dark:text-gray-100' 
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          Anual
        </span>
        <div className="h-6 flex items-center min-w-[80px]">
          {isYearly ? (
            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
              {discount}
            </span>
          ) : (
            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap opacity-30">
              {discount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
