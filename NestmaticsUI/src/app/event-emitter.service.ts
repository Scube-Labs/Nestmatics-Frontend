import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';

@Injectable({
  providedIn: 'root'
})
export class EventEmitterService {

  invokeRefresh = new EventEmitter();
  subsVar:Subscription;

  invokeAreaChange = new EventEmitter();
  subsArea:Subscription;

  constructor() { }

  onChangeDate(date:string){
    this.invokeRefresh.emit(date);
  }

  onChangeToArea(name:string){
    this.invokeAreaChange.emit(name);
  }
}
