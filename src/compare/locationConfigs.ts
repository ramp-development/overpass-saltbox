declare global {
  interface Window {
    locationConfigs: LocationConfig[];
  }
}

type locationValue = number | null;

export interface LocationConfig {
  id: string;
  name: string;
  warehouse: {
    none: locationValue;
    small: locationValue;
    medium: locationValue;
    large: locationValue;
    xlarge: locationValue;
  };
  suites: {
    none: locationValue;
    one: locationValue;
    two: locationValue;
    three: locationValue;
    four: locationValue;
  };
}

export const locationConfigs: LocationConfig[] = [
  {
    id: 'ATLUW',
    name: 'Atlanta Upper Westside',
    warehouse: { none: 0, small: 550, medium: 1225, large: 2000, xlarge: 3800 },
    suites: { none: 0, one: 500, two: 1000, three: 1400, four: 1800 },
  },
  {
    id: 'ATLWP',
    name: 'Atlanta Westside Park',
    warehouse: { none: 0, small: 575, medium: 1350, large: 2400, xlarge: 4125 },
    suites: { none: 0, one: 575, two: 1125, three: 1550, four: 1950 },
  },
  {
    id: 'DALC',
    name: 'Dallas Carrollton',
    warehouse: { none: 0, small: 525, medium: 1450, large: 2475, xlarge: 3825 },
    suites: { none: 0, one: 475, two: 875, three: null, four: 1175 },
  },
  {
    id: 'DALF',
    name: 'Dallas Farmers Branch',
    warehouse: { none: 0, small: 850, medium: 1400, large: 2475, xlarge: 3875 },
    suites: { none: 0, one: 475, two: 875, three: 1175, four: 1450 },
  },
  {
    id: 'DEN',
    name: 'Denver',
    warehouse: { none: 0, small: 300, medium: 1300, large: 2150, xlarge: 3600 },
    suites: { none: 0, one: 550, two: 1000, three: 1400, four: 1750 },
  },
  {
    id: 'LAD',
    name: 'Los Angeles Duarte',
    warehouse: { none: 0, small: 0, medium: 1800, large: 3100, xlarge: 5900 },
    suites: { none: 0, one: 500, two: 740, three: 1170, four: 1410 },
  },
  {
    id: 'LAT',
    name: 'Los Angeles Torrance',
    warehouse: { none: 0, small: 775, medium: 2050, large: 3700, xlarge: 5450 },
    suites: { none: 0, one: 600, two: 1000, three: 1300, four: 1600 },
  },
  {
    id: 'MIA',
    name: 'Miami',
    warehouse: { none: 0, small: 875, medium: 2175, large: 3500, xlarge: 5650 },
    suites: { none: 0, one: 775, two: 1075, three: null, four: 1550 },
  },
  {
    id: 'MIN',
    name: 'Minneapolis',
    warehouse: { none: null, small: 550, medium: 1300, large: 2100, xlarge: 3600 },
    suites: { none: 0, one: null, two: null, three: null, four: null },
  },
  {
    id: 'PHO',
    name: 'Phoenix',
    warehouse: { none: 0, small: 500, medium: 1500, large: 2500, xlarge: 4200 },
    suites: { none: 0, one: 550, two: 850, three: null, four: 1800 },
  },
  {
    id: 'SEA',
    name: 'Seattle',
    warehouse: { none: null, small: 375, medium: 1700, large: 2575, xlarge: 4000 },
    suites: { none: 0, one: null, two: null, three: null, four: null },
  },
  {
    id: 'WASH',
    name: 'Washington DC',
    warehouse: { none: 0, small: 725, medium: 1975, large: 3300, xlarge: 5450 },
    suites: { none: 0, one: 725, two: 1025, three: 1450, four: 1850 },
  },
];
