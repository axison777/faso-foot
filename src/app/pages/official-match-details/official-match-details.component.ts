import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OfficialMatchService, OfficialMatch } from '../../service/official-match.service';
import { MatchCallupService, MatchCallups, CallupPlayer } from '../../service/match-callup.service';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-official-match-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './official-match-details.component.html',
    styleUrls: ['./official-match-details.component.scss']
})
export class OfficialMatchDetailsComponent implements OnInit {
    match$!: Observable<OfficialMatch | null>;
    matchCallups$!: Observable<MatchCallups | null>;
    matchId: string = '';
    
    showFormationView: 'team1' | 'team2' | null = null;
    hoveredPlayerId: string | null = null;

    constructor(
        private officialMatchService: OfficialMatchService,
        private matchCallupService: MatchCallupService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.matchId = this.route.snapshot.paramMap.get('id') || '';
        console.log('[OfficialMatchDetails] Match ID:', this.matchId);
        
        // Essayer d'abord getMatchDetails
        this.match$ = this.officialMatchService.getMatchDetails(this.matchId);
        
        // Si getMatchDetails retourne null, chercher dans la liste des matchs
        this.match$.subscribe(match => {
            console.log('[OfficialMatchDetails] Match data from getMatchDetails:', match);
            
            if (!match) {
                console.log('[OfficialMatchDetails] Match null, recherche dans la liste des matchs...');
                this.officialMatchService.getAssignedMatches().subscribe(matches => {
                    const foundMatch = matches.find(m => m.id === this.matchId);
                    console.log('[OfficialMatchDetails] Match trouvé dans la liste:', foundMatch);
                    if (foundMatch) {
                        this.match$ = of(foundMatch);
                    }
                });
            }
        });
        
        this.matchCallups$ = this.matchCallupService.getMatchCallups(this.matchId);
        
        this.matchCallups$.subscribe(callups => {
            console.log('[OfficialMatchDetails] Callups data:', callups);
        });
    }

    goBack() {
        this.router.navigate(['/officiel/matchs']);
    }

