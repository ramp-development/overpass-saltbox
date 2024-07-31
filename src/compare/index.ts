import { queryElements } from '$utils/queryElements';

import { PricingTable } from './class';

export const pricing = () => {
  // eslint-disable-next-line no-console
  console.log('pricing');

  const attr = 'data-pricing';
  const components = queryElements<HTMLDivElement>(`[${attr}="component"]`);

  setTimeout(() => {
    components.forEach((component) => {
      const pricingTable = new PricingTable(component);
      pricingTable.init();
    });
  }, 500);
};
