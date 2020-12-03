import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet-plugin-trackplayback';
//import { CalendarComponent } from '../calendar/calendar.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import * as _moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { EventEmitterService } from '../event-emitter.service';

const moment = _moment;

@Component({
  selector: 'app-playback',
  templateUrl: './playback.component.html',
  styleUrls: ['./playback.component.scss']
})
export class PlaybackComponent implements AfterViewInit {
  toolOpened = true; //Variable used for opening and closing the toolbar
  private map; //Main map 

  // calendarComponent: CalendarComponent = new CalendarComponent();
  // private areaSelected = CalendarComponent.getAreaSelected(); // Variable to obtain service area selected
  // private dateSelected = CalendarComponent.getDateSelected(); //Variable to obtain the date selected

  private areaSelected = localStorage.getItem('currAreaName');
  private dateSelected = localStorage.getItem('currDate');

  areas: string = environment.baseURL + '/nestmatics/areas' //Service Area Data End-point
  rides: string = environment.baseURL + '/nestmatics/rides' //Ride Data End-point
  nests: string = environment.baseURL + '/nestmatics/nests' //Nest Data End-Point
  trackplayback: any; //Track instance in charge of visualization
  disableControls: boolean = true; //Variable used to disable controls
  minUnix //Minimum time
  maxUnix //Maximum time
  change; //Percentage change for progress bar
  progress = 0; //Progress for progress bar
  currentTime; //Current time being displayed in the playback
  currHeat;
  heatSelected ;
  InProcess = true;
  lastTimeSelected;

  constructor(
      private http: HttpClient,
      public dialog: MatDialog,
      private eventEmitterService: EventEmitterService,
      private toastr: ToastrService) {
        this.eventEmitterService.ridesSub = this.eventEmitterService.invokeRefreshRides.
        subscribe(()=> {
        this.refresh()
      });
    }

  ngAfterViewInit(): void {
    this.initialize();
  }

  refresh(){
    this.map.off();
    this.map.remove();
    this.initialize();
  }

  /**
   * Initialize everything in the correct order. Also used to update the map data.
   */
  private initialize() {

    this.initMap();
    this.loadNests();
    this.initTiles();
    this.restrict();
    this.playAll();
    this.displayBehaviour(1);
  }
  
  /**
   * Restrict the map view to only the selected Service Area
   */
  private restrict(): void{
    if(!(this.areaSelected == undefined || this.areaSelected == "Unnamed")) {
      this.http.get(this.areas + "/" + localStorage.getItem('currAreaID')).subscribe((res: any) => {
        var polygon = L.polygon(res.ok.coords.coordinates);
        this.map.fitBounds(polygon.getBounds());
        this.map.setMaxBounds(polygon.getBounds());
        this.map.options.minZoom = this.map.getZoom();
      },
      (error) => {
        console.log("Unable to restrict area");
      })
    }  
    else {
    }
  } 
  
/**
 * Initialize Main Map
 */
  private initMap(): void {
    this.map = (L as any).map('playback', {
      zoomControl: false,
      zoom: 15
    });

    new (L as any).Control.Zoom({ position: 'bottomright' }).addTo(this.map); //Zoom control to be on the bottom right

  }

  /**
   * Main Map Tile Initialization Method. Initializes raster tiles by OpenStreetMap
   */
  private initTiles(): void {
    const tiles = (L as any).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  /**
   * Load Nests from DB to Map. Retrieved nest belong to selected Service Area
   */
  private loadNests(): void {
    this.http.get(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID') + "/date/" + localStorage.getItem('currDate')).subscribe((res: any) => {
      for (const c of res.ok) {
        const lat = c.coords.lat;
        const lon = c.coords.lon;
        var currNest = (L as any).circle([lat, lon], c.nest_radius).addTo(this.map);
        currNest.bindTooltip(
          
          "Name: " + c.nest_name
        );
        currNest.addEventListener("click", ()=> {
          this.http.get(this.rides + "/startat/nest/" + c._id + "/date/" + "2020-03-02" + "/area/" + localStorage.getItem('currAreaID') ).subscribe((res: any) => {
            
            var playbackArray = [];

            for(var i=0; i<res.ok.length; i++){
              var rideArray = new Array();
              if(Number(res.ok[i].coords.start_lat) != -1 && Number(res.ok[i].coords.start_lon) != -1 && Number(res.ok[i].start_time) != -1 && Number(res.ok[i].coords.end_lat) != -1 && Number(res.ok[i].coords.end_lon) != -1 && Number(res.ok[i].end_time) != -1){
                rideArray.push({
                  "lat": Number(res.ok[i].coords.start_lat),
                  "lng": Number(res.ok[i].coords.start_lon),
                  "time": Number(moment(res.ok[i].start_time).format('x')) * 1
                });
                rideArray.push({
                  "lat": Number(res.ok[i].coords.end_lat),
                  "lng": Number(res.ok[i].coords.end_lon),
                  "time": Number(moment(res.ok[i].end_time).format('x')) * 1
                });
      
                playbackArray.push(rideArray);
              }
              
            }
            
            this.playBack(playbackArray);

          })
        })
      }
    },
    (error) => {
      this.toastr.warning(error.error.Error);
    });
  }