    getStatusClass(status: string): string {
        const statusMap: Record<string, string> = {
            'UPCOMING': 'status-upcoming',
            'IN_PROGRESS': 'status-in-progress',
            'COMPLETED': 'status-completed',
            'POSTPONED': 'status-postponed',
            'CANCELLED': 'status-cancelled'
        };
        return statusMap[status] || 'status-default';
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'UPCOMING': 'À venir',
            'IN_PROGRESS': 'En cours',
            'COMPLETED': 'Terminé',
            'POSTPONED': 'Reporté',
            'CANCELLED': 'Annulé'
        };
        return labels[status] || status;
    }

    getRoleLabel(role: string): string {
        const roles: Record<string, string> = {
            'CENTRAL_REFEREE': 'Arbitre Central',
            'ASSISTANT_REFEREE_1': 'Assistant 1',
            'ASSISTANT_REFEREE_2': 'Assistant 2',
            'FOURTH_OFFICIAL': '4ème Arbitre',
            'COMMISSIONER': 'Commissaire'
        };
        return roles[role] || role;
    }

    getRoleIcon(role: string): string {
        const icons: Record<string, string> = {
            'CENTRAL_REFEREE': 'pi pi-user',
            'ASSISTANT_REFEREE_1': 'pi pi-flag',
            'ASSISTANT_REFEREE_2': 'pi pi-flag',
            'FOURTH_OFFICIAL': 'pi pi-users',
            'COMMISSIONER': 'pi pi-briefcase'
        };
        return icons[role] || 'pi pi-user';
    }

    getStarters(players: any[]): any[] {
        if (!players) return [];
        const starters = players.filter(p => {
            // Gérer tous les formats possibles pour is_starter
            return p.is_starter === true || 
                   p.is_starter === 'true' || 
                   p.is_starter === '1' || 
                   p.is_starter === 1;
        });
        console.log(`[getStarters] ${starters.length} titulaires trouvés sur ${players.length} joueurs`);
        if (starters.length > 0) {
            console.log('[getStarters] Premier titulaire:', starters[0]);
        }
        return starters;
    }

    getSubstitutes(players: any[]): any[] {
        if (!players) return [];
        const subs = players.filter(p => {
            return p.is_starter === false || 
                   p.is_starter === 'false' || 
                   p.is_starter === '0' || 
                   p.is_starter === 0;
        });
        console.log(`[getSubstitutes] ${subs.length} remplaçants trouvés sur ${players.length} joueurs`);
        return subs;
    }

    toggleFormationView(team: 'team1' | 'team2') {
        this.showFormationView = this.showFormationView === team ? null : team;
    }

    onPlayerHover(playerId: string | null) {
        this.hoveredPlayerId = playerId;
    }

    getPlayerPositionByIndex(index: number, formation: string): { x: number, y: number } {
        const formations: Record<string, any> = {
            '4-4-2': [
                { role: 'GK', x: 4, y: 50 },
                { role: 'LB', x: 28, y: 18 },
                { role: 'LCB', x: 24, y: 36 },
                { role: 'RCB', x: 24, y: 64 },
                { role: 'RB', x: 28, y: 82 },
                { role: 'LM', x: 50, y: 18 },
                { role: 'LCM', x: 48, y: 36 },
                { role: 'RCM', x: 48, y: 64 },
                { role: 'RM', x: 50, y: 82 },
                { role: 'LST', x: 82, y: 42 },
                { role: 'RST', x: 82, y: 58 }
            ],
            '4-3-3': [
                { role: 'GK', x: 4, y: 50 },
                { role: 'LB', x: 28, y: 18 },
                { role: 'LCB', x: 24, y: 36 },
                { role: 'RCB', x: 24, y: 64 },
                { role: 'RB', x: 28, y: 82 },
                { role: 'LCM', x: 54, y: 32 },
                { role: 'CM', x: 48, y: 50 },
                { role: 'RCM', x: 54, y: 68 },
                { role: 'LW', x: 76, y: 18 },
                { role: 'ST', x: 86, y: 50 },
                { role: 'RW', x: 76, y: 82 }
            ],
            '3-5-2': [
                { role: 'GK', x: 4, y: 50 },
                { role: 'LCB', x: 24, y: 34 },
                { role: 'CB', x: 22, y: 50 },
                { role: 'RCB', x: 24, y: 66 },
                { role: 'LM', x: 58, y: 18 },
                { role: 'LCM', x: 52, y: 34 },
                { role: 'CM', x: 46, y: 50 },
                { role: 'RCM', x: 52, y: 66 },
                { role: 'RM', x: 58, y: 82 },
                { role: 'LST', x: 82, y: 42 },
                { role: 'RST', x: 82, y: 58 }
            ],
            '3-4-3': [
                { role: 'GK', x: 4, y: 50 },
                { role: 'LCB', x: 27, y: 18 },
                { role: 'CB', x: 20, y: 50 },
                { role: 'RCB', x: 27, y: 82 },
                { role: 'LM', x: 50, y: 16 },
                { role: 'LCM', x: 50, y: 38 },
                { role: 'RCM', x: 50, y: 62 },
                { role: 'RM', x: 50, y: 84 },
                { role: 'LW', x: 76, y: 18 },
                { role: 'CF', x: 86, y: 50 },
                { role: 'RW', x: 76, y: 82 }
            ]
        };

        const formationPositions = formations[formation] || formations['4-4-2'];
        
        // Retourner la position selon l'index du joueur
        // Limite à 11 positions maximum
        if (index < formationPositions.length) {
            console.log(`[getPlayerPosition] Joueur index ${index} -> position:`, formationPositions[index]);
            return { x: formationPositions[index].x, y: formationPositions[index].y };
        }
        
        // Si plus de 11 joueurs, on les met au centre
        console.warn(`[getPlayerPosition] Index ${index} hors limites (max ${formationPositions.length})`);
        return { x: 50, y: 50 };
    }

    submitReport(matchId: string) {
        this.router.navigate(['/official/match-report', matchId]);
    }

    enterScore(matchId: string) {
        console.log('Saisir score pour le match:', matchId);
    }

    enterEvents(matchId: string) {
        console.log('Saisir événements pour le match:', matchId);
    }

    enterCards(matchId: string) {
        console.log('Saisir cartons pour le match:', matchId);
    }
}
