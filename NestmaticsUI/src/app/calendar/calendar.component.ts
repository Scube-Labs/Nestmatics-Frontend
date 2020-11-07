import { Component} from '@angular/core';
import { CalendarData, CalendarWeekStart, CalendarOptions, RandomDataService } from 'ng-calendar-heatmap';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})

export class CalendarComponent {

  public calendarData: CalendarData[];
  public calendarOptionsCustom: CalendarOptions;

  constructor(protected randomDataService: RandomDataService) {

    this.calendarOptionsCustom = {
      weekStart: CalendarWeekStart.MONDAY,
      responsive: true,
      onClick: (data: CalendarData) => console.log(data),
      colorRange: ['#D8E6E7', '#832124'],
      staticMax: true,
      tooltipEnabled: false,
      max: 10
    };

    this.calendarData = randomDataService.generate(10, 20);
    console.log(this.calendarData);
  }

  newData() {
    this.calendarData = this.randomDataService.generate(10, 20);
  }

  clearData() {
    this.calendarData = [];
  }
}