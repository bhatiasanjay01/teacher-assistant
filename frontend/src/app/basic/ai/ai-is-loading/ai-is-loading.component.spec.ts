import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiIsLoadingComponent } from './ai-is-loading.component';

describe('AiIsLoadingComponent', () => {
  let component: AiIsLoadingComponent;
  let fixture: ComponentFixture<AiIsLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AiIsLoadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiIsLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
