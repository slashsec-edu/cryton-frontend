import { ComponentHarness } from '@angular/cdk/testing';

export class WorkerTableHarness extends ComponentHarness {
  static hostSelector = 'app-worker-table';

  private _getStateHeader = this.locatorFor('.worker-header--state > h2');
  private _getIDHeader = this.locatorFor('.worker-header > aside > h3');
  private _getNameParagraph = this.locatorFor('#name-text');
  private _getAddressParagraph = this.locatorFor('#address-text');
  private _getQPrefixParagraph = this.locatorFor('#q-prefix-text');

  async getState(): Promise<string> {
    const state = await this._getStateHeader();
    return state.text();
  }

  async getID(): Promise<number> {
    const id = await this._getIDHeader();
    const idText = await id.text();

    // Slice off the "ID: " at the beginning
    return Number(idText.slice(3));
  }

  async getName(): Promise<string> {
    const nameParagraph = await this._getNameParagraph();
    return nameParagraph.text();
  }

  async getAddress(): Promise<string> {
    const addressParagraph = await this._getAddressParagraph();
    return addressParagraph.text();
  }

  async getQPrefix(): Promise<string> {
    const qPrefixParagraph = await this._getQPrefixParagraph();
    return qPrefixParagraph.text();
  }
}
