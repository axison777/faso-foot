import { Component } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
@Component({
  selector: 'app-accueil',
 standalone: true,
  imports: [
    NgChartsModule
  ],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent {
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true }
    }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Équipe D', 'Équipe H', 'Équipe F', 'Équipe A'],
    datasets: [
      { data: [40, 45, 30, 25], label: 'Points', backgroundColor: '#2e7d32' }
    ]
  };
}
