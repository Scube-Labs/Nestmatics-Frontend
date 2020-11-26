import { Component, ViewChild} from '@angular/core';
import { MatDatepickerInputEvent, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { MatInput } from '@angular/material/input';
import { FormControl } from '@angular/forms';

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
  static selectedDate = moment(new Date()).format('YYYY-MM-DD');
  static availableDatesList: string[] = [];

  todaysDate = new FormControl(new Date());

  
  dataFilter = (d: Date | null): boolean => {
    const date = (d || new Date());

    // Allow specific dates. dates are listen in the availableDatesList array.
    return (this.calComponent.availableDatesList.includes((moment(date).format('YYYY-MM-DD'))));
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    CalendarComponent.updateDateSelected(moment(event.value).format('YYYY-MM-DD'));
  }

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {
      const date = cellDate.getDate();

      console.log(date)
      // Highlight the 1st and 20th day of each month.
      return (date === 1 || date === 20) ? 'example-custom-date-class' : '';
    }

    return '';
  }

  constructor() {
  }

  static getDateSelected() {
    return CalendarComponent.selectedDate;
  }

  static updateDateSelected(date: string) {
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