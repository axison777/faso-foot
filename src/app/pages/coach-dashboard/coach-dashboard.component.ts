import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EquipeService } from '../../service/equipe.service';
import { MatchService } from '../../service/match.service';
import { MockDataService } from '../../service/mock-data.service';
import { TeamStats, MatchListItem } from '../../models/dashboard.model';
import { Team } from '../../models/team.model';
import { TeamStatsCardComponent } from '../../components/dashboard/team-stats-card.component';
import { NextMatchCardComponent } from '../../components/dashboard/next-match-card.component';
import { MatchesListComponent } from '../../components/dashboard/matches-list.component';
import { CompetitionOption } from '../../components/dashboard/competition-filter.component';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    TeamStatsCardComponent,
    NextMatchCardComponent,
    MatchesListComponent
  ],
  providers: [MessageService],
  templateUrl: './coach-dashboard.component.html',
  styleUrls: ['./coach-dashboard.component.scss']
})
export class CoachDashboardComponent implements OnInit {
  team: Team | null = null;
  teamStats: TeamStats | null = null;
  nextMatch: MatchListItem | null = null;
  competitions: CompetitionOption[] = [];
  loading = false;
  useMockData = true; // TODO: Mettre à false quand le backend est prêt

  constructor(
    private equipeService: EquipeService,
    private matchService: MatchService,
    private mockDataService: MockDataService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadTeamData();
  }

  loadTeamData(): void {
    this.loading = true;
    const service$ = this.useMockData
      ? this.mockDataService.getMockTeam()
      : this.equipeService.getMyTeam();

    service$.subscribe({
      next: (team) => {
        this.team = team;
        if (team.id) {
          this.loadTeamStats(team.id);
          this.loadNextMatch(team.id);
          this.loadCompetitions(team.id);
        }
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les données de l\'équipe'
        });
        this.loading = false;
      }
    });
  }

  loadTeamStats(teamId: string): void {
    const service$ = this.useMockData
      ? this.mockDataService.getMockTeamStats(teamId)
      : this.equipeService.getTeamStats(teamId);

    service$.subscribe({
      next: (stats) => {
        this.teamStats = stats;
      },
      error: () => {
        this.teamStats = {
          teamId,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          recentForm: []
        };
      }
    });
  }

  loadNextMatch(teamId: string): void {
    const service$ = this.useMockData
      ? this.mockDataService.getMockNextMatch(teamId)
      : this.matchService.getUpcomingMatchForTeam(teamId);

    service$.subscribe({
      next: (match) => {
        this.nextMatch = match;
      },
      error: () => {
        this.nextMatch = null;
      }
    });
  }

  loadCompetitions(teamId: string): void {
    const service$ = this.useMockData
      ? this.mockDataService.getMockMatches(teamId, 'UPCOMING')
      : this.matchService.getMatchesForTeam(teamId);

    service$.subscribe({
      next: (matches) => {
        const comps = new Map<string, CompetitionOption>();
        matches.forEach(m => {
          if (m.competition && !comps.has(m.competition.id)) {
            comps.set(m.competition.id, m.competition as CompetitionOption);
          }
        });
        this.competitions = Array.from(comps.values());
      },
      error: () => {
        this.competitions = [];
      }
    });
  }
}
