import { Component, OnInit, OnDestroy } from '@angular/core';
import { CrytonEditorStepsComponent } from 'src/app/generics/cryton-editor-steps.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WorkersService } from 'src/app/services/workers.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-worker-creation-steps',
  templateUrl: './worker-creation-steps.component.html',
  styleUrls: ['./worker-creation-steps.component.scss']
})
export class WorkerCreationStepsComponent extends CrytonEditorStepsComponent implements OnInit, OnDestroy {
  workerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    ip: new FormControl('', [Validators.required]),
    qPrefix: new FormControl('', [Validators.required])
  });

  constructor(private _workersService: WorkersService) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.eraseEvent$.pipe(takeUntil(this.destroySubject$)).subscribe(() => this.erase());
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  createPostRequest(): void {
    const body: Record<string, string> = {
      name: this.workerForm.get('name').value as string,
      address: this.workerForm.get('ip').value as string,
      q_prefix: this.workerForm.get('qPrefix').value as string,
      state: 'DOWN'
    };
    this.create.emit(this._workersService.postItem(body));
  }

  handleInput(): void {
    this.emitCompletion(this.workerForm.valid);
  }

  erase(): void {
    this.workerForm.reset();
  }
}
