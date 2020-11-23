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

  constructor(private http: HttpClient , public dialogRef: MatDialogRef<DialogExperimentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log(data);
      this.http.get(this.exp + "/" + data.id).subscribe((res: any) => {
        console.log(res);
      })
     }

  ngOnInit(): void {
  }

}
