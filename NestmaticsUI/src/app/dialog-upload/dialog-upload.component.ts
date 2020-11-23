import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dialog-upload',
  templateUrl: './dialog-upload.component.html',
  styleUrls: ['./dialog-upload.component.scss']
})
export class DialogUploadComponent implements OnInit {

  constructor() { }
  afuConfig = {
    uploadAPI: {
      url: environment.baseURL + "/files" 
    },
    formatsAllowed: ".csv",
    theme: "dragNDrop"
  };

  ngOnInit(): void {
  }

}
