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
  ridesFrom1;
  ridesFrom2;
  vehicle_qty1;
  vehicle_qty2;
  started1;
  started2;
  ended1;
  ended2;
  
  constructor(private http: HttpClient , public dialogRef: MatDialogRef<DialogExperimentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.http.get(this.exp + "/" + data.id).subscribe((res: any) => {
        this.expName = res.ok.name;

        this.http.get(this.nests + "/nestconfig/" + res.ok.config1 + "/stats").subscribe((res: any) => {
          this.vehicle_qty1 = res.ok.vehicle_qty;
          this.revenue1 = "$" + res.ok.revenue.toFixed(2);
          this.started1 = res.ok.rides_started_nest.length;
          this.ended1 = res.ok.rides_end_nest.length;
        },
        (error) => {
          this.vehicle_qty1 = "N/A";
          this.revenue1 = "$0";
          this.started1 = "0";
          this.ended1 = "0";
        })
        

        this.http.get(this.nests + "/nestconfig/" + res.ok.config2 + "/stats").subscribe((res: any) => {
          this.vehicle_qty2 = res.ok.vehicle_qty;
          this.revenue2 = "$" + res.ok.revenue.toFixed(2);
          this.started2 = res.ok.rides_started_nest.length;
          this.ended2 = res.ok.rides_end_nest.length;
        },
        (error) => {
          this.vehicle_qty2 = "N/A";
          this.revenue2 = "$0";
          this.started2 = "0";
          this.ended2 = "0";
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
