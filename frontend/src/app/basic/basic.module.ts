import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgChartsModule } from 'ng2-charts';
import { AllAntModules } from '../library/ant-design/ant.module';
import { AllMaterialModules } from '../library/material/material.module';
import { AiIsLoadingComponent } from './ai/ai-is-loading/ai-is-loading.component';
import { DarkModeColorDirective } from './dark-mode/dark-mode-color.directive';
import { DisableWhenLoadingDirective } from './loading/disable-when-loading.directive';
import { GlobalLoadingBarComponent } from './loading/global-loading-bar/global-loading-bar.component';
import { LoadingSpinComponent } from './loading/loading-spin/loading-spin.component';
import { MarkdownItComponent } from './markdown-it/markdown-it.component';
import { ToLocaleFormat } from './pipes/to-locale-format.pipe';
import { ShowHideTextComponent } from './show-hide-text/show-hide-text.component';
import { DragDropFileUploadDirective } from './upload/drag-drop-file-upload.directive';
import { UploadDragComponent } from './upload/upload-drag/upload-drag.component';
import { VersionUpgradeHeaderComponent } from './version-upgrade-header/version-upgrade-header.component';

const basicComponentList = [
  DarkModeColorDirective,
  GlobalLoadingBarComponent,
  DisableWhenLoadingDirective,
  VersionUpgradeHeaderComponent,
  ToLocaleFormat,
  LoadingSpinComponent,
  UploadDragComponent,
  DragDropFileUploadDirective,
  AiIsLoadingComponent,
  ShowHideTextComponent,
  MarkdownItComponent,
];

@NgModule({
  declarations: basicComponentList,
  imports: [
    CommonModule,
    AllAntModules,
    FormsModule,
    AllMaterialModules,
    OverlayModule,
    ReactiveFormsModule,
    NgChartsModule,
    NgxChartsModule,
  ],
  exports: basicComponentList,
})
export class BasicModule {}
