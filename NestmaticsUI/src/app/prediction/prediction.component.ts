import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet.heat/dist/leaflet-heat.js'
import { environment } from 'src/environments/environment';
import { EventEmitterService } from '../event-emitter.service'
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.scss']
})
export class PredictionComponent implements AfterViewInit {
  toolOpened = true;
  private map;

  //calendarComponent: CalendarComponent = new CalendarComponent();
  //private areaSelected = CalendarComponent.getAreaSelected(); // Variable to obtain service area selected
  
  private areaSelected = localStorage.getItem('currAreaID');

  areas: string = environment.baseURL+ 'nestmatics/areas' //Service Area Data End-point
  rides: string = environment.baseURL+ 'nestmatics/rides' //Ride Data End-point
  nests: string = environment.baseURL+ 'nestmatics/nests' //Nest Data End-Point
  restPredict: string =environment.baseURL+ 'nestmatics/predictions'
  
  currHeat;
  InProcess = false;
  currentTime;
  
  constructor(private http: HttpClient,
    private eventEmitterService: EventEmitterService, 
    private toastr: ToastrService) { }

  ngOnInit(){
    if(this.eventEmitterService.predictSub == undefined){
      this.eventEmitterService.predictSub = this.eventEmitterService.invokeRefreshPrediction.
      subscribe(()=> {
        this.refresh()
      });
    }
  }

  refresh(){
    console.log(localStorage.getItem('currDate'));
    this.map.off();
    this.map.remove();
    this.initialize();
  }

  ngAfterViewInit(): void {
   this.initialize();
  }

  initialize(){
    this.initMap();
    this.loadNests();
    this.initTiles();
    this.restrict();
    this.predict(1);
  }

  formatLabel(value: number) {
    if (value == 12) {
      return Math.round(value) + "PM";
    }
    else if(value == 24){
      return Math.round(value) - 12 + "AM"
    }
    else if(value > 12){
      return Math.round(value) - 12 + "PM"
    }
    return value + "AM";
  }

  getPrediction(day: number) {
    this.predict(day);
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
  
  private initMap(): void {
    this.map = (L as any).map('prediction', {
      zoomControl: false,
      center: [ 18.2013, -67.1452 ],
      zoom: 15
    });

    new (L as any).Control.Zoom({ position: 'bottomright' }).addTo(this.map);

  }

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
          "Vehicles: " + c.vehicle_qty
        );
      }
    },
    (error) => {
      this.toastr.info(error.error.Error);
    });
  }

  private predict(day : number): void {
    
    this.InProcess = true;

    this.http.get(this.restPredict).subscribe((res: any) => {
      if(typeof this.currHeat != 'undefined'){
        this.map.removeLayer(this.currHeat);
      }
      
      for (const c of res) {
        this.currHeat = (L as any).heatLayer(c[day], {radius: 30}).addTo(this.map);
      }

      this.InProcess = false;
    },
    (error) => {
      this.InProcess = false;
      this.toastr.error("No predictions found or available at the moment");
    });

    
  }
}
