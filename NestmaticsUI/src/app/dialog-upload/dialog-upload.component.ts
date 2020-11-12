import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dialog-upload',
  templateUrl: './dialog-upload.component.html',
  styleUrls: ['./dialog-upload.component.scss']
})
export class DialogUploadComponent implements OnInit {

  constructor() { }
  afuConfig = {
    uploadAPI: {
      url:"http://localhost:3000/files" 
    },
    formatsAllowed: ".csv",
    theme: "dragNDrop"
  };

  ngOnInit(): void {
  }

}
