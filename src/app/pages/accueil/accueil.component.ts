import { Component, OnInit } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { MenuModule } from 'primeng/menu';
import { ChartConfiguration } from 'chart.js';
import { DropdownModule } from 'primeng/dropdown';

interface Saison {
  nom: string;
  totalMatchsJoues: number;
  totalMatchsReportes: number;
  totalMatchsAnnuels: number;
  classementEquipes: any[];
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [
    NgChartsModule,
    MenuModule,
    DropdownModule
  ],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit {

  // --- Liste des saisons fictives ---
  saisons: Saison[] = [
    {
      nom: '2025/2026',
      totalMatchsJoues: 120,
      totalMatchsReportes: 5,
      totalMatchsAnnuels: 3,
      classementEquipes: [
        { nom: 'Équipe A', points: 45, victoires: 14, differenceButs: 20 },
        { nom: 'Équipe B', points: 42, victoires: 13, differenceButs: 15 },
        { nom: 'Équipe C', points: 38, victoires: 11, differenceButs: 10 },
        { nom: 'Équipe D', points: 30, victoires: 9, differenceButs: 5 }
      ]
    },
    {
      nom: '2024/2025',
      totalMatchsJoues: 110,
      totalMatchsReportes: 8,
      totalMatchsAnnuels: 2,
      classementEquipes: [
        { nom: 'Équipe A', points: 40, victoires: 12, differenceButs: 18 },
        { nom: 'Équipe B', points: 35, victoires: 10, differenceButs: 12 },
        { nom: 'Équipe C', points: 32, victoires: 9, differenceButs: 8 },
        { nom: 'Équipe D', points: 28, victoires: 8, differenceButs: 5 }
      ]
    },
    {
      nom: '2023/2024',
      totalMatchsJoues: 100,
      totalMatchsReportes: 10,
      totalMatchsAnnuels: 5,
      classementEquipes: [
        { nom: 'Équipe A', points: 38, victoires: 11, differenceButs: 15 },
        { nom: 'Équipe B', points: 34, victoires: 10, differenceButs: 10 },
        { nom: 'Équipe C', points: 30, victoires: 9, differenceButs: 8 },
        { nom: 'Équipe D', points: 25, victoires: 7, differenceButs: 4 }
      ]
    }
  ];


  selectedSaison: Saison = this.saisons[0];


  totalMatchsJoues = 0;
  totalMatchsReportes = 0;
  totalMatchsAnnuels = 0;


  classementEquipes: any[] = [];

  constructor() {}

  ngOnInit(): void {
    this.updateDashboard();
  }


  onSaisonChange(): void {
    this.updateDashboard();
  }


  updateDashboard(): void {
    this.totalMatchsJoues = this.selectedSaison.totalMatchsJoues;
    this.totalMatchsReportes = this.selectedSaison.totalMatchsReportes;
    this.totalMatchsAnnuels = this.selectedSaison.totalMatchsAnnuels;
    this.classementEquipes = this.selectedSaison.classementEquipes;


    this.pieChartData.datasets[0].data = [
      this.totalMatchsJoues,
      this.totalMatchsReportes,
      this.totalMatchsAnnuels
    ];


    this.barChartData.datasets[0].data = this.classementEquipes.map(e => e.points);
    this.barChartData.labels = this.classementEquipes.map(e => e.nom);
  }


  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y',
    scales: { x: { beginAtZero: true } }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Points',
        backgroundColor: '#3EB489'
      }
    ]
  };


  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true
  };

  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Joués', 'Reportés', 'Annulés'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#329157', '#f59e0b', '#dc2626']
      }
    ]
  };
}
