import { Component, ViewChild, OnInit, ViewEncapsulation} from '@angular/core';
import { MatDatepickerInputEvent, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import * as _moment from 'moment';
import { MatInput } from '@angular/material/input';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EventEmitterService } from '../event-emitter.service';
import { environment } from 'src/environments/environment';

const moment = _moment;

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class CalendarComponent implements OnInit {
  
  @ViewChild('input', {
    read: MatInput
  }) input: MatInput;
  
  //For Service Area
  areaName = localStorage.getItem('currAreaName');

  rides = environment.baseURL + "/nestmatics/rides"

  static areaSelectedID = localStorage.getItem('currAreaID');
  static isSelected = false;

  //For Date
  static hasDate = false;
  static selectedDate = moment(new Date()).format('YYYY-MM-DD');
  static availableDatesList: string[] = [];
  
  todaysDate = new FormControl(new Date());

  day = localStorage.setItem('currDate', CalendarComponent.selectedDate);

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highligh dates inside the month view.
    if (view === 'month') {

      var datestr = new Date(cellDate).toISOString();
      datestr = datestr.split("T")[0].concat("T00:00:00");

      if (CalendarComponent.availableDatesList.includes(datestr)){
        return 'calendarColor';
      }
      else{
        return "";
      }
    }

    return '';
  }

  static eventEmitter;
  

  addEvent(type: string, event: MatDatepickerInputEvent<Date>) {
    CalendarComponent.updateDateSelected(moment(event.value).format('YYYY-MM-DD'));
  }

  constructor( 
    private eventEmitterService: EventEmitterService,
    private http: HttpClient) {
    CalendarComponent.eventEmitter = eventEmitterService;

    if(CalendarComponent.eventEmitter.subsArea == undefined){
      
      //Subscribe to event that will trigger a change in the name of the area the user is looking at
      this.eventEmitterService.subsArea = this.eventEmitterService.invokeAreaChange.
      subscribe((name:string)=> {
        this.changeAreaName(name)
      });
    }

    //subscribe to event that will look for available dates when there is an upload
    this.eventEmitterService.datesSub = this.eventEmitterService.invokeAddDates.
        subscribe((name:string)=> {
          this.lookForAvailableDates()
        });
  }

  ngOnInit(){
    
  }

  changeAreaName(name:string){
    this.areaName = name
    if(name != "Puerto Rico"){
        this.lookForAvailableDates();
    }
  }

  lookForAvailableDates(){
    this.http.get(this.rides + "/area/" + localStorage.getItem('currAreaID')+"/alldates").subscribe((res: any) => {
      if(res.ok){
          CalendarComponent.availableDatesList = res.ok;
      }
    });
  }

  static getDateSelected() {
    return CalendarComponent.selectedDate;
  }

  static updateDateSelected(date: string) {
    localStorage.setItem('currDate', date);
    this.selectedDate = date;
    this.hasDate = true;
    this.eventEmitter.onChangeDate(localStorage.getItem('currView'));
   
  }

  /**
   * Update the selected service area name.
   * @param name Name to be used when updating the selected service area name
   */
  static updateAreaSelected(id: string, name: string) {
    localStorage.setItem('areaName', name);
    localStorage.setItem('areaSelectedID', id);

    this.areaSelectedID = id;
    this.isSelected = true; 
  }


  public resetCalendar() {
    if(this.input.value != undefined){
      this.input.value = undefined;
    }
  }

}