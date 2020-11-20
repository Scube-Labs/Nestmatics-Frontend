import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-areas',
  templateUrl: './dialog-areas.component.html',
  styleUrls: ['./dialog-areas.component.scss']
})
export class DialogAreasComponent implements OnInit {
  nestName; // Nest Name Variable
  nestID; //Nest ID Variable

  constructor(public dialogRef: MatDialogRef<DialogAreasComponent>,
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
    this.dialogRef.close(-1);
    
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
