import { Component} from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent {

  public areaName = "Mayaguez";
  static areaSelected;

  constructor() {
    CalendarComponent.areaSelected = this.areaName;
  }

  
}