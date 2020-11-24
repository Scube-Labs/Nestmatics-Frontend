import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule, routingComponents} from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapComponent } from './map/map.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { ToolbarModule } from './toolbar/toolbar.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";
import { PredictionComponent } from './prediction/prediction.component';
import { ExperimentComponent } from './experiment/experiment.component';
import { CalendarHeatmapModule } from 'ng-calendar-heatmap';
import { CalendarComponent } from './calendar/calendar.component';
import { MainComponent } from './main/main.component';
import { PlaybackComponent } from './playback/playback.component';
import { ServiceAreaComponent } from './service-area/service-area.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { AngularFileUploaderModule } from 'angular-file-uploader';

//Google Auth Modules
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider } from 'angularx-social-login';

//Dialogs
import { DialogAreasComponent } from './dialog-areas/dialog-areas.component';
import { DialogNestsComponent } from './dialog-nests/dialog-nests.component';
import { DialogUploadComponent } from './dialog-upload/dialog-upload.component';
import { DialogExperimentListComponent } from './dialog-experiment-list/dialog-experiment-list.component';
import { DialogExperimentComponent } from './dialog-experiment/dialog-experiment.component';
import { DialogCreateExperimentComponent } from './dialog-create-experiment/dialog-create-experiment.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    routingComponents,
    PredictionComponent,
    ExperimentComponent,
    MainComponent,
    DialogNestsComponent,
    PlaybackComponent,
    ServiceAreaComponent,
    DialogAreasComponent,
    LoginComponent,
    DialogUploadComponent,
    DialogExperimentListComponent,
    DialogExperimentComponent,
    DialogCreateExperimentComponent
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
    CalendarHeatmapModule,
    SocialLoginModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthGuard,
    LoginComponent,
    CalendarComponent,
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '724257522743-odkrelv6iqnao7ns1itdufdo2ihhpo5c.apps.googleusercontent.com'
            )
          }
        ]
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [DialogNestsComponent, DialogAreasComponent, DialogUploadComponent, DialogExperimentListComponent, DialogExperimentComponent, DialogCreateExperimentComponent]
})
export class AppModule { }
