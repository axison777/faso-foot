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
import { PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CoachService } from '../../service/coach.service';
import { AuthService } from '../../service/auth.service';
import { EnrichedMatch, MatchStatus, getMatchStatusLabel, getMatchStatusClass, CoachMatchResponse } from '../../models/coach-api.model';

@Component({
    selector: 'app-coach-matches',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, CardModule, ButtonModule, DropdownModule, DialogModule, ToastModule, InputTextModule, PaginatorModule, TooltipModule],
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
    loadingSeasons = signal(false);
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

    // Pagination côté serveur
    currentPage = signal(0); // 0-indexed pour PrimeNG Paginator
    pageSize = signal(4); // 12 cartes par page (4x3 grid)
    totalRecords = signal(0); // Total des records côté serveur
    loadingPagination = signal(false);

    // Liens de pagination Laravel
    paginationLinks = signal<any>({
        first: null,
        last: null,
        prev: null,
        next: null
    });

    // État du chargement des actions de pagination
    loadingFirst = signal(false);
    loadingPrev = signal(false);
    loadingNext = signal(false);
    loadingLast = signal(false);

    // État interne (pour gérer les filtres côté client)
    allMatches = signal<EnrichedMatch[]>([]); // Tous les matchs du serveur
    filteredMatchesSignal = signal<EnrichedMatch[]>([]); // Matchs filtrés côté client

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
        { label: "Aujourd'hui", value: 'today' },
        { label: 'Cette semaine', value: 'week' },
        { label: 'Ce mois', value: 'month' }
    ];

    ngOnInit() {
        // Charger les saisons en premier
        this.loadSeasons().then(() => {
            // Une fois les saisons chargées, charger les matchs
            this.loadMatches();
        });

        // Écouter les query params pour ouvrir automatiquement le modal si un matchId est présent
        this.route.queryParams.subscribe((params) => {
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

    /**
     * Charge les saisons de l'équipe pour les filtres
     */
    async loadSeasons(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.loadingSeasons.set(true);

            const currentUser = this.authService.currentUser;
            const userTeamId = this.teamId || currentUser?.team_id;

            console.log('📅 [COACH MATCHES] Chargement des saisons');
            console.log('🏟️ [COACH MATCHES] Team ID pour saisons:', userTeamId);

            if (!userTeamId) {
                this.loadingSeasons.set(false);
                resolve();
                return;
            }

            this.coachService.getTeamSeasons(userTeamId).subscribe({
                next: (response) => {
                    console.log('✅ [COACH MATCHES] Réponse saisons reçue:', response);

                    // Gérer les réponses wrappées (cas où l'API retourne {seasons: [...]} ou {data: [...]} ou directement le tableau)
                    let seasons = Array.isArray(response) ? response : (response as any)?.seasons || (response as any)?.data || [];

                    if (!Array.isArray(seasons)) {
                        console.error('❌ [COACH MATCHES] Structure de réponse inattendue pour les saisons:', response);
                        this.seasons.set([]);
                        this.loadingSeasons.set(false);
                        resolve();
                        return;
                    }

                    if (seasons.length === 0) {
                        console.warn('⚠️ [COACH MATCHES] Aucune saison reçue du backend');
                        this.seasons.set([]);
                        this.loadingSeasons.set(false);
                        resolve();
                        return;
                    }

                    // Formater les saisons pour le dropdown
                    const formattedSeasons = seasons.map((season) => ({
                        id: season.id,
                        label: `${season.league?.name} ${new Date(season.start_date).getFullYear()}/${new Date(season.end_date).getFullYear()}`,
                        data: season
                    }));

                    this.seasons.set(formattedSeasons);

                    console.log('✅ [COACH MATCHES] Saisons formatées:', formattedSeasons.length);
                    this.loadingSeasons.set(false);
                    resolve();
                },
                error: (err) => {
                    console.error('❌ [COACH MATCHES] Erreur lors du chargement des saisons:', err);
                    this.seasons.set([]);
                    this.loadingSeasons.set(false);
                    resolve(); // Continue même si les saisons n'ont pas pu être chargées
                }
            });
        });
    }

    /**
     * Charge les matchs avec pagination côté serveur
     */
    loadMatches(resetPage = false) {
        this.loading.set(true);
        this.error.set(null);

        // Reset page si demandé ou si changing filters
        if (resetPage) {
            this.currentPage.set(0);
        }

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

        // Paramètres de pagination et filtres API
        const filters: any = {
            page: this.currentPage() + 1, // Pagination API (1-indexed)
            per_page: this.pageSize()
        };

        // Filtres côté serveur (API) - seulement si explicitement sélectionnés par l'utilisateur
        if (this.selectedSeason() && this.selectedSeason().id) {
            filters.season_id = this.selectedSeason().id;
        }
        if (this.selectedCompetition() && this.selectedCompetition().id) {
            filters.pool_id = this.selectedCompetition().id;
        }
        if (this.selectedStatus() && this.selectedStatus() !== 'all') {
            filters.status = this.selectedStatus();
        }

        console.log('📄 [COACH MATCHES] Pagination:', { page: filters.page, per_page: filters.per_page });
        console.log('🎯 [COACH MATCHES] Filtres API appliqués:', filters);

        // ✅ UTILISATION de l'API paginée maintenant que l'intercepteur est corrigé
        this.coachService.getTeamMatchesPaginated(userTeamId, filters).subscribe({
            next: (paginatedResponse: CoachMatchResponse) => {
                console.log('✅ [COACH MATCHES] Réponse paginée reçue:', paginatedResponse);

                if (!paginatedResponse.data || paginatedResponse.data.length === 0) {
                    console.warn('⚠️ [COACH MATCHES] Aucun match reçu du backend');
                    this.allMatches.set([]);
                    this.totalRecords.set(0);
                    this.matches.set([]);
                    this.filteredMatches.set([]);
                    this.closestMatch.set(null);
                    this.loading.set(false);
                    return;
                }

                // Enrichir les matchs de cette page
                const enrichedMatches = this.coachService.enrichMatches(paginatedResponse.data, userTeamId);

                // Pour la pagination côté serveur, on travaille seulement avec les matchs de la page courante
                this.allMatches.set(enrichedMatches); // Contiendra seulement la page actuelle
                this.totalRecords.set(paginatedResponse.meta.total);

                // Stocker les liens de pagination Laravel
                this.paginationLinks.set(paginatedResponse.links);

                // Mettre à jour la page actuelle basée sur les métadonnées
                this.currentPage.set(paginatedResponse.meta.current_page - 1); // Convertir en 0-indexed pour PrimeNG

                // Extraire les filtres disponibles depuis cette page (pour éviter de faire trop d'appels API)
                this.extractFilters(enrichedMatches);

                // Pour la pagination serveur, on utilise directement les matchs enrichis de cette page
                this.matches.set(enrichedMatches);
                this.filteredMatches.set(enrichedMatches);

                // Trouver le match le plus proche parmi tous les matchs déjà chargés
                // Note: Cette logique pourrait nécessiter un appel séparé si besoin
                this.findClosestMatch();

                // console.log('✅ [COACH MATCHES] Traitement terminé avec pagination serveur');
                // console.log('📊 [COACH MATCHES] Statistiques pagination:', {
                //     page: paginatedResponse.meta.current_page,
                //     totalPages: paginatedResponse.meta.last_page,
                //     totalRecords: paginatedResponse.meta.total,
                //     perPage: paginatedResponse.meta.per_page,
                //     itemsOnThisPage: enrichedMatches.length
                // });

                this.loading.set(false);
            },
            error: (err) => {
                console.error('❌ [COACH MATCHES] Erreur:', err);
                this.error.set('Impossible de charger les matchs');
                this.loading.set(false);
            }
        });
    }

    /**
     * Navigation avec les liens de pagination Laravel
     */
    goToFirstPage() {
        const firstUrl = this.paginationLinks().first;
        if (firstUrl) {
            this.loadingFirst.set(true);
            this.loadMatchesFromUrl(firstUrl);
        }
    }

    goToPreviousPage() {
        const prevUrl = this.paginationLinks().prev;
        if (prevUrl) {
            this.loadingPrev.set(true);
            this.loadMatchesFromUrl(prevUrl);
        }
    }

    getLegLabel(leg: 'first_leg' | 'second_leg' | 'second_led'): string {
        const labels: Record<'first_leg' | 'second_leg' | 'second_led', string> = {
            first_leg: 'ALLER',
            second_leg: 'RETOUR',
            second_led: 'RETOUR'
        };

        return labels[leg] || leg;
    }

    goToNextPage() {
        const nextUrl = this.paginationLinks().next;
        if (nextUrl) {
            this.loadingNext.set(true);
            this.loadMatchesFromUrl(nextUrl);
        }
    }

    goToLastPage() {
        const lastUrl = this.paginationLinks().last;
        if (lastUrl) {
            this.loadingLast.set(true);
            this.loadMatchesFromUrl(lastUrl);
        }
    }

    /**
     * Construit les paramètres de filtres actuels pour la pagination
     */
    private getCurrentFilterParams(): Record<string, any> {
        const params: Record<string, any> = {
            per_page: this.pageSize()
        };

        // Ajouter les filtres actifs
        if (this.selectedSeason() && this.selectedSeason().id) {
            params['season_id'] = this.selectedSeason().id;
        }
        if (this.selectedCompetition() && this.selectedCompetition().id) {
            params['pool_id'] = this.selectedCompetition().id;
        }
        if (this.selectedStatus() && this.selectedStatus() !== 'all') {
            params['status'] = this.selectedStatus();
        }

        return params;
    }

    /**
     * Charge les matchs depuis une URL de pagination
     */
    private loadMatchesFromUrl(url: string) {
        const currentUser = this.authService.currentUser;
        const userTeamId = this.teamId || currentUser?.team_id;

        if (!userTeamId) {
            return;
        }

        // Récupérer les paramètres de filtres actuels
        const filterParams = this.getCurrentFilterParams();
        console.log('🔗 [COACH MATCHES] Chargement depuis URL:', url, 'avec filtres:', filterParams);

        this.coachService.getTeamMatchesByUrl(url, filterParams).subscribe({
            next: (paginatedResponse: CoachMatchResponse) => {
                console.log('✅ [COACH MATCHES] Réponse pagination URL reçue:', paginatedResponse);

                if (!paginatedResponse.data || paginatedResponse.data.length === 0) {
                    console.warn('⚠️ [COACH MATCHES] Aucun match dans cette page');
                    this.allMatches.set([]);
                    this.totalRecords.set(0);
                    this.matches.set([]);
                    this.filteredMatches.set([]);
                    this.closestMatch.set(null);
                } else {
                    // Enrichir les matchs de cette page
                    const enrichedMatches = this.coachService.enrichMatches(paginatedResponse.data, userTeamId);

                    // Mettre à jour les données
                    this.allMatches.set(enrichedMatches);
                    this.totalRecords.set(paginatedResponse.meta.total);

                    // Mettre à jour les liens de pagination
                    this.paginationLinks.set(paginatedResponse.links);

                    // Mettre à jour la page actuelle
                    this.currentPage.set(paginatedResponse.meta.current_page - 1);

                    // Utiliser les matchs enrichis
                    this.matches.set(enrichedMatches);
                    this.filteredMatches.set(enrichedMatches);

                    // Trouver le match le plus proche
                    this.findClosestMatch();

                    console.log('✅ [COACH MATCHES] Changement de page terminé:', {
                        page: paginatedResponse.meta.current_page,
                        total: paginatedResponse.meta.total
                    });
                }

                // Réinitialiser tous les indicateurs de chargement
                this.loadingFirst.set(false);
                this.loadingPrev.set(false);
                this.loadingNext.set(false);
                this.loadingLast.set(false);
            },
            error: (err) => {
                console.error('❌ [COACH MATCHES] Erreur lors du chargement par URL:', err);
                this.error.set('Impossible de charger la page demandée');

                // Réinitialiser tous les indicateurs de chargement
                this.loadingFirst.set(false);
                this.loadingPrev.set(false);
                this.loadingNext.set(false);
                this.loadingLast.set(false);
            }
        });
    }

    /**
     * Vérifie si les boutons de pagination sont disponibles
     */
    hasFirstLink(): boolean {
        return !!this.paginationLinks().first;
    }

    hasPrevLink(): boolean {
        return !!this.paginationLinks().prev;
    }

    hasNextLink(): boolean {
        return !!this.paginationLinks().next;
    }

    hasLastLink(): boolean {
        return !!this.paginationLinks().last;
    }

    /**
     * Applique la pagination côté client sur les matchs chargés
     */
    applyClientSidePagination() {
        const allMatches = this.allMatches();
        const startIndex = this.currentPage() * this.pageSize();
        const endIndex = startIndex + this.pageSize();

        // Appliquer les filtres côté client (période, recherche)
        let filtered = [...allMatches];

        // Filtrer par période (frontend)
        if (this.selectedPeriod() !== 'all') {
            filtered = this.coachService.filterMatchesByPeriod(filtered, this.selectedPeriod());
        }

        // Filtrer par recherche d'adversaire
        if (this.searchOpponent()) {
            const search = this.searchOpponent().toLowerCase();
            filtered = filtered.filter((m) => m.opponent?.name.toLowerCase().includes(search) || m.opponent?.abbreviation?.toLowerCase().includes(search));
        }

        // Trier
        filtered = this.coachService.sortMatches(filtered, this.sortBy());

        // Mettre à jour les signaux
        this.filteredMatchesSignal.set(filtered);
        this.totalRecords.set(filtered.length);

        // Pagination: prendre seulement la page courante
        const pageMatches = filtered.slice(startIndex, endIndex);
        this.matches.set(pageMatches);
        this.filteredMatches.set(pageMatches);
    }

    extractFilters(matches: any[]) {
        // Les saisons sont maintenant chargées séparement via loadSeasons()
        // Ici on extrait seulement les compétitions depuis les matchs

        const competitionsMap = new Map();
        matches.forEach((match) => {
            if (match.pool && !competitionsMap.has(match.pool.id)) {
                competitionsMap.set(match.pool.id, {
                    id: match.pool.id,
                    name: match.pool.name
                });
            }
        });
        this.competitions.set(Array.from(competitionsMap.values()));
    }

    findClosestMatch() {
        const upcomingMatches = this.filteredMatches().filter((m) => m.isUpcoming && m.matchDate);

        if (upcomingMatches.length > 0) {
            const closest = upcomingMatches.reduce((prev, curr) => {
                return curr.matchDate! < prev.matchDate! ? curr : prev;
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

    /**
     * Méthode appelée lors du changement de page par PrimeNG Paginator
     */
    onPageChange(event: any) {
        this.currentPage.set(event.page);
        this.loadMatches(); // Recharger la page depuis le serveur
        console.log('📄 [COACH MATCHES] Changement de page:', event.page + 1);
    }

    /**
     * Applique les filtres côté serveur et met à jour la pagination
     */
    onPeriodChange() {
        // Note: Les filtres côté client (période, recherche, tri) ne sont plus supportés
        // avec la pagination côté serveur. Il faudrait implémenter ces filtres côté serveur.
        console.log('⚠️ [COACH MATCHES] Filtrage par période non supporté côté serveur');
        this.messageService.add({
            severity: 'warn',
            summary: 'Filtrage limité',
            detail: "Le filtrage par période n'est disponible que pour les données déjà chargées"
        });
    }

    onSearchChange() {
        // Note: La recherche côté client n'est plus supportée avec la pagination côté serveur
        // Il faudrait implémenter la recherche côté serveur
        console.log('⚠️ [COACH MATCHES] Recherche non supportée côté serveur');
        this.messageService.add({
            severity: 'warn',
            summary: 'Recherche limitée',
            detail: "La recherche n'est disponible que pour les données déjà chargées"
        });
    }

    onSortChange() {
        // Note: Le tri côté client n'est plus supporté avec la pagination côté serveur
        // Il faudrait implémenter le tri côté serveur
        console.log('⚠️ [COACH MATCHES] Tri non supporté côté serveur');
        this.messageService.add({
            severity: 'warn',
            summary: 'Tri limité',
            detail: "Le tri n'est disponible que pour les données déjà chargées"
        });
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
            detail: 'Rechargement des données...'
        });
        // Recharger les saisons puis les matchs
        this.loadSeasons().then(() => {
            this.loadMatches();
        });
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
        const match = this.filteredMatches().find((m) => m.id === matchId);
        if (match) {
            console.log('✅ [COACH MATCHES] Match trouvé, ouverture du modal:', match);
            this.openMatchDetails(match);
        } else {
            console.warn("⚠️ [COACH MATCHES] Match non trouvé avec l'ID:", matchId);
            this.messageService.add({
                severity: 'warn',
                summary: 'Match non trouvé',
                detail: "Le match demandé n'a pas été trouvé dans la liste"
            });
        }
    }

    /**
     * Calcule le nombre total de pages
     */
    getTotalPages(): number {
        const total = this.totalRecords();
        const size = this.pageSize();
        return Math.ceil(total / size) || 1;
    }
}
