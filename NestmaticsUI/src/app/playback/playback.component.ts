import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet-plugin-trackplayback';
import { CalendarComponent } from '../calendar/calendar.component';
import { MatDialog } from '@angular/material/dialog';

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

  areas: string = 'http://localhost:3000/areas' //Service Area Data End-point
  rides: string = 'http://localhost:3000/rides' //Ride Data End-point
  nests: string ='http://localhost:3000/nests' //Nest Data End-Point
  trackplayback: any;
  
  constructor(
      private http: HttpClient,
      public dialog: MatDialog) { }

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
    this.http.get(this.areas + "?name=" + this.areaSelected).subscribe((res: any) => {
      var polygon = L.polygon(res[0].coordinates);
      this.map.fitBounds(polygon.getBounds());
      this.map.setMaxBounds(polygon.getBounds());
      this.map.options.minZoom = this.map.getZoom();
    }
  )}  
  
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
    this.http.get(this.nests + "?serviceArea=" + this.areaSelected).subscribe((res: any) => {
      for (const c of res) {
        const lat = c.coordinates[0];
        const lon = c.coordinates[1];
        var currNest = (L as any).circle([lon, lat], 20).addTo(this.map);
        currNest.bindTooltip(
          "Vehicles: " + c.vehicles
        );
      }
    });
  }

  /**
   * Method to initialize playback of vehicle ride data
   */
  private playback(): void {
    setTimeout(() => {
    this.http.get(this.rides).subscribe((res: any) => {
      this.trackplayback = (L as any).trackplayback(res[0].date0, this.map, {
        trackPointOptions: {
          // whether draw track point
          isDraw: true
        },
        trackLineOptions: {
        // whether draw track line
        isDraw: true
      }});
    });
    }, 200);
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
}
