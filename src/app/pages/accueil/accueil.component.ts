import { Component, OnInit } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { MenuModule } from 'primeng/menu';
import { ChartConfiguration } from 'chart.js';

// TODO: Importer les futurs services (commentés si pas encore créés)
// import { EquipeService } from '../services/equipe.service';
// import { StadeService } from '../services/stade.service';
// import { LigueService } from '../services/ligue.service';
// import { SaisonService } from '../services/saison.service';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [
    NgChartsModule,
    MenuModule
  ],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit {

  totalEquipes = 0;
  totalStades = 0;
  totalLigues = 0;
  totalSaisons = 0;

  constructor(
    // Injecter les services une fois disponibles
    // private equipeService: EquipeService,
    // private stadeService: StadeService,
    // private ligueService: LigueService,
    // private saisonService: SaisonService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Remplacer plus tard par les appels API
    this.totalEquipes = 16;
    this.totalStades = 8;
    this.totalLigues = 3;
    this.totalSaisons = 2;

    // Exemple futur :
    // this.equipeService.getAll().subscribe(data => this.totalEquipes = data.length);
  }

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
      {
        data: [40, 45, 30, 25],
        label: 'Points',
        backgroundColor: '#3EB489'
      }
    ]
  };
}
