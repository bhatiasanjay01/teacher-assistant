import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDragComponent } from './upload-drag.component';

describe('UploadDragComponent', () => {
  let component: UploadDragComponent;
  let fixture: ComponentFixture<UploadDragComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadDragComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadDragComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
