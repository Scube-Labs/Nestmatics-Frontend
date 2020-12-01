import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-nests',
  templateUrl: './dialog-nests.component.html',
  styleUrls: ['./dialog-nests.component.scss']
})
export class DialogNestsComponent implements OnInit {
  newAmmount = 0;
  nestName = "";
  constructor(public dialogRef: MatDialogRef<DialogNestsComponent>,
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
  // updateNest() {
  //   if(this.newAmmount > 100) this.newAmmount = 100;
  //   this.dialogRef.close(this.newAmmount);
  // }

  cancelNest() {
    this.dialogRef.close(-2);

  }

  /**
   * This function deletes the selected nest from the database.
   */
  deleteNest() {
    this.dialogRef.close(-1);
    
  }

}
