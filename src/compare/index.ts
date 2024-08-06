import { queryElements } from '$utils/queryElements';

import { PricingTable } from './class';

export const pricing = () => {
  // eslint-disable-next-line no-console
  console.log('pricing');

  const attr = 'data-pricing';
  const components = queryElements<HTMLDivElement>(`[${attr}="component"]`);

  components.forEach((component) => {
    new PricingTable(component);
  });
};
