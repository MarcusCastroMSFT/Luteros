export interface PricingFeature {
  id: string;
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  popular?: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonVariant: 'outline' | 'filled';
}

export interface PricingFAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface YearlyDiscount {
  percentage: number;
  description: string;
}
