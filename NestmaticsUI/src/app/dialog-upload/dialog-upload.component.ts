import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { EventEmitterService } from '../event-emitter.service';

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
  ml: string = environment.baseURL + "/nestmatics/ml"

  constructor(
    private http: HttpClient, 
    private toastr: ToastrService,
    private eventEmitterService: EventEmitterService) { }
  

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
      if(res.ok.inserted.length == 0){
        this.toastr.info("File was already uploaded");
      }
      else{
        this.toastr.success("File uploaded succesfully")
        this.eventEmitterService.onAddDates();
      }

      this.uploadingInProcess = false;

      this.http.get(this.ml + "/prediction/validate/area/" + localStorage.getItem('currAreaID')).subscribe((res: any) => {
        this.toastr.info("Data was validated");
      })
    },
    (error) => {
      this.toastr.warning("Upload Error: " + error.error.Error);

      this.uploadingInProcess = false;
    })

    
  }

}
