import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet-plugin-trackplayback';
import { CalendarComponent } from '../calendar/calendar.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
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
    this.restrict();
    this.drawControl();
    this.playback();
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
    this.map = (L as any).map('map', {
      zoomControl: false,
      center: [ 18.2013, -67.1452 ],
      zoom: 15
    });

    new (L as any).Control.Zoom({ position: 'bottomright' }).addTo(this.map);

  }

  private initTiles(): void {
    const tiles = (L as any).tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 14,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
  }

  private drawControl(): void {
    var drawnItems = new (L as any).FeatureGroup();
    var drawControl = new (L as any).Control.Draw({
        edit: {
            featureGroup: drawnItems
        },
        draw: {
            circlemarker: true,
            polyline: false,
            circle: false,
            polygon: false,
            rectangle: false,
            marker: false
        }
    });
    this.map.addControl(drawControl);

    this.map.on('draw:created', (e) => {
      var type = e.layerType,
          layer = e.layer;
      if (type === 'marker') {
          // Do marker specific actions
      }
      // Do whatever else you need to. (save to db; add to map etc)
      this.map.addLayer(layer);
      var lat = layer._latlng.lat;
      var lon = layer._latlng.lng;

      // const headers = { 'Content-Type' : 'application/json'};
      this.http.post(this.nests, {
        "name": "name",
        "coordinates": [
            lon,
            lat
          ]
      }).toPromise() 
   });
  }

  private loadNests(): void {
    
    this.http.get(this.nests).subscribe((res: any) => {
      for (const c of res) {
        const lat = c.coordinates[0];
        const lon = c.coordinates[1];
        (L as any).circle([lon, lat], 20).addTo(this.map);
      }
    });
  }

  private playback(): void {

    this.http.get(this.rides).subscribe((res: any) => {
      const trackplayback = (L as any).trackplayback(res[0].date1, this.map, {
        trackPointOptions: {
          // whether draw track point
          isDraw: true
        },
        trackLineOptions: {
        // whether draw track line
        isDraw: true
      }});
      trackplayback.start();
    });'http://localhost:3000/nests'
    
  }
}
