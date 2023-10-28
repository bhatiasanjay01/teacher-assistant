import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  {
    path: 'welcome',
    loadChildren: () =>
      import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
  },

  {
    path: 'teachers',
    loadChildren: () =>
      import('./pages/teachers/teachers.module').then((m) => m.TeachersModule),
  },
  {
    path: 'register-student',
    loadChildren: () =>
      import('./pages/register-student/register-student.module').then(
        (m) => m.RegisterStudentModule
      ),
  },
  {
    path: 'upload-homework',
    loadChildren: () =>
      import('./pages/upload-homework/upload-homework.module').then(
        (m) => m.UploadHomeworkModule
      ),
  },
  { path: '**', redirectTo: 'https://www.mindcraftsmart.com/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
