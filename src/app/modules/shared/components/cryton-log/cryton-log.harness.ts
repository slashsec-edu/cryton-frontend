import { ComponentHarness } from '@angular/cdk/testing';

export class CrytonLogHarness extends ComponentHarness {
  static hostSelector = 'app-cryton-log';

  getCodeElement = this.locatorFor('code');

  async getText(): Promise<string> {
    const codeEl = await this.getCodeElement();
    return codeEl.text();
  }
}
