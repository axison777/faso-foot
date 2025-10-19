import { Component, OnInit, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { CoachService } from '../../service/coach.service';
import { AuthService } from '../../service/auth.service';
import { EnrichedMatch, MatchStatus, getMatchStatusLabel, getMatchStatusClass } from '../../models/coach-api.model';

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
        ToastModule,
        InputTextModule
    ],
    providers: [MessageService],
    templateUrl: './coach-matches.component.html',
    styleUrls: ['./coach-matches.component.scss']
})
export class CoachMatchesComponent implements OnInit {
    @Input() teamId?: string;
    
    private coachService = inject(CoachService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);
    private route = inject(ActivatedRoute);

    matches = signal<EnrichedMatch[]>([]);
    filteredMatches = signal<EnrichedMatch[]>([]);
    closestMatch = signal<EnrichedMatch | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    // Filtres
    seasons = signal<any[]>([]);
    competitions = signal<any[]>([]);
    selectedSeason = signal<any>(null);
    selectedCompetition = signal<any>(null);
    selectedStatus = signal<'all' | 'not_started' | 'in_progress' | 'finished' | 'cancelled' | 'postponed' | 'planned' | 'completed' | 'validated'>('all'); // Par défaut: tous les matchs
    selectedPeriod = signal<'today' | 'week' | 'month' | 'all'>('all');
    searchOpponent = signal<string>('');
    sortBy = signal<'date_asc' | 'date_desc' | 'competition' | 'opponent'>('date_asc');

    // Modal
    showDetailsModal = signal(false);
    selectedMatch = signal<EnrichedMatch | null>(null);

    sortOptions = [
        { label: 'Date (Plus proche en premier)', value: 'date_asc' },
        { label: 'Date (Plus loin en premier)', value: 'date_desc' },
        { label: 'Compétition', value: 'competition' },
        { label: 'Adversaire', value: 'opponent' }
    ];

    statusOptions = [
        { label: 'Tous les matchs', value: 'all' },
        { label: 'Non commencé', value: 'not_started' },
        { label: 'Planifié', value: 'planned' },
        { label: 'En cours', value: 'in_progress' },
        { label: 'Terminé', value: 'finished' },
        { label: 'Complété', value: 'completed' },
        { label: 'Validé', value: 'validated' },
        { label: 'Reporté', value: 'postponed' },
        { label: 'Annulé', value: 'cancelled' }
    ];

    periodOptions = [
        { label: 'Tous', value: 'all' },
        { label: 'Aujourd\'hui', value: 'today' },
        { label: 'Cette semaine', value: 'week' },
        { label: 'Ce mois', value: 'month' }
    ];

    ngOnInit() {
        this.loadMatches();
        
        // Écouter les query params pour ouvrir automatiquement le modal si un matchId est présent
        this.route.queryParams.subscribe(params => {
            const matchId = params['matchId'];
            if (matchId) {
                console.log('🔍 [COACH MATCHES] Ouverture automatique du match:', matchId);
                // Attendre que les matchs soient chargés avant d'ouvrir le modal
                setTimeout(() => {
                    this.openMatchFromId(matchId);
                }, 1000);
            }
        });
    }

