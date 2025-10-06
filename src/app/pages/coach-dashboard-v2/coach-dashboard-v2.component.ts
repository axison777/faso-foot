import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipeService, Equipe } from '../../service/equipe.service';
import { TeamDashboardCardComponent, TeamDashboardData } from '../club-coach-shared/team-dashboard-card/team-dashboard-card.component';

@Component({
  selector: 'app-coach-dashboard-v2',
  standalone: true,
  imports: [CommonModule, TeamDashboardCardComponent],
  templateUrl: './coach-dashboard-v2.component.html',
  styleUrls: ['./coach-dashboard-v2.component.scss']
})
export class CoachDashboardV2Component implements OnInit {
  private equipeService = inject(EquipeService);
  
  team = signal<Equipe | null>(null);
  teamData = signal<TeamDashboardData | null>(null);
  loading = false;

  ngOnInit(): void {
    this.loadTeamData();
  }

  loadTeamData() {
    this.loading = true;
    this.equipeService.getMyTeam().subscribe(t => {
      this.team.set(t);
      
      const data: TeamDashboardData = {
        id: t.id || '',
        name: t.name,
        coach: { name: 'Vous' },
        playerCount: 18,
        totalPlayers: 25,
        kit: { photo: t.logo },
        nextMatch: {
          opponent: 'USO',
          date: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          competition: 'Championnat',
          matchId: 'm1'
        },
        standing: { rank: 3, points: 24, played: 12 },
        stats: { goals: 28, assists: 15, yellowCards: 12, redCards: 2 }
      };
      
      this.teamData.set(data);
      this.loading = false;
    });
  }
}
