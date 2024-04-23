import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,CanActivate, Router, RouterStateSnapshot,UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from '../services/login.service';

@Injectable({
  providedIn:'root'
})

export class authGuard implements CanActivate  {
  constructor(private loginService:LoginService, private router:Router){}

 canActivate(
   route: ActivatedRouteSnapshot,
   state: RouterStateSnapshot): boolean {
   return this.isLogin(); 
 }
 
 isLogin():any{
  if(this.loginService.isLoggenIn()){
    return true;
  }
  this.router.navigateByUrl('/home/clientes');
 }
}
