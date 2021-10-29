import { Component, DebugElement, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CrytonEditorStepsComponent } from 'src/app/generics/cryton-editor-steps.component';
import { TemplateService } from 'src/app/services/template.service';
import { Selectable } from '../../../cryton-editor/interfaces/selectable.interface';

@Component({
  selector: 'app-template-upload-steps',
  templateUrl: './template-upload-steps.component.html',
  styleUrls: ['./template-upload-steps.component.scss']
})
export class TemplateUploadStepsComponent extends CrytonEditorStepsComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput: DebugElement;
  @ViewChild('fileButton') fileButton: DebugElement;

  fileToUpload: File;

  constructor(private _templateService: TemplateService) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  createPostRequest(): void {
    this.create.emit(this._templateService.uploadFile(this.fileToUpload));
  }

  handleChange(event: File[]): void {
    this.fileToUpload = event && event[0] ? event[0] : undefined;
    let selectables: Selectable[] = null;

    if (this.fileToUpload) {
      selectables = [{ name: this.fileToUpload.name, id: null }];
    }

    this.inputChange.emit({
      selectables,
      completion: null
    });
  }

  erase(): void {
    this.fileToUpload = null;
  }
}
