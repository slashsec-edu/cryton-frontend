import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppRoutingModule } from 'src/app/app-routing.module';

import { OutletComponent } from './outlet.component';

describe('OutletComponent', () => {
  let component: OutletComponent;
  let fixture: ComponentFixture<OutletComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [AppRoutingModule],
        declarations: [OutletComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(OutletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
