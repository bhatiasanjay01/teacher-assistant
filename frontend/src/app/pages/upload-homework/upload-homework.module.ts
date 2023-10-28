import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicModule } from '../../basic/basic.module';
import { AllAntModules } from '../../library/ant-design/ant.module';
import { SharedModule } from '../shared/shared.module';
import { UploadHomeworkRoutingModule } from './upload-homework-routing.module';
import { UploadHomeworkComponent } from './upload-homework/upload-homework.component';

@NgModule({
  imports: [
    CommonModule,
    AllAntModules,
    FormsModule,
    ReactiveFormsModule,
    UploadHomeworkRoutingModule,
    SharedModule,
    BasicModule,
  ],
  declarations: [UploadHomeworkComponent],
  exports: [],
})
export class UploadHomeworkModule {}
