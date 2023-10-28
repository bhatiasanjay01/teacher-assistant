import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadHomeworkComponent } from './upload-homework.component';

describe('UploadHomeworkComponent', () => {
  let component: UploadHomeworkComponent;
  let fixture: ComponentFixture<UploadHomeworkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadHomeworkComponent]
    });
    fixture = TestBed.createComponent(UploadHomeworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
