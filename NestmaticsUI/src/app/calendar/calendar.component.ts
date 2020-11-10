import { Component} from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent {

  static areaName = undefined;
  static isSelected = false;
  calComponent = CalendarComponent;

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