import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import { CalendarComponent } from '../calendar/calendar.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogNestsComponent } from '../dialog-nests/dialog-nests.component';

@Component({
  selector: 'app-service-area',
  templateUrl: './service-area.component.html',
  styleUrls: ['./service-area.component.scss']
})
export class ServiceAreaComponent implements AfterViewInit {
  toolOpened = true; //Variable used for opening and closing the toolbar
  private map; //Main map

  calendarComponent: CalendarComponent;
  private areaSelected = CalendarComponent.areaSelected; // Variable to obtain service area selected

  areas: string = 'http://localhost:3000/areas' //Service Area Data End-point
  rides: string = 'http://localhost:3000/rides' //Ride Data End-point
  nests: string ='http://localhost:3000/nests' //Nest Data End-Point

  maxArea: any = [[18.183610921675665,-67.17015266418457],[18.183610921675665,-67.11831092834473],[18.227965441672286,-67.11831092834473],[18.227965441672286,-67.17015266418457]]
  currArea = {};

  constructor(
      private http: HttpClient,
      public dialog: MatDialog) { }

  ngAfterViewInit(): void {
    this.initialize();
  }

  private initialize() {

    this.initMap();
    this.initTiles();
    this.loadAreas();
    this.drawControl();

  }

/**
 * Initialize Main Map
 */
  private initMap(): void {
    this.map = (L as any).map('service', {
      zoomControl: false,
      center: [ 18.2208, -66.5901 ],
      zoom: 9
    });
    this.map.doubleClickZoom.disable(); //Disable double click zoom. Conflicts with bounds.

    new (L as any).Control.Zoom({ position: 'bottomright' }).addTo(this.map); //Zoom control to be on the bottom right

    /**
     * This event listener checks for a map click. The map will be bounded to the maximum size of the region to be drawn.
     * Area drawing is only enable when bounded.
     */
    this.map.addEventListener("dblclick", (e)=> {
      var circle = L.circle([e.latlng.lat, e.latlng.lng], 2000).addTo(this.map); //Intermediate Circle to create the Area Bounds
      var rectangle = new L.Rectangle(circle.getBounds(), {color: 'red', fillColor: '#ffffff', fillOpacity: 0.5}); // Create Area Bounds.
      this.map.removeLayer(circle);

      if(this.currArea != undefined){
        this.map.removeLayer(this.currArea);
      }

      this.currArea = rectangle.addTo(this.map)

      this.map.fitBounds(rectangle.getBounds());

    /**
     * This event notifies when a new area is created by the drawControl
     */
    this.map.on('draw:created', (e) => {
      var type = e.layerType,
      layer = e.layer;
      var valid = true;
      
      for(var i=0; i<layer._latlngs[0].length; i++){
        console.log(rectangle.toGeoJSON().geometry.coordinates[0]);
        if(!isMarkerInsidePolygon(layer._latlngs[0][i], rectangle.toGeoJSON().geometry.coordinates[0])){
          valid = false;
        }
       }
       if(valid){
        this.http.post(this.areas, {
          "name": "Unknown",
          "coordinates": layer._latlngs[0]
        }).subscribe(res => {
            this.map.off();
            this.map.remove();
            this.initialize();
        }) 
       }
      //console.log(rectangle.toGeoJSON().geometry.coordinates);
      //console.log(isMarkerInsidePolygon(layer._latlngs[0][0], rectangle.toGeoJSON().geometry.coordinates[0]));
    });

    })
    function isMarkerInsidePolygon(point, poly) {
      var polyPoints = poly;
      var x = point.lat, y = point.lng;
      console.log("PolyPoints: " + polyPoints);
      console.log("x: " + x);
      console.log("y: " + y);

      var inside = false;
      for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
          var xi = polyPoints[i][1], yi = polyPoints[i][0];
          var xj = polyPoints[j][1], yj = polyPoints[j][0];

          var intersect = ((yi > y) != (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

          if (intersect) inside = !inside;
      }

      return inside;
    };
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
            circlemarker: false,
            polyline: false,
            circle: false,
            polygon: false,
            rectangle: true,
            marker: false
        },
    });
    this.map.addControl(drawControl);
  }

  /**
   * Load Nests from DB to Map. Retrieved nest belong to selected Service Area
   */
  private loadAreas(): void {
    this.http.get(this.areas).subscribe((res: any) => {
      for (const c of res) {
        var currArea = L.polygon(c.coordinates);
        currArea.bindTooltip(c.name);
        currArea.addTo(this.map);

        currArea.addEventListener("click", ()=> {
          this.openDialog(c.name, c);
        })
      }
    });
  }

  /**
   * Internal method used by the nest's event listener. This opens the nest-dialog to edit or delete nests.
   * @param vehicles
   */
  private openDialog(vehicles, area){
    let dialogRef = this.dialog.open(DialogNestsComponent, {
      data: {vehicles: vehicles},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    })
  }
}
