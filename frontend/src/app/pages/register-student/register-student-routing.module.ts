import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterStudentComponent } from './register-student.component';

const routes: Routes = [
  { path: '', component: RegisterStudentComponent },
  { path: ':name', component: RegisterStudentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterStudentRoutingModule {}
