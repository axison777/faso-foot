import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatchService } from '../../service/match.service';
import { AuthService } from '../../service/auth.service';

@Component({
    selector: 'app-coach-matches',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        CardModule,
        ButtonModule,
        DropdownModule,
        DialogModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './coach-matches.component.html',
    styleUrls: ['./coach-matches.component.scss']
})
export class CoachMatchesComponent implements OnInit {
    @Input() teamId?: string;
    
    private matchService = inject(MatchService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    matches = signal<any[]>([]);
    filteredMatches = signal<any[]>([]);
    closestMatch = signal<any>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    // Filtres
    seasons = signal<any[]>([]);
    competitions = signal<any[]>([]);
    selectedSeason = signal<any>(null);
    selectedCompetition = signal<any>(null);
    sortBy = signal<string>('date');

    // Modal
    showDetailsModal = signal(false);
    selectedMatch = signal<any>(null);

    sortOptions = [
        { label: 'Date (Plus récent)', value: 'date' },
        { label: 'Compétition', value: 'competition' },
        { label: 'Saison', value: 'season' }
    ];

    ngOnInit() {
        this.loadMatches();
    }

    loadMatches() {
        this.loading.set(true);
        this.error.set(null);

        const currentUser = this.authService.currentUser;
        const userTeamId = this.teamId || currentUser?.team_id;

        console.log('⚽ [COACH MATCHES] Chargement des matchs');
        console.log('👤 [COACH MATCHES] User:', currentUser);
        console.log('🏟️ [COACH MATCHES] Team ID:', userTeamId);
        console.log('📌 [COACH MATCHES] Team ID depuis @Input:', this.teamId);

        if (!userTeamId) {
            this.error.set('Aucune équipe assignée à votre compte');
            this.loading.set(false);
            return;
        }

        this.matchService.getAllMatchesForTeam(userTeamId).subscribe({
            next: (rawMatches: any[]) => {
                console.log('✅ [COACH MATCHES] Matchs reçus:', rawMatches);
                console.log('📊 [COACH MATCHES] Nombre de matchs:', rawMatches?.length || 0);

                if (!rawMatches || rawMatches.length === 0) {
                    console.warn('⚠️ [COACH MATCHES] Aucun match reçu du backend');
                    this.loading.set(false);
                    return;
                }

                // Ajouter les infos calculées directement sur les matchs
                rawMatches.forEach((match: any, index: number) => {
                    console.log(`📝 [MATCH ${index + 1}]`, {
                        team_one_id: match.team_one_id,
                        home_club_id: match.home_club_id,
                        userTeamId: userTeamId,
                        scheduled_at: match.scheduled_at,
                        has_team_one: !!match.team_one,
                        has_team_two: !!match.team_two
                    });

                    match.isMyTeamHome = match.team_one_id === userTeamId || match.home_club_id === userTeamId;
                    match.myTeam = match.isMyTeamHome ? match.team_one : match.team_two;
                    match.opponent = match.isMyTeamHome ? match.team_two : match.team_one;
                    match.matchDate = new Date(match.scheduled_at);
                    
                    console.log(`✅ [MATCH ${index + 1}] Traité:`, {
                        isMyTeamHome: match.isMyTeamHome,
                        opponent: match.opponent?.name,
                        matchDate: match.matchDate
                    });
                });

                this.matches.set(rawMatches);
                this.extractFilters(rawMatches);
                this.applyFilters();
                this.findClosestMatch();

                console.log('✅ [COACH MATCHES] Traitement terminé');
                console.log('📊 [COACH MATCHES] Matchs filtrés:', this.filteredMatches().length);
                console.log('⭐ [COACH MATCHES] Match le plus proche:', this.closestMatch());

                this.loading.set(false);
            },
            error: (err) => {
                console.error('❌ [COACH MATCHES] Erreur:', err);
                this.error.set('Impossible de charger les matchs');
                this.loading.set(false);
            }
        });
    }

    extractFilters(matches: any[]) {
        const seasonsMap = new Map();
        matches.forEach(match => {
            if (match.season && !seasonsMap.has(match.season.id)) {
                seasonsMap.set(match.season.id, {
                    id: match.season.id,
                    label: `Saison ${new Date(match.season.start_date).getFullYear()}/${new Date(match.season.end_date).getFullYear()}`,
                    data: match.season
                });
            }
        });
        this.seasons.set(Array.from(seasonsMap.values()));

        const competitionsMap = new Map();
        matches.forEach(match => {
            if (match.pool && !competitionsMap.has(match.pool.id)) {
                competitionsMap.set(match.pool.id, {
                    id: match.pool.id,
                    name: match.pool.name
                });
            }
        });
        this.competitions.set(Array.from(competitionsMap.values()));
    }

    applyFilters() {
        let filtered = [...this.matches()];

        if (this.selectedSeason()) {
            filtered = filtered.filter(m => m.season?.id === this.selectedSeason().id);
        }

        if (this.selectedCompetition()) {
            filtered = filtered.filter(m => m.pool?.id === this.selectedCompetition().id);
        }

        filtered = this.sortMatches(filtered);
        this.filteredMatches.set(filtered);
    }

    sortMatches(matches: any[]): any[] {
        const sortBy = this.sortBy();

        return [...matches].sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return a.matchDate.getTime() - b.matchDate.getTime();
                case 'competition':
                    return (a.pool?.name || '').localeCompare(b.pool?.name || '');
                case 'season':
                    return (a.season?.start_date || '').localeCompare(b.season?.start_date || '');
                default:
                    return 0;
            }
        });
    }

    findClosestMatch() {
        const now = new Date();
        const upcomingMatches = this.filteredMatches().filter(m => m.matchDate >= now);

        if (upcomingMatches.length > 0) {
            const closest = upcomingMatches.reduce((prev, curr) => {
                return curr.matchDate < prev.matchDate ? curr : prev;
            });
            this.closestMatch.set(closest);
        } else {
            this.closestMatch.set(null);
        }
    }

    onSeasonChange() {
        this.applyFilters();
        this.findClosestMatch();
    }

    onCompetitionChange() {
        this.applyFilters();
        this.findClosestMatch();
    }

    onSortChange() {
        this.applyFilters();
    }

    resetFilters() {
        this.selectedSeason.set(null);
        this.selectedCompetition.set(null);
        this.sortBy.set('date');
        this.applyFilters();
        this.findClosestMatch();
    }

    openMatchDetails(match: any) {
        this.selectedMatch.set(match);
        this.showDetailsModal.set(true);
    }

    closeDetailsModal() {
        this.showDetailsModal.set(false);
        this.selectedMatch.set(null);
    }

    refreshMatches() {
        this.messageService.add({
            severity: 'info',
            summary: 'Actualisation',
            detail: 'Rechargement des matchs...'
        });
        this.loadMatches();
    }

    getDaysUntilMatch(match: any): number {
        const now = new Date();
        const diff = match.matchDate.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    isUpcoming(match: any): boolean {
        return match.matchDate > new Date();
    }

    isPast(match: any): boolean {
        return match.matchDate < new Date();
    }

    getMatchStatus(match: any): string {
        const days = this.getDaysUntilMatch(match);
        if (days < 0) return 'Terminé';
        if (days === 0) return "Aujourd'hui";
        if (days === 1) return 'Demain';
        return `Dans ${days} jours`;
    }
}
