import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipeService, Equipe } from '../../service/equipe.service';
import { TeamDashboardData } from '../club-coach-shared/team-dashboard-card/team-dashboard-card.component';

@Component({
  selector: 'app-coach-dashboard-v2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coach-dashboard-v2.component.html',
  styleUrls: ['./coach-dashboard-v2.component.scss']
})
export class CoachDashboardV2Component implements OnInit {
  private equipeService = inject(EquipeService);
  
  team = signal<Equipe | null>(null);
  teamData = signal<TeamDashboardData | null>(null);
  loading = false;

  // Données pour les top performers
  topScorers = [
    { name: 'Kylian Mbappé', position: 'Attaquant', goals: 12 },
    { name: 'Karim Benzema', position: 'Attaquant', goals: 8 },
    { name: 'Antoine Griezmann', position: 'Milieu', goals: 6 },
    { name: 'Ousmane Dembélé', position: 'Ailier', goals: 4 }
  ];

  topAssisters = [
    { name: 'Paul Pogba', position: 'Milieu', assists: 9 },
    { name: 'N\'Golo Kanté', position: 'Milieu', assists: 7 },
    { name: 'Kylian Mbappé', position: 'Attaquant', assists: 5 },
    { name: 'Lucas Hernandez', position: 'Défenseur', assists: 3 }
  ];

  teamForm = ['win', 'win', 'draw', 'loss', 'win'];

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

  getSquadPercentage(): number {
    const data = this.teamData();
    if (!data) return 0;
    return Math.round((data.playerCount / data.totalPlayers) * 100);
  }

  getRankClass(rank?: number): string {
    if (!rank) return 'rank-neutral';
    if (rank <= 3) return 'rank-top';
    if (rank >= 15) return 'rank-bottom';
    return 'rank-neutral';
  }

  getFormIcon(result: string): string {
    switch (result) {
      case 'win': return 'pi-check-circle';
      case 'loss': return 'pi-times-circle';
      case 'draw': return 'pi-minus-circle';
      default: return 'pi-circle';
    }
  }

  getFormSummary(): string {
    const wins = this.teamForm.filter(r => r === 'win').length;
    const draws = this.teamForm.filter(r => r === 'draw').length;
    const losses = this.teamForm.filter(r => r === 'loss').length;
    return `${wins}V ${draws}N ${losses}D`;
  }
}
