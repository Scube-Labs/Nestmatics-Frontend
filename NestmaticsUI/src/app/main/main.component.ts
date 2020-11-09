import { Component, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { PlaybackComponent } from '../playback/playback.component'
import { PredictionComponent } from '../prediction/prediction.component';
import { ExperimentComponent } from '../experiment/experiment.component';
import { ServiceAreaComponent } from '../service-area/service-area.component';


@Component({ 
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  toolOpened = true;
  currentComponent: any = MapComponent;
  constructor() { }

  ngOnInit(): void {
  }

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
}
