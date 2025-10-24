import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CoachPlayer, CoachMatch, CoachTeam, CoachStaffMember, CoachSeason, MatchFilterOptions, EnrichedMatch, CoachMatchResponse } from '../models/coach-api.model';

/**
 * Service centralisé pour tous les appels API de la vue Coach
 * Optimisé avec cache et intercepteurs pour stabilité API
 */
@Injectable({
    providedIn: 'root'
})
export class CoachService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    // Cache pour éviter les requêtes répétitives (TTL: 5 minutes)
    private readonly CACHE_DURATION = 5 * 60 * 1000;

    // ============================================
    // TEAM METHODS
    // ============================================

    /**
     * Récupère les informations complètes d'une équipe
     * Avec cache automatique pour éviter les requêtes répétitives
     */
    getTeamById(teamId: string): Observable<CoachTeam> {
        return this.http.get<CoachTeam>(`${this.baseUrl}/teams/${teamId}`).pipe(
            shareReplay(1, this.CACHE_DURATION), // Cache 5 minutes
            catchError((err) => {
                console.error("Erreur lors du chargement de l'équipe:", err);
                throw err;
            })
        );
    }

    // ============================================
    // PLAYER METHODS
    // ============================================

    /**
     * Récupère tous les joueurs d'une équipe
     * Endpoint: GET /v1/teams/{teamId}/players
     * Avec cache automatique et réponse normalisée
     */
    getTeamPlayers(teamId: string): Observable<CoachPlayer[]> {
        console.log('👥 [COACH SERVICE] Récupération des joueurs de l\'équipe:', teamId);
        
        return this.http.get<any>(`${this.baseUrl}/teams/${teamId}/players`).pipe(
            map((response) => {
                console.log('✅ [COACH SERVICE] Réponse brute joueurs:', response);
                // Le vrai endpoint retourne { status: true, data: { players: [...] }, message: "..." }
                const players = response?.data?.players || response?.players || response?.data || [];
                console.log('✅ [COACH SERVICE] Joueurs extraits:', players.length);
                return players;
            }),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [COACH SERVICE] Erreur lors du chargement des joueurs:', err);
                return of([]);
            })
        );
    }

    /**
     * Récupère les détails complets d'un joueur
     * Avec cache automatique pour éviter les requêtes répétitives
     */
    getPlayerDetails(playerId: string): Observable<CoachPlayer> {
        return this.http.get<CoachPlayer>(`${this.baseUrl}/players/show/${playerId}`).pipe(
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('Erreur lors du chargement du joueur:', err);
                throw err;
            })
        );
    }

    // ============================================
    // MATCH METHODS
    // ============================================

    /**
     * Récupère tous les matchs d'une équipe avec filtres optionnels (version paginée)
     * Avec cache automatique et réponse normalisée par l'intercepteur
     */
    getTeamMatchesPaginated(teamId: string, filters?: MatchFilterOptions): Observable<CoachMatchResponse> {
        // Construire les paramètres de requête
        let params = new HttpParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params = params.set(key, value.toString());
                }
            });
        }

        return this.http.get<CoachMatchResponse>(`${this.baseUrl}/teams/${teamId}/matches`, { params }).pipe(
            catchError((err) => {
                console.error('Erreur lors du chargement des matchs paginés:', err);
                return of({
                    data: [],
                    meta: {
                        current_page: 1,
                        per_page: 15,
                        total: 0,
                        last_page: 1,
                        from: 0,
                        to: 0
                    },
                    links: {
                        first: null,
                        last: null,
                        prev: null,
                        next: null
                    }
                });
            })
        );
    }

    /**
     * Récupère une page spécifique de matchs en utilisant les liens de pagination
     * Peut inclure des paramètres supplémentaires (filtres) à ajouter à l'URL
     */
    getTeamMatchesByUrl(url: string, additionalParams?: Record<string, any>): Observable<CoachMatchResponse> {
        // Construire l'URL avec les paramètres supplémentaires si fournis
        let finalUrl = url;

        if (additionalParams && Object.keys(additionalParams).length > 0) {
            const urlObj = new URL(url);
            Object.entries(additionalParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    urlObj.searchParams.set(key, value.toString());
                }
            });
            finalUrl = urlObj.toString();
            console.log('🔗 [COACH SERVICE] URL avec paramètres additionnels:', finalUrl);
        }

        return this.http.get<CoachMatchResponse>(finalUrl).pipe(
            catchError((err) => {
                console.error('Erreur lors du chargement des matchs par URL:', err, additionalParams);
                return of({
                    data: [],
                    meta: {
                        current_page: 1,
                        per_page: 15,
                        total: 0,
                        last_page: 1,
                        from: 0,
                        to: 0
                    },
                    links: {
                        first: null,
                        last: null,
                        prev: null,
                        next: null
                    }
                });
            })
        );
    }

    /**
     * Récupère tous les matchs d'une équipe avec filtres optionnels
     * Utilise la version paginée en interne mais retourne le tableau de données
     * @deprecated Utilisez getTeamMatchesPaginated pour accéder aux métadonnées de pagination
     */
    getTeamMatches(teamId: string, filters?: MatchFilterOptions): Observable<CoachMatch[]> {
        return this.getTeamMatchesPaginated(teamId, filters).pipe(
            map((response) => response.data),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('Erreur lors du chargement des matchs:', err);
                return of([]);
            })
        );
    }

    /**
     * Récupère uniquement les matchs à venir (planned ou not_started)
     */
    getUpcomingMatches(teamId: string, filters?: Omit<MatchFilterOptions, 'status'>): Observable<CoachMatch[]> {
        // Note: Pour les matchs à venir, on ne filtre pas par statut ici car on trie par date
        // Le filtrage "à venir" se fait côté client avec enrichMatches
        return this.getTeamMatches(teamId, { ...filters }).pipe(
            map((matches) => {
                // Filtrer les matchs futurs
                const now = new Date().getTime();
                return matches.filter((m) => {
                    const matchDate = this.parseFrenchDate(m.scheduled_at);
                    return matchDate ? matchDate.getTime() > now : false;
                });
            })
        );
    }

    /**
     * Récupère uniquement les matchs passés (finished, completed, validated)
     */
    getPastMatches(teamId: string, filters?: Omit<MatchFilterOptions, 'status'>): Observable<CoachMatch[]> {
        // Note: Pour les matchs passés, on peut filtrer par plusieurs statuts ou par date
        return this.getTeamMatches(teamId, { ...filters }).pipe(
            map((matches) => {
                // Filtrer les matchs passés
                const now = new Date().getTime();
                return matches.filter((m) => {
                    const matchDate = this.parseFrenchDate(m.scheduled_at);
                    return matchDate ? matchDate.getTime() <= now : false;
                });
            })
        );
    }

    /**
     * Récupère le prochain match à jouer
     */
    getNextMatch(teamId: string): Observable<CoachMatch | null> {
        return this.getUpcomingMatches(teamId).pipe(
            map((matches) => {
                if (!matches || matches.length === 0) {
                    return null;
                }

                // Trier par date et prendre le premier
                const sorted = matches.sort((a, b) => {
                    const dateA = new Date(a.scheduled_at).getTime();
                    const dateB = new Date(b.scheduled_at).getTime();
                    return dateA - dateB;
                });

                return sorted[0];
            })
        );
    }

    // ============================================
    // SEASON METHODS
    // ============================================

    /**
     * Récupère les saisons d'une équipe
     * Avec cache automatique pour éviter les requêtes répétitives
     */
    getTeamSeasons(teamId: string): Observable<CoachSeason[]> {
        return this.http.get<CoachSeason[]>(`${this.baseUrl}/teams/${teamId}/seasons`).pipe(
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('Erreur lors du chargement des saisons:', err);
                return of([]);
            })
        );
    }

    // ============================================
    // STAFF METHODS
    // ============================================

    /**
     * Récupère le staff d'une équipe
     * Endpoint: GET /v1/teams/{teamId}/staffs
     * Avec cache automatique et réponse normalisée
     */
    getTeamStaff(teamId: string): Observable<CoachStaffMember[]> {
        console.log('👔 [COACH SERVICE] Récupération du staff de l\'équipe:', teamId);
        
        return this.http.get<any>(`${this.baseUrl}/teams/${teamId}/staffs`).pipe(
            map((response) => {
                console.log('✅ [COACH SERVICE] Réponse brute staff:', response);
                // Le vrai endpoint retourne { status: true, data: { staffs: [...] }, message: "..." }
                const staffs = response?.data?.staffs || response?.staffs || response?.data || [];
                console.log('✅ [COACH SERVICE] Staff extrait:', staffs.length);
                return staffs;
            }),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [COACH SERVICE] Erreur lors du chargement du staff:', err);
                return of([]);
            })
        );
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    /**
     * Analyse et parse une date en format français DD/MM/YYYY ou DD/MM/YYYY HH:mm
     * ou ISO. Retourne une Date valide ou null si impossible à parser.
     */
    parseFrenchDate(dateString: string): Date | null {
        if (!dateString || typeof dateString !== 'string') {
            return null;
        }

        // Essayer d'abord avec le constructeur Date (ISO, etc.)
        const isoDate = new Date(dateString);
        if (!isNaN(isoDate.getTime())) {
            return isoDate;
        }

        // Essayer le format DD/MM/YYYY
        const ddmmyyyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyyMatch) {
            const [, day, month, year] = ddmmyyyyMatch;
            // Note: Constructor Date uses 0-indexed months
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
        }

        // Essayer le format DD/MM/YYYY HH:mm
        const ddmmyyyyhhmmMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})$/);
        if (ddmmyyyyhhmmMatch) {
            const [, day, month, year, hours, minutes] = ddmmyyyyhhmmMatch;
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
        }

        // Format non reconnu
        console.warn('⚠️ [DATE PARSER] Unable to parse date:', dateString);
        return null;
    }

    /**
     * Enrichit les matchs avec des données calculées (adversaire, domicile/extérieur, etc.)
     */
    enrichMatches(matches: CoachMatch[], teamId: string): EnrichedMatch[] {
        const now = new Date();

        return matches.map((match) => {
            const isHome = match.team_one_id === teamId || match.home_club_id === teamId;

            // Validate date before creating Date object
            let matchDate: Date | null = null;
            let daysUntilMatch: number | undefined = undefined;

            if (match.scheduled_at) {
                // Use the French date parser to handle DD/MM/YYYY format and ISO dates
                matchDate = this.parseFrenchDate(match.scheduled_at);
                if (matchDate) {
                    daysUntilMatch = Math.ceil((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                } else {
                    console.warn('⚠️ [COACH SERVICE] Could not parse scheduled_at date:', match.scheduled_at, 'for match:', match.id);
                }
            } else {
                console.warn('⚠️ [COACH SERVICE] Missing scheduled_at for match:', match.id);
            }

            return {
                ...match,
                isHome,
                opponent: isHome ? match.team_two : match.team_one,
                myTeam: isHome ? match.team_one : match.team_two,
                matchDate,
                daysUntilMatch,
                isUpcoming: matchDate ? matchDate > now : false,
                isPast: matchDate ? matchDate < now : false
            };
        });
    }

    /**
     * Filtre les matchs par période (aujourd'hui, cette semaine, ce mois, etc.)
     */
    filterMatchesByPeriod(matches: EnrichedMatch[], period: 'today' | 'week' | 'month' | 'all'): EnrichedMatch[] {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        switch (period) {
            case 'today':
                const endOfToday = new Date(now);
                endOfToday.setHours(23, 59, 59, 999);
                return matches.filter((m) => m.matchDate && m.matchDate >= now && m.matchDate <= endOfToday);

            case 'week':
                const endOfWeek = new Date(now);
                endOfWeek.setDate(endOfWeek.getDate() + 7);
                return matches.filter((m) => m.matchDate && m.matchDate >= now && m.matchDate <= endOfWeek);

            case 'month':
                const endOfMonth = new Date(now);
                endOfMonth.setMonth(endOfMonth.getMonth() + 1);
                return matches.filter((m) => m.matchDate && m.matchDate >= now && m.matchDate <= endOfMonth);

            case 'all':
            default:
                return matches;
        }
    }

    /**
     * Trie les matchs
     */
    sortMatches(matches: EnrichedMatch[], sortBy: 'date_asc' | 'date_desc' | 'competition' | 'opponent'): EnrichedMatch[] {
        return [...matches].sort((a, b) => {
            switch (sortBy) {
                case 'date_asc':
                    const aTime = a.matchDate ? a.matchDate.getTime() : 0;
                    const bTime = b.matchDate ? b.matchDate.getTime() : 0;
                    return aTime - bTime;

                case 'date_desc':
                    const bTimeDesc = b.matchDate ? b.matchDate.getTime() : 0;
                    const aTimeDesc = a.matchDate ? a.matchDate.getTime() : 0;
                    return bTimeDesc - aTimeDesc;

                case 'competition':
                    return (a.pool?.name || '').localeCompare(b.pool?.name || '');

                case 'opponent':
                    return (a.opponent?.name || '').localeCompare(b.opponent?.name || '');

                default:
                    return 0;
            }
        });
    }

    /**
     * Calcule l'âge d'un joueur
     */
    calculatePlayerAge(birthDate: string): number {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Détermine le statut du contrat d'un joueur
     */
    determineContractStatus(contractEndDate?: string): 'VALID' | 'EXPIRING' | 'EXPIRED' {
        if (!contractEndDate) return 'VALID';

        const endDate = new Date(contractEndDate);
        const now = new Date();
        const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);

        if (endDate < now) return 'EXPIRED';
        if (endDate <= sixMonthsFromNow) return 'EXPIRING';
        return 'VALID';
    }

    /**
     * Groupe les matchs par saison
     */
    groupMatchesBySeason(matches: EnrichedMatch[]): Map<string, EnrichedMatch[]> {
        const grouped = new Map<string, EnrichedMatch[]>();

        matches.forEach((match) => {
            const seasonId = match.season?.id || 'unknown';
            if (!grouped.has(seasonId)) {
                grouped.set(seasonId, []);
            }
            grouped.get(seasonId)!.push(match);
        });

        return grouped;
    }

    /**
     * Groupe les matchs par compétition
     */
    groupMatchesByCompetition(matches: EnrichedMatch[]): Map<string, EnrichedMatch[]> {
        const grouped = new Map<string, EnrichedMatch[]>();

        matches.forEach((match) => {
            const competitionId = match.pool?.id || 'unknown';
            if (!grouped.has(competitionId)) {
                grouped.set(competitionId, []);
            }
            grouped.get(competitionId)!.push(match);
        });

        return grouped;
    }
}
