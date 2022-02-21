import { ChangeDetectionStrategy, Component, DebugElement, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { parse, stringify } from 'yaml';
import { getControlError } from './cryton-inventory.errors';

type InventoryRecord = { key: string; value: string | Inventory };
type Inventory = InventoryRecord[];

type OutputInventory = Record<string, unknown>;
type InputData = { inventory: string };

@Component({
  selector: 'app-cryton-inventory-creator',
  templateUrl: './cryton-inventory-creator.component.html',
  styleUrls: ['./cryton-inventory-creator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrytonInventoryCreatorComponent {
  @ViewChild('pathInput') pathInput: DebugElement;
  inventory: Inventory = [];
  variableForm = new FormGroup({
    path: new FormControl('', [Validators.required]),
    value: new FormControl('', [Validators.required])
  });
  getControlError = getControlError;

  constructor(
    private _dialogRef: MatDialogRef<CrytonInventoryCreatorComponent>,
    @Inject(MAT_DIALOG_DATA) data: InputData
  ) {
    if (data && data.inventory) {
      this.inventory = this._deserializeInventory(data.inventory);
    }
  }

  isSection(inventoryRecord: InventoryRecord): boolean {
    return Array.isArray(inventoryRecord.value);
  }

  fillPath(path: string): void {
    this.variableForm.get('path').setValue(path);
  }

  createVariable(): void {
    if (!this.variableForm.valid) {
      return;
    }

    const { path, value } = this.variableForm.value as Record<string, string>;

    if (path.endsWith('.')) {
      return this.variableForm.get('path').setErrors({ endingDot: true });
    }

    const sections = path.split('.');
    let lastInventory = this.inventory;

    if (sections.some(section => section === '')) {
      return this.variableForm.get('path').setErrors({ emptySection: true });
    }

    for (let i = 0; i < sections.length; i++) {
      const sectionKey = sections[i];

      if (i === sections.length - 1) {
        try {
          this._createVariable(sectionKey, value, lastInventory);
        } catch {
          return;
        }
      } else {
        try {
          const sectionInventory = this._createSection(sectionKey, lastInventory);
          lastInventory = sectionInventory;
        } catch {
          return;
        }
      }
    }

    this._afterSubmit(sections);
  }

  create(): void {
    const yaml = this._generateYaml();
    console.log(yaml);

    if (yaml) {
      this._dialogRef.close(yaml);
    } else {
      this._dialogRef.close();
    }
  }

  deleteRecord(path: string): void {
    const sections = path.split('.');

    let currentInventory = this.inventory;

    sections.slice(0, sections.length - 1).forEach(sectionKey => {
      const inventory = this._findRecord(sectionKey, currentInventory);
      currentInventory = inventory.value as Inventory;
    });

    const lastKey = sections[sections.length - 1];
    const record = currentInventory.find(currentRecord => currentRecord.key === lastKey);
    const recordIndex = currentInventory.indexOf(record);
    currentInventory.splice(recordIndex, 1);
  }

  canCreate(): boolean {
    const { path, value } = this.variableForm.value as Record<string, string>;

    return path != null && value != null;
  }

  private _createSection(sectionKey: string, inventory: Inventory): Inventory {
    const record = this._findRecord(sectionKey, inventory);

    if (record) {
      if (this.isSection(record)) {
        return record.value as Inventory;
      } else {
        this.variableForm.get('path').setErrors({ variableToSection: true });
        throw new Error();
      }
    } else {
      const newSection = { key: sectionKey, value: [] as Inventory };
      inventory.push(newSection);
      return newSection.value;
    }
  }

  private _createVariable(sectionKey: string, value: string, inventory: Inventory): void {
    const existingRecord = this._findRecord(sectionKey, inventory);

    if (existingRecord) {
      if (this.isSection(existingRecord)) {
        this.variableForm.get('path').setErrors({ sectionToVariable: true });
        throw new Error();
      } else {
        existingRecord.value = value;
      }
    } else {
      inventory.push({ key: sectionKey, value });
    }
  }

  private _afterSubmit(sections: string[]): void {
    this.variableForm.get('path').setValue(sections.slice(0, sections.length - 1).join('.'));
    (this.pathInput.nativeElement as HTMLInputElement).focus();
    this.variableForm.get('value').reset();
    this.variableForm.get('value').setErrors(null);
    this.variableForm.get('path').setErrors(null);
  }

  private _findRecord(key: string, inventory: Inventory): InventoryRecord {
    return inventory.find(record => record.key === key);
  }

  private _generateYaml(): string {
    return stringify(this._toOutputFormat(this.inventory));
  }

  private _toOutputFormat(inventory: Inventory): OutputInventory {
    const outputInventory: OutputInventory = {};

    inventory.forEach(record => {
      outputInventory[record.key] = this.isSection(record)
        ? this._toOutputFormat(record.value as Inventory)
        : record.value;
    });

    return outputInventory;
  }

  private _deserializeInventory(inventory: string): Inventory {
    const parsedInventory = parse(inventory) as OutputInventory;
    return this._deserializeInventoryRec(parsedInventory);
  }

  private _deserializeInventoryRec(inventory: OutputInventory): Inventory {
    const outputInventory: Inventory = [];

    Object.entries(inventory).forEach(([key, value]: [string, string | OutputInventory]) => {
      let record: InventoryRecord;

      if (typeof value === 'string') {
        record = { key, value };
      } else {
        record = { key, value: this._deserializeInventoryRec(value) };
      }

      outputInventory.push(record);
    });

    return outputInventory;
  }
}
