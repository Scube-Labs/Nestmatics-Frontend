import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet-plugin-trackplayback';
import { CalendarComponent } from '../calendar/calendar.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import * as _moment from 'moment';

const moment = _moment;

@Component({
  selector: 'app-playback',
  templateUrl: './playback.component.html',
  styleUrls: ['./playback.component.scss']
})
export class PlaybackComponent implements AfterViewInit {
  toolOpened = true; //Variable used for opening and closing the toolbar
  private map; //Main map 

  calendarComponent: CalendarComponent = new CalendarComponent();
  private areaSelected = CalendarComponent.getAreaSelected(); // Variable to obtain service area selected
  private dateSelected = CalendarComponent.getDateSelected(); //Variable to obtain the date selected

  areas: string = environment.baseURL + '/nestmatics/areas' //Service Area Data End-point
  rides: string = environment.baseURL + '/nestmatics/rides' //Ride Data End-point
  nests: string = environment.baseURL + '/nestmatics/nests' //Nest Data End-Point
  trackplayback: any;
  disableControls: boolean = true;
  constructor(
      private http: HttpClient,
      public dialog: MatDialog) {}

  ngAfterViewInit(): void {
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
    this.playback();
  
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
    this.http.get(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID') + "/date/" + this.calendarComponent.calComponent.getDateSelected()).subscribe((res: any) => {
      for (const c of res.ok) {
        const lat = c.coords.lat;
        const lon = c.coords.lon;
        var currNest = (L as any).circle([lat, lon], c.nest_radius).addTo(this.map);
        currNest.bindTooltip(
          "Vehicles: " + c.vehicle_qty
        );
      }
    },
    (error) => {
      console.log("Unable to load Nests");
    });
  }

  /**
   * Method to initialize playback of vehicle ride data
   */
  private playback(): void {
    let distincstRideIDs = new Set();
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
              "time": Number(moment(res.ok[i].start_time).format('HmmssS')) * 1
            });
            rideArray.push({
              "lat": Number(res.ok[i].coords.end_lat),
              "lng": Number(res.ok[i].coords.end_lon),
              "time": Number(moment(res.ok[i].end_time).format('HmmssS')) * 1
            });
  
            playbackArray.push(rideArray);
          }
          
        }
        
        console.log(playbackArray);
        
        if(res.ok.length > 0){
          
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
          
        }
        else {
          alert('No playback data available')
        }
      },
      (error) => {
        console.log(error.error.Error);
      });
    }
    }, 400);
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
    console.log(event)
    if(event.checked == false){
      this.trackplayback.hideTrackLine();
    }
    else{
      this.trackplayback.showTrackLine();
    }
  }
}
