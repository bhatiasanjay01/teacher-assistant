import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicModule } from '../../basic/basic.module';
import { AllAntModules } from '../../library/ant-design/ant.module';
import { SharedModule } from '../shared/shared.module';
import { TeachersRoutingModule } from './teachers-routing.module';
import { TeachersComponent } from './teachers/teachers.component';

@NgModule({
  imports: [
    CommonModule,
    AllAntModules,
    FormsModule,
    ReactiveFormsModule,
    TeachersRoutingModule,
    SharedModule,
    BasicModule,
  ],
  declarations: [TeachersComponent],
  exports: [],
})
export class TeachersModule {}
