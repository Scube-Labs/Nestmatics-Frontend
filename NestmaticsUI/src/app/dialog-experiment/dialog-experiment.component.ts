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
  
  constructor(private http: HttpClient , public dialogRef: MatDialogRef<DialogExperimentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.http.get(this.exp + "/" + data.id).subscribe((res: any) => {
        console.log(res.ok.config1);
        this.expName = res.ok.name;

        this.http.get(this.nests + "/nestconfig/" + res.ok.config1 + "/revenue").subscribe((res: any) => {

        })

        this.http.get(this.nests + "/nestconfig/" + res.ok.config2 + "/revenue").subscribe((res: any) => {

        })

        this.http.get(this.nests + "/nestconfig/" + res.ok.config2 + "/actvehicles").subscribe((res: any) => {

        })
        this.http.get(this.nests + "/nestconfig/" + res.ok.config2 + "/actvehicles").subscribe((res: any) => {

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
