import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

// 🥇 Interfaces
interface RankingTeam {
  position: number;
  team_name: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
  last_5_results: string[];
}

interface TopScorer {
  position: number;
  player_name: string;
  team_name: string;
  goals: number;
  assists: number;
  matches_played: number;
  minutes_played: number;
}

interface UpcomingMatch {
  date: string;
  time: string;
  home_team: string;
  away_team: string;
  stadium: string;
  status: 'À venir' | 'Reporté' | 'Terminé';
}

interface Poule {
  nom: string;
  classementEquipes: RankingTeam[];
}

interface Saison {
  nom: string;
  totalMatchsJoues: number;
  totalMatchsReportes: number;
  totalMatchsAnnuels: number;
  classementEquipes?: RankingTeam[];
  poules?: Poule[];
}

interface Ligue {
  nom: string;
  saisons: Saison[];
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, DropdownModule, TableModule],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss']
})
export class AccueilComponent implements OnInit {
  // 📊 Ligues simulées
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
            {
              position: 1, team_name: 'Équipe A', matches_played: 20, wins: 14, draws: 3, losses: 3,
              goals_for: 40, goals_against: 20, points: 45, last_5_results: ['W','W','D','L','W']
            },
            {
              position: 2, team_name: 'Équipe B', matches_played: 20, wins: 13, draws: 3, losses: 4,
              goals_for: 38, goals_against: 23, points: 42, last_5_results: ['D','W','W','L','W']
            },
            {
              position: 3, team_name: 'Équipe C', matches_played: 20, wins: 11, draws: 5, losses: 4,
              goals_for: 35, goals_against: 25, points: 38, last_5_results: ['W','D','D','W','L']
            }
          ]
        }
      ]
    }
  ];

  // 🔽 Sélections utilisateur
  selectedLigue?: Ligue;
  selectedSaison?: Saison;
  selectedPoule?: Poule;

  // 📌 Stats globales
  totalMatchsJoues = 0;
  totalMatchsReportes = 0;
  totalMatchsAnnuels = 0;
  totalMatchs = 0;

  // 🏆 Classement
  ranking: RankingTeam[] = [];

  // ⚽️ Top buteurs
  topScorers: TopScorer[] = [
    { position: 1, player_name: 'Joueur 1', team_name: 'Équipe A', goals: 18, assists: 5, matches_played: 20, minutes_played: 1750 },
    { position: 2, player_name: 'Joueur 2', team_name: 'Équipe B', goals: 15, assists: 7, matches_played: 20, minutes_played: 1680 },
    { position: 3, player_name: 'Joueur 3', team_name: 'Équipe C', goals: 13, assists: 4, matches_played: 19, minutes_played: 1600 }
  ];

  // 📅 Prochains matchs
  upcomingMatches: UpcomingMatch[] = [
    { date: '2025-10-01', time: '18:00', home_team: 'Équipe A', away_team: 'Équipe B', stadium: 'Stade National', status: 'À venir' },
    { date: '2025-10-03', time: '20:30', home_team: 'Équipe C', away_team: 'Équipe D', stadium: 'Stade Municipal', status: 'À venir' },
    { date: '2025-10-05', time: '17:00', home_team: 'Équipe E', away_team: 'Équipe F', stadium: 'Stade Olympique', status: 'Reporté' }
  ];

  // 📊 Graphiques
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = { responsive: true };
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Joués', 'Reportés', 'Annulés'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#329157', '#f59e0b', '#dc2626'] }]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    indexAxis: 'y',
    scales: { x: { beginAtZero: true } }
  };
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Points', backgroundColor: '#3EB489' }]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = { responsive: true };
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['J1', 'J2', 'J3', 'J4', 'J5'],
    datasets: [{ data: [0, 0, 0, 0, 0], label: 'Équipe A', borderColor: '#2563eb', fill: false }]
  };

  ngOnInit(): void {}

  // 🔁 Sélections
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

  // 📊 Dashboard
  resetDashboard(): void {
    this.totalMatchsJoues = this.totalMatchsReportes = this.totalMatchsAnnuels = this.totalMatchs = 0;
    this.ranking = [];
    this.updateCharts();
  }

  updateDashboard(): void {
    if (!this.selectedSaison) return;

    this.totalMatchsJoues = this.selectedSaison.totalMatchsJoues;
    this.totalMatchsReportes = this.selectedSaison.totalMatchsReportes;
    this.totalMatchsAnnuels = this.selectedSaison.totalMatchsAnnuels;
    this.totalMatchs = this.totalMatchsJoues + this.totalMatchsReportes + this.totalMatchsAnnuels;

    if (this.selectedSaison.classementEquipes) {
      this.ranking = this.selectedSaison.classementEquipes;
    } else if (this.selectedPoule) {
      this.ranking = this.selectedPoule.classementEquipes;
    } else {
      this.ranking = [];
    }

    this.updateCharts();
  }

  updateCharts(): void {
    this.pieChartData.datasets[0].data = [this.totalMatchsJoues, this.totalMatchsReportes, this.totalMatchsAnnuels];
    this.barChartData.labels = this.ranking.map(e => e.team_name);
    this.barChartData.datasets[0].data = this.ranking.map(e => e.points);
    this.lineChartData.datasets[0].data = [10, 15, 20, 25, 30];
  }

  // 🏅 Label spécial pour les positions
  getPositionLabel(position: number): string {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return position.toString();
  }

  // 🟢 Pastilles de résultats récents
  getResultColor(result: string): string {
    return result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-yellow-500' : 'bg-red-500';
  }
}
