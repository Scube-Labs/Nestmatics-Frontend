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
  ml: string = environment.baseURL + "/nestmatics/ml"

  usersList = [];
  userIDs = [];
  usrEmail;
  usrType;
  typeList = ["user", "admin"];

  trainIsValid = false;

  newDataReq;
  accuracyReq;

  newDataCheck = false;
  accuracyCheck = false;

  week = [
    { value: 'Sunday', ID: 0},
    { value: 'Monday', ID: 1},
    { value: 'Tuesday', ID: 2},
    { value: 'Wednesday', ID: 3},
    { value: 'Thursday', ID: 4},
    { value: 'Friday', ID: 5},
    { value: 'Saturday', ID: 6},
  ]
  hours = [
    //AM
    { value: '1:00 AM', ID: 0 },
    { value: '2:00 AM', ID: 1 },
    { value: '3:00 AM', ID: 2 },
    { value: '4:00 AM', ID: 3 },
    { value: '5:00 AM', ID: 4 },
    { value: '6:00 AM', ID: 5 },
    { value: '7:00 AM', ID: 6 },
    { value: '8:00 AM', ID: 7 },
    { value: '9:00 AM', ID: 8 },
    { value: '10:00 AM', ID: 9 },
    { value: '11:00 AM', ID: 10 },
    { value: '12:00 AM', ID: 11 },
    //PM
    { value: '1:00 PM', ID: 12 },
    { value: '2:00 PM', ID: 13 },
    { value: '3:00 PM', ID: 14 },
    { value: '4:00 PM', ID: 15 },
    { value: '5:00 PM', ID: 16 },
    { value: '6:00 PM', ID: 17 },
    { value: '7:00 PM', ID: 18 },
    { value: '8:00 PM', ID: 19 },
    { value: '9:00 PM', ID: 20 },
    { value: '10:00 PM', ID: 21 },
    { value: '11:00 PM', ID: 22 },
    { value: '12:00 PM', ID: 23 }
  ]

  ampm = ["AM", "PM"];

  constructor(private http: HttpClient,
    private toastr: ToastrService) {

      if(localStorage.getItem('areaSelected') == "true"){
        this.http.get(this.ml + "/requierments/area/" + localStorage.getItem('currAreaID')).subscribe((res: any) => {
          console.log(res);

          this.trainIsValid = res.ok.can_train;
          this.newDataReq = res.ok.required_days;
          if(res.ok.accuracy === -1){
            this.accuracyReq = "No predictions yet";
          }
          else{
            this.accuracyReq = res.ok.accuracy;
            if(res.ok.accuracy < res.ok.threshold) this.accuracyCheck = true;
          }

          if(res.ok.required_days === 0) this.newDataCheck = true;
          
        })
      }
      else{
        this.newDataReq = "N/A";
        this.accuracyReq = "N/A";
        this.trainIsValid = false;
      }
    }

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
      for(var i=0; i<res.length; i++){
        this.usersList.push(res[i].email)
        this.userIDs.push(res[i]._id);
      }
    })
  }

  public trainModel(day, time) {
    if(typeof day != 'undefined' && typeof time != 'undefined'){
      this.toastr.success("Re-training was scheduled");
      this.http.put(this.ml + "/area/" + localStorage.getItem('currAreaID') + "/trainModel",
      {
        "status": "waiting",
        "weekday": day,
        "hour": time
      }).subscribe((res: any) => {

      })
    }
    else{
      this.toastr.info("Please select a valid day and time to re-train");
    }
    
  }
}
