import { EventEmitter, Injectable } from '@angular/core';  
import { Event, NavigationEnd, Router } from '@angular/router';  
import { MatDialog, MatDialogRef } from '@angular/material/dialog';  
import { DialogLoadingComponent } from './dialog-loading/dialog-loading.component';  
  
@Injectable()  
export class SpinnerService {  
  
  
    constructor(private router: Router, private dialog: MatDialog) {  
  
    }  
  
    start(message?): MatDialogRef<DialogLoadingComponent> {  
        
        const dialogRef = this.dialog.open(DialogLoadingComponent,{  
            disableClose: true ,  
            data: message == ''|| message == undefined ? "Loading..." : message  
        });  
        return dialogRef;  
      };  
  
    stop(ref:MatDialogRef<DialogLoadingComponent>){  
        ref.close();  
    }    
}  