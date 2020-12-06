import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-warn-delete',
  templateUrl: './dialog-warn-delete.component.html',
  styleUrls: ['./dialog-warn-delete.component.scss']
})
export class DialogWarnDeleteComponent implements OnInit {

  item;

  constructor(public dialogRef: MatDialogRef<DialogWarnDeleteComponent>   
    , @Inject(MAT_DIALOG_DATA) public data: any) {
      this.item = data.item;
    }  
 

  ngOnInit(): void {
  }

  deleteNest(){
    this.dialogRef.close(-1);
  }

  close(){
    this.dialogRef.close(-2);
  }

}
