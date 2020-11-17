import { Component} from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';


@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent {

  static areaName = undefined;
  static isSelected = false;
  calComponent = CalendarComponent;
  
  dataFilter = (d: Date | null): boolean => {
    const date = (d || new Date()).getDate();

    // Allow specific dates
    return date === 1 || date === 6;
  }

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    console.log(event.value);
  }

  constructor() {
  }

  /**
   * Update the selected service area name.
   * @param name Name to be used when updating the selected service area name
   */
  static updateAreaSelected(name: string) {
    this.areaName = name;
    this.isSelected = true;
  }

  /**
   * Get the current service area selected
   * @returns Returns selected service area name
   */
  static getAreaSelected() {
    return CalendarComponent.areaName;
  }

  
}