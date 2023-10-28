import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeworkQuestionComponent } from './homework-question.component';

describe('HomeworkQuestionComponent', () => {
  let component: HomeworkQuestionComponent;
  let fixture: ComponentFixture<HomeworkQuestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HomeworkQuestionComponent]
    });
    fixture = TestBed.createComponent(HomeworkQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
