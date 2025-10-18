import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EquipeService, Equipe } from '../../service/equipe.service';
import { AuthService } from '../../service/auth.service';
import { MatchService } from '../../service/match.service';
import { TeamDashboardData } from '../club-coach-shared/team-dashboard-card/team-dashboard-card.component';

@Component({
  selector: 'app-coach-dashboard-v2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coach-dashboard-v2.component.html',
  styleUrls: ['./coach-dashboard-v2.component.scss']
})
export class CoachDashboardV2Component implements OnInit {
    @Input() teamId?: string;
    
    private equipeService = inject(EquipeService);
    private authService = inject(AuthService);
    private matchService = inject(MatchService);
    private router = inject(Router);
    
    team = signal<Equipe | null>(null);
    teamData = signal<TeamDashboardData | null>(null);
    nextMatch = signal<any>(null);
    loading = false;
    error = signal<string | null>(null);

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
    this.error.set(null);
    
    const currentUser = this.authService.currentUser;
    const userTeamId = this.teamId || currentUser?.team_id;
    
    console.log('📊 [DASHBOARD] Chargement des données du coach');
    console.log('👤 [DASHBOARD] Current User:', currentUser);
    console.log('🏟️ [DASHBOARD] Team ID à utiliser:', userTeamId);
    console.log('🆔 [DASHBOARD] Team ID depuis @Input:', this.teamId);
    console.log('🆔 [DASHBOARD] Team ID depuis user:', currentUser?.team_id);
    
    if (!userTeamId) {
      console.error('❌ [DASHBOARD] Aucun team_id trouvé!');
      this.error.set('Aucune équipe assignée à votre compte coach');
      this.loading = false;
      return;
    }
    
    console.log('🔄 [DASHBOARD] Appel API GET /teams/' + userTeamId);
    
    // Récupérer les données de l'équipe via son ID
    this.equipeService.getTeamById(userTeamId).subscribe({
      next: (t) => {
        console.log('✅ [DASHBOARD] Équipe reçue du backend:', t);
        this.team.set(t);
        
        const data: TeamDashboardData = {
          id: t.id || '',
          name: t.name,
          coach: { name: currentUser?.first_name && currentUser?.last_name 
            ? `${currentUser.first_name} ${currentUser.last_name}` 
            : 'Vous' },
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
        
        console.log('📦 [DASHBOARD] Team Data formatée:', data);
        this.teamData.set(data);
        
        // Charger le prochain match
        this.loadNextMatch(userTeamId);
      },
      error: (err) => {
        console.error('❌ [DASHBOARD] Erreur lors du chargement de l\'équipe:', err);
        console.error('❌ [DASHBOARD] Status:', err?.status);
        console.error('❌ [DASHBOARD] Message:', err?.message);
        console.error('❌ [DASHBOARD] Error complet:', err);
        this.error.set('Impossible de charger les données de l\'équipe');
        this.loading = false;
      }
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

  loadNextMatch(teamId: string) {
    console.log('🔄 [DASHBOARD] Chargement du prochain match');
    
    this.matchService.getAllMatchesForTeam(teamId).subscribe({
      next: (matches: any[]) => {
        console.log('✅ [DASHBOARD] Matchs reçus:', matches);
        console.log('📊 [DASHBOARD] Nombre de matchs:', matches?.length || 0);
        
        if (!matches || matches.length === 0) {
          console.log('⚠️ [DASHBOARD] Aucun match disponible');
          this.nextMatch.set(null);
          this.loading = false;
          return;
        }
        
        // Filtrer les matchs à venir et trouver le plus proche
        const now = new Date();
        const upcomingMatches = matches
          .filter((m: any) => {
            const matchDate = new Date(m.scheduled_at);
            return matchDate > now;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.scheduled_at);
            const dateB = new Date(b.scheduled_at);
            return dateA.getTime() - dateB.getTime();
          });
        
        console.log('⏭️ [DASHBOARD] Matchs à venir:', upcomingMatches.length);
        
        if (upcomingMatches.length > 0) {
          const nextMatchData: any = upcomingMatches[0];
          const isHome = nextMatchData.team_one_id === teamId || nextMatchData.home_club_id === teamId;
          const opponent = isHome ? nextMatchData.team_two : nextMatchData.team_one;
          
          const formatted = {
            id: nextMatchData.id,
            opponent: opponent?.abbreviation || opponent?.name || 'Adversaire',
            opponentLogo: opponent?.logo,
            date: nextMatchData.scheduled_at,
            competition: nextMatchData.pool?.name || 'Compétition',
            stadium: nextMatchData.stadium?.name || 'Stade',
            isHome: isHome,
            homeTeam: nextMatchData.team_one?.abbreviation || nextMatchData.team_one?.name || 'Équipe Domicile',
            awayTeam: nextMatchData.team_two?.abbreviation || nextMatchData.team_two?.name || 'Équipe Extérieure',
            matchId: nextMatchData.id
          };
          
          console.log('⚽ [DASHBOARD] Prochain match trouvé:', formatted);
          this.nextMatch.set(formatted);
        } else {
          console.log('ℹ️ [DASHBOARD] Aucun match à venir');
          this.nextMatch.set(null);
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ [DASHBOARD] Erreur:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Navigue vers la page de préparation de la composition (match-setup)
   * pour soumettre la feuille de match
   */
  prepareMatchSheet() {
    const match = this.nextMatch();
    if (match && match.id) {
      console.log('📋 [DASHBOARD] Navigation vers match-setup pour le match:', match.id);
      this.router.navigate(['/match-setup', match.id]);
    } else {
      console.warn('⚠️ [DASHBOARD] Aucun match disponible pour préparer la composition');
    }
  }

  /**
   * Navigue vers la page des détails du match
   */
  viewMatchDetails() {
    const match = this.nextMatch();
    if (match && match.id) {
      console.log('👁️ [DASHBOARD] Navigation vers les détails du match:', match.id);
      // Navigation vers la page de détails des matchs coach avec l'ID du match
      this.router.navigate(['/mon-equipe/matchs'], { 
        queryParams: { matchId: match.id } 
      });
    } else {
      console.warn('⚠️ [DASHBOARD] Aucun match disponible pour voir les détails');
    }
  }
}
