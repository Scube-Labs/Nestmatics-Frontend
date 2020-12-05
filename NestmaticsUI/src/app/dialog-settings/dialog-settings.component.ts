import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dialog-settings',
  templateUrl: './dialog-settings.component.html',
  styleUrls: ['./dialog-settings.component.scss']
})
export class DialogSettingsComponent implements OnInit {

  users: string = environment.baseURL + "/nestmatics/users"
  usersList = [];
  userIDs = [];
  usrEmail;
  usrType;
  typeList = ["user", "admin"];

  trainIsValid = false;

  constructor(private http: HttpClient,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  public addUser(type) {
    
    if(typeof this.usrEmail != 'undefined' && typeof type != 'undefined'){
      this.http.post(this.users,
      {
        "email": this.usrEmail,
        "type": type
      }).subscribe((res: any) => {
        this.toastr.success("User " + this.usrEmail + "was succesfuly added");
        this.usersList = [];
        this.userIDs = [];
        this.getAllUsers();
      },
      (error) => {
        this.toastr.error("Invalid email. " + error.error.Error);
      })

     
    }
    else{
      this.toastr.info("Please enter both email and type")
    }
    
  }

  public deleteUser(user) {
    if(localStorage.getItem('userIsAdmin'))
    {
      var id = this.getUserID(user);
      this.http.delete(this.users + "/" + id).subscribe((res: any) => {
        this.usersList = [];
        this.userIDs = [];
        this.getAllUsers();
      })
    }
    else{
      this.toastr.warning("Administrator priviledges needed to delete users");
    }
    
  }

  private getUserID(user){
    return this.userIDs[this.usersList.indexOf(user.selectedOptions.selected[0]._value)]
  }

  private getAllUsers(){
    this.http.get(this.users).subscribe((res: any) => {
      console.log(this.users);
      for(var i=0; i<res.length; i++){
        this.usersList.push(res[i].email)
        this.userIDs.push(res[i]._id);
      }
    })
  }

}
