// CDK
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
// MATERIAL
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { CertainityCheckComponent } from './components/certainity-check/certainity-check.component';
import { CrytonButtonComponent } from './components/cryton-button/cryton-button.component';
import { CrytonCardComponent } from './components/cryton-card/cryton-card.component';
import { CrytonCodeComponent } from './components/cryton-code/cryton-code.component';
// COMPONENTS
import { CrytonCounterComponent } from './components/cryton-counter/cryton-counter.component';
import { CrytonDatetimePickerComponent } from './components/cryton-datetime-picker/cryton-datetime-picker.component';
import { CrytonEditorComponent } from './components/cryton-editor/cryton-editor.component';
import { CrytonFileUploaderComponent } from './components/cryton-file-uploader/cryton-file-uploader.component';
import { CrytonFlatCardComponent } from './components/cryton-flat-card/cryton-flat-card.component';
import { CrytonIdChipComponent } from './components/cryton-id-chip/cryton-id-chip.component';
import { CrytonInventoryCreatorComponent } from './components/cryton-inventory-creator/cryton-inventory-creator.component';
import { CrytonLabeledItemComponent } from './components/cryton-labeled-item/cryton-labeled-item.component';
import { CrytonLogComponent } from './components/cryton-log/cryton-log.component';
import { CrytonSnackbarAlertComponent } from './components/cryton-snackbar-alert/cryton-snackbar-alert.component';
import { CrytonStateChipComponent } from './components/cryton-state-chip/cryton-state-chip.component';
import { CrytonTableComponent } from './components/cryton-table/cryton-table.component';
import { CrytonTimePickerComponent } from './components/cryton-time-picker/cryton-time-picker.component';
import { ExpandedRunManipulationComponent } from './components/run-manipulation/expanded-run-manipulation.component';
import { ReportManiupulationComponent } from './components/run-manipulation/report-manipulation.component';
import { TickSizePickerComponent } from './components/tick-size-picker/tick-size-picker.component';
// DIRECTIVES
import { ComponentInputDirective } from './directives/component-input.directive';
import { EnableTabDirective } from './directives/enable-tab.directive';
import { FileUploadDndDirective } from './directives/file-upload-dnd.directive';
import { HoldClickDirective } from './directives/hold-click.directive';
import { NoScrollDirective } from './directives/no-scroll.directive';
import { CrytonDatetimePipe } from './pipes/cryton-datetime.pipe';
import { EscapePipe } from './pipes/escape.pipe';
// PIPES
import { FileNamePipe } from './pipes/file-name.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { ShortStringPipe } from './pipes/short-string.pipe';
import { YamlPipe } from './pipes/yaml.pipe';

@NgModule({
  declarations: [
    CrytonButtonComponent,
    CrytonCounterComponent,
    CrytonTableComponent,
    CrytonEditorComponent,
    CrytonDatetimePickerComponent,
    ComponentInputDirective,
    CertainityCheckComponent,
    CrytonFileUploaderComponent,
    FileNamePipe,
    FileUploadDndDirective,
    FileSizePipe,
    HoldClickDirective,
    ShortStringPipe,
    CrytonCardComponent,
    CrytonDatetimePipe,
    EscapePipe,
    NoScrollDirective,
    TickSizePickerComponent,
    CrytonLogComponent,
    CrytonSnackbarAlertComponent,
    EnableTabDirective,
    CrytonIdChipComponent,
    CrytonStateChipComponent,
    CrytonFlatCardComponent,
    CrytonLabeledItemComponent,
    ExpandedRunManipulationComponent,
    ReportManiupulationComponent,
    YamlPipe,
    CrytonCodeComponent,
    CrytonTimePickerComponent,
    CrytonInventoryCreatorComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSortModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatCardModule,
    ClipboardModule,
    MatDividerModule
  ],
  exports: [
    CrytonButtonComponent,
    CrytonCounterComponent,
    CrytonTableComponent,
    CrytonEditorComponent,
    CertainityCheckComponent,
    CrytonFileUploaderComponent,
    ComponentInputDirective,
    FileNamePipe,
    FileUploadDndDirective,
    FileSizePipe,
    ShortStringPipe,
    CrytonCardComponent,
    CrytonDatetimePipe,
    EscapePipe,
    NoScrollDirective,
    TickSizePickerComponent,
    EnableTabDirective,
    CrytonLogComponent,
    CrytonSnackbarAlertComponent,
    EnableTabDirective,
    CrytonIdChipComponent,
    CrytonStateChipComponent,
    CrytonFlatCardComponent,
    CrytonLabeledItemComponent,
    ExpandedRunManipulationComponent,
    ReportManiupulationComponent,
    YamlPipe,
    CrytonCodeComponent,
    CrytonTimePickerComponent
  ],
  providers: [CrytonDatetimePipe, EscapePipe, ShortStringPipe, YamlPipe]
})
export class SharedModule {}
