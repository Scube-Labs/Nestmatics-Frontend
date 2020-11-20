import { Component, ViewChild} from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { MatInput } from '@angular/material/input';

const moment = _moment;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent {
  
  @ViewChild('input', {
    read: MatInput
  }) input: MatInput;
  
  calComponent = CalendarComponent;
  //For Service Area
  static areaName = undefined;
  static areaSelectedID = undefined;
  static isSelected = false;

  //For Date
  static hasDate = false;
  static selectedDate = undefined;
  static availableDatesList: string[] = [];

  rides: string = 'http://localhost:3000/rides' //Ride Data End-point
  
  dataFilter = (d: Date | null): boolean => {
    const date = (d || new Date());

    // Allow specific dates. dates are listen in the availableDatesList array.
    return (this.calComponent.availableDatesList.includes((moment(date).format('YYYY-MM-DD'))));
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    CalendarComponent.updateDateSelected(moment(event.value).format('YYYY-MM-DD'));
  }

  constructor() {
  }

  static getDateSelected() {
    return CalendarComponent.selectedDate;
  }

  static updateDateSelected(date: String) {
    this.selectedDate = date;
    this.hasDate = true;
  }

  /**
   * Update the selected service area name.
   * @param name Name to be used when updating the selected service area name
   */
  static updateAreaSelected(id: string, name: string) {
    this.areaName = name;
    this.areaSelectedID = id;
    this.isSelected = true; 
  }

  /**
   * Get the current service area selected
   * @returns Returns selected service area name
   */
  static getAreaSelected() {
    return CalendarComponent.areaName;
  }

  static getAreaSelectedID(){
    
  }

  public resetCalendar() {
    if(this.input.value != undefined){
      this.input.value = undefined;
      this.calComponent.hasDate = false;
    }
  }

}