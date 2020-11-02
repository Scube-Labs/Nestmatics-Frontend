import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet-plugin-trackplayback';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  toolOpened = true;
  private map;
  private data = [{lat:18.208857284769497, lng:-67.1403479576111, time:0},{lat:18.212057410313477, lng:-67.1408522129059, time:40000}];
  
  nests: string = '/assets/map.json';
  restNests: string ='http://localhost:3000/nests'
  
  constructor(private http: HttpClient) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadNests();
    this.initTiles();
    this.drawControl();
    this.playback();
  }

  
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
    minZoom: 15,
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
      console.log(layer._latlng);
      var lat = layer._latlng.lat;
      var lon = layer._latlng.lng;

      // const headers = { 'Content-Type' : 'application/json'};
      this.http.post('http://localhost:3000/nests', {
        "name": "name",
        "coordinates": [
            lon,
            lat
          ]
      }).toPromise() 
   });
  }

  private loadNests(): void {
    
    this.http.get(this.restNests).subscribe((res: any) => {
      for (const c of res) {
        const lat = c.coordinates[0];
        const lon = c.coordinates[1];
        (L as any).circle([lon, lat], 20).addTo(this.map);
      }
    });
  }

  private playback(): void {

    const trackplayback = (L as any).trackplayback(this.data, this.map, {
      trackPointOptions: {
        // whether draw track point
        isDraw: true
      },
      trackLineOptions: {
      // whether draw track line
      isDraw: true
    }});
    console.log(trackplayback);
    trackplayback.start();
  }
}
