import { Component, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { PlaybackComponent } from '../playback/playback.component'
import { PredictionComponent } from '../prediction/prediction.component';
import { ExperimentComponent } from '../experiment/experiment.component';
import { ServiceAreaComponent } from '../service-area/service-area.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogUploadComponent } from '../dialog-upload/dialog-upload.component';
import { EventEmitterService } from '../event-emitter.service'
import { DialogSettingsComponent } from '../dialog-settings/dialog-settings.component';
import { Router } from '@angular/router';

@Component({ 
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  toolOpened = true;
  defaultAreaName = "Puerto Rico"
  defaultName = localStorage.setItem('currAreaName', this.defaultAreaName)
  currentComponent: any = ServiceAreaComponent;
  isSelected = false;

  activeColor = '#94ded2';
  inactiveColor = '#59ccb9';

  serviceArea = this.activeColor;
  map = this.inactiveColor;
  prediction = this.inactiveColor;
  experiment = this.inactiveColor;
  upload = this.inactiveColor;
  playback = this.inactiveColor;
  settings = this.inactiveColor;
  admin = false;
  prevComp= 'service';

  constructor(
    public dialog: MatDialog,
    private eventEmitterService: EventEmitterService,
    private router: Router) { 

      this.eventEmitterService.selectSub = this.eventEmitterService.invokeSelected.
        subscribe(()=> {
        this.select()
      });
      this.admin = localStorage.getItem('userIsAdmin') == "true"
      localStorage.setItem('areaSelected', JSON.stringify(false));
    }

  ngOnInit(): void {
    localStorage.setItem('currView', 'serviceArea')
    this.admin = localStorage.getItem('userIsAdmin') == "true"
    

    console.log(localStorage.getItem('reload'))

    if(localStorage.getItem('reload') != "true"){
      setTimeout(function() {
        localStorage.setItem('reload', "true");
        window.location.reload();
      }, 10)
      
    }
  }

  select(){
    this.isSelected = true;
    localStorage.setItem('areaSelected', JSON.stringify(true));
  }

  /**
   * The purpose of this function is to toggle what components are being displayed in the main view.
   * @param comp Contains the string used for the component selections.
   */
  changeComponent(comp: string) {
    if(comp == "map"){
      this.currentComponent = MapComponent;
      localStorage.setItem('currView', 'map')
      this.map = this.activeColor;
      this.eventEmitterService.onChangeToArea(localStorage.getItem('currAreaName'));
    }
    else if(comp == "playback"){
      this.playback = this.activeColor;
      localStorage.setItem('currView', 'playback')
      this.currentComponent = PlaybackComponent;
    }
    else if(comp == "prediction"){
      this.prediction = this.activeColor;
      localStorage.setItem('currView', 'prediction')
      this.currentComponent = PredictionComponent;
    }
    else if(comp == "experiment"){
      this.experiment = this.activeColor;
      localStorage.setItem('currView', 'experiment')
      this.currentComponent = ExperimentComponent;
    }
    else if(comp == "service"){
      this.serviceArea = this.activeColor;
      localStorage.setItem('currView', 'serviceArea')
      this.currentComponent = ServiceAreaComponent;
      this.eventEmitterService.onChangeToArea("Puerto Rico");
    }
    this.changeColors(this.prevComp);
    this.prevComp = comp;
  }

  changeColors(prevComp:string){
    switch(prevComp){
      case 'service':
        this.serviceArea = this.inactiveColor;
        break;
      case 'map':
        this.map = this.inactiveColor;
        break;
      case 'prediction':
        this.prediction = this.inactiveColor;
        break;
      case 'upload':
        this.upload = this.inactiveColor;
        break;
      case 'playback':
        this.playback = this.inactiveColor;
        break;
      case 'experiment':
        this.experiment = this.inactiveColor;
        break;
      case 'settings':
        this.settings = this.inactiveColor;
    }
  }

  /**
   * Open the upload component dialog
   */
  public openUpload(){
    this.upload = this.activeColor;
    this.changeColors(this.prevComp);
    this.prevComp = 'upload';
    let dialogRef = this.dialog.open(DialogUploadComponent);
    dialogRef.afterClosed().subscribe(result => {
      
    })
  }

  public openSettings(){
    this.settings = this.activeColor;
    this.changeColors(this.prevComp);
    this.prevComp = 'settings';
    let dialogRef = this.dialog.open(DialogSettingsComponent);
    dialogRef.afterClosed().subscribe(result => {
      
    })
  }
}
