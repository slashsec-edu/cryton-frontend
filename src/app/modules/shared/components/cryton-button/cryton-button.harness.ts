import { MatButtonHarness } from '@angular/material/button/testing';

export class CrytonButtonHarness extends MatButtonHarness {
  getIconElement = this.locatorForOptional('mat-icon');

  async getIcon(): Promise<string> {
    const iconElement = await this.getIconElement();
    return iconElement.text();
  }

  async getName(): Promise<string> {
    const buttonText = await this.getText();
    const icon = await this.getIcon();

    if (icon) {
      return buttonText.slice(icon.length).trim();
    }
    return buttonText.trim();
  }
}
