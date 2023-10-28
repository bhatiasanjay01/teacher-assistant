import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowHideTextComponent } from './show-hide-text.component';

describe('ShowHideTextComponent', () => {
  let component: ShowHideTextComponent;
  let fixture: ComponentFixture<ShowHideTextComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShowHideTextComponent]
    });
    fixture = TestBed.createComponent(ShowHideTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
