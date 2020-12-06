import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SocialAuthService, SocialUser } from "angularx-social-login";
import { GoogleLoginProvider } from "angularx-social-login";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { EventEmitterService } from '../event-emitter.service';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  approvedEmails: string[] = [];
  approvedIDs: string[] = [];

  userRoute: string = environment.baseURL + "/nestmatics/users";
  
  constructor(
    private http: HttpClient, 
    private router: Router, 
    private authService: SocialAuthService, 
    private toastr: ToastrService,
    private eventEmitterService: EventEmitterService) {

      this.eventEmitterService.logoutSub = this.eventEmitterService.invokeLogout.
        subscribe(()=> {
        this.logout()
      });
    }

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
    let observables: Observable<any>[] = [];
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)
    this.authService.authState.subscribe((user: any) => {
      if(user != null){
        this.getApprovedAccounts();
        console.log(this.approvedEmails)
        console.log(this.approvedEmails.indexOf(user.email))
        if(this.approvedEmails.indexOf(user.email) >= 0){
          localStorage.setItem('loggedIn', JSON.stringify(user != null));
          localStorage.setItem('currUserID', this.approvedIDs[this.approvedEmails.indexOf(user.email)]);
          
          observables.push(this.http.get(this.userRoute + "/" + this.approvedIDs[this.approvedEmails.indexOf(user.email)]))

          // this.http.get(this.userRoute + "/" + this.approvedIDs[this.approvedEmails.indexOf(user.email)]).subscribe((res: any) => {
          //   if(res.type == "admin"){
          //     localStorage.setItem('userIsAdmin', JSON.stringify(true));
          //   }
          //   else{
          //     localStorage.setItem('userIsAdmin', JSON.stringify(false));
          //   }
          // })
          forkJoin(observables)
            .subscribe(res => {
              if(res[0].type == "admin"){
                localStorage.setItem('userIsAdmin', JSON.stringify(true));
              }
              else{
                localStorage.setItem('userIsAdmin', JSON.stringify(false));
              }
            });
        }
  
        else{
          this.toastr.warning("Account is not approved");
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
    this.router.navigate(['/login']);
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
