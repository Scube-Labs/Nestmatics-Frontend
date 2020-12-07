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
  scheduleIsValid = false;
  scheduleMessage;
  newDataReq;
  accuracyReq;

  newDataCheck = false;
  accuracyCheck = false;

  weekValues = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  weekIDs = [0, 1, 2, 3, 4, 5, 6];

  hours = [
    //AM
    { value: '12:00 AM', ID: 0 },
    { value: '1:00 AM', ID: 1 },
    { value: '2:00 AM', ID: 2 },
    { value: '3:00 AM', ID: 3 },
    { value: '4:00 AM', ID: 4 },
    { value: '5:00 AM', ID: 5 },
    { value: '6:00 AM', ID: 6 },
    { value: '7:00 AM', ID: 7 },
    { value: '8:00 AM', ID: 8 },
    { value: '9:00 AM', ID: 9 },
    { value: '10:00 AM', ID: 10 },
    { value: '11:00 AM', ID: 11 },
    //PM
    { value: '12:00 PM', ID: 12 },
    { value: '1:00 PM', ID: 13 },
    { value: '2:00 PM', ID: 14 },
    { value: '3:00 PM', ID: 15 },
    { value: '4:00 PM', ID: 16 },
    { value: '5:00 PM', ID: 17 },
    { value: '6:00 PM', ID: 18 },
    { value: '7:00 PM', ID: 19 },
    { value: '8:00 PM', ID: 20 },
    { value: '9:00 PM', ID: 21 },
    { value: '10:00 PM', ID: 22 },
    { value: '11:00 PM', ID: 23 }
  ]

  ampm = ["AM", "PM"];

  constructor(private http: HttpClient,
    private toastr: ToastrService) {

      if(localStorage.getItem('areaSelected') == "true"){
        this.http.get(this.ml + "/requierments/area/" + localStorage.getItem('currAreaID')).subscribe((req: any) => {
          this.http.get(this.ml + "/area/" + localStorage.getItem('currAreaID') + "/training/metadata").subscribe((res:any) => {
          this.trainIsValid = req.ok.can_train && (res.ok[0].status != "training");
          this.scheduleIsValid = (res.ok[0].status != "training")
          this.newDataReq = req.ok.required_days;
          
          if(req.ok.accuracy === -1){
            this.accuracyReq = "No predictions yet";
          }
          else{
            this.accuracyReq = req.ok.accuracy.toFixed(1);
            if(req.ok.accuracy < req.ok.threshold) this.accuracyCheck = true;
          }

          if(req.ok.required_days === 0) this.newDataCheck = true;

          if(res.ok[0].status == "ready"){
            this.scheduleMessage = "There is no training scheduled"
          }
          else if(res.ok[0].status == "training"){
            this.scheduleMessage = "Prediction model is currently training";
          }
          else{
            this.scheduleMessage = "Training scheduled for " + this.weekValues[res.ok[0].weekday] + " at " + this.hours[res.ok[0].hour].value;
          }
          
          })
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
      
      if(time === -1){
        this.http.put(this.ml + "/area/" + localStorage.getItem('currAreaID') + "/trainModel",
        {
          "status": "waiting",
          "weekday": day,
          "hour": time
        }).subscribe((res: any) => {
          this.toastr.success("Training started");
        })
      }
      else{
        this.http.put(this.ml + "/area/" + localStorage.getItem('currAreaID') + "/trainModel",
        {
          "status": "waiting",
          "weekday": this.weekIDs[this.weekValues.indexOf(day.value)],
          "hour": time
        }).subscribe((res: any) => {
          this.toastr.success("Training started");
        })
      }
      
    }
    else{
      this.toastr.info("Please select a valid day and time to re-train");
    }
    
  }
}
