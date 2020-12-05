import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DialogWarnDeleteComponent } from '../dialog-warn-delete/dialog-warn-delete.component';


@Component({
  selector: 'app-dialog-nests',
  templateUrl: './dialog-nests.component.html',
  styleUrls: ['./dialog-nests.component.scss']
})
export class DialogNestsComponent implements OnInit {
  newAmmount = 0;
  nestName = "";
  constructor(public dialogRef: MatDialogRef<DialogNestsComponent>,
    public warn_dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.newAmmount = data.vehicles;
      this.nestName = data.name;
     }

  ngOnInit(): void {
  }

  /**
   * This function updates the selected nest's vehicle ammount. 0 <= value <= 100
   */
  updateNest(qty:string, name:string) {
    var result = {name: name, vehicles:qty };
    console.log("name "+name+", vehicles: "+qty)
    this.dialogRef.close(result);
  }

  cancelNest() {
    this.dialogRef.close(-2);

  }

  /**
   * This function will trigger the complete deletion of a nest
   */
  deleteNest(){
      let Ref = this.warn_dialog.open(DialogWarnDeleteComponent, {
        data: {item: "nest"},
        disableClose: true
      });
  
      Ref.afterClosed().subscribe(result => {
        if(result === -1){
          this.dialogRef.close(-3);
        }
        else if (result === -2){
          //Do-nothing, this is the closing condition.
        }
        
      });
    }

  /**
   * This function deletes the selected nest config from the current nest config list.
   */
  deleteNestConfig() {
    this.dialogRef.close(-1);
    
  }

}
