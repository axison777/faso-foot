import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { MenuModule } from 'primeng/menu';
import { DropdownModule } from 'primeng/dropdown';

// ng2-charts
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface Equipe {
  nom: string;
  points: number;
  victoires: number;
  differenceButs: number;
}

interface Poule {
  nom: string;
  classementEquipes: Equipe[];
}

interface Saison {
  nom: string;
  totalMatchsJoues: number;
  totalMatchsReportes: number;
  totalMatchsAnnuels: number;
  classementEquipes?: Equipe[]; // pour ligue 1
  poules?: Poule[];             // pour ligue 2 et 3
}

interface Ligue {
  nom: string;
  saisons: Saison[];
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, MenuModule, DropdownModule],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit {
  // --- Données des ligues et saisons ---
  ligues: Ligue[] = [
    {
      nom: 'Ligue 1',
      saisons: [
        {
          nom: '2025/2026',
          totalMatchsJoues: 120,
          totalMatchsReportes: 5,
          totalMatchsAnnuels: 3,
          classementEquipes: [
            { nom: 'Équipe A', points: 45, victoires: 14, differenceButs: 20 },
            { nom: 'Équipe B', points: 42, victoires: 13, differenceButs: 15 }
          ]
        }
      ]
    },
    {
      nom: 'Ligue 2',
      saisons: [
        {
          nom: '2025/2026',
          totalMatchsJoues: 100,
          totalMatchsReportes: 7,
          totalMatchsAnnuels: 2,
          poules: [
            {
              nom: 'Poule A',
              classementEquipes: [
                { nom: 'Équipe A1', points: 30, victoires: 9, differenceButs: 10 },
                { nom: 'Équipe A2', points: 25, victoires: 8, differenceButs: 6 }
              ]
            },
            {
              nom: 'Poule B',
              classementEquipes: [
                { nom: 'Équipe B1', points: 28, victoires: 8, differenceButs: 7 },
                { nom: 'Équipe B2', points: 22, victoires: 7, differenceButs: 4 }
              ]
            }
          ]
        }
      ]
    },
    {
      nom: 'Ligue 3',
      saisons: [
        {
          nom: '2025/2026',
          totalMatchsJoues: 90,
          totalMatchsReportes: 10,
          totalMatchsAnnuels: 5,
          poules: [
            { nom: 'Poule A', classementEquipes: [] },
            { nom: 'Poule B', classementEquipes: [] },
            { nom: 'Poule C', classementEquipes: [] },
            { nom: 'Poule D', classementEquipes: [] }
          ]
        }
      ]
    }
  ];

  // --- Sélections utilisateur ---
  selectedLigue?: Ligue;
  selectedSaison?: Saison;
  selectedPoule?: Poule;

  // --- Statistiques affichées ---
  totalMatchsJoues = 0;
  totalMatchsReportes = 0;
  totalMatchsAnnuels = 0;
  classementEquipes: Equipe[] = [];

  ngOnInit(): void {}

  // --- Gestion des sélections ---
  onLigueChange(): void {
    this.selectedSaison = undefined;
    this.selectedPoule = undefined;
    this.resetDashboard();
  }

  onSaisonChange(): void {
    this.selectedPoule = undefined;
    this.updateDashboard();
  }

  onPouleChange(): void {
    this.updateDashboard();
  }

  resetDashboard(): void {
    this.totalMatchsJoues = 0;
    this.totalMatchsReportes = 0;
    this.totalMatchsAnnuels = 0;
    this.classementEquipes = [];
    this.updateCharts();
  }

  updateDashboard(): void {
    if (!this.selectedSaison) return;

    this.totalMatchsJoues = this.selectedSaison.totalMatchsJoues;
    this.totalMatchsReportes = this.selectedSaison.totalMatchsReportes;
    this.totalMatchsAnnuels = this.selectedSaison.totalMatchsAnnuels;

    if (this.selectedSaison.classementEquipes) {
      this.classementEquipes = this.selectedSaison.classementEquipes;
    } else if (this.selectedPoule) {
      this.classementEquipes = this.selectedPoule.classementEquipes;
    } else {
      this.classementEquipes = [];
    }

    this.updateCharts();
  }

  // --- Mise à jour des graphiques ---
  updateCharts(): void {
    this.pieChartData.datasets[0].data = [
      this.totalMatchsJoues,
      this.totalMatchsReportes,
      this.totalMatchsAnnuels
    ];

    this.barChartData.labels = this.classementEquipes.map(e => e.nom);
    this.barChartData.datasets[0].data = this.classementEquipes.map(e => e.points);
  }

  // --- Graphiques Chart.js ---
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y',
    scales: { x: { beginAtZero: true } }
  };

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Points', backgroundColor: '#3EB489' }]
  };

  public pieChartOptions: ChartConfiguration<'pie'>['options'] = { responsive: true };

  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Joués', 'Reportés', 'Annulés'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#329157', '#f59e0b', '#dc2626'] }]
  };
}
