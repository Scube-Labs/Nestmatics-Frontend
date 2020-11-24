import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as _moment from 'moment';

const moment = _moment;

@Component({
  selector: 'app-dialog-create-experiment',
  templateUrl: './dialog-create-experiment.component.html',
  styleUrls: ['./dialog-create-experiment.component.scss']
})
export class DialogCreateExperimentComponent {

  nests: string = environment.baseURL + "/nestmatics/nests/"
  exp: string = environment.baseURL + "/nestmatics/experiment"

  experimentName;
  selectedFirst;
  selectedSecond;
  experimentsList: string[] = [];
  experimentsNamesList: string[] = [];
  currNestID;

  constructor(private http: HttpClient , public dialogRef: MatDialogRef<DialogCreateExperimentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      
      this.http.get(this.nests + "nestconfig/nest/" + data.id).subscribe((res: any) => {
        for(var i=0; i<res.ok.length; i++){
          this.experimentsList.push(res.ok[i]);
          this.experimentsNamesList.push(moment(res.ok[i].start_date).format('YYYY-MM-DD'));
        }

        this.currNestID = data.id;
      })

     }

  ngOnInit(): void {
  }

  public createExperiment() {

    if(typeof this.experimentName != 'undefined')
    {
      if(typeof this.selectedFirst != 'undefined' && typeof this.selectedSecond != 'undefined'){
        if(this.selectedFirst == this.selectedSecond){
          alert("Invalid configuration selection. Configurations cannot be the same for both selections")
        }
        else{
          var first: any = this.experimentsList[this.experimentsNamesList.indexOf(this.selectedFirst)]
          var second: any = this.experimentsList[this.experimentsNamesList.indexOf(this.selectedSecond)]
          
          this.http.post(this.exp, {
            "nest_id": this.currNestID,
            "name": this.experimentName,
            "config1": first._id,
            "config2": second._id,
            "date": moment(new Date()).format('YYYY-MM-DD')
          }).subscribe((res: any) => {
            this.dialogRef.close(-1);
          },
          (error) => {
            alert(error.error.Error);
          })
        }
      }
      else{
        alert("Please Select two (2) different nest configurations");
      }
    }
    else {
      alert("Please enter a valid name for the experiment");

    }

    

  }
}
