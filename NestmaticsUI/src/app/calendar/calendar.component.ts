import { Component, ViewChild, OnInit} from '@angular/core';
import { MatDatepickerInputEvent, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { MatInput } from '@angular/material/input';
import { FormControl } from '@angular/forms';
import { EventEmitterService } from '../event-emitter.service'

const moment = _moment;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent implements OnInit {
  
  @ViewChild('input', {
    read: MatInput
  }) input: MatInput;
  
  //calComponent = CalendarComponent;
  //For Service Area
  areaName = localStorage.getItem('currAreaName');
  static areaSelectedID = localStorage.getItem('currAreaID');
  static isSelected = false;

  //For Date
  static hasDate = false;
  static selectedDate = moment(new Date()).format('YYYY-MM-DD');
  static availableDatesList: string[] = [];
  

  todaysDate = new FormControl(new Date());

  day = localStorage.setItem('currDate', CalendarComponent.selectedDate);

  
  // dataFilter = (d: Date | null): boolean => {
  //   const date = (d || new Date());

  //   // Allow specific dates. dates are listen in the availableDatesList array.
  //   return (this.calComponent.availableDatesList.includes((moment(date).format('YYYY-MM-DD'))));
  // }

  static eventEmitter;
  

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    CalendarComponent.updateDateSelected(moment(event.value).format('YYYY-MM-DD'));
  }

  constructor( private eventEmitterService: EventEmitterService) {
    CalendarComponent.eventEmitter = eventEmitterService;

    if(CalendarComponent.eventEmitter.subsArea == undefined){
      this.eventEmitterService.subsArea = this.eventEmitterService.invokeAreaChange.
      subscribe((name:string)=> {
        this.changeAreaName(name)
      });
    }
  }

  ngOnInit(){
    
  }

  changeAreaName(name:string){
    this.areaName = name
  }

  static getDateSelected() {
    return CalendarComponent.selectedDate;
  }

  static updateDateSelected(date: string) {
    localStorage.setItem('currDate', date);
    this.selectedDate = date;
    this.hasDate = true;
    this.eventEmitter.onChangeDate(localStorage.getItem('currView'));
   // console.log(this.selectedDate)
  }

  /**
   * Update the selected service area name.
   * @param name Name to be used when updating the selected service area name
   */
  static updateAreaSelected(id: string, name: string) {
    localStorage.setItem('areaName', name);
    localStorage.setItem('areaSelectedID', id);
  //  this.areaName = name;
    this.areaSelectedID = id;
    this.isSelected = true; 
  }

  /**
   * Get the current service area selected
   * @returns Returns selected service area name
   */
  static getAreaSelected() {
  //  return CalendarComponent.areaName;
  }

  static getAreaSelectedID(){
    
  }

  public resetCalendar() {
    if(this.input.value != undefined){
      this.input.value = undefined;
  //    this.calComponent.hasDate = false;
    }
  }

}