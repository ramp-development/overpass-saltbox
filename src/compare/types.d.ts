declare global {
  interface Window {
    PRICING_CONFIG: PricingConfig[];
  }
}

type Input = HTMLSelectElement | HTMLInputElement;
type Output = HTMLElement;
type Values = {
  location: string;
  timeframe: string;
  logisticSupport: boolean;
  warehouseSuite: string;
  officeSuite: string;
};

type OptionMap = {
  element: HTMLOptionElement;
  value: string;
  text: string | null;
};

type WarehouseSize = 'None' | 'Small' | 'Medium' | 'Large' | 'XLarge';
type OfficeSize = 'None' | '1 person' | '2 person' | '3 person' | '4 person';

interface Combination {
  warehouse: WarehouseSize;
  office: OfficeSize;
  total: number;
}

interface LocationConfig {
  id: string;
  combinations: Combination[];
}

interface PricingConfig {
  TIMEFRAME: {
    MONTHLY: string;
    BI_ANNUALLY: string;
    ANNUALLY: string;
  };
  DISCOUNT: {
    MONTHLY: number;
    BI_ANNUALLY: number;
    ANNUALLY: number;
  };
  LOGISTIC_SUPPORT: {
    INCLUDED: number;
    EXCLUDED: number;
  };
  PROMPT: {
    LOCATION: string;
    OPTIONS: string;
  };
  OPTIONS: {
    LOCATION: string;
    WAREHOUSE: string;
    READY: string;
  };
  LOCATIONS: LocationConfig[];
}
