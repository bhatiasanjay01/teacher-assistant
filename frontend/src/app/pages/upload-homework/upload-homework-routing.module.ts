import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UploadHomeworkComponent } from './upload-homework/upload-homework.component';

const routes: Routes = [
  { path: '', component: UploadHomeworkComponent },
  { path: ':name', component: UploadHomeworkComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UploadHomeworkRoutingModule {}