  /**
   * Method to initialize playback of vehicle ride data
   */
  private playAll(): void {
    setTimeout(() => {
    if(typeof this.dateSelected != 'undefined') {
      this.http.get(this.rides + "/area/" + localStorage.getItem('currAreaID') + "/date/" + this.dateSelected).subscribe((res: any) => {
        var playbackArray = [];

        for(var i=0; i<res.ok.length; i++){
          var rideArray = new Array();
          if(Number(res.ok[i].coords.start_lat) != -1 && Number(res.ok[i].coords.start_lon) != -1 && Number(res.ok[i].start_time) != -1 && Number(res.ok[i].coords.end_lat) != -1 && Number(res.ok[i].coords.end_lon) != -1 && Number(res.ok[i].end_time) != -1){
            rideArray.push({
              "lat": Number(res.ok[i].coords.start_lat),
              "lng": Number(res.ok[i].coords.start_lon),
              "time": Number(moment(res.ok[i].start_time).format('x')) * 1
            });
            rideArray.push({
              "lat": Number(res.ok[i].coords.end_lat),
              "lng": Number(res.ok[i].coords.end_lon),
              "time": Number(moment(res.ok[i].end_time).format('x')) * 1
            });
  
            playbackArray.push(rideArray);
          }
          
        }
        
        this.playBack(playbackArray);
        
      },
      (error) => {
        this.toastr.info(error.error.Error);

        this.InProcess = false;
      });
    }
    }, 400);
  }

  private playBack(playbackArray: string[]) {
    if(playbackArray.length > 0){


      if(typeof this.trackplayback != 'undefined'){
        this.trackplayback.dispose();
      }
          
      this.trackplayback = (L as any).trackplayback(playbackArray, this.map, {
        trackPointOptions: {
          // whether draw track point
          isDraw: true
        },
        trackLineOptions: {
        // whether draw track line
        isDraw: true
      }});
      this.disableControls = false;
      this.InProcess = false;

      this.minUnix = moment(this.trackplayback.getStartTime()).format('H');
      this.maxUnix = moment(this.trackplayback.getEndTime()).format('H');

      this.change = 100/(this.maxUnix - this.minUnix);

      // trigger on time change
      this.trackplayback.on('tick', e => {
        if(Number(moment(e.time).format('H')) < 12){
          this.currentTime = moment(e.time).format('H:mm:ss') + " AM";
        }
        else if(Number(moment(e.time).format('H')) == 12){
          this.currentTime = moment(e.time).format('H:mm:ss') + " PM";
        }
        else{
          this.currentTime = (Number(moment(e.time).format('H')) - 12).toString() + moment(e.time).format(':mm:ss') + " PM";
        }

        this.progress = (Number(moment(e.time).format('H')) - this.minUnix) * this.change

      }, this)

      
    }
    else {
      this.toastr.error('No playback data available')
    }


  }
  formatLabel(value: number) {
    if (value > 12) {
      return Math.round(value)-12 + 'PM';
    }
    return value + 'AM';
  }

  public updateTime(time : number): void {
    this.lastTimeSelected = time
    var unixTime;
    if(time < 10){
      unixTime = Number(moment(this.dateSelected + "T0" + time + ":00:00").format('x'))
    }
    else{
      unixTime = Number(moment(this.dateSelected + "T" + time + ":00:00").format('x'))
    }
    Number(moment(this.dateSelected + "T0" + time + ":00:00").format('x'));
    this.displayBehaviour(time);
    this.trackplayback.setCursor(unixTime);
    this.playbackPause();
    this.playbackPlay();
  }

  /**
   * Function to control the playback Play functionality
   */
  public playbackPlay() {
    this.trackplayback.start();
  }
  /**
   * Function to control the playback Pause functionality
   */
  public playbackPause() {
    this.trackplayback.stop();
  }
  /**
   * Function to control the playback Replay functionality
   */
  public playbackReplay() {
    this.trackplayback.rePlaying();
  }

  public showLines(event) {
    if(event.checked == false){
      this.trackplayback.hideTrackLine();
    }
    else{
      this.heatSelected = false;
      this.trackplayback.showTrackLine();
    }
  }

  public showBehaviour(event) {
    if(event.checked == false){
      this.heatSelected = false;
      if(typeof this.currHeat != 'undefined'){
        this.map.removeLayer(this.currHeat);
      }
    }
    else{
      this.heatSelected = true;
      this.trackplayback.setCursor
      if(typeof this.lastTimeSelected != 'undefined'){
        this.displayBehaviour(this.lastTimeSelected);
      }
    }
  }

   private displayBehaviour(time : number): void {
    var endPerHour = []
    if(typeof this.dateSelected != 'undefined') {
      this.http.get(this.rides + "/area/" + localStorage.getItem('currAreaID') + "/date/" + this.dateSelected).subscribe((res: any) => {
        for (var i=0; i< res.ok.length; i++){

          if(typeof this.currHeat != 'undefined'){
            this.map.removeLayer(this.currHeat);
          }

          if(Number(moment(res.ok[i].start_time).format('H')) == time)
          {
            endPerHour.push([res.ok[i].coords.start_lat, res.ok[i].coords.start_lon, 1])
            
          }
          

        }
        
        if(this.heatSelected){
          this.currHeat = (L as any).heatLayer(endPerHour, {radius: 30}, {0.4: 'bluered', 0.65: 'lime', 1: 'blue'}).addTo(this.map);

        }
        
      });
    }
   }

  public quickSpeed() {
    this.trackplayback.quickSpeed();
  }

  public slowSpeed() {
    this.trackplayback.slowSpeed();
  }
}
