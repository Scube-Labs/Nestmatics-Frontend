import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet.heat/dist/leaflet-heat.js'
import { DialogExperimentListComponent } from '../dialog-experiment-list/dialog-experiment-list.component';
import { DialogExperimentComponent } from '../dialog-experiment/dialog-experiment.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { DialogCreateExperimentComponent } from '../dialog-create-experiment/dialog-create-experiment.component';
import { ToastrService } from 'ngx-toastr';
import { DialogWarnDeleteComponent } from '../dialog-warn-delete/dialog-warn-delete.component';

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

  // rides: string = 'http://localhost:3000/rides'
  // exp: string = 'http://localhost:3000/experiments';

  exp: string = environment.baseURL + '/nestmatics/experiment' //Route for experiments End-point
  areas: string = environment.baseURL + '/nestmatics/areas' //Service Area Data End-point
  nests: string = environment.baseURL + '/nestmatics/nests' //Nest Data End-Point
  
  experimentsList: string[] = [];
  experimentIDs: string[] = [];
  nestsList: string[] = [];
  nestsIDs: string[] = [];
  
  constructor(private http: HttpClient,
    public dialog: MatDialog,
    private toastr: ToastrService) { }

  ngAfterViewInit(): void {
    this.initialize();
  }

  public initialize() {
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
        this.nestsList.push(c.nest_name);
        this.nestsIDs.push(c._id);
        const lat = c.coords.lat;
        const lon = c.coords.lon;
        var currNest = (L as any).circle([lat, lon], c.nest_radius).addTo(this.map);
        currNest.bindTooltip(
          "Name: " + c.nest_name,
        );
        currNest.addEventListener("click", ()=> {
          this.openDialog(DialogExperimentListComponent, c);
        })
      }
    },
    (error) => {
      this.toastr.warning("Unable to load Nests");
    });
  }

  private openDialog(dialog, nest){
    let dialogRef = this.dialog.open(dialog, {
      data: {vehicles: nest.vehicles,
                    id: nest._id,
                    name: nest.name},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === -1){
        //Open experiment creation dialog.
        this.openCreateExperimentDialog(nest._id);
      }

      else if(result === -2){
        //experiment was deleted
        this.experimentsList = [];
        this.experimentIDs = [];
        this.getAllExperiments();
      }

      else if(typeof result != 'undefined'){
        //a valid experiment was selected
        this.openExperimentDialog(result);
      }
    })
  }

  /**
   * This function opens dialog of the Experiment selected by user
   * @param expID 
   */
  public getIDsOfExperiment(exp){
    if(typeof exp._value != 'undefined'){
      this.openExperimentDialog(this.experimentIDs[this.experimentsList.indexOf(exp.selectedOptions.selected[0]._value)])
    }
  }

  public deleteExperiment(exp) {
    let Ref = this.dialog.open(DialogWarnDeleteComponent, {
      data: {item: "experiment"},
      disableClose: true
    });

    Ref.afterClosed().subscribe(result => {
      if(result === -1){
        if(typeof exp._value != 'undefined'){
          this.http.delete(this.exp + "/" + this.experimentIDs[this.experimentsList.indexOf(exp.selectedOptions.selected[0]._value)]).subscribe((res: any) => {
            this.experimentsList = [];
            this.experimentIDs = [];
            this.getAllExperiments();
          })
        }
      }
      else if (result === -2){
        //Do-nothing, this is the closing condition.
      }
   
    });
  }
  


  public openExperimentDialog(expID){
    if(typeof expID != 'undefined'){
      let dialogRef = this.dialog.open(DialogExperimentComponent, {
        data: {id: expID}
      });

      dialogRef.afterClosed().subscribe(result => {
        
      });
    }
  }

  public openCreateExperimentDialog(nest_id: string) {
    if(typeof nest_id != 'undefined'){
      let dialogRef = this.dialog.open(DialogCreateExperimentComponent, {
        data: {id: nest_id}
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result === -1){
          //experiment was created
          this.experimentsList = [];
          this.experimentIDs = [];
          this.getAllExperiments();
        }
      })
    }
  }

  /**
   * Retrieve the list of all the experiments in the selected service area
   */
  private getAllExperiments() {
    this.http.get(this.exp + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID')).subscribe((res: any) => {
      for(var i=0; i<res.ok.length; i++){
        this.experimentsList.push(res.ok[i].name);
        this.experimentIDs.push(res.ok[i]._id);
      }

    },
    (error) => {
      this.toastr.warning(error.error.Error);
    })
  }

  public filterExperiments(name) {
    
    if(typeof name._value != 'undefined'){
      this.experimentsList = [];
      this.experimentIDs = [];
      this.http.get(this.exp + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID')).subscribe((res: any) => {
        console.log(name._value);
        for(var i=0; i<res.ok.length; i++){
          if(res.ok[i].nest_id == this.nestsIDs[this.nestsList.indexOf(name._value)]){
            this.experimentsList.push(res.ok[i].name);
            this.experimentIDs.push(res.ok[i]._id);
          }
        }
      },
      (error) => {
        this.toastr.warning(error.error.Error);
      })
    }
    else{
      this.toastr.info("Please select a nest name before filtering");
    }
  }

  public removeFilter() {
    this.experimentsList = [];
      this.experimentIDs = [];
      this.getAllExperiments();
  }
}