    loadMatches() {
        this.loading.set(true);
        this.error.set(null);

        const currentUser = this.authService.currentUser;
        const userTeamId = this.teamId || currentUser?.team_id;

        console.log('⚽ [COACH MATCHES] Chargement des matchs');
        console.log('👤 [COACH MATCHES] User:', currentUser);
        console.log('🏟️ [COACH MATCHES] Team ID:', userTeamId);

        if (!userTeamId) {
            this.error.set('Aucune équipe assignée à votre compte');
            this.loading.set(false);
            return;
        }

        // Construire les filtres API
        const filters: any = {};
        if (this.selectedSeason()) {
            filters.season_id = this.selectedSeason().id;
        }
        if (this.selectedCompetition()) {
            filters.pool_id = this.selectedCompetition().id;
        }
        if (this.selectedStatus() !== 'all') {
            filters.status = this.selectedStatus();
        }
        
        // Ajouter pagination - récupérer tous les matchs
        filters.per_page = 1000; // Récupérer tous les matchs (ajustez selon vos besoins)

        // Charger les matchs avec filtres
        this.coachService.getTeamMatches(userTeamId, filters).subscribe({
            next: (rawMatches) => {
                console.log('✅ [COACH MATCHES] Matchs reçus:', rawMatches);
                console.log('📊 [COACH MATCHES] Nombre de matchs:', rawMatches?.length || 0);

                if (!rawMatches || rawMatches.length === 0) {
                    console.warn('⚠️ [COACH MATCHES] Aucun match reçu du backend');
                    this.matches.set([]);
                    this.filteredMatches.set([]);
                    this.loading.set(false);
                    return;
                }

                // Enrichir les matchs
                const enrichedMatches = this.coachService.enrichMatches(rawMatches, userTeamId);
                console.log('✅ [COACH MATCHES] Matchs enrichis:', enrichedMatches);

                this.matches.set(enrichedMatches);
                this.extractFilters(enrichedMatches);
                this.applyFilters();
                this.findClosestMatch();

                console.log('✅ [COACH MATCHES] Traitement terminé');
                console.log('📊 [COACH MATCHES] Matchs filtrés:', this.filteredMatches().length);

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

        // Filtrer par période (frontend)
        if (this.selectedPeriod() !== 'all') {
            filtered = this.coachService.filterMatchesByPeriod(filtered, this.selectedPeriod());
        }

        // Filtrer par recherche d'adversaire
        if (this.searchOpponent()) {
            const search = this.searchOpponent().toLowerCase();
            filtered = filtered.filter(m => 
                m.opponent?.name.toLowerCase().includes(search) ||
                m.opponent?.abbreviation?.toLowerCase().includes(search)
            );
        }

        // Trier
        filtered = this.coachService.sortMatches(filtered, this.sortBy());

        this.filteredMatches.set(filtered);
    }

    findClosestMatch() {
        const upcomingMatches = this.filteredMatches().filter(m => m.isUpcoming);

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
        this.loadMatches(); // Recharger avec le nouveau filtre API
    }

    onCompetitionChange() {
        this.loadMatches(); // Recharger avec le nouveau filtre API
    }

    onStatusChange() {
        this.loadMatches(); // Recharger avec le nouveau filtre API
    }

    onPeriodChange() {
        this.applyFilters();
        this.findClosestMatch();
    }

    onSearchChange() {
        this.applyFilters();
        this.findClosestMatch();
    }

    onSortChange() {
        this.applyFilters();
    }

    resetFilters() {
        this.selectedSeason.set(null);
        this.selectedCompetition.set(null);
        this.selectedStatus.set('all');
        this.selectedPeriod.set('all');
        this.searchOpponent.set('');
        this.sortBy.set('date_asc');
        this.loadMatches();
    }

    openMatchDetails(match: EnrichedMatch) {
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

    getDaysUntilMatch(match: EnrichedMatch): number {
        return match.daysUntilMatch || 0;
    }

    isUpcoming(match: EnrichedMatch): boolean {
        return match.isUpcoming;
    }

    isPast(match: EnrichedMatch): boolean {
        return match.isPast;
    }

    getMatchStatus(match: EnrichedMatch): string {
        const days = match.daysUntilMatch || 0;
        if (days < 0) return 'Terminé';
        if (days === 0) return "Aujourd'hui";
        if (days === 1) return 'Demain';
        return `Dans ${days} jours`;
    }

    /**
     * Retourne le label français pour le statut du match
     */
    getMatchStatusLabel(status: MatchStatus | undefined): string {
        return getMatchStatusLabel(status);
    }

    /**
     * Retourne la classe CSS pour le statut du match
     */
    getMatchStatusClass(status: MatchStatus | undefined): string {
        return getMatchStatusClass(status);
    }

    /**
     * Ouvre le modal de détails pour un match spécifique à partir de son ID
     */
    openMatchFromId(matchId: string) {
        const match = this.filteredMatches().find(m => m.id === matchId);
        if (match) {
            console.log('✅ [COACH MATCHES] Match trouvé, ouverture du modal:', match);
            this.openMatchDetails(match);
        } else {
            console.warn('⚠️ [COACH MATCHES] Match non trouvé avec l\'ID:', matchId);
            this.messageService.add({
                severity: 'warn',
                summary: 'Match non trouvé',
                detail: 'Le match demandé n\'a pas été trouvé dans la liste'
            });
        }
    }
}
