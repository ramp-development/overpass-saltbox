import { queryElement } from '$utils/queryElement';
import { queryElements } from '$utils/queryElements';

declare global {
  interface Window {
    PRICING_CONFIG: PricingConfig;
  }
}

const { PRICING_CONFIG } = window;

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
  private pills: {
    logisticSupport: HTMLDivElement;
    warehouse: HTMLDivElement;
    office: HTMLDivElement;
  };

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
    this.pills = {
      logisticSupport: queryElement(`[data-output="logisticSupport"]`, component) as HTMLDivElement,
      warehouse: queryElement(`[data-output="warehouse"]`, component) as HTMLDivElement,
      office: queryElement(`[data-output="office"]`, component) as HTMLDivElement,
    };

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
      let text;

      switch (type) {
        case 'timeframe':
          text =
            this.values.timeframe === '6-months'
              ? PRICING_CONFIG.TIMEFRAME.BI_ANNUALLY
              : this.values.timeframe === 'yearly'
                ? PRICING_CONFIG.TIMEFRAME.ANNUALLY
                : PRICING_CONFIG.TIMEFRAME.MONTHLY;
          break;
        case 'access-price':
          text = this.values.logisticSupport
            ? PRICING_CONFIG.LOGISTIC_SUPPORT.INCLUDED
            : PRICING_CONFIG.LOGISTIC_SUPPORT.EXCLUDED;
          break;
        case 'workspace-price':
          const combinationConfig = this.getCombinationConfig();
          if (!combinationConfig) return;

          const discount =
            this.values.timeframe === 'monthly'
              ? PRICING_CONFIG.DISCOUNT.MONTHLY
              : this.values.timeframe === '6-months'
                ? PRICING_CONFIG.DISCOUNT.BI_ANNUALLY
                : PRICING_CONFIG.DISCOUNT.ANNUALLY;

          text = this.formatCurrency(combinationConfig.total * (1 - discount));
          break;
        case 'logisticSupport':
          this.values.logisticSupport
            ? this.pills.logisticSupport.classList.add('is-selected')
            : this.pills.logisticSupport.classList.remove('is-selected');
          break;
        case 'warehouse':
          this.warehouseInput.selectedIndex > 1
            ? this.pills.warehouse.classList.add('is-selected')
            : this.pills.warehouse.classList.remove('is-selected');
          break;
        case 'office':
          this.officeInput.selectedIndex > 1
            ? this.pills.office.classList.add('is-selected')
            : this.pills.office.classList.remove('is-selected');
          break;
      }

      if (text) this.setText(output, text.toString());
    });
  }

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
      this.promptText.textContent = PRICING_CONFIG.PROMPT.LOCATION;
      this.pricing.style.display = 'none';
      this.prompt.style.display = 'block';
      this.warehouseOptions[0].element.textContent = PRICING_CONFIG.OPTIONS.LOCATION;
      this.officeOptions[0].element.textContent = PRICING_CONFIG.OPTIONS.LOCATION;
      return;
    }

    // no warehouse selected
    if (this.warehouseInput.selectedIndex === 0) {
      this.promptText.textContent = PRICING_CONFIG.PROMPT.OPTIONS;
      this.pricing.style.display = 'none';
      this.prompt.style.display = 'block';
      this.warehouseOptions[0].element.textContent = PRICING_CONFIG.OPTIONS.READY;
      this.officeOptions[0].element.textContent = PRICING_CONFIG.OPTIONS.WAREHOUSE;
    }

    // no office selected
    if (this.warehouseInput.selectedIndex !== 0 && this.officeInput.selectedIndex === 0) {
      this.promptText.textContent = PRICING_CONFIG.PROMPT.OPTIONS;
      this.pricing.style.display = 'none';
      this.prompt.style.display = 'block';
      this.warehouseOptions[0].element.textContent = PRICING_CONFIG.OPTIONS.READY;
      this.officeOptions[0].element.textContent = PRICING_CONFIG.OPTIONS.READY;
    }

    // show prompt
    if (this.warehouseInput.selectedIndex !== 0 && this.officeInput.selectedIndex !== 0) {
      this.prompt.style.display = 'none';
      this.pricing.style.display = 'block';
    }
  }

  private locationChange(): void {
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
    const locationConfig = PRICING_CONFIG.LOCATIONS.find(
      (item) => item.id === this.values.location
    );

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

  private setText(output: Output, text: string) {
    output.textContent = text;
  }
}
