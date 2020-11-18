import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet.heat/dist/leaflet-heat.js'
import { CalendarComponent } from '../calendar/calendar.component';
import { DialogExperimentListComponent } from '../dialog-experiment-list/dialog-experiment-list.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss']
})
export class ExperimentComponent implements AfterViewInit {
  toolOpened = true;
  private map;
  calendarComponent: CalendarComponent = new CalendarComponent();
  private areaSelected = CalendarComponent.getAreaSelected();
  areas: string = 'http://localhost:3000/areas'
  rides: string = 'http://localhost:3000/rides'
  nests: string = 'http://localhost:3000/nests'
  
  constructor(private http: HttpClient,
    public dialog: MatDialog) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadNests();
    this.initTiles();
    this.restrict();
  }

  private restrict(): void{
    this.http.get(this.areas + "?name=" + this.areaSelected).subscribe((res: any) => {
      var polygon = L.polygon(res[0].coordinates);
      this.map.fitBounds(polygon.getBounds());
      this.map.setMaxBounds(polygon.getBounds());
      this.map.options.minZoom = this.map.getZoom();
    }
  )}  

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
          this.openDialog(DialogExperimentListComponent, c.vehicles, c);
        })
      }
    });
  }

  private openDialog(dialog, vehicles, nest){
    let dialogRef = this.dialog.open(dialog, {
      data: {vehicles: vehicles,
                    id: nest.id},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === -1){
        this.http.delete(this.nests + "/" + nest.id).subscribe(res => {
          this.map.off();
          this.map.remove();
        });
      }
      else{
      }
    })
  }
}
