import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { DialogNestsComponent } from '../dialog-nests/dialog-nests.component';
import { environment } from '../../environments/environment';
import * as _moment from 'moment';
import { EventEmitterService } from '../event-emitter.service';
import { Observable, forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from '../spinner.service';

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
  old_vehicle_qty:number;
  assigned_vehicles: number;
  counter: number;

  dropName:string;
  old_dropName:string;

  newDay = false;
  surpassedAmount = false;
  dropid:string;

  currentDate= localStorage.getItem('currDate');

  private areaSelected = localStorage.getItem('currAreaName');
  areas: string = environment.baseURL + '/nestmatics/areas' //Service Area Data End-point
  nests: string = environment.baseURL + '/nestmatics/nests' //Nest Data End-Point
  drop: string = environment.baseURL + '/nestmatics/drop' // Drop strat end-point

  constructor(
      private http: HttpClient,
      public dialog: MatDialog, 
      private eventEmitterService: EventEmitterService,
      private toastr: ToastrService,
      private spinner: SpinnerService) { 

        this.eventEmitterService.subsVar = this.eventEmitterService.invokeRefreshMap.
        subscribe(()=> {
        this.refresh()
      });
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

  /**
   * Reinitializing map with local changes to drop strategy
   */
  private reinitialize() {
    this.initMap();
    this.restrict();
    this.initTiles();
    this.reloadNests();
    this.drawControl();
  }

  /**
   * Refresh map when changing dates
   */
  refresh(){
    console.log(localStorage.getItem('currDate'));
    this.setAssignedVehicles(0)
    this.setName("")
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
     this.toastr.error("Unable to restrict area")
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

   });
  }

  public getDropStrategyForDate(){
    this.http.get(this.drop +"/area/"+localStorage.getItem('currAreaID')+"/date/"+localStorage.getItem('currDate')+"/"+localStorage.getItem('currDate')).subscribe((res: any) => {
        console.log(res.ok);
        if (res.ok){
          var date = res.ok[0].start_date;
          
          this.setVehicles(res.ok[0].vehicles)
          
          this.old_vehicle_qty = res.ok[0].vehicles;
          
          this.setName(res.ok[0].name);
         
          this.old_dropName = res.ok[0].name;

          this.dropid = res.ok[0]._id
          this.newDay = false;
          
          var assignedVehicles = 0;
          this.http.get(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID') + "/date/" + date).subscribe((res: any) => {
              if (res.ok){
                for (const c of res.ok) {
                  c["update"] = 0;
                  this.nestList.push(c);
        
                 assignedVehicles += c.vehicle_qty;
        
                  const lat = c.coords.lat;
                  const lon = c.coords.lon;
                  
                  this.addNestsToMap(lat, lon, c)
                }
                this.nestConfigList.splice(0, this.nestConfigList.length);
                this.setAssignedVehicles(assignedVehicles);
                this.toastr.clear();
                this.toastr.success("Drop Strategy found for this day.");
                this.toastr.info("If editing the drop strategy, remember to click on the button to edit it!");
              }
            },
            (error) => {
              console.log(error.error.Error);
            });
        }
      },
      (error) => {
        this.toastr.info("This day has no drop strategy. Create a New one and remember to save it!");
        this.newDay = true;
        this.getEmptyDayNests();
        console.log(error.error.Error);
    });
  }

  public getEmptyDayNests(){
    this.http.get(this.nests + "/area/"+localStorage.getItem('currAreaID')+"/user/"+localStorage.getItem('currUserID')).subscribe((res: any) => {
  
      console.log(res);  
      if (res.ok){
          var vehicles = 0;
          for (const c of res.ok) {
            c['vehicle_qty'] = 0;
            c["update"] = 0;
            this.nestList.push(c);
            
            this.newDay = true;
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
   
    this.http.get(this.nests + "/area/" + localStorage.getItem('currAreaID') + "/user/" + localStorage.getItem('currUserID') + "/date/" + localStorage.getItem('currDate')).subscribe((res: any) => {
      if (res.ok){
        var vehicles = 0;
        this.newDay = false;
        for (const c of res.ok) {

          c["update"] = 0;
          this.nestList.push(c);

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
      this.toastr.warning(error.error.Error);
      this.getEmptyDayNests();
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
          this.updateAssignedVehicles(vehicle, c.vehicle_qty);
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
    var spinnerRef = this.spinner.start();
    
    var found = false;
    for(const c of this.nestList){
      if("new" in c){
        found = true;
        console.log("found new")
        this.http.post(this.nests, {
          "service_area": c.service_area,
          "nest_name": c.nest_name,
          "coords": {
            "lat": c.coords.lat,
            "lon": c.coords.lon
          },
          "nest_radius": c.nest_radius,
          "user": c.user
        }).subscribe((done: any) => {
          if(done.ok){
            var nestid = done.ok._id;
            console.log("nest_name"+ nestid)
            this.http.post(this.nests + "/nestconfig", {
              "nest": nestid,
              "start_date":  localStorage.getItem('currDate'),
              "end_date":  localStorage.getItem('currDate'),
              "vehicle_qty": c.vehicle_qty,
            }).subscribe((done:any)=>{
              this.nestConfigList.push(done.ok._id);

            })
          }},
          (error)=>{
              this.toastr.error("there is already a nest with this configuration")
          }
        );
      }
    }

    setTimeout( ()=>{ 
      this.editConfigurations(spinnerRef);
      //this.spinner.stop(spinnerRef);

    }, 3000)
  }

  /**
   * Function to update changes made in the configurations
   */
  editConfigurations(spinerRef){
    var configs = Array<any>();
      for(const c of this.nestList){
        configs.push(c.configid)
        
        if("update" in c && c.update == 1){
          this.http.put(this.nests + "/nestconfig/" + c.configid , {
            "vehicle_qty": parseInt(c.vehicle_qty)
          })
        }
      }
      configs.push(...this.nestConfigList);
      this.editDropStrategy(configs, spinerRef);
      this.spinner.stop(spinerRef);
  }

  public editDropStrategy(configs, spinerRef){
    var name = this.dropName;
    var vehicles = this.vehicle_qty;
    var vchange = false;
    var nchange = false;
    let observables: Observable<any>[] = [];
    if(this.old_vehicle_qty != this.vehicle_qty){
      vchange = true;
      observables.push(this.http.put(this.drop + "/"+this.dropid+"/vehicles" , {
        "vehicles":vehicles
      }))
    }
    if(this.old_dropName != this.dropName){
      nchange = true;
      observables.push(this.http.put(this.drop + "/"+this.dropid+"/name" , {
        "name":name
      }))
    }
    this.http.put(this.drop + "/"+this.dropid+"/day/0" , {
      configs
    }).subscribe(res => {
      if(vchange || nchange){
        forkJoin(observables)
          .subscribe(dataArray => {
            this.toastr.success("Successfully edited the selected Drop Strategy");
            this.refresh();
      });
      }else{
        this.toastr.success("Successfully edited the selected Drop Strategy");
        this.refresh();
        this.spinner.stop(spinerRef);
      }
    });
  }

  public insertDropStrategyToDB(){
    this.http.post(this.drop,
      {
        "days": [
          {
            "configurations": [ this.nestConfigList ], 
            "date": localStorage.getItem('currDate')
          }
        ],
        "user":localStorage.getItem('currUserID'), 
        "vehicles": this.vehicle_qty,
        "name": this.dropName,
        "end_date": localStorage.getItem('currDate'), 
        "service_area": localStorage.getItem('currAreaID'), 
        "start_date": localStorage.getItem('currDate')
    }).subscribe((res: any) => {
      this.toastr.success("Successfully uploaded new Drop Strategy");
      this.refresh();
    });
  }


  public insertNestConfigs(){
    console.log("attempting to insert nests ");

    var spinnerservice = this.spinner.start();

    let observables: Observable<any>[] = [];

    for(var c of this.nestList){
      if("new" in c){
        this.http.post(this.nests, {
          "service_area": c.service_area,
          "nest_name": c.nest_name,
          "coords": {
            "lat": c.coords.lat,
            "lon": c.coords.lon
          },
          "nest_radius": c.nest_radius,
          "user": c.user,
        }).subscribe((done: any) => {
          this.http.post(this.nests + "/nestconfig", {
            "nest": done.ok._id,
            "start_date":  localStorage.getItem('currDate'),
            "end_date":  localStorage.getItem('currDate'),
            "vehicle_qty": c.vehicle_qty,
          }).subscribe((done:any)=>{
            this.nestConfigList.push(done.ok._id);
          });
        });
    } else{
      this.http.post(this.nests + "/nestconfig", {
        "nest": c._id,
        "start_date":  localStorage.getItem('currDate'),
        "end_date":  localStorage.getItem('currDate'),
        "vehicle_qty": c.vehicle_qty,
      }).subscribe((done:any)=>{
        this.nestConfigList.push(done.ok._id);
      });
    }
  }
  
  setTimeout( ()=>{ 
    this.insertDropStrategyToDB()
    this.spinner.stop(spinnerservice);
  }, 3000)
    
  //this.spinner.stop(spinnerservice);

  // setTimeout( function(){
  //   forkJoin(observables)
  //     .subscribe(dataArray => {
  //         console.log(dataArray);
  //         for(const c of dataArray){
  //             this.nestConfigList.push(c.ok._id);
  //         }
  //         console.log("insert drop");
  //         this.insertDropStrategyToDB();
  //     });

  // }, 3000)
  }

  updateAssignedVehicles(newNumber:number, oldNumber:number){
    this.assigned_vehicles = this.assigned_vehicles - oldNumber;
    this.assigned_vehicles = this.assigned_vehicles + newNumber;
    if(this.assigned_vehicles > this.vehicle_qty){
      this.surpassedAmount = true;
      this.assigned_vehicles = this.assigned_vehicles - newNumber;
      this.toastr.info("You have surpassed the quantity of vehicles to deploy on the day");
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
      disableClose: true
    });

    var oldName = nest.nest_name;
    var oldVehicleqty = vehicles;
    console.log(nest);
    
    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {
          //Delete the nest config 
        if(result === -1){
          this.removeItemFromNestArray(oldName);
          this.map.off();
          this.map.remove();
          this.reinitialize();
        }
        else if(result == -2){
          // do nothing
        }

        // delete the nest from db
        else if(result == -3){
          if('new' in nest && nest['new'] == 1){
            this.removeItemFromNestArray(oldName)
          }
          else{
            this.http.delete(this.nests + "/nest/" + nest._id).subscribe(res => {
              this.removeItemFromNestArray(oldName)
              this.map.off();
              this.map.remove();
              this.reinitialize();
              
            });
          }
        }
        //Update the nest name or vehicle qty
        else{
            if('new' in nest && nest['new'] == 1){
              if(result.vehicles !== ""){
                this.updateLocalConfigVehicles(oldName, parseInt(result.vehicles));
              }
              if (result.name !== ""){
                this.updateLocalConfigNames(oldName, result.name);
              }
              this.map.off();
              this.map.remove();
              this.reinitialize();
            }
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
                  
                });
              }
              else if (result.name !== "" || result.vehicles !== ""){
                  
                if(result.vehicles !== ""){
                  this.updateLocalConfigVehicles(oldName, parseInt(result.vehicles));
                  this.map.off();
                  this.map.remove();
                  this.reinitialize();
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
      }
      
    })
  }

  setVehicles(qty) {
    this.vehicle_qty = parseInt(qty);
  }

  setName(name){
    this.dropName = name;
  }

  setAssignedVehicles(qty){
    this.assigned_vehicles = parseInt(qty);
  }
}
