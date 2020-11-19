import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dialog-experiment-list',
  templateUrl: './dialog-experiment-list.component.html',
  styleUrls: ['./dialog-experiment-list.component.scss']
})
export class DialogExperimentListComponent {

  exp: string = 'http://localhost:3000/experiments';
  experiments: string[] = [];
  experimentIDs: string[] = [];

  constructor(private http: HttpClient , public dialogRef: MatDialogRef<DialogExperimentListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.http.get(this.exp + "?nest=" + data.id).subscribe((res: any) => {
        for(var i=0; i<res.length; i++){
          this.experiments.push(res[i].name);
          this.experimentIDs.push(res[i]._id);
        }
      })
     }


  public selectExperiment(e: any) {
    if(e.selectedOptions.selected.length > 0){
      //console.log(this.experimentIDs[this.experiments.indexOf(e.selectedOptions.selected[0]._value)]);
      this.dialogRef.close(this.experimentIDs[this.experiments.indexOf(e.selectedOptions.selected[0]._value)]);
    }
  }

  public createExperiment() {
    this.dialogRef.close(-1);
  }
}
