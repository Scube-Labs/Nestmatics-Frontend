import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {environment } from '../../environments/environment';

@Component({
  selector: 'app-dialog-experiment',
  templateUrl: './dialog-experiment.component.html',
  styleUrls: ['./dialog-experiment.component.scss']
})
export class DialogExperimentComponent implements OnInit {

  exp = environment.baseURL + "/nestmatics/experiment"
  nests = environment.baseURL + "/nestmatics/nests"

  expName = ''

  revenue1;
  revenue2;
  active1;
  active2;
  ridesFrom1;
  ridesFrom2;
  
  constructor(private http: HttpClient , public dialogRef: MatDialogRef<DialogExperimentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.http.get(this.exp + "/" + data.id).subscribe((res: any) => {
        console.log(res.ok.config1);
        this.expName = res.ok.name;

        this.http.get(this.nests + "/nestconfig/" + res.ok.config1 + "/stats").subscribe((res: any) => {
          this.revenue1 = "$" + res.ok.revenue.toFixed(2);
          this.active1 = res.ok.total_rides;
        },
        (error) => {
          this.revenue1 = "$0";
          this.active1 = "0";
        })
        

        this.http.get(this.nests + "/nestconfig/" + res.ok.config2 + "/stats").subscribe((res: any) => {
          this.revenue2 = "$" + res.ok.revenue.toFixed(2);
          this.active2 = res.ok.total_rides;
        },
        (error) => {
          this.revenue2 = "$0";
          this.active2 = "0";
        })
        
      })
     }

  ngOnInit(): void {
  }

  /**
   * Close with code to generate report
   */
  report() {
    this.dialogRef.close(-1);
    
  }

}
