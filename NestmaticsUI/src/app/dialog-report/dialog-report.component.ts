import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {environment } from '../../environments/environment';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts/lib/base-chart.directive';

@Component({
  selector: 'app-dialog-report',
  templateUrl: './dialog-report.component.html',
  styleUrls: ['./dialog-report.component.scss']
})

export class DialogReportComponent implements OnInit {

  exp = environment.baseURL + "/nestmatics/experiment"

  expName = ''

  revenue1;
  revenue2;
  total_rides1;
  total_rides2;
  vehicle_qty1;
  vehicle_qty2;
  start_date1;
  start_date2;
  config_1v2;
  config_2v1;
  
  public barChartOptions: ChartOptions = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { 
      xAxes: [{ scaleLabel: {
        display: true,
        labelString: 'Hour'}}], 

      yAxes: [{ scaleLabel: {
        display: true,
        labelString: 'Rides'}}] 
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };

  public barChartLabels: Label[] = ['5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00','13:00','14:00',
  '15:00','16:00','17:00','18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  public barChartType: ChartType = 'bar';
  public barChartLegend = true;

  public barChartData: ChartDataSets[] = [
    { data: [], label: 'Config 1' },
    { data: [], label: 'Config 2' }
  ];

  constructor(private http: HttpClient , public dialogRef: MatDialogRef<DialogReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.expName = data.expName;

      console.log("experiment id "+data.id);
      this.http.get(this.exp + "/" + data.id+"/report").subscribe((res: any) => {
        console.log(res);

        if(res.ok){
          this.config_1v2 = parseFloat(res.ok.conf_1v2).toFixed(2);
          this.config_2v1 = parseFloat(res.ok.conf_2v1).toFixed(2);

          this.vehicle_qty1 = res.ok.config1.hourly_results[0].vehicle_qty;
          this.vehicle_qty2 = res.ok.config2.hourly_results[0].vehicle_qty;

          this.revenue1 = res.ok.config1.total_revenue;
          this.revenue2 = res.ok.config2.total_revenue;

          this.total_rides1 = res.ok.config1.total_rides;
          this.total_rides2 = res.ok.config2.total_rides;

          this.start_date1 = res.ok.config1.start_date;
          this.start_date2 = res.ok.config2.start_date;

          var hours1:Array<any> = res.ok.config1.hourly_results;
          for(let i = 0; i< hours1.length; i++){
              this.barChartData[0].data.push(hours1[i].total_rides);
          }

          var hours2:Array<any> = res.ok.config2.hourly_results;
          for(let i = 0; i< hours2.length; i++){
              this.barChartData[1].data.push(hours2[i].total_rides);
          }
        }
        
      },(error) => {
        this.config_1v2 = "0";
          this.config_2v1 = "0";

          this.vehicle_qty1 = "0";
          this.vehicle_qty2 = "0";

          this.revenue1 = "0";
          this.revenue2 = "0";

          this.total_rides1 = "0";
          this.total_rides2 = "0";

          this.start_date1 = "0";
          this.start_date2 = "0";
      })
     }

  ngOnInit(): void {
  }

  getPositiveNegative(value){
      if(value > 0){
        return '#51cc51'
      }
      else{
        return '#cc0000'
      }
  }

  close() {
    this.dialogRef.close(-1);
    
  }

}
