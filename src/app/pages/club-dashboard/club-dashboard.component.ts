import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ClubService } from '../../service/club.service';
import { EquipeService } from '../../service/equipe.service';
import { MatchService } from '../../service/match.service';
import { MockDataService } from '../../service/mock-data.service';
import { ClubDashboard, ClubStats, TeamStats, MatchListItem } from '../../models/dashboard.model';
import { Team } from '../../models/team.model';
import { ClubStatsCardComponent } from '../../components/dashboard/club-stats-card.component';
import { TeamStatsCardComponent } from '../../components/dashboard/team-stats-card.component';
import { NextMatchCardComponent } from '../../components/dashboard/next-match-card.component';
import { MatchesListComponent } from '../../components/dashboard/matches-list.component';
import { CompetitionOption } from '../../components/dashboard/competition-filter.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-club-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    ToastModule,
    ClubStatsCardComponent,
    TeamStatsCardComponent,
    NextMatchCardComponent,
    MatchesListComponent
  ],
  providers: [MessageService],
  templateUrl: './club-dashboard.component.html',
  styleUrls: ['./club-dashboard.component.scss']
})
export class ClubDashboardComponent implements OnInit {
  club: ClubDashboard | null = null;
  clubStats: ClubStats | null = null;
  loading = false;
  activeTeamIndex = 0;
  useMockData = true; // TODO: Mettre à false quand le backend est prêt

  teamStatsMap = new Map<string, TeamStats>();
  nextMatchMap = new Map<string, MatchListItem | null>();
  competitionsMap = new Map<string, CompetitionOption[]>();

  constructor(
    private clubService: ClubService,
    private equipeService: EquipeService,
    private matchService: MatchService,
    private mockDataService: MockDataService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadClubData();
  }

  loadClubData(): void {
    this.loading = true;
    const service$ = this.useMockData 
      ? this.mockDataService.getMockClub()
      : this.clubService.getMyClub();

    service$.subscribe({
      next: (club) => {
        this.club = club;
        this.clubStats = club.stats;
        if (club.teams && club.teams.length > 0) {
          club.teams.forEach(team => {
            if (team.id) {
              this.loadTeamData(team.id);
            }
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les données du club'
        });
        this.loading = false;
      }
    });
  }

  loadClubStats(): void {
    if (!this.club?.id) return;
    
    this.clubService.getClubStats(this.club.id).subscribe({
      next: (stats) => {
        this.clubStats = stats;
      },
      error: () => {
        this.clubStats = {
          totalMatches: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0
        };
      }
    });
  }

  loadTeamData(teamId: string): void {
    this.loadTeamStats(teamId);
    this.loadNextMatch(teamId);
    this.loadCompetitions(teamId);
  }

  loadTeamStats(teamId: string): void {
    const service$ = this.useMockData
      ? this.mockDataService.getMockTeamStats(teamId)
      : this.equipeService.getTeamStats(teamId);

    service$.subscribe({
      next: (stats) => {
        this.teamStatsMap.set(teamId, stats);
      },
      error: () => {
        this.teamStatsMap.set(teamId, {
          teamId,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          recentForm: []
        });
      }
    });
  }

  loadNextMatch(teamId: string): void {
    const service$ = this.useMockData
      ? this.mockDataService.getMockNextMatch(teamId)
      : this.matchService.getUpcomingMatchForTeam(teamId);

    service$.subscribe({
      next: (match) => {
        this.nextMatchMap.set(teamId, match);
      },
      error: () => {
        this.nextMatchMap.set(teamId, null);
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
        this.competitionsMap.set(teamId, Array.from(comps.values()));
      },
      error: () => {
        this.competitionsMap.set(teamId, []);
      }
    });
  }

  getTeamStats(teamId: string): TeamStats | null {
    return this.teamStatsMap.get(teamId) || null;
  }

  getNextMatch(teamId: string): MatchListItem | null {
    return this.nextMatchMap.get(teamId) || null;
  }

  getCompetitions(teamId: string): CompetitionOption[] {
    return this.competitionsMap.get(teamId) || [];
  }
}
