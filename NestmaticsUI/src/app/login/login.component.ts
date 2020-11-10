import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SocialAuthService, SocialUser } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  user: SocialUser;
  static loggedIn: boolean;
  compLogin = LoginComponent
  
  constructor(private router: Router, private authService: SocialAuthService) {}

  /**
   * The function initializes an authentication service that awaits for a user to login.
   * Once the user login, information like the email and the login state are stored in local storage.
   */
  ngOnInit(): void {
    this.authService.authState.subscribe((user) => {
      localStorage.setItem('email', user.email);
      localStorage.setItem('loggedIn', JSON.stringify(user != null));
      
      if (localStorage.getItem('loggedIn')) {
        this.router.navigate(['/']);
     }
    });
  }

  /**
   * This function initializes a Google Sign-In API call.
   */
  public login(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  /**
   * Logs the user out using the Google Sign-Out API call.
   */
  public logout(): void {
    this.authService.signOut();
  }
}
