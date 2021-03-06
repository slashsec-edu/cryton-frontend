import { ComponentHarness } from '@angular/cdk/testing';

export class CrytonCounterHarness extends ComponentHarness {
  static hostSelector = 'app-cryton-counter';

  getCounterElement = this.locatorFor('.cryton-counter--counter');

  getCountElement = this.locatorFor('b');

  async getCount(): Promise<number> {
    const countElement = await this.getCountElement();
    const countText = await countElement.text();
    return Number(countText);
  }

  async getName(): Promise<string> {
    const counterElement = await this.getCounterElement();
    const textContent = await counterElement.text();
    const colonIndex = textContent.indexOf(':');
    return textContent.slice(0, colonIndex);
  }
}
