import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  imports: [],
  exports: [
    ClipboardModule,
    CdkStepperModule,
    CdkTableModule,
    DragDropModule,
    MatIconModule,
    MatProgressBarModule,
    ScrollingModule,
  ],
})
export class AllMaterialModules {}
