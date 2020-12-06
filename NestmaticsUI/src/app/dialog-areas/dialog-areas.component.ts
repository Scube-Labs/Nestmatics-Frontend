import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DialogWarnDeleteComponent } from '../dialog-warn-delete/dialog-warn-delete.component';

@Component({
  selector: 'app-dialog-areas',
  templateUrl: './dialog-areas.component.html',
  styleUrls: ['./dialog-areas.component.scss']
})
export class DialogAreasComponent implements OnInit {
  nestName; // Nest Name Variable
  nestID; //Nest ID Variable

  constructor(public dialogRef: MatDialogRef<DialogAreasComponent>,
    public warn_dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.nestName = data.name;
      this.nestID = data.area._id
     }

  ngOnInit(): void {
  }

  /**
   * Update the Service Area Name
   */
  updateArea() {
    this.dialogRef.close([this.nestID, this.nestName]);

  }

  /**
   * Delete the Service Area
   */
  deleteArea() {
    let Ref = this.warn_dialog.open(DialogWarnDeleteComponent, {
      data: {item: "service area"},
      disableClose: true
    });

    Ref.afterClosed().subscribe(result => {
      if(result === -1){
        this.dialogRef.close(-1);
      }
      else if (result === -2){
        //Do-nothing, this is the closing condition.
      }
      
    });
    
  }

  /**
   * Close the Material Dialog
   */
  cancelArea() {
    this.dialogRef.close(-2);

  }

  /**
   * Function to select the service area to be used
   */
  selectArea() {

    this.dialogRef.close(-3);

  }
}
