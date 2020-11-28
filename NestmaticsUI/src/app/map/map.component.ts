import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import { CalendarComponent } from '../calendar/calendar.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogNestsComponent } from '../dialog-nests/dialog-nests.component';
import { environment } from '../../environments/environment';
import * as _moment from 'moment';
import { ToastrService } from 'ngx-toastr';

const moment = _moment;

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

  areas: string = environment.baseURL + '/nestmatics/areas' //Service Area Data End-point
  nests: string = environment.baseURL + '/nestmatics/nests' //Nest Data End-Point
  
  constructor(
      private http: HttpClient,
      public dialog: MatDialog,
      private toastr: ToastrService) { }

  ngAfterViewInit(): void {
    this.initialize();
  }

  /**
   * Main initialization function.
   * Initializes all the necesari components in the specified order.
   */
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
        "service_area": localStorage.getItem('currAreaID'),
        "nest_name": "Nest-" + new Date().toISOString(),
        "coords": {
          "lat": lat,
          "lon": lon
        },
        "nest_radius": 30,
        "user": localStorage.getItem('currUserID'),
      }).subscribe((res: any) => {
        this.http.post(this.nests + "/nestconfig", {
          "nest": res.ok._id,
          "start_date":  this.calendarComponent.calComponent.getDateSelected(),
          "end_date":  this.calendarComponent.calComponent.getDateSelected(),
          "vehicle_qty": 0,
        }).subscribe((done: any) => {
          this.map.off();
          this.map.remove();
          this.initialize();
        })

      }) 
   });
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
        currNest.addEventListener("click", ()=> {
          this.openDialog(DialogNestsComponent, c.vehicle_qty, c);
        })
      }
    },
    (error) => {
      this.toastr.warning(error.error.Error);
    });
  }

  /**
   * Internal method used by the nest's event listener. This opens the nest-dialog to edit or delete nests.
   * @param dialog The dialog component to be used for displaying
   * @param vehicles Ammount of vehicles in the nest
   * @param nest Specifies nest reference
   */
  private openDialog(dialog, vehicles, nest){
    let dialogRef = this.dialog.open(dialog, {
      data: {vehicles: vehicles},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      //Delete the nest
      if(result === -1){
        this.http.delete(this.nests + "/nest/" + nest._id).subscribe(res => {
          this.map.off();
          this.map.remove();
          this.initialize();
        });
      }
      //Update the nest
      else{
        this.http.get(this.nests + "/nestconfig/nest/" + nest._id).subscribe((res: any) => {
          //FIX
          this.http.put(this.nests + "/nestconfig/" + res.ok[0]._id , {
            "vehicle_qty": result
          }).subscribe(res => {
            this.map.off();
            this.map.remove();
            this.initialize();
          })
        });
      }
    })
  }
}
