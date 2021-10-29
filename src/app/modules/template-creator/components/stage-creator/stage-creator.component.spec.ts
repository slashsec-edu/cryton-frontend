import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TemplateCreatorModule } from '../../template-creator.module';
import { StageCreatorComponent } from './stage-creator.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectionStrategy } from '@angular/core';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';

describe('StageCreatorComponent', () => {
  let component: StageCreatorComponent;
  let fixture: ComponentFixture<StageCreatorComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StageCreatorComponent],
        imports: [TemplateCreatorModule, BrowserAnimationsModule],
        providers: [{ provide: AlertService, useValue: alertServiceStub }]
      })
        .overrideComponent(StageCreatorComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StageCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
