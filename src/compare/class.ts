import { queryElement } from '$utils/queryElement';
import { queryElements } from '$utils/queryElements';

import { type Combination, type LocationConfig, locationConfigs } from './locationConfigs';

const TIMEFRAME_MONTHLY = '/month',
  TIMEFRAME_BI_ANNUALLY = '/6 months',
  TIMEFRAME_ANNUALLY = '/year';

const LOGISTIC_SUPPORT_INCLUDED = 349,
  LOGISTIC_SUPPORT_NOT_INCLUDED = 199;

const DISCOUNT_MONTHLY = 0,
  DISCOUNT_BI_ANNUALLY = 0.05,
  DISCOUNT_ANNUALLY = 0.1;

const PROMPT_LOCATION = 'Select location above',
  PROMPT_OPTIONS = 'Select warehouse and office suites';

const OPTIONS_LOCATION = 'Select location for options',
  OPTIONS_WAREHOUSE = 'Select warehouse size for options',
  OPTIONS_READY = 'Select size';

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

/**
 * PLAN
 * - get a reference to all necessary elements:
 *  - inputs, outputs, active timeframe
 * - save the values of the inputs
 * - functions to update the values on change
 * - function to set active class for timeframe
 */

/**
 * @description
 * This class will handle the pricing table functionality.
 *
 * Plan:
 *
 * 1. On change of the location
 * - get the locationConfig
 * - update the warehouse and office select options
 * - when a sub option is selected, update the other sub options
 */

/**
 * @todo default pricing values?
 * @todo update warehouse selector
 * @todo update office selector
 * @todo warehouse and office selects to prompt selection of location first
 */

export class PricingTable {
  private component: HTMLElement;
  private logisticSupportInput: HTMLInputElement;
  private locationInput: HTMLSelectElement;
  private timeframeInputs: HTMLInputElement[];
  private activeTimeframe: HTMLInputElement;
  private warehouseInput: HTMLSelectElement;
  private warehouseOptions: OptionMap[];
  private officeInput: HTMLSelectElement;
  private officeOptions: OptionMap[];
  private inputs: Input[];
  private outputs: Output[];
  private values: Values;
  private locationConfig: LocationConfig | undefined;
  private pricing: HTMLElement;
  private prompt: HTMLElement;
  private promptText: HTMLSpanElement;

  constructor(component: HTMLElement) {
    this.component = component;
    this.logisticSupportInput = queryElement(
      'input[name="logisticSupport"]',
      component
    ) as HTMLInputElement;
    this.locationInput = queryElement('select[name="location"]', component) as HTMLSelectElement;
    this.timeframeInputs = queryElements('input[name="billed"]', component) as HTMLInputElement[];
    this.activeTimeframe = this.getActiveTimeframe() as HTMLInputElement;
    this.warehouseInput = queryElement('select[name="warehouse"]', component) as HTMLSelectElement;
    this.warehouseOptions = this.getOptions(this.warehouseInput);
    this.officeInput = queryElement('select[name="office"]', component) as HTMLSelectElement;
    this.officeOptions = this.getOptions(this.officeInput);
    this.inputs = [
      this.logisticSupportInput,
      this.locationInput,
      ...this.timeframeInputs,
      this.warehouseInput,
      this.officeInput,
    ];
    this.outputs = queryElements<HTMLElement>('[data-pricing="output"][data-output]', component);
    this.values = this.getValues();
    this.locationConfig = this.getLocationConfig();
    this.pricing = queryElement('[data-pricing="pricing"]', component) as HTMLElement;
    this.prompt = queryElement('[data-pricing="prompt"]', component) as HTMLElement;
    this.promptText = queryElement('[data-pricing="prompt-text"]', this.prompt) as HTMLSpanElement;

    this.update = this.update.bind(this);
    this.init();
  }

  private getOptions(select: HTMLSelectElement): OptionMap[] {
    const options = queryElements('option', select) as HTMLOptionElement[];
    return options.map((option) => {
      return {
        element: option,
        value: option.value,
        text: option.textContent,
      };
    });
  }

  private init(): void {
    this.render();
    this.bindEvents();
  }

