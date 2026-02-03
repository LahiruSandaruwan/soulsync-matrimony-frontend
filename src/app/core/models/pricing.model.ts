export interface CountryPricing {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  plans: PricingPlan[];
  paymentMethods: string[];
  taxRate?: number;
  taxName?: string;
  taxInclusive?: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  type: 'basic' | 'premium' | 'platinum';
  description: string;
  prices: PlanPrices;
  features: string[];
  isPopular?: boolean;
}

export interface PlanPrices {
  monthly: number;
  quarterly: number;
  yearly: number;
  monthlyWithTax?: number;
  quarterlyWithTax?: number;
  yearlyWithTax?: number;
}

export interface CountryInfo {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  detectedBy: 'ip' | 'manual' | 'default';
}

export interface SupportedCountry {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  isActive: boolean;
  paymentMethods: string[];
}

export interface PriceCalculation {
  plan: string;
  duration: string;
  countryCode: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  taxAmount: number;
  finalPrice: number;
  currency: string;
  currencySymbol: string;
}

// Storage keys
export const COUNTRY_STORAGE_KEY = 'soulsync_country';
export const CURRENCY_STORAGE_KEY = 'soulsync_currency';

// Default values
export const DEFAULT_COUNTRY = 'US';
export const DEFAULT_CURRENCY = 'USD';

// Country to currency mapping for quick lookup
export const COUNTRY_CURRENCY_MAP: Record<string, { code: string; symbol: string }> = {
  US: { code: 'USD', symbol: '$' },
  LK: { code: 'LKR', symbol: 'Rs.' },
  IN: { code: 'INR', symbol: '₹' },
  GB: { code: 'GBP', symbol: '£' },
  DE: { code: 'EUR', symbol: '€' },
  FR: { code: 'EUR', symbol: '€' },
  IT: { code: 'EUR', symbol: '€' },
  ES: { code: 'EUR', symbol: '€' },
  NL: { code: 'EUR', symbol: '€' },
  AU: { code: 'AUD', symbol: 'A$' },
  CA: { code: 'CAD', symbol: 'C$' },
  SG: { code: 'SGD', symbol: 'S$' },
  AE: { code: 'AED', symbol: 'د.إ' },
  SA: { code: 'SAR', symbol: '﷼' },
  PK: { code: 'PKR', symbol: 'Rs.' },
  BD: { code: 'BDT', symbol: '৳' }
};
