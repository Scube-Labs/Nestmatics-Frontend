import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-experiment-list',
  templateUrl: './dialog-experiment-list.component.html',
  styleUrls: ['./dialog-experiment-list.component.scss']
})
export class DialogExperimentListComponent {

  exp: string = environment.baseURL + '/nestmatics/experiment';
  experiments: string[] = [];
  experimentIDs: string[] = [];

  constructor(private toastr: ToastrService, private http: HttpClient , public dialogRef: MatDialogRef<DialogExperimentListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.http.get(this.exp + "/nest/" + data.id).subscribe((res: any) => {
        for(var i=0; i<res.ok.length; i++){
          this.experiments.push(res.ok[i].name);
          this.experimentIDs.push(res.ok[i]._id);
        }
      }),
      (error) => {
        this.toastr.warning(error.error.Error);
      }
     }


  public selectExperiment(e: any) {
    if(e.selectedOptions.selected.length > 0){
      this.dialogRef.close(this.experimentIDs[this.experiments.indexOf(e.selectedOptions.selected[0]._value)]);
    }
  }

  public createExperiment() {
    this.dialogRef.close(-1);
  }
}
