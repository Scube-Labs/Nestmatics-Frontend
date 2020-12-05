import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventEmitterService } from '../event-emitter.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})

export class StatsComponent implements OnInit {

  totalRides = 0;
  totalRevenue;
  totalActiveVehicles = 0;

  stats: string = environment.baseURL + '/nestmatics/stats' 

  constructor(
    private http: HttpClient,
    private eventEmitterService: EventEmitterService) { 

      this.eventEmitterService.subsVar = this.eventEmitterService.invokeRefreshRides.
      subscribe(()=> {
        this.refresh()
    });
  }

  refresh(){
    this.loadStats();
  }

  ngOnInit(): void {
    this.loadStats();
  }
 
  loadStats(){
    this.http.get(this.stats + "/area/" + localStorage.getItem('currAreaID')+"/date/"+localStorage.getItem('currDate')).subscribe((res: any) => {
      if(res.ok){
          this.totalRevenue = parseFloat(res.ok.total_revenue).toFixed(2);
          this.totalRides = res.ok.total_rides;
          this.totalActiveVehicles = Object.keys(res.ok.total_active_vehicles).length;
      }
    },
    (error) => {
      
    })
  }

}
