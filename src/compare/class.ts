import { type CompareRoute, type CompareRouteGroup, type CompareRouteGroups } from './routeConfigs';

type GroupName = 'parsel' | 'other' | 'retail';
type Input = HTMLSelectElement;
type Output = HTMLElement;

export class CompareTable {
  private component: HTMLElement;
  private origin: HTMLSelectElement;
  private destination: HTMLSelectElement;
  private inputs: Input[];
  private outputs: Output[];
  private routeName: string;
  private routeConfig: CompareRouteGroups;

  constructor(component: HTMLElement) {
    this.component = component;
    this.origin = component.querySelector('select[name="origin"]') as HTMLSelectElement;
    this.destination = component.querySelector('select[name="destination"]') as HTMLSelectElement;
    this.inputs = [this.origin, this.destination];
    this.outputs = [...component.querySelectorAll<HTMLElement>('[data-compare-output]')];
    this.routeName = this.getRouteName();
    this.routeConfig = this.getRouteConfig();
    this.update = this.update.bind(this);
  }

  public init(): void {
    this.render();
    this.bindEvents();
  }

  private bindEvents(): void {
    this.inputs.forEach((input) => {
      input.addEventListener('change', () => {
        this.update();
      });
    });
  }

  private update(): void {
    this.routeName = this.getRouteName();
    this.routeConfig = this.getRouteConfig();
    this.render();
  }

  private render(): void {
    this.outputs.forEach((output) => {
      const { compareGroup, compareOutput } = output.dataset;
      if (!compareGroup || !compareOutput) return;

      const groupConfig = this.getGroupConfig(compareGroup as GroupName);
      const value = groupConfig[compareOutput];

      switch (compareOutput) {
        case 'costTag':
          const { costTagVisibility } = groupConfig;
          if (costTagVisibility) {
            output.style.removeProperty('display');
          } else {
            output.style.display = 'none';
          }
          this.setText(output, value);
          break;
        case 'speedTagVisibility':
          const { speedTagVisibility } = groupConfig;
          if (speedTagVisibility) {
            output.style.removeProperty('display');
          } else {
            output.style.display = 'none';
          }
          this.setText(output, value);
          break;
        case 'pickup':
          output.dataset.comparePickup = value;
          break;
        default:
          this.setText(output, value);
          break;
      }
    });
  }

  private setText(output: Output, text: string) {
    output.textContent = text;
  }

  private getRouteName(): string {
    return `${this.origin.value}-${this.destination.value}`;
  }

  private getRouteConfig(): CompareRouteGroups {
    const { routeConfigs } = window;
    const routeConfig = routeConfigs.find((item) => item.name === this.routeName);
    if (!routeConfig) throw new Error(`No route configuration found for ${this.routeName}`);

    this.routeConfig = routeConfig.outputs;
    this.updateRouteConfig();
    return routeConfig.outputs;
  }

  private updateRouteConfig(): void {
    // parsel cost tag
    const costSavings = this.routeConfig.parsel.cost / this.routeConfig.retail.cost;
    const roundedSavings = Math.round(costSavings * 100);
    const costTag = `${roundedSavings}% savings`;
    const costTagVisibility = roundedSavings < 1 ? false : true;

    // parsel speed tag
    const difference = this.routeConfig.retail.speedValue - this.routeConfig.parsel.speedValue;
    const plural = difference > 1 ? 'days' : 'day';
    const speedTag = `${difference} ${plural} faster`;
    const speedTagVisibility = difference < 1 ? false : true;

    // apply
    this.routeConfig.parsel.costTag = costTag;
    this.routeConfig.parsel.costTagVisibility = costTagVisibility;
    this.routeConfig.parsel.speedTag = speedTag;
    this.routeConfig.parsel.speedTagVisibility = speedTagVisibility;

    // speed labels
    this.routeConfig.parsel.speedLabel = this.routeConfig.parsel.speedValue > 1 ? 'days' : 'day';
    this.routeConfig.other.speedLabel = this.routeConfig.other.speedValue > 1 ? 'days' : 'day';
    this.routeConfig.retail.speedLabel = this.routeConfig.retail.speedValue > 1 ? 'days' : 'day';
  }

  private getGroupConfig(groupName: GroupName): CompareRouteGroup {
    const routeGroupConfig = this.routeConfig[groupName];
    return routeGroupConfig;
  }
}
