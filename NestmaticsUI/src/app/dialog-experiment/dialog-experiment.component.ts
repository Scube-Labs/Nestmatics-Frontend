import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {environment } from '../../environments/environment';
import { DialogReportComponent } from '../dialog-report/dialog-report.component' 

@Component({
  selector: 'app-dialog-experiment',
  templateUrl: './dialog-experiment.component.html',
  styleUrls: ['./dialog-experiment.component.scss']
})
export class DialogExperimentComponent implements OnInit {

  exp = environment.baseURL + "/nestmatics/experiment"
  nests = environment.baseURL + "/nestmatics/nests"

  expName = ''
  expid;

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
  totalActiveVehicles1;
  totalActiveVehicles2;
  
  constructor(private http: HttpClient , public dialog: MatDialog, public dialogRef: MatDialogRef<DialogExperimentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log("experiment id "+data.id);
      this.expid = data.id;
      this.http.get(this.exp + "/" + data.id).subscribe((res: any) => {
        console.log(res);
        this.expName = res.ok.name;

        this.http.get(this.nests + "/nestconfig/" + res.ok.config1 + "/stats").subscribe((res: any) => {
          this.vehicle_qty1 = res.ok.vehicle_qty;
          this.revenue1 = "$" + res.ok.revenue.toFixed(2);
          this.started1 = res.ok.rides_started_nest.length;
          this.ended1 = res.ok.rides_end_nest.length;
          this.totalActiveVehicles1 = Object.keys(res.ok.active_vehicles).length;
        },
        (error) => {
          this.vehicle_qty1 = "N/A";
          this.revenue1 = "$0";
          this.started1 = "0";
          this.ended1 = "0";
          this.totalActiveVehicles1 = "0";
        })
        

        this.http.get(this.nests + "/nestconfig/" + res.ok.config2 + "/stats").subscribe((res: any) => {
          this.vehicle_qty2 = res.ok.vehicle_qty;
          this.revenue2 = "$" + res.ok.revenue.toFixed(2);
          this.started2 = res.ok.rides_started_nest.length;
          this.ended2 = res.ok.rides_end_nest.length;
          this.totalActiveVehicles2 = Object.keys(res.ok.active_vehicles).length;
        },
        (error) => {
          this.vehicle_qty2 = "N/A";
          this.revenue2 = "$0";
          this.started2 = "0";
          this.ended2 = "0";
          this.totalActiveVehicles2 = "0";
        })
        
      })
     }

  ngOnInit(): void {
  }

  /**
   * Open dialog for report
   */
  openReportDialog(){
    let dialogRef = this.dialog.open(DialogReportComponent, {
      data: {id:this.expid, expName:this.expName},
    });

    dialogRef.afterClosed().subscribe(result => {
      
    })
  }

  close() {
    this.dialogRef.close(-1);
    
  }

}