  private render(): void {
    this.outputs.forEach((output) => {
      const type = output.dataset.output;

      // update the timeframe for workspace plans
      if (type === 'timeframe') {
        const timeframe =
          this.values.timeframe === '6-months'
            ? TIMEFRAME_BI_ANNUALLY
            : this.values.timeframe === 'yearly'
              ? TIMEFRAME_ANNUALLY
              : TIMEFRAME_MONTHLY;

        this.setText(output, timeframe);
        return;
      }

      // update the price of access plans
      if (type === 'access-price') {
        const price = this.values.logisticSupport
          ? LOGISTIC_SUPPORT_INCLUDED
          : LOGISTIC_SUPPORT_NOT_INCLUDED;

        this.setText(output, price.toLocaleString());
      }

      // update the price of workspace plans
      if (type === 'workspace-price') {
        const combinationConfig = this.getCombinationConfig();
        if (!combinationConfig) return;

        let discount = 0;
        switch (this.values.timeframe) {
          case 'monthly':
            discount = DISCOUNT_MONTHLY;
            break;
          case '6-months':
            discount = DISCOUNT_BI_ANNUALLY;
            break;
          case 'yearly':
            discount = DISCOUNT_ANNUALLY;
            break;
        }

        this.setText(output, this.formatCurrency(combinationConfig.total * (1 - discount)));
      }
    });
  }

  // function that takes a number and outputs it in currency format in dollars
  private formatCurrency(number: number): string {
    return Math.ceil(number).toLocaleString('en-US');
  }

  private bindEvents(): void {
    /**
     * 1. on change of location - update warehouse and office options
     * 2. on change of warehouse and office - update warehouse or office options
     */

    this.inputs.forEach((input) => {
      input.addEventListener('change', this.update);
    });

    this.locationChange();
    this.setPricePrompt();

    this.locationInput.addEventListener('change', () => {
      this.locationChange();
      this.warehouseChange();
      this.setPricePrompt();
    });

    this.warehouseInput.addEventListener('change', () => {
      this.warehouseChange();
      this.setPricePrompt();
    });

    this.officeInput.addEventListener('change', () => {
      this.officeChange();
      this.setPricePrompt();
    });
  }

  private setPricePrompt(): void {
    // no location selected
    if (this.locationInput.selectedIndex === 0) {
      this.promptText.textContent = PROMPT_LOCATION;
      this.pricing.style.display = 'none';
      this.prompt.style.display = 'block';
      this.warehouseOptions[0].element.textContent = OPTIONS_LOCATION;
      this.officeOptions[0].element.textContent = OPTIONS_LOCATION;
      return;
    }

    // no warehouse selected
    if (this.warehouseInput.selectedIndex === 0) {
      this.promptText.textContent = PROMPT_OPTIONS;
      this.pricing.style.display = 'none';
      this.prompt.style.display = 'block';
      this.warehouseOptions[0].element.textContent = OPTIONS_READY;
      this.officeOptions[0].element.textContent = OPTIONS_WAREHOUSE;
    }

    // no office selected
    if (this.warehouseInput.selectedIndex !== 0 && this.officeInput.selectedIndex === 0) {
      this.promptText.textContent = PROMPT_OPTIONS;
      this.pricing.style.display = 'none';
      this.prompt.style.display = 'block';
      this.warehouseOptions[0].element.textContent = OPTIONS_READY;
      this.officeOptions[0].element.textContent = OPTIONS_READY;
    }

    // show prompt
    if (this.warehouseInput.selectedIndex !== 0 && this.officeInput.selectedIndex !== 0) {
      this.prompt.style.display = 'none';
      this.pricing.style.display = 'block';
    }
  }

  private locationChange(): void {
    console.log('location change');

    // diable all options for both selects
    this.disableAllOptions(this.warehouseInput);
    this.disableAllOptions(this.officeInput);

    // if there is no location config, return
    if (!this.locationConfig) return;

    // get all combinations for the current location
    const { combinations } = this.locationConfig;
    combinations.forEach((combination) => {
      // find the warehouse option and enable it
      const warehouseOption = this.warehouseOptions.find(
        (option) => option.value === combination.warehouse
      );
      if (warehouseOption) warehouseOption.element.disabled = false;

      // find the office option and enable it
      const officeOption = this.officeOptions.find((option) => option.value === combination.office);
      if (officeOption) officeOption.element.disabled = false;
    });

    this.warehouseOptions.forEach((option) => {
      if (option.element.disabled && option.element.selected) {
        this.warehouseInput.selectedIndex = 0;
      }
    });
  }

