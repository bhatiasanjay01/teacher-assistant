import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalLoadingBarComponent } from './global-loading-bar.component';

describe('GlobalLoadingBarComponent', () => {
  let component: GlobalLoadingBarComponent;
  let fixture: ComponentFixture<GlobalLoadingBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlobalLoadingBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalLoadingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
