import { CompareTable } from './class';

export const compare = () => {
  // eslint-disable-next-line no-console
  console.log('compare');

  const attr = 'data-compare';
  const components = [...document.querySelectorAll<HTMLDivElement>(`[${attr}="component"]`)];
  if (components.length === 0) return;

  components.forEach((component) => {
    const compareTable = new CompareTable(component);
    compareTable.init();
  });
};
