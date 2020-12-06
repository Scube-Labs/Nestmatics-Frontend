import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  invokeRefreshMap = new EventEmitter();
  subsVar:Subscription;

  invokeRefreshExperiment = new EventEmitter();
  expSub:Subscription;

  invokeRefreshRides = new EventEmitter();
  ridesSub:Subscription;

  invokeRefreshPrediction = new EventEmitter();
  predictSub: Subscription;

  invokeAreaChange = new EventEmitter();
  subsArea:Subscription;

  invokeSelected = new EventEmitter();
  selectSub: Subscription;

  invokeLogout = new EventEmitter();
  logoutSub:Subscription;

  constructor() { }

  onChangeDate(view:string){
    if(view == 'map'){
      console.log("map")
      this.invokeRefreshMap.emit();
    }
    else if(view == 'predictions'){
      this.invokeRefreshPrediction.emit();
    }
    else if(view == 'playback'){
      this.invokeRefreshRides.emit();
    }
  }

  onLogOut(){
    this.invokeLogout.emit();
  }

  onSelectionOfArea(){
    this.invokeSelected.emit();
  }

  onChangeToArea(name:string){
    this.invokeAreaChange.emit(name);
  }
}
