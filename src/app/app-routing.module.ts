import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { PagesRoutingModule } from './pages/pages.routing';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/login', pathMatch:'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true}),
            PagesRoutingModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
