import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
import { Draw } from 'leaflet-draw';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {
  toolOpened = true;
  private map;
  

  constructor() { }

  ngAfterViewInit(): void {
    this.initMap();
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });


    tiles.addTo(this.map);
    
    var drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);
    var drawControl = new Draw.drawControl.Draw({
        edit: {
            featureGroup: drawnItems
        },
        draw: true
    });
    this.map.addControl(drawControl);
  }

  
  private initMap(): void {
    this.map = L.map('map', {
      drawControl: true,
      zoomControl: false,
      center: [ 18.2013, -67.1452 ],
      zoom: 14
    });

    new L.Control.Zoom({ position: 'bottomright' }).addTo(this.map);

  }
}
