import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ServiceAreaComponent } from './service-area/service-area.component';
import { MapComponent } from './map/map.component';
import { PredictionComponent } from './prediction/prediction.component';
import { ExperimentComponent } from './experiment/experiment.component';
import { CalendarComponent } from './calendar/calendar.component';
import { MainComponent } from './main/main.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {path: '', component: MainComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'experiment', component: ExperimentComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [LoginComponent, ServiceAreaComponent, MapComponent, PredictionComponent, ExperimentComponent, CalendarComponent, MainComponent]
