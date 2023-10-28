import { NgModule } from '@angular/core';

import { WelcomeRoutingModule } from './welcome-routing.module';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicModule } from '../../basic/basic.module';
import { AllAntModules } from '../../library/ant-design/ant.module';
import { SharedModule } from '../shared/shared.module';
import { WelcomeComponent } from './welcome.component';

@NgModule({
  imports: [
    CommonModule,
    AllAntModules,
    FormsModule,
    ReactiveFormsModule,
    WelcomeRoutingModule,
    SharedModule,
    BasicModule,
  ],
  declarations: [WelcomeComponent],
  exports: [WelcomeComponent],
})
export class WelcomeModule {}
