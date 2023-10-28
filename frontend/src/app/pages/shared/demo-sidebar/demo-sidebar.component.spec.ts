import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoSidebarComponent } from './demo-sidebar.component';

describe('DemoSidebarComponent', () => {
  let component: DemoSidebarComponent;
  let fixture: ComponentFixture<DemoSidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DemoSidebarComponent]
    });
    fixture = TestBed.createComponent(DemoSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