  private warehouseChange(): void {
    console.log('warehouse change');

    // reset all options if the warehouse is on the default value
    if (this.warehouseInput.selectedIndex === 0) {
      this.locationChange();
    }

    // disable all options for the office select
    this.disableAllOptions(this.officeInput);

    // if there is no location config, return
    if (!this.locationConfig) return;

    // get all combinations for the current location
    const { combinations } = this.locationConfig;
    combinations.forEach((combination) => {
      // if the warehouse does not match the current warehouse, return
      if (combination.warehouse !== this.values.warehouseSuite) return;

      // find the office option and enable it
      const officeOption = this.officeOptions.find((option) => option.value === combination.office);
      if (officeOption) officeOption.element.disabled = false;
    });

    this.officeOptions.forEach((option) => {
      if (option.element.disabled && option.element.selected) {
        this.officeInput.selectedIndex = 0;
      }
    });
  }

  private officeChange(): void {
    console.log('office change');

    // disable all options for the warehouse select
    this.disableAllOptions(this.warehouseInput);

    // if there is no location config, return
    if (!this.locationConfig) return;

    // get all combinations for the current location
    const { combinations } = this.locationConfig;
    combinations.forEach((combination) => {
      // if the office does not match the current office, return
      if (combination.office !== this.values.officeSuite) return;

      // find the warehouse option and enable it
      const warehouseOption = this.warehouseOptions.find(
        (option) => option.value === combination.warehouse
      );
      if (warehouseOption) warehouseOption.element.disabled = false;
    });

    this.locationChange();

    this.warehouseOptions.forEach((option) => {
      if (option.element.disabled && option.element.selected) {
        this.warehouseInput.selectedIndex = 0;
      }
    });
  }

  private disableAllOptions(select: HTMLSelectElement): void {
    const options = queryElements('option', select) as HTMLOptionElement[];
    options.forEach((option, index) => {
      if (index === 0) return;
      option.disabled = true;
    });
  }

  private update(): void {
    this.activeTimeframe = this.getActiveTimeframe();
    this.values = this.getValues();
    this.locationConfig = this.getLocationConfig();
    this.render();
  }

  private getActiveTimeframe(): HTMLInputElement {
    return this.timeframeInputs.find((timeframe) => timeframe.checked) ?? this.timeframeInputs[0];
  }

  private getValues(): Values {
    const values = {
      location: this.locationInput.value as string,
      logisticSupport: this.logisticSupportInput.checked,
      timeframe: this.activeTimeframe.value as string,
      warehouseSuite: this.warehouseInput.value as string,
      officeSuite: this.officeInput.value as string,
    };

    this.values = values;
    return values;
  }

  private getLocationConfig(): LocationConfig | undefined {
    const locationConfig = locationConfigs.find((item) => item.id === this.values.location);
    if (!locationConfig) {
      console.error(`No location configuration found for ${this.values.location}`);
      return;
    }

    return locationConfig;
  }

  private getCombinationConfig(): Combination | undefined {
    const { locationConfig } = this;
    if (!locationConfig) {
      console.error(`No location configuration found for ${this.values.location}`);
      return;
    }

    const combinationConfig = locationConfig.combinations.find((item) => {
      return (
        item.warehouse === this.values.warehouseSuite && item.office === this.values.officeSuite
      );
    });

    if (!combinationConfig) {
      console.error(
        `No combination configuration found for ${this.values.warehouseSuite} and ${this.values.officeSuite}`
      );
      return;
    }

    return combinationConfig;
  }

  // private setTimeframeActiveClass(): void {
  //   this.timeframes.forEach((timeframe) => {
  //     const wrapper = timeframe.parentElement;
  //     if (!wrapper) return;

  //     wrapper.classList.remove('is-active');
  //   });

  //   const { parentElement } = this.activeTimeframe;
  //   if (!parentElement) return;

  //   parentElement.classList.add('is-active');
  // }

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
