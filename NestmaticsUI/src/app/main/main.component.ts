import { Component, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { PlaybackComponent } from '../playback/playback.component'
import { PredictionComponent } from '../prediction/prediction.component';
import { ExperimentComponent } from '../experiment/experiment.component';
import { ServiceAreaComponent } from '../service-area/service-area.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { DialogUploadComponent } from '../dialog-upload/dialog-upload.component'

@Component({ 
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  toolOpened = true;
  currentComponent: any = ServiceAreaComponent;
  calendarComponent: CalendarComponent = new CalendarComponent();
  
  constructor(
    private http: HttpClient,
    public dialog: MatDialog) { }

  ngOnInit(): void {
  }

  /**
   * The purpose of this function is to toggle what components are being displayed in the main view.
   * @param comp Contains the string used for the component selections.
   */
  changeComponent(comp: string) {
    if(comp == "map"){
      this.currentComponent = MapComponent;
    }
    if(comp == "playback"){
      this.currentComponent = PlaybackComponent;
    }
    if(comp == "prediction"){
      this.currentComponent = PredictionComponent;
    }
    if(comp == "experiment"){
      this.currentComponent = ExperimentComponent;
    }
    if(comp == "service"){
      this.currentComponent = ServiceAreaComponent;
    }
  }

  public openDialog(){
    let dialogRef = this.dialog.open(DialogUploadComponent);

    dialogRef.afterClosed().subscribe(result => {
      
    })
  }
}
