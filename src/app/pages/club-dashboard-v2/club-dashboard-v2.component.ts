import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { ClubService, MyClub } from '../../service/club.service';
import { TeamDashboardCardComponent, TeamDashboardData } from '../club-coach-shared/team-dashboard-card/team-dashboard-card.component';

@Component({
  selector: 'app-club-dashboard-v2',
  standalone: true,
  imports: [CommonModule, TabViewModule, TeamDashboardCardComponent],
  templateUrl: './club-dashboard-v2.component.html',
  styleUrls: ['./club-dashboard-v2.component.scss']
})
export class ClubDashboardV2Component implements OnInit {
  private clubService = inject(ClubService);
  
  club = signal<MyClub | null>(null);
  teamsData = signal<TeamDashboardData[]>([]);
  loading = false;

  ngOnInit(): void {
    this.loadClubData();
  }

  loadClubData() {
    this.loading = true;
    this.clubService.getMyClub().subscribe(c => {
      this.club.set(c);
      
      const teams: TeamDashboardData[] = (c?.teams || []).map(t => ({
        id: t.id,
        name: t.name,
        coach: { name: 'Coach assigné' },
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
      }));
      
      this.teamsData.set(teams);
      this.loading = false;
    });
  }
}
