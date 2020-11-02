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
  private data = [{lat:18.2013, lng:-67.1452, time:150, dir:320 }];
  
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
      zoom: 9
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

  private drawControl(): void {
    var drawnItems = new (L as any).FeatureGroup();
    this.map.addLayer(drawnItems);
    var drawControl = new (L as any).Control.Draw({
        edit: {
            featureGroup: drawnItems
        },
        draw: {
            circlemarker: false
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
   });
  }

  private loadNests(): void {
    
    this.http.get(this.restNests).subscribe((res: any) => {
      for (const c of res[0].features) {
        const lat = c.geometry.coordinates[0];
        const lon = c.geometry.coordinates[1];
        (L as any).circle([lon, lat], 20).addTo(this.map);
      }
    });
  }

  private playback(): void {

    const trackplayback = (L as any).trackplayback(this.data, this.map);
    console.log(this.data);
    const trackplaybackControl = (L as any).trackplaybackcontrol(trackplayback);

    trackplaybackControl.addTo(this.map);
  }
}
