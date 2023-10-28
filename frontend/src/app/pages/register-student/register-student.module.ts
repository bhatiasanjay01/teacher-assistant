import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AllAntModules } from '../../library/ant-design/ant.module';
import { SharedModule } from '../shared/shared.module';
import { RegisterStudentRoutingModule } from './register-student-routing.module';
import { RegisterStudentComponent } from './register-student.component';

@NgModule({
  imports: [
    CommonModule,
    AllAntModules,
    FormsModule,
    ReactiveFormsModule,
    RegisterStudentRoutingModule,
    SharedModule,
  ],
  declarations: [RegisterStudentComponent],
  exports: [RegisterStudentComponent],
})
export class RegisterStudentModule {}
