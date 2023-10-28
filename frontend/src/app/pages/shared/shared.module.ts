import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BasicModule } from '../../basic/basic.module';
import { AllAntModules } from '../../library/ant-design/ant.module';
import { DemoSidebarComponent } from './demo-sidebar/demo-sidebar.component';
import { HomeworkQuestionComponent } from './homework-question/homework-question.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    AllAntModules,
    FormsModule,
    ReactiveFormsModule,
    BasicModule,
  ],
  declarations: [HomeworkQuestionComponent, DemoSidebarComponent],
  exports: [HomeworkQuestionComponent, DemoSidebarComponent],
})
export class SharedModule {}
