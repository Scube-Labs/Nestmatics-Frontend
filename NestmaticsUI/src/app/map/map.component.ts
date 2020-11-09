import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import { CalendarComponent } from '../calendar/calendar.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogNestsComponent } from '../dialog-nests/dialog-nests.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  toolOpened = true; //Variable used for opening and closing the toolbar
  private map; //Main map 

  calendarComponent: CalendarComponent = new CalendarComponent();
  private areaSelected = CalendarComponent.getAreaSelected(); // Variable to obtain service area selected

  areas: string = 'http://localhost:3000/areas' //Service Area Data End-point
  rides: string = 'http://localhost:3000/rides' //Ride Data End-point
  nests: string ='http://localhost:3000/nests' //Nest Data End-Point
  
  constructor(
      private http: HttpClient,
      public dialog: MatDialog) { }

  ngAfterViewInit(): void {
    this.initialize();
  }

  private initialize() {

    this.initMap();
    this.restrict();
    this.initTiles();
    this.loadNests();
    this.drawControl();
  
  }
  /**
   * Restrict the map view to only the selected Service Area
   */
  private restrict(): void{
    if(!(this.areaSelected == undefined || this.areaSelected == "Unnamed")) {
      this.http.get(this.areas + "?name=" + this.areaSelected).subscribe((res: any) => {
        var polygon = L.polygon(res[0].coordinates);
        this.map.fitBounds(polygon.getBounds());
        this.map.setMaxBounds(polygon.getBounds());
        this.map.options.minZoom = this.map.getZoom();
        console.log("entered");
      })
    }  
    else {
    }
  }
  
/**
 * Initialize Main Map
 */
  private initMap(): void {
    this.map = (L as any).map('map', {
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
   * Custom Method for displaying the nest drawing controls 
   */
  private drawControl(): void {
    var drawnItems = new (L as any).FeatureGroup();
    var drawControl = new (L as any).Control.Draw({
        edit: {
            featureGroup: drawnItems,
            edit: false,
            remove: false
        },
        draw: {
            circlemarker: true,
            polyline: false,
            circle: false,
            polygon: false,
            rectangle: false,
            marker: false
        },
    });
    this.map.addControl(drawControl);

    /**
     * This event notifies when a new nest is created by the drawControl
     */
    this.map.on('draw:created', (e) => {
      var type = e.layerType,
          layer = e.layer;

      this.map.addLayer(layer); 

      //Retrieve lat and lng
      var lat = layer._latlng.lat;
      var lon = layer._latlng.lng;

      //Add new nest to DB
      this.http.post(this.nests, {
        "serviceArea": this.areaSelected,
        "name": "name",
        "coordinates": [
            lon,
            lat
          ],
        "vehicles": 0 //The new nest is initialized to have 0 vehicles
      }).subscribe(res => {
          this.map.off();
          this.map.remove();
          this.initialize();
      }) 
   });
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
        currNest.addEventListener("click", ()=> {
          this.openDialog(DialogNestsComponent, c.vehicles, c);
        })
      }
    });
  }

  /**
   * Internal method used by the nest's event listener. This opens the nest-dialog to edit or delete nests.
   * @param vehicles 
   */
  private openDialog(dialog, vehicles, nest){
    let dialogRef = this.dialog.open(dialog, {
      data: {vehicles: vehicles},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === -1){
        this.http.delete(this.nests + "/" + nest.id).subscribe(res => {
          this.map.off();
          this.map.remove();
          this.initialize();
        });
      }
      else{
        this.http.put(this.nests + "/" + nest.id, {
          "serviceArea": this.areaSelected,
          "name": "name",
          "coordinates": [
            nest.coordinates[0],
            nest.coordinates[1]
            ],
          "vehicles": result //The new nest is initialized to have 0 vehicles
        }).subscribe(res => {
          this.map.off();
          this.map.remove();
          this.initialize();
        })
      }
    })
  }
}
