import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-areas',
  templateUrl: './dialog-areas.component.html',
  styleUrls: ['./dialog-areas.component.scss']
})
export class DialogAreasComponent implements OnInit {
  nestName; // Nest Name Variable
  constructor(public dialogRef: MatDialogRef<DialogAreasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.nestName = data.name;
     }

  ngOnInit(): void {
  }

  /**
   * Update the Service Area Name
   */
  updateArea() {
    this.dialogRef.close(this.nestName);

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

  selectArea() {

    this.dialogRef.close(-3);

  }
}
