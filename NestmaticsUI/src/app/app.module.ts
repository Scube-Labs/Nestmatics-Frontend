import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule, routingComponents} from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapComponent } from './map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ToolbarModule } from './toolbar/toolbar.module';
import { FormsModule } from '@angular/forms';
import { AngularFileUploaderModule } from "angular-file-uploader";
import { HttpClientModule } from "@angular/common/http";
import { PredictionComponent } from './prediction/prediction.component';
import { ExperimentComponent } from './experiment/experiment.component';


@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    routingComponents,
    PredictionComponent,
    ExperimentComponent
  ],
  imports: [
    LeafletModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToolbarModule,
    FormsModule,
    AngularFileUploaderModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
