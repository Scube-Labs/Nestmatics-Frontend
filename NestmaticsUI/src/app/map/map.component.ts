import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import { CalendarComponent } from '../calendar/calendar.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogNestsComponent } from '../dialog-nests/dialog-nests.component';
import { environment } from '../../environments/environment';
import * as _moment from 'moment';
import { EventEmitterService } from '../event-emitter.service'

const moment = _moment;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})

export class MapComponent implements AfterViewInit {
  toolOpened = true; //Variable used for opening and closing the toolbar
  private map; //Main map 

  mapNestList = new Array<any>();
  nestList = new Array<any>();
  nestConfigList = new Array<any>();

  vehicle_qty :string;

  //calendarComponent: CalendarComponent = new CalendarComponent();
  //private areaSelected = CalendarComponent.getAreaSelected(); // Variable to obtain service area selected

  private areaSelected = localStorage.getItem('currAreaName');
  areas: string = environment.baseURL + '/nestmatics/areas' //Service Area Data End-point
  nests: string = environment.baseURL + '/nestmatics/nests' //Nest Data End-Point
  
  constructor(
      private http: HttpClient,
      public dialog: MatDialog, 
      private eventEmitterService: EventEmitterService) { }


  ngOnInit(){
    if(this.eventEmitterService.subsVar == undefined){
      this.eventEmitterService.subsVar = this.eventEmitterService.invokeRefresh.
      subscribe((date:string)=> {
        this.refresh()
      });
    }
  }

  ngAfterViewInit(): void {
    this.initialize();
  }

  /**
   * Main initialization function.
   * Initializes all the necessary components in the specified order.
   */
  private initialize() {

    this.initMap();
    this.restrict();
    this.initTiles();
    this.loadNests();
    this.drawControl();
  
  }

  refresh(){
    console.log(localStorage.getItem('currDate'))
    this.map.off();
    this.map.remove();
    this.initialize();
  }

  /**
   * Restrict the map view to only the selected Service Area
   */
  private restrict(): void{
    if(!(this.areaSelected == undefined || this.areaSelected == "Unnamed")) {
      console.log(localStorage.getItem('currAreaID'))
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
      console.log(localStorage.getItem('did not restrict'))
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
        console.log(res);
        this.http.post(this.nests + "/nestconfig", {
          "nest": res.ok._id,
          "start_date":  localStorage.getItem('currDate'),
          "end_date":  localStorage.getItem('currDate'),
          "vehicle_qty": 0,
        }).subscribe((done: any) => {
          console.log(done);
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
   // console.log(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID') + "/date/" + localStorage.getItem('currDate'));
    this.http.get(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID') + "/date/" + localStorage.getItem('currDate')).subscribe((res: any) => {
    //  console.log(res.ok);
      if (res.ok){
        for (const c of res.ok) {

          this.nestList.push(c);
          
          const lat = c.coords.lat;
          const lon = c.coords.lon;
          
          var currNest = (L as any).circle([lat, lon], c.nest_radius).addTo(this.map);
          this.mapNestList.push(currNest);
          
          currNest.bindTooltip(
            "Name: " + c.nest_name
          );
          currNest.addEventListener("click", ()=> {
            this.openDialog(DialogNestsComponent, c.vehicle_qty, c);
          })
        }
      }
    },
    (error) => {
      console.log(error.error.Error);
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
      data: {vehicles: vehicles, name: nest.nest_name},
      disableClose: false
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
      else if(result == -2){
        // do nothing
      }
      //Update the nest name
      else{
          //FIX
          this.http.put(this.nests + "/nest/" + nest._id , {
            "nest_name": result
          }).subscribe(res => {
            this.map.off();
            this.map.remove();
            this.initialize();
          });
        

        // this.http.get(this.nests + "/nestconfig/nest/" + nest._id).subscribe((res: any) => {
        //   //FIX
        //   this.http.put(this.nests + "/nestconfig/" + res.ok[0]._id , {
        //     "vehicle_qty": result
        //   }).subscribe(res => {
        //     this.map.off();
        //     this.map.remove();
        //     this.initialize();
        //   })
        // });
        
      }
    })
  }

  addVehicles(qty:string) {
    if (!this.vehicle_qty) {
       return;
    }
    this.vehicle_qty = qty;
  }
}
