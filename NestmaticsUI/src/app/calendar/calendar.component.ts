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

  static updateAreaSelected(name: string) {
    this.areaName = name;
    this.isSelected = true;
  }

  static getAreaSelected() {
    return CalendarComponent.areaName;
  }

  
}