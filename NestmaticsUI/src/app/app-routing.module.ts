import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ServiceAreaComponent } from './service-area/service-area.component';
import { MapComponent } from './map/map.component';
import { PredictionComponent } from './prediction/prediction.component';
import { ExperimentComponent } from './experiment/experiment.component';

const routes: Routes = [
  {path: '', component: MapComponent},
  {path: 'login', component: LoginComponent},
  {path: 'service-area', component: ServiceAreaComponent},
  {path: 'home', component: MapComponent},
  {path: 'prediction', component: PredictionComponent},
  {path: 'experiment', component: ExperimentComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [LoginComponent, ServiceAreaComponent, MapComponent, PredictionComponent, ExperimentComponent]
