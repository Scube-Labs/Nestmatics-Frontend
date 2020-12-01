import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-nests',
  templateUrl: './dialog-nests.component.html',
  styleUrls: ['./dialog-nests.component.scss']
})
export class DialogNestsComponent implements OnInit {
  newAmount = 0;
  constructor(public dialogRef: MatDialogRef<DialogNestsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.newAmount = data.vehicles;
     }

  ngOnInit(): void {
  }

  /**
   * This function updates the selected nest's vehicle ammount. 0 <= value <= 100
   */
  updateNest() {
    if(this.newAmount > 100) this.newAmount = 100;
    this.dialogRef.close(this.newAmount);
  }

  /**
   * This function deletes the selected nest from the database.
   */
  deleteNest() {
    this.dialogRef.close(-1);
    
  }

}
