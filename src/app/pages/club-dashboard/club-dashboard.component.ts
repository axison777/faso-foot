import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';

import { ClubService, MyClub, ClubStats } from '../../service/club.service';
import { EquipeService, TeamStats } from '../../service/equipe.service';
import { NextMatchCardComponent } from '../../components/dashboard/next-match-card/next-match-card.component';
import { TeamStatsCardComponent } from '../../components/dashboard/team-stats-card/team-stats-card.component';
import { ClubStatsCardComponent } from '../../components/dashboard/club-stats-card/club-stats-card.component';
import { MatchesListComponent } from '../../components/dashboard/matches-list/matches-list.component';
import { CompetitionFilterComponent, CompetitionOption } from '../../components/dashboard/competition-filter/competition-filter.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-club-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, TabViewModule, CardModule, NextMatchCardComponent, TeamStatsCardComponent, ClubStatsCardComponent, MatchesListComponent, CompetitionFilterComponent],
  templateUrl: './club-dashboard.component.html',
  styleUrls: ['./club-dashboard.component.scss']
})
export class ClubDashboardComponent implements OnInit {
  private clubService = inject(ClubService);
  private equipeService = inject(EquipeService);

  club = signal<MyClub | null>(null);
  clubStats = signal<ClubStats | null>(null);

  // competition filter per team (id -> selected competition id)
  teamCompFilters = new Map<string, string | null>();

  ngOnInit(): void {
    this.clubService.getMyClub().subscribe(c => {
      this.club.set(c);
      if (c?.id) {
        this.clubService.getClubStats(c.id).subscribe(s => this.clubStats.set(s));
      }
    });
  }

  getCompetitionOptions(): CompetitionOption[] {
    return [ { id: 'c1', name: 'Championnat', type: 'LEAGUE' }, { id: 'c2', name: 'Coupe', type: 'CUP' } ];
  }

  selectedComp(teamId: string): string | null { return this.teamCompFilters.get(teamId) ?? null; }
  onCompChange(teamId: string, compId: string | null) { this.teamCompFilters.set(teamId, compId); }
}
