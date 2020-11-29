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
import { CloseScrollStrategy } from '@angular/cdk/overlay';
import { Observable, forkJoin } from 'rxjs';

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

  newNests = new Array<any>();

  vehicle_qty: number;
  assigned_vehicles: number;
  counter: number;

  newDay = false;
  surpassedAmount = false;
  dropid:string;

  currentDate= localStorage.getItem('currDate');

  //calendarComponent: CalendarComponent = new CalendarComponent();
  //private areaSelected = CalendarComponent.getAreaSelected(); // Variable to obtain service area selected

  private areaSelected = localStorage.getItem('currAreaName');
  areas: string = environment.baseURL + '/nestmatics/areas' //Service Area Data End-point
  nests: string = environment.baseURL + '/nestmatics/nests' //Nest Data End-Point
  drop: string = environment.baseURL + '/nestmatics/drop' // Drop strat end-point

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
    this.getDropStrategyForDate();
    this.drawControl();
    this.currentDate = localStorage.getItem('currDate');
  }

  private reinitialize() {
    this.initMap();
    this.restrict();
    this.initTiles();
    this.reloadNests();
    this.drawControl();
  }

  refresh(){
    console.log(localStorage.getItem('currDate'));
    this.nestList.splice(0, this.nestList.length);
    this.newNests.splice(0, this.newNests.length);
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

      this.mapNestList.push(layer);

      var newNest = {
          "service_area": localStorage.getItem('currAreaID'),
          "nest_name": "Nest-" + new Date().toISOString(),
          "coords": {
            "lat": lat,
            "lon": lon
          },
          "nest_radius": 30,
          "user": localStorage.getItem('currUserID'),
        };
      
      var vehicle_qty = 0;
      
      this.newNests.push(newNest);
      newNest["vehicle_qty"] = 0;
      newNest['new'] = 1;
      this.nestList.push(newNest);
      this.map.off();
      this.map.remove();
      this.reinitialize();

      //Add new nest to DB
      // this.http.post(this.nests, newNest).subscribe((res: any) => {
      //   console.log(res);
      //   newNest["_id"]=res.ok._id

      //   this.http.post(this.nests + "/nestconfig", {
      //     "nest": res.ok._id,
      //     "start_date":  localStorage.getItem('currDate'),
      //     "end_date":  localStorage.getItem('currDate'),
      //     "vehicle_qty": vehicle_qty,
      //   }).subscribe((done: any) => {
      //     newNest["vehicle_qty"] = vehicle_qty;
      //     newNest["configid"] = done.ok._id;

      //     //add nest to list to display
      //     this.nestList.push(newNest);

      //     //add nest to new nest list to insert afterward
      //     this.newNests.push(newNest);

      //     // add nest config id to list to insert later on 
      //     this.newConfigs.push(done.ok._id);

      //     console.log(done);
      //     // this.map.off();
      //     this.map.remove();
      //     this.reinitialize();
      //   })
      // }) 
   });
  }

  public getDropStrategyForDate(){
    this.http.get(this.drop +"/area/"+localStorage.getItem('currAreaID')+"/date/"+localStorage.getItem('currDate')+"/"+localStorage.getItem('currDate')).subscribe((res: any) => {
      //  console.log(res.ok);
        if (res.ok){
          var date = res.ok[0].start_date;
          this.vehicle_qty = res.ok[0].vehicles;
          this.dropid = res.ok[0]._id
          
          var assignedVehicles = 0;
          this.http.get(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID') + "/date/" + date).subscribe((res: any) => {
            //  console.log(res.ok);
              if (res.ok){
                for (const c of res.ok) {
                  c["update"] = 0;
                  this.nestList.push(c);
                 // this.nestConfigList.push(c.configid);
        
                 assignedVehicles += c.vehicle_qty;
        
                  const lat = c.coords.lat;
                  const lon = c.coords.lon;
                  
                  this.addNestsToMap(lat, lon, c)
                }
                this.nestConfigList.splice(0, this.nestConfigList.length);
                this.setAssignedVehicles(assignedVehicles);
              }
            },
            (error) => {
              console.log(error.error.Error);
            });
        }
      },
      (error) => {
        console.log("get empy nests");
        this.newDay = true;
        this.getEmptyDayNests();
        console.log(error.error.Error);
    });
  }

  public getEmptyDayNests(){
    this.http.get(this.nests + "/area/"+localStorage.getItem('currAreaID')+"/user/"+localStorage.getItem('currUserID')).subscribe((res: any) => {
      //  console.log(res.ok);
      console.log(res);  
      if (res.ok){
          var vehicles = 0;
          for (const c of res.ok) {
            c['vehicle_qty'] = 0;
            c["update"] = 0;
            this.nestList.push(c);
  
            const lat = c.coords.lat;
            const lon = c.coords.lon;
            
            this.addNestsToMap(lat, lon, c);
          }
         this.nestConfigList.splice(0, this.nestConfigList.length);
         this.setAssignedVehicles(0);
         console.log(this.nestList);
        }
      },
      (error) => {
        console.log(error.error.Error);
      });
  }

  public reloadNests() {
    // var tempList = this.nestList;
    // this.nestList.splice(0, this.nestList.length);
    if (this.nestList){
      for (const c of this.nestList) {

        const lat = c.coords.lat;
        const lon = c.coords.lon;

        this.mapNestList.splice(0, this.mapNestList.length);
        
        this.addNestsToMap(lat, lon, c);
      }
    }
  }

  /**
   * Draws Nests to the map
   * @param lat 
   * @param lon 
   * @param c 
   */
  private addNestsToMap(lat, lon, c){
    var currNest = (L as any).circle([lat, lon], c.nest_radius).addTo(this.map);
    this.mapNestList.push(currNest);
        
    currNest.bindTooltip(
      "Name: " + c.nest_name,
      "Vehicle_qty: " + c.vehicle_qty
    );
    currNest.addEventListener("click", ()=> {
      this.openDialog(DialogNestsComponent, c.vehicle_qty, c);
    })
  }

  /**
   * Load Nests from DB to Map. Retrieved nest belong to selected Service Area
   */
  private loadNests(): void {
   // console.log(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID') + "/date/" + localStorage.getItem('currDate'));
    this.http.get(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID') + "/date/" + localStorage.getItem('currDate')).subscribe((res: any) => {
    //  console.log(res.ok);
      if (res.ok){
        var vehicles = 0;
        this.newDay = false;
        for (const c of res.ok) {

          c["update"] = 0;
          this.nestList.push(c);
          //this.nestConfigList.push(c.configid);

          vehicles += c.vehicle_qty;

          const lat = c.coords.lat;
          const lon = c.coords.lon;
          
          this.addNestsToMap(lat, lon, c)
        }
       this.setAssignedVehicles(vehicles);
      }
      else {
        console.log('entered else')
      }
    },
    (error) => {
      console.log("get empy nests");
      this.newDay = true;
      this.getEmptyDayNests();
      console.log(error.error.Error);
    });
  }

  removeItemFromNestArray(name:string){
    var index = 0;
    for (const c of this.nestList) { 
      
      if(c.nest_name == name){
        this.nestList.splice(index, 1);
      }
      index++;
    }
  }

  updateLocalConfigVehicles(name:string, vehicle:number){
    for(const c of this.nestList){
      if(c.nest_name == name){
          this.updateAssignedVehicles(vehicle, c.vehicle_qty)
          console.log("changed "+c.nest_name+" with "+c.vehicle_qty+" to "+vehicle);
          c["update"] = 1;
          c.vehicle_qty = vehicle;
          break;
      }
    }
  }

  updateLocalConfigNames(oldName:string, name:string){
    for(const c of this.nestList){
      if(c.nest_name == oldName){
          c.nest_name = name;
          break;
      }
    }
  }

  addNewConfigsToDrop(){
    let observables: Observable<any>[] = [];
    var found = false;
    for(const c of this.nestList){
      if("new" in c){
        found = true;
        this.http.post(this.nests, {
          "service_area": c.service_area,
          "nest_name": c.nest_name,
          "coords": {
            "lat": c.lat,
            "lon": c.lon
          },
          "nest_radius": c.nest_radius,
          "user": c.user,
        }).subscribe((done: any) => {
          var nestid = done.ok._id;
          
          observables.push(this.http.post(this.nests + "/nestconfig", {
            "nest": nestid,
            "start_date":  localStorage.getItem('currDate'),
            "end_date":  localStorage.getItem('currDate'),
            "vehicle_qty": c.vehicle_qty,
          }))
        });
      }
    }
    if(found){
      forkJoin(observables)
      .subscribe(dataArray => {
        for(const c of dataArray){
          this.nestConfigList.push(c.ok._id);
        }
      });
    }
  }


  /**
   * Function to update changes made in the configurations
   */
  editConfigurations(){
    var configs = Array<any>();
    let observables: Observable<any>[] = [];
    this.addNewConfigsToDrop();
    for(const c of this.nestList){
      configs.push(c.configid);
      // if("new" in c){
        
      //   this.http.post(this.nests, {
      //     "service_area": c.service_area,
      //     "nest_name": c.nest_name,
      //     "coords": {
      //       "lat": c.lat,
      //       "lon": c.lon
      //     },
      //     "nest_radius": c.nest_radius,
      //     "user": c.user,
      //   } ).subscribe((done: any) => {
      //     var nestid = done.ok._id;
          
      //     observables.push(this.http.post(this.nests + "/nestconfig", {
      //       "nest": nestid,
      //       "start_date":  localStorage.getItem('currDate'),
      //       "end_date":  localStorage.getItem('currDate'),
      //       "vehicle_qty": c.vehicle_qty,
      //     }))

      //     this.http.post(this.nests + "/nestconfig", {
      //       "nest": nestid,
      //       "start_date":  localStorage.getItem('currDate'),
      //       "end_date":  localStorage.getItem('currDate'),
      //       "vehicle_qty": c.vehicle_qty,
      //     }).subscribe((result: any) => {
      //       c["_id"] = nestid;
      //       c["configid"] = result.ok._id;
      //       c["update"] = 0;
      //     });
      //   });
      // }
      if("update" in c && c.update == 1){

        this.http.put(this.nests + "/nestconfig/" + c.configid , {
          "vehicle_qty": parseInt(c.vehicle_qty)
        }).subscribe(res => {
          console.log("edited configuration")
        });
      }
    }
    console.log("editing drop strategy")
    this.editDropStrategy(configs);
  }

  public editDropStrategy(configs){
    this.http.put(this.drop + "/"+this.dropid+"/day/0" , {
      configs
    }).subscribe(res => {
      console.log("edited drop strategy")
      this.map.off();
      this.map.remove();
      this.initialize();
    });
  }

  public insertDropStrategyToDB(){
    this.http.post(this.drop,
      {
        "days": [
          {
            "configurations": this.nestConfigList, 
            "date": localStorage.getItem('currDate')
          }
        ],
        "user":localStorage.getItem('currUserID'), 
        "vehicles": this.vehicle_qty,
        "end_date": localStorage.getItem('currDate'), 
        "service_area": localStorage.getItem('currAreaID'), 
        "start_date": localStorage.getItem('currDate')
    }).subscribe((res: any) => {
      console.log("added new drop strategy")
      this.map.off();
      this.map.remove();
      this.initialize();
    });
  }


  public insertNestConfigs(){
    console.log("attempting to insert nests ");

    let observables: Observable<any>[] = [];

    for(var c of this.nestList){
      if("new" in c){
        this.http.post(this.nests, {
          "service_area": c.service_area,
          "nest_name": c.nest_name,
          "coords": {
            "lat": c.lat,
            "lon": c.lon
          },
          "nest_radius": c.nest_radius,
          "user": c.user,
        }).subscribe((done: any) => {
          observables.push( this.http.post(this.nests + "/nestconfig", {
            "nest": done.ok._id,
            "start_date":  localStorage.getItem('currDate'),
            "end_date":  localStorage.getItem('currDate'),
            "vehicle_qty": c.vehicle_qty,
          }));

          // var nestid = done.ok._id;
          // this.http.post(this.nests + "/nestconfig", {
          //   "nest": nestid,
          //   "start_date":  localStorage.getItem('currDate'),
          //   "end_date":  localStorage.getItem('currDate'),
          //   "vehicle_qty": c.vehicle_qty,
          // }).subscribe((result: any) => {
          //   c["_id"] = nestid;
          //   c["configid"] = result.ok._id;
          //   c["update"] = 0;
          //   this.nestConfigList.push(result.ok._id);
          // });
        });
    }else{
      observables.push(this.http.post(this.nests + "/nestconfig", {
        "nest": c._id,
        "start_date":  localStorage.getItem('currDate'),
        "end_date":  localStorage.getItem('currDate'),
        "vehicle_qty": c.vehicle_qty,
      }));
      
      // console.log("posting new config");
      // this.http.post(this.nests + "/nestconfig", {
      //   "nest": c._id,
      //   "start_date":  localStorage.getItem('currDate'),
      //   "end_date":  localStorage.getItem('currDate'),
      //   "vehicle_qty": c.vehicle_qty,
      // }).subscribe((done: any) => {
      //   console.log("added new config");
      //   this.nestConfigList.push(done.ok._id);
      // });
    }
  }
  forkJoin(observables)
      .subscribe(dataArray => {
          console.log(dataArray);
          for(const c of dataArray){
              this.nestConfigList.push(c.ok._id);
          }
          console.log("insert drop");
          this.insertDropStrategyToDB();
      });
  }

  updateAssignedVehicles(newNumber:number, oldNumber:number){
    this.assigned_vehicles -= oldNumber;
    this.assigned_vehicles += newNumber;
    if(this.assigned_vehicles > this.vehicle_qty){
      this.surpassedAmount = true;
      this.assigned_vehicles -= newNumber;
    }
    else{
      this.surpassedAmount = false;
    }
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

    var oldName = nest.nest_name;
    var oldVehicleqty = vehicles;
    console.log(nest);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {
          //Delete the nest
        if(result === -1){
          this.removeItemFromNestArray(oldName);
          this.map.off();
          this.map.remove();
          this.reinitialize();
          // this.http.delete(this.nests + "/nest/" + nest._id).subscribe(res => {
          //   this.map.off();
          //   this.map.remove();
          //   this.initialize();
          // });
        }
        else if(result == -2){
          // do nothing
        }
        //Update the nest name
        else{
            if(result.name !== "" && result.vehicles !== ""){
              this.http.put(this.nests + "/nest/" + nest._id , {
                "nest_name": result.name
              }).subscribe(res => {
                this.updateLocalConfigVehicles(oldName, parseInt(result.vehicles));
                this.updateLocalConfigNames(oldName, result.name);
                this.map.off();
                this.map.remove();
                this.reinitialize();

                // if (this.newDay){
                //   this.updateLocalConfigVehicles(nest.nest_name, result.vehicles);
                // }

                // else{
                //   this.http.put(this.nests + "/nestconfig/" + nest.configid , {
                //     "vehicle_qty": parseInt(result.vehicles)
                //   }).subscribe(res => {
                //     this.updateAssignedVehicles(parseInt(result.vehicles),oldVehicleqty);
                //     this.map.off();
                //     this.map.remove();
                //     this.initialize();
                //   });
                // }
                
              });
            }
            else if (result.name !== "" || result.vehicles !== ""){
                // //FiX with ROUTE, need nest config id
              if(result.vehicles !== ""){
                this.updateLocalConfigVehicles(oldName, parseInt(result.vehicles));
                this.map.off();
                this.map.remove();
                this.reinitialize();
                  // if (this.newDay){
                  //   this.updateLocalConfigVehicles(nest._id, result.vehicles);
                  // }
                  // else{
                  //   this.http.put(this.nests + "/nestconfig/" + nest.configid , {
                  //     "vehicle_qty": parseInt(result.vehicles)
                  //   }).subscribe(res => {
                  //     this.updateAssignedVehicles(parseInt(result.vehicles),oldVehicleqty);
                  //     this.updateLocalConfigVehicles(nest.nest_name, result.vehicles);
                  //     this.map.off();
                  //     this.map.remove();
                  //     this.reinitialize();
                  //   });
                  // }
                }
                else if (result.name !== ""){
                  this.http.put(this.nests + "/nest/" + nest._id , {
                    "nest_name": result.name
                  }).subscribe(res => {
                    this.updateLocalConfigNames(nest.nest_name, result.name);
                    this.map.off();
                    this.map.remove();
                    this.reinitialize();
                  });
              }
            }
          
        }
      }
      
    })
  }

  setVehicles(qty) {
    
    this.vehicle_qty = parseInt(qty);
  }

  setAssignedVehicles(qty){
    this.assigned_vehicles = parseInt(qty);
  }
}
