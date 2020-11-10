import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginComponent } from '../login/login.component'
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
 
  constructor(private router: Router, private authService: LoginComponent) {}
  

  /**
   * The canActivate function contains the logic used to restrict the user from viewing the main application view before he/she login.
   */
  canActivate(): boolean {
    if(localStorage.getItem('loggedIn')){
      return true;
    }

    else{
      this.router.navigate(['/login']);
      return false;
    }
  }
}
