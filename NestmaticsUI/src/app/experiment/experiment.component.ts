import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet.heat/dist/leaflet-heat.js'
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss']
})
export class ExperimentComponent implements AfterViewInit {
  toolOpened = true;
  private map;
  calendarComponent: CalendarComponent;
  private areaSelected = CalendarComponent.areaSelected;
  areas: string = 'http://localhost:3000/areas'
  rides: string = 'http://localhost:3000/rides'
  nests: string ='http://localhost:3000/nests'
  
  constructor(private http: HttpClient) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadNests();
    this.initTiles();
    //this.drawControl();
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
        (L as any).circle([lon, lat], 20).addTo(this.map);
      }
    });
  }
}
