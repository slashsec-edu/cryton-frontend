import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { RunService } from 'src/app/services/run.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { RunYamlPreviewComponent } from './run-yaml-preview.component';

describe('RunYamlPreviewComponent', () => {
  let component: RunYamlPreviewComponent;
  let fixture: ComponentFixture<RunYamlPreviewComponent>;

  const activatedRouteStub = {
    params: of({ id: 1 })
  };

  const runServiceStub = jasmine.createSpyObj('RunService', ['fetchYaml']) as Spied<RunService>;
  runServiceStub.fetchYaml.and.returnValue('detail:\n  plan:\n  - name: plan');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunYamlPreviewComponent],
      imports: [SharedModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: RunService, useValue: runServiceStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunYamlPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
