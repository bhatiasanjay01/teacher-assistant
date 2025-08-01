import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinComponent } from './loading-spin.component';

describe('LoadingSpinComponent', () => {
  let component: LoadingSpinComponent;
  let fixture: ComponentFixture<LoadingSpinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingSpinComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingSpinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
