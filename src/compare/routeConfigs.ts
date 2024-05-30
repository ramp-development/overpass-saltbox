declare global {
  interface Window {
    routeConfigs: CompareRoute[];
  }
}

// Now you can use window.routeConfigs
console.log(window.routeConfigs);

export interface CompareRouteGroup {
  cost: number;
  costTag?: string;
  costTagVisibility?: boolean;
  speedValue: number;
  speedTag?: string;
  speedTagVisibility?: boolean;
  speedLabel?: string;
  pickup: boolean;
  pickupTag?: string;
}

export interface CompareRouteGroups {
  parsel: CompareRouteGroup;
  other: CompareRouteGroup;
  retail: CompareRouteGroup;
}

export interface CompareRoute {
  name: string;
  outputs: CompareRouteGroups;
}

export const routeConfigs: CompareRoute[] = [
  {
    name: 'Boston-NewYork',
    outputs: {
      parsel: {
        cost: 6.07,
        speedValue: 2,
        pickup: true,
        pickupTag: 'Up to 5 free pickups',
      },
      other: {
        cost: 8.12,
        speedValue: 3,
        pickup: false,
      },
      retail: {
        cost: 12.45,
        speedValue: 3,
        pickup: false,
      },
    },
  },
  {
    name: 'Boston-Dallas',
    outputs: {
      parsel: {
        cost: 4.07,
        speedValue: 1,
        pickup: true,
        pickupTag: 'Up to 4 free pickups',
      },
      other: {
        cost: 6.12,
        speedValue: 2,
        pickup: false,
      },
      retail: {
        cost: 10.45,
        speedValue: 2,
        pickup: false,
      },
    },
  },
  {
    name: 'Denver-NewYork',
    outputs: {
      parsel: {
        cost: 7.07,
        speedValue: 1,
        pickup: true,
        pickupTag: 'Up to 6 free pickups',
      },
      other: {
        cost: 9.12,
        speedValue: 2,
        pickup: false,
      },
      retail: {
        cost: 13.45,
        speedValue: 2,
        pickup: false,
      },
    },
  },
];
