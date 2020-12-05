import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-loading',
  templateUrl: './dialog-loading.component.html',
  styleUrls: ['./dialog-loading.component.scss']
})
export class DialogLoadingComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<DialogLoadingComponent>   
    , @Inject(MAT_DIALOG_DATA) public data: any) {}  
 

  ngOnInit(): void {
  }

}
