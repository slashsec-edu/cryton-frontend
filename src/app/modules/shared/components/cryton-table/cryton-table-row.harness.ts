import { MatRowHarness } from '@angular/material/table/testing';

export class CrytonTableRowHarness extends MatRowHarness {
  /**
   * Clicks on the table row.
   */
  async click(): Promise<void> {
    const hostElement = await this.host();
    return hostElement.click();
  }
}
