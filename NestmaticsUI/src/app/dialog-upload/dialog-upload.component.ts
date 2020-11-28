import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-upload',
  templateUrl: './dialog-upload.component.html',
  styleUrls: ['./dialog-upload.component.scss']
})
export class DialogUploadComponent implements OnInit {

  selectedFile;
  hasSelected = false;

  uploadingInProcess = false;

  rides = environment.baseURL + "/nestmatics/rides"
  constructor(private http: HttpClient, private toastr: ToastrService) { }
  
  // afuConfig = {
  //   uploadAPI: {
  //     url: environment.baseURL + "/nestmatics/rides" 
  //   },
  //   formatsAllowed: ".csv",
  //   theme: "dragNDrop",
  //   params: {
  //     'page': '1'
  //   }
  // };

  ngOnInit(): void {
  }


  onFileChange(event) {
    this.selectedFile = event.target.files[0];
    if(event.target.files.length == 0){
      this.hasSelected = false;
    }
    else{
      this.hasSelected = true;
    }
    
  }

  fileUpload() {
    this.uploadingInProcess = true;
    var formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('area', localStorage.getItem('currAreaID'));
    this.http.post(this.rides, formData).subscribe((res: any) => {
      console.log(res)
      if(res.ok.inserted.length == 0){
        this.toastr.info("File was already uploaded");
      }
      else{
        this.toastr.success("File uploaded succesfuly")
      }

      this.uploadingInProcess = false;
    },
    (error) => {
      console.log(error);
      this.toastr.warning("Upload Error: " + error.error.Error);

      this.uploadingInProcess = false;
    })

    
  }

}
