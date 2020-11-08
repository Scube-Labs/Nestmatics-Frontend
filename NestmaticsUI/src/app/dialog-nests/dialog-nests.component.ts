import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-nests',
  templateUrl: './dialog-nests.component.html',
  styleUrls: ['./dialog-nests.component.scss']
})
export class DialogNestsComponent implements OnInit {
  newAmmount = 0;
  constructor(public dialogRef: MatDialogRef<DialogNestsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.newAmmount = data.vehicles;
     }

  ngOnInit(): void {
  }

  updateNest() {
    if(this.newAmmount > 100) this.newAmmount = 100;
    this.dialogRef.close(this.newAmmount);
  }

  deleteNest() {
    this.dialogRef.close(-1);
    
  }

}
