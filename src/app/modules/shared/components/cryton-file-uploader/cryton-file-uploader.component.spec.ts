import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { createMockFileList, MockFile } from 'src/app/testing/utility/mock-filelist';
import { CrytonFileUploaderComponent } from './cryton-file-uploader.component';

describe('CrytonFileUploaderComponent', () => {
  let component: CrytonFileUploaderComponent;
  let fixture: ComponentFixture<CrytonFileUploaderComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CrytonFileUploaderComponent],
        imports: [MatIconModule, SharedModule]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(CrytonFileUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all uploaded files correctly', () => {
    const files: MockFile[] = [
      { name: 'file_1.txt', body: 'something' },
      { name: 'some_file.txt', body: 'body' },
      { name: 'other_file.yaml', body: 'contents' }
    ];

    spyOn(component.fileChange, 'emit');
    component.handleFileInput(createMockFileList(files));
    fixture.detectChanges();

    const displayedFiles: DebugElement[] = fixture.debugElement.queryAll(By.css('.file'));

    for (let i = 0; i < displayedFiles.length; i++) {
      const fileElement = displayedFiles[i].nativeElement as HTMLElement;
      const name = fileElement.textContent.trim();
      expect(name).toContain(files[i].name);
    }

    expect(component.fileChange.emit).toHaveBeenCalled();
  });
});
