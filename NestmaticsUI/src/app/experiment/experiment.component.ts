import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet.heat/dist/leaflet-heat.js'
import { CalendarComponent } from '../calendar/calendar.component';
import { DialogExperimentListComponent } from '../dialog-experiment-list/dialog-experiment-list.component';
import { DialogExperimentComponent } from '../dialog-experiment/dialog-experiment.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss']
})
export class ExperimentComponent implements AfterViewInit {
  toolOpened = true;
  private map;
  //calendarComponent: CalendarComponent = new CalendarComponent();
 // private areaSelected = CalendarComponent.getAreaSelected();
  private areaSelected = localStorage.getItem('currAreaName');

  rides: string = 'http://localhost:3000/rides'
  exp: string = 'http://localhost:3000/experiments';

  areas: string = environment.baseURL + '/nestmatics/areas' //Service Area Data End-point
  nests: string = environment.baseURL + '/nestmatics/nests' //Nest Data End-Point
  
  experimentsList: string[] = [];
  experimentIDs: string[] = [];
  nestsList: string[][] = [];
  
  constructor(private http: HttpClient,
    public dialog: MatDialog) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadNests();
    this.initTiles();
    this.restrict();
    this.getAllExperiments();
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
    this.map = (L as any).map('experiment', {
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
    this.http.get(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID')).subscribe((res: any) => {
      for (const c of res.ok) {
        const lat = c.coords.lat;
        const lon = c.coords.lon;
        var currNest = (L as any).circle([lat, lon], c.nest_radius).addTo(this.map);
        currNest.bindTooltip(
          "Vehicles: " + c.vehicle_qty
        );
        currNest.addEventListener("click", ()=> {
          this.openDialog(DialogExperimentListComponent, c);
        })
      }
    },
    (error) => {
      console.log("Unable to load Nests");
    });
  }

  private openDialog(dialog, nest){
    console.log(nest);
    let dialogRef = this.dialog.open(dialog, {
      data: {vehicles: nest.vehicles,
                    id: nest._id},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === -1){
        //Create New Experiment
      }
      else if(typeof result != 'undefined'){
        this.openExperimentDialog(result);
      }
    })
  }

  /**
   * This function retrieves the id of the Experiment selected by user
   * @param expID 
   */
  public getIDsOfExperiment(exp){
    if(typeof exp._value != 'undefined'){
      this.openExperimentDialog(this.experimentIDs[this.experimentsList.indexOf(exp.selectedOptions.selected[0]._value)])
    }
  }

  public openExperimentDialog(expID){
    if(typeof expID != 'undefined'){
      let dialogRef = this.dialog.open(DialogExperimentComponent, {
        data: {id: expID}
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result === -1){
          this.http.get(this.exp + "/" + expID + "/report").subscribe((res: any) => {
            console.log(res);
          })
        }
      })
    }
  }

  /**
   * Retrieve the list of all the experiments in the selected service area
   */
  private getAllExperiments() {
    this.http.get(this.exp).subscribe((res: any) => {
      if(res.length == 0) alert("No Experiments have been created yet.")
      for(var i=0; i<res.length; i++){
        this.experimentsList.push(res[i].name);
        this.experimentIDs.push(res[i]._id);
      }
    })
  }
  
  public getFilteredExperiments(nest) {
    this.http.get(this.exp).subscribe((res: any) => {
      if(res.length == 0) alert("No Experiments have been created yet.")
      for(var i=0; i<res.length; i++){
        this.experimentsList.push(res[i].name);
        this.experimentIDs.push(res[i]._id);
      }
    })
  }

  public filterExperiments(nest) {
    console.log(nest);
  }
}
