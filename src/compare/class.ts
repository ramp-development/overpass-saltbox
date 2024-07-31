import { queryElement } from '$utils/queryElement';
import { queryElements } from '$utils/queryElements';

import { type LocationConfig, locationConfigs } from './locationConfigs';

type Input = HTMLSelectElement | HTMLInputElement;
type Output = HTMLElement;
type Values = {
  location: string;
  timeframe: string;
  warehouseSuite: string;
  officeSuite: string;
};

/**
 * PLAN
 * - get a reference to all necessary elements:
 *  - inputs, outputs, active timeframe
 * - save the values of the inputs
 * - functions to update the values on change
 * - function to set active class for timeframe
 */

export class PricingTable {
  private component: HTMLElement;
  private locations: HTMLSelectElement;
  private timeframes: HTMLInputElement[];
  private activeTimeframe: HTMLInputElement;
  private warehouseSuites: HTMLSelectElement;
  private officeSuites: HTMLSelectElement;
  private inputs: Input[];
  private outputs: Output[];
  private values: Values;
  private locationConfig: LocationConfig;

  constructor(component: HTMLElement) {
    this.component = component;
    this.locations = queryElement('select[data-input="location"]', component) as HTMLSelectElement;
    this.timeframes = queryElements('input[name="Billed"]', component) as HTMLInputElement[];
    this.activeTimeframe = this.getActiveTimeframe() as HTMLInputElement;
    this.warehouseSuites = queryElement(
      'select[data-input="warehouse"]',
      component
    ) as HTMLSelectElement;
    this.officeSuites = queryElement('select[data-input="suite"]', component) as HTMLSelectElement;
    this.inputs = [this.locations, ...this.timeframes, this.warehouseSuites, this.officeSuites];
    this.outputs = queryElements<HTMLElement>('[data-pricing="output"][data-output]', component);
    this.values = this.getValues();
    this.locationConfig = this.getLocationConfig();
    this.update = this.update.bind(this);
  }

  public init(): void {
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.setTimeframeActiveClass();

    this.outputs.forEach((output) => {
      const type = output.dataset.output;
      console.log(type);

      if (type === 'timeframe') {
        const timeframe =
          this.values.timeframe === '6 Monthly'
            ? '/6 months'
            : this.values.timeframe === 'Yearly'
              ? '/year'
              : '/month';

        this.setText(output, timeframe);
        return;
      }

      if (type === 'workspace-price') {
        const warehousePrice = this.locationConfig.warehouse[this.values.warehouseSuite];
        const officePrice = this.locationConfig.suites[this.values.officeSuite];
        const price = warehousePrice + officePrice;

        this.setText(output, price.toLocaleString());
      }
    });

    // this.outputs.forEach((output) => {
    //   const { compareGroup, compareOutput } = output.dataset;
    //   if (!compareGroup || !compareOutput) return;
    //   const groupConfig = this.getGroupConfig(compareGroup as GroupName);
    //   const value = groupConfig[compareOutput];
    //   switch (compareOutput) {
    //     case 'cost':
    //       const currency = value.toLocaleString(undefined, {
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2,
    //       });
    //       this.setText(output, currency);
    //       break;
    //     case 'costTag':
    //       const { costTagVisibility } = groupConfig;
    //       if (costTagVisibility) {
    //         output.style.removeProperty('display');
    //       } else {
    //         output.style.display = 'none';
    //       }
    //       this.setText(output, value);
    //       break;
    //     case 'speedTag':
    //       const { speedTagVisibility } = groupConfig;
    //       if (speedTagVisibility) {
    //         output.style.removeProperty('display');
    //       } else {
    //         output.style.display = 'none';
    //       }
    //       this.setText(output, value);
    //       break;
    //     case 'pickup':
    //       output.dataset.comparePickup = value;
    //       break;
    //     default:
    //       this.setText(output, value);
    //       break;
    //   }
    // });
  }

  private bindEvents(): void {
    this.timeframes.forEach((input) => {
      input.addEventListener('change', () => {
        this.activeTimeframe = this.getActiveTimeframe();
        this.setTimeframeActiveClass();
      });
    });

    this.inputs.forEach((input) => {
      input.addEventListener('change', this.update);
    });
  }

  private update(): void {
    this.activeTimeframe = this.getActiveTimeframe();
    this.values = this.getValues();
    this.locationConfig = this.getLocationConfig();
    this.render();
  }

  private getActiveTimeframe(): HTMLInputElement {
    return this.timeframes.find((timeframe) => timeframe.checked) ?? this.timeframes[0];
  }

  private getValues(): Values {
    const values = {
      location: this.locations.value as string,
      timeframe: this.activeTimeframe.value as string,
      warehouseSuite: this.warehouseSuites.value as string,
      officeSuite: this.officeSuites.value as string,
    };

    this.values = values;
    return values;
  }

  private getLocationConfig(): LocationConfig {
    // const { locationConfigs } = window;
    const locationConfig = locationConfigs.find((item) => item.name === this.values.location);
    if (!locationConfig) {
      throw new Error(`No route configuration found for ${this.values.location}`);
    }

    this.locationConfig = locationConfig;
    // this.updateLocationConfig();
    return locationConfig;
  }

  private setTimeframeActiveClass(): void {
    this.timeframes.forEach((timeframe) => {
      const wrapper = timeframe.parentElement;
      if (!wrapper) return;

      wrapper.classList.remove('is-active');
    });

    const { parentElement } = this.activeTimeframe;
    if (!parentElement) return;

    parentElement.classList.add('is-active');
  }

  private setText(output: Output, text: string) {
    output.textContent = text;
  }

  // private updateLocationConfig(): void {
  //   // // parsel cost tag
  //   // const costSavings = this.locationConfig.parsel.cost / this.locationConfig.retail.cost;
  //   // const roundedSavings = Math.round(costSavings * 100);
  //   // const costTag = `${roundedSavings}% savings`;
  //   // const costTagVisibility = roundedSavings < 1 ? false : true;
  //   // // parsel speed tag
  //   // const difference = this.locationConfig.retail.speedValue - this.locationConfig.parsel.speedValue;
  //   // const plural = difference > 1 ? 'days' : 'day';
  //   // const speedTag = `${difference} ${plural} faster`;
  //   // const speedTagVisibility = difference < 1 ? false : true;
  //   // // apply
  //   // this.locationConfig.parsel.costTag = costTag;
  //   // this.locationConfig.parsel.costTagVisibility = costTagVisibility;
  //   // this.locationConfig.parsel.speedTag = speedTag;
  //   // this.locationConfig.parsel.speedTagVisibility = speedTagVisibility;
  //   // // speed labels
  //   // this.locationConfig.parsel.speedLabel = this.locationConfig.parsel.speedValue > 1 ? 'days' : 'day';
  //   // this.locationConfig.other.speedLabel = this.locationConfig.other.speedValue > 1 ? 'days' : 'day';
  //   // this.locationConfig.retail.speedLabel = this.locationConfig.retail.speedValue > 1 ? 'days' : 'day';
  // }

  // private getGroupConfig(groupName: GroupName): CompareRouteGroup {
  //   const routeGroupConfig = this.locationConfig[groupName];
  //   return routeGroupConfig;
  // }
}
