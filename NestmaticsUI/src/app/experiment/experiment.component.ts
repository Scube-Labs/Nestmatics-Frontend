import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { HttpClient } from '@angular/common/http';
import 'leaflet.heat/dist/leaflet-heat.js'

@Component({
  selector: 'app-experiment',
  templateUrl: './experiment.component.html',
  styleUrls: ['./experiment.component.scss']
})
export class ExperimentComponent implements AfterViewInit {
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
    //this.drawControl();
    this.restrict();
    this.predict();
  }

  private restrict(): void{
    var polygon = L.polygon([
      [18.183610921675665, -67.17015266418457],
      [18.183610921675665, -67.11831092834473],
      [18.227965441672286, -67.11831092834473],
      [18.227965441672286,-67.17015266418457]
  ]);

    this.map.fitBounds(polygon.getBounds());
    this.map.setMaxBounds(polygon.getBounds());
    this.map.options.minZoom = this.map.getZoom();
    
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
    minZoom: 14,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
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

  private predict(): void {
    var heat = (L as any).heatLayer([
      [18.208857284769497, -67.1403479576111, 5], // lat, lng, intensity
      [18.2097745242172, -67.1413564682007, 5],
      [18.209998737569695, -67.14003682136537, 5],
      [18.212057410313477, -67.1408522129059, 5],
      [18.214584856440485, -67.14109897613527, 5],
      [18.211150374331343, -67.1447253227234, 5],
      [18.206054578751242, -67.14481115341188, 5],
      [18.205626525135333, -67.1451759338379, 5],
    ], {radius: 35}).addTo(this.map);
  }
}
