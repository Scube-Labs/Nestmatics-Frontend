import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SocialAuthService, SocialUser } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  approvedEmails: string[] = [];
  approvedIDs: string[] = [];

  userRoute: string = environment.baseURL + "/nestmatics/users";
  
  constructor(private http: HttpClient, private router: Router, private authService: SocialAuthService) {}

  /**
   * The function initializes an authentication service that awaits for a user to login.
   * Once the user login, information like the email and the login state are stored in local storage.
   */
  ngOnInit(): void {
    this.getApprovedAccounts();
  }

  /**
   * This function initializes a Google Sign-In API call.
   */
  public login(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)
    this.authService.authState.subscribe((user) => {
      if(user != null){
        this.getApprovedAccounts();
        if(this.approvedEmails.indexOf(user.email) > 0){
          localStorage.setItem('loggedIn', JSON.stringify(user != null));
          localStorage.setItem('currUserID', this.approvedIDs[this.approvedEmails.indexOf(user.email)]);
        }
  
        else{
          alert("Account is not approved");
          this.logout();
          this.router.navigate(['/login']);
        }
        
        if (localStorage.getItem('loggedIn')) {
          //validate if the user is approved
          this.router.navigate(['/']);
       }
      }
      
    });
  }

  /**
   * Logs the user out using the Google Sign-Out API call.
   */
  public logout(): void {
    this.authService.signOut();
    localStorage.clear();
  }

  private getApprovedAccounts() {
    this.http.get(this.userRoute).subscribe((res: any) => {
      for(var i=0; i<res.length; i++){
        this.approvedEmails.push(res[i].email);
        this.approvedIDs.push(res[i]._id)
      }
    })

  }
}
