import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TemplateCreatorModule } from '../../template-creator.module';
import { StepCreatorComponent } from './step-creator.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectionStrategy } from '@angular/core';
import { CrytonButtonHarness } from 'src/app/modules/shared/components/cryton-button/cryton-button.harness';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { findAsync } from 'src/app/testing/utility/async-find';

describe('StepCreatorComponent', () => {
  let component: StepCreatorComponent;
  let fixture: ComponentFixture<StepCreatorComponent>;
  let loader: HarnessLoader;

  const testingStep = { name: 'a', attackModule: 'b', attackModuleArgs: 'c' };

  const getButton = (name: string): Promise<CrytonButtonHarness> =>
    loader
      .getAllHarnesses(CrytonButtonHarness)
      .then(buttons => findAsync(buttons, async button => button.getName().then(buttonName => buttonName === name)));

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StepCreatorComponent],
        imports: [TemplateCreatorModule, BrowserAnimationsModule, NoopAnimationsModule],
        providers: []
      })
        .overrideComponent(StepCreatorComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(StepCreatorComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the create button to disabled properly', async () => {
    const createButton = await getButton('Create step');
    expect(await createButton.isDisabled()).toBeTruthy();

    component.stepForm.setValue(testingStep);
    fixture.detectChanges();

    expect(await createButton.isDisabled()).toBeFalsy();
  });

  it('should erase filled data correctly', async () => {
    const eraseButton = await getButton('Erase step');
    component.stepForm.setValue(testingStep);

    await eraseButton.click();
    fixture.detectChanges();

    expect(component.stepForm.value).toEqual(
      jasmine.objectContaining({
        name: null,
        attackModule: null,
        attackModuleArgs: null
      })
    );

    expect(component.stepForm.errors).toBeNull();
  });
});
