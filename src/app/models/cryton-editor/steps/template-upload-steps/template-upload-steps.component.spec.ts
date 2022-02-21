import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BehaviorSubject, Subject } from 'rxjs';
import { CrytonFileUploaderComponent } from 'src/app/modules/shared/components/cryton-file-uploader/cryton-file-uploader.component';
import { FileNamePipe } from 'src/app/modules/shared/pipes/file-name.pipe';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { TemplateService } from 'src/app/services/template.service';
import { templates } from 'src/app/testing/mockdata/templates.mockdata';
import { TestingService } from 'src/app/testing/services/testing.service';
import { Template } from '../../../api-responses/template.interface';
import { TemplateUploadStepsComponent } from './template-upload-steps.component';

describe('TemplateUploadStepsComponent', () => {
  let component: TemplateUploadStepsComponent;
  let fixture: ComponentFixture<TemplateUploadStepsComponent>;
  const templateServiceStub = new TestingService<Template>(templates);
  const eraseSubject$ = new Subject<void>();
  const createSubject$ = new Subject<void>();

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TemplateUploadStepsComponent, FileNamePipe, CrytonFileUploaderComponent],
        imports: [SharedModule],
        providers: [FileNamePipe, { provide: TemplateService, useValue: templateServiceStub }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateUploadStepsComponent);
    component = fixture.componentInstance;
    component.currentStepSubject$ = new BehaviorSubject<number>(0);
    component.eraseEvent$ = eraseSubject$.asObservable();
    component.createEvent$ = createSubject$.asObservable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
