import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EquipeService, Equipe, TeamStats } from '../../service/equipe.service';
import { NextMatchCardComponent } from '../../components/dashboard/next-match-card/next-match-card.component';
import { TeamStatsCardComponent } from '../../components/dashboard/team-stats-card/team-stats-card.component';
import { MatchesListComponent } from '../../components/dashboard/matches-list/matches-list.component';
import { CompetitionFilterComponent, CompetitionOption } from '../../components/dashboard/competition-filter/competition-filter.component';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [CommonModule, NextMatchCardComponent, TeamStatsCardComponent, MatchesListComponent, CompetitionFilterComponent],
  templateUrl: './coach-dashboard.component.html',
  styleUrls: ['./coach-dashboard.component.scss']
})
export class CoachDashboardComponent implements OnInit {
  private equipeService = inject(EquipeService);

  team = signal<Equipe | null>(null);
  stats = signal<TeamStats | null>(null);
  selectedComp: string | null = null;

  ngOnInit(): void {
    this.equipeService.getMyTeam().subscribe(t => {
      this.team.set(t);
      if (t?.id) this.equipeService.getTeamStats(t.id).subscribe(s => this.stats.set(s));
    });
  }

  getCompetitionOptions(): CompetitionOption[] {
    return [ { id: 'c1', name: 'Championnat', type: 'LEAGUE' }, { id: 'c2', name: 'Coupe', type: 'CUP' } ];
  }
}
