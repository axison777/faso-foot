import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
    ClubApiResponse,
    ClubManagerClub,
    ClubManagerTeam,
    ClubManagerPlayer,
    ClubManagerStaffMember,
    ClubManagerMatch,
    ClubManagerMatchResponse,
    MatchFilterOptions,
    EnrichedMatch,
    TeamWithData,
    Season
} from '../models/club-manager-api.model';

/**
 * Service centralisé pour tous les appels API de la vue Club Manager
 * Optimisé avec cache et intercepteurs pour stabilité API
 */
@Injectable({
    providedIn: 'root'
})
export class ClubManagerService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    // Cache pour éviter les requêtes répétitives (TTL: 5 minutes)
    private readonly CACHE_DURATION = 5 * 60 * 1000;

    // ============================================
    // CLUB METHODS
    // ============================================

    /**
     * Récupère les informations complètes d'un club avec ses équipes
     * Endpoint: GET /api/v1/clubs/{clubId}
     */
    getClubById(clubId: string): Observable<ClubManagerClub> {
        console.log('🏢 [CLUB MANAGER SERVICE] Récupération du club:', clubId);
        
        return this.http.get<ClubApiResponse>(`${this.baseUrl}/clubs/${clubId}`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Club reçu:', response.data.club);
                return response.data.club;
            }),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement du club:', err);
                throw err;
            })
        );
    }

    /**
     * Récupère uniquement les équipes d'un club
     */
    getClubTeams(clubId: string): Observable<ClubManagerTeam[]> {
        return this.getClubById(clubId).pipe(
            map((club) => club.teams || []),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement des équipes:', err);
                return of([]);
            })
        );
    }

    // ============================================
    // TEAM METHODS
    // ============================================

    /**
     * Récupère les informations complètes d'une équipe
     */
    getTeamById(teamId: string): Observable<ClubManagerTeam> {
        console.log('⚽ [CLUB MANAGER SERVICE] Récupération de l\'équipe:', teamId);
        
        return this.http.get<any>(`${this.baseUrl}/teams/${teamId}`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Équipe reçue:', response);
                // Gérer les différents formats de réponse
                return response.data?.team || response.data || response;
            }),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement de l\'équipe:', err);
                throw err;
            })
        );
    }

    /**
     * Récupère toutes les données d'une équipe (joueurs, staff, matchs)
     * Optimisé avec forkJoin pour charger en parallèle
     */
    getTeamWithAllData(teamId: string): Observable<TeamWithData> {
        console.log('📦 [CLUB MANAGER SERVICE] Récupération complète de l\'équipe:', teamId);
        
        return forkJoin({
            team: this.getTeamById(teamId),
            players: this.getTeamPlayers(teamId),
            staff: this.getTeamStaff(teamId),
            upcomingMatches: this.getUpcomingMatches(teamId),
            pastMatches: this.getPastMatches(teamId)
        }).pipe(
            map(({ team, players, staff, upcomingMatches, pastMatches }) => ({
                ...team,
                players,
                staff,
                upcomingMatches,
                pastMatches
            })),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement complet de l\'équipe:', err);
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
     */
    getTeamPlayers(teamId: string): Observable<ClubManagerPlayer[]> {
        console.log('👥 [CLUB MANAGER SERVICE] Récupération des joueurs de l\'équipe:', teamId);
        
        return this.http.get<any>(`${this.baseUrl}/teams/${teamId}/players`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Réponse brute joueurs:', response);
                // Le vrai endpoint retourne { status: true, data: { players: [...] }, message: "..." }
                const rawPlayers = response?.data?.players || response?.players || response?.data || [];
                console.log('✅ [CLUB MANAGER SERVICE] Joueurs extraits:', rawPlayers.length);
                
                // Mapper les joueurs et construire l'URL complète de la photo
                const players = rawPlayers.map((player: any) => {
                    console.log('📸 [CLUB MANAGER SERVICE] Joueur photo mapping:', {
                        id: player.id,
                        name: `${player.first_name} ${player.last_name}`,
                        photo: player.photo,
                        photo_url: player.photo_url
                    });
                    
                    // Construire l'URL de la photo
                    let photoUrl = null;
                    
                    // Cas 1: photo_url existe déjà et est une URL complète
                    if (player.photo_url) {
                        photoUrl = player.photo_url;
                    }
                    // Cas 2: photo existe et est une URL complète
                    else if (player.photo && player.photo.startsWith('http')) {
                        photoUrl = player.photo;
                    }
                    // Cas 3: photo existe et est un chemin relatif
                    else if (player.photo && !player.photo.startsWith('http')) {
                        // Construire l'URL complète (ajuster selon votre backend)
                        const baseUrl = this.baseUrl.replace('/api/v1', '');
                        photoUrl = `${baseUrl}/storage/${player.photo}`;
                    }
                    
                    return {
                        ...player,
                        photo: photoUrl // Normaliser sur le champ 'photo'
                    };
                });
                
                console.log('✅ [CLUB MANAGER SERVICE] Joueurs avec photos:', players);
                return players;
            }),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement des joueurs:', err);
                return of([]);
            })
        );
    }

    /**
     * Récupère les détails complets d'un joueur
     * Endpoint: GET /v1/players/show/{id}
     */
    getPlayerDetails(playerId: string): Observable<ClubManagerPlayer> {
        console.log('👤 [CLUB MANAGER SERVICE] Récupération du joueur:', playerId);
        
        return this.http.get<any>(`${this.baseUrl}/players/show/${playerId}`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Joueur reçu:', response);
                return response.data?.player || response.data || response;
            }),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement du joueur:', err);
                throw err;
            })
        );
    }

    /**
     * Crée un nouveau joueur
     * Endpoint: POST /v1/players
     */
    createPlayer(playerData: Partial<ClubManagerPlayer>): Observable<ClubManagerPlayer> {
        console.log('➕ [CLUB MANAGER SERVICE] Création d\'un joueur:', playerData);
        
        return this.http.post<any>(`${this.baseUrl}/players`, playerData).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Joueur créé:', response);
                return response.data?.player || response.data || response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la création du joueur:', err);
                throw err;
            })
        );
    }

    /**
     * Modifie un joueur existant
     * Endpoint: PUT /v1/players/{playerId}
     */
    updatePlayer(playerId: string, playerData: Partial<ClubManagerPlayer>): Observable<ClubManagerPlayer> {
        console.log('✏️ [CLUB MANAGER SERVICE] Modification du joueur:', playerId, playerData);
        
        return this.http.put<any>(`${this.baseUrl}/players/${playerId}`, playerData).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Joueur modifié:', response);
                return response.data?.player || response.data || response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la modification du joueur:', err);
                throw err;
            })
        );
    }

    /**
     * Supprime un joueur
     * Endpoint: DELETE /v1/players/delete/{playerId}
     */
    deletePlayer(playerId: string): Observable<any> {
        console.log('🗑️ [CLUB MANAGER SERVICE] Suppression du joueur:', playerId);
        
        return this.http.delete<any>(`${this.baseUrl}/players/delete/${playerId}`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Joueur supprimé:', response);
                return response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la suppression du joueur:', err);
                throw err;
            })
        );
    }

    /**
     * Récupère la liste paginée de tous les joueurs
     * Endpoint: GET /v1/players/paginate
     */
    getAllPlayersPaginated(page: number = 1, perPage: number = 15): Observable<any> {
        console.log('👥 [CLUB MANAGER SERVICE] Récupération paginée des joueurs, page:', page);
        
        let params = new HttpParams()
            .set('page', page.toString())
            .set('per_page', perPage.toString());
        
        return this.http.get<any>(`${this.baseUrl}/players/paginate`, { params }).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Joueurs paginés reçus:', response);
                return response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement des joueurs paginés:', err);
                return of({ data: [], meta: { current_page: 1, per_page: perPage, total: 0 } });
            })
        );
    }

    /**
     * Récupère tous les joueurs d'un club (toutes équipes confondues)
     */
    getAllClubPlayers(clubId: string): Observable<ClubManagerPlayer[]> {
        console.log('👥 [CLUB MANAGER SERVICE] Récupération de tous les joueurs du club:', clubId);
        
        return this.getClubTeams(clubId).pipe(
            map((teams) => {
                // Créer un tableau d'observables pour chaque équipe
                const playerObservables = teams.map((team) => this.getTeamPlayers(team.id));
                return playerObservables;
            }),
            // Exécuter tous les appels en parallèle
            map((observables) => {
                if (observables.length === 0) {
                    return of([]);
                }
                return forkJoin(observables);
            }),
            // Aplatir les résultats
            map((result: Observable<ClubManagerPlayer[][]>) => {
                return result.pipe(
                    map((playerArrays) => playerArrays.flat())
                );
            }),
            // Déballer l'observable imbriqué
            map((observable) => observable),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement des joueurs du club:', err);
                return of([]);
            })
        ) as Observable<ClubManagerPlayer[]>;
    }

    // ============================================
    // STAFF METHODS
    // ============================================

    /**
     * Récupère le staff d'une équipe
     * Endpoint: GET /v1/teams/{teamId}/staffs
     */
    getTeamStaff(teamId: string): Observable<ClubManagerStaffMember[]> {
        console.log('👔 [CLUB MANAGER SERVICE] Récupération du staff de l\'équipe:', teamId);
        
        return this.http.get<any>(`${this.baseUrl}/teams/${teamId}/staffs`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Réponse brute staff:', response);
                // Le vrai endpoint retourne { status: true, data: { staffs: [...] }, message: "..." }
                const staffs = response?.data?.staffs || response?.staffs || response?.data || [];
                console.log('✅ [CLUB MANAGER SERVICE] Staff extrait:', staffs);
                return staffs;
            }),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement du staff:', err);
                return of([]);
            })
        );
    }

    /**
     * Récupère les détails d'un membre du staff
     * Endpoint: GET /v1/staffs/{id}
     */
    getStaffDetails(staffId: string): Observable<ClubManagerStaffMember> {
        console.log('👤 [CLUB MANAGER SERVICE] Récupération du membre du staff:', staffId);
        
        return this.http.get<any>(`${this.baseUrl}/staffs/${staffId}`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Staff reçu:', response);
                return response.data?.staff || response.data || response;
            }),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement du membre du staff:', err);
                throw err;
            })
        );
    }

    /**
     * Crée un nouveau membre du staff
     * Endpoint: POST /v1/staffs
     */
    createStaff(staffData: Partial<ClubManagerStaffMember>): Observable<ClubManagerStaffMember> {
        console.log('➕ [CLUB MANAGER SERVICE] Création d\'un membre du staff:', staffData);
        
        return this.http.post<any>(`${this.baseUrl}/staffs`, staffData).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Staff créé:', response);
                return response.data?.staff || response.data || response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la création du staff:', err);
                throw err;
            })
        );
    }

    /**
     * Modifie un membre du staff existant
     * Endpoint: PUT /v1/staffs/{id}
     */
    updateStaff(staffId: string, staffData: Partial<ClubManagerStaffMember>): Observable<ClubManagerStaffMember> {
        console.log('✏️ [CLUB MANAGER SERVICE] Modification du staff:', staffId, staffData);
        
        return this.http.put<any>(`${this.baseUrl}/staffs/${staffId}`, staffData).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Staff modifié:', response);
                return response.data?.staff || response.data || response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la modification du staff:', err);
                throw err;
            })
        );
    }

    /**
     * Supprime un membre du staff
     * Endpoint: DELETE /v1/staffs/{id}
     */
    deleteStaff(staffId: string): Observable<any> {
        console.log('🗑️ [CLUB MANAGER SERVICE] Suppression du staff:', staffId);
        
        return this.http.delete<any>(`${this.baseUrl}/staffs/${staffId}`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Staff supprimé:', response);
                return response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la suppression du staff:', err);
                throw err;
            })
        );
    }

    /**
     * Récupère la liste complète du staff
     * Endpoint: GET /v1/staffs
     */
    getAllStaff(): Observable<ClubManagerStaffMember[]> {
        console.log('👔 [CLUB MANAGER SERVICE] Récupération de tout le staff');
        
        return this.http.get<any>(`${this.baseUrl}/staffs`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Staff complet reçu:', response);
                return response.data?.staffs || response.data || [];
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement du staff complet:', err);
                return of([]);
            })
        );
    }

    /**
     * Récupère tout le staff d'un club (toutes équipes confondues)
     */
    getAllClubStaff(clubId: string): Observable<ClubManagerStaffMember[]> {
        console.log('👔 [CLUB MANAGER SERVICE] Récupération de tout le staff du club:', clubId);
        
        return this.getClubTeams(clubId).pipe(
            map((teams) => {
                const staffObservables = teams.map((team) => this.getTeamStaff(team.id));
                return staffObservables;
            }),
            map((observables) => {
                if (observables.length === 0) {
                    return of([]);
                }
                return forkJoin(observables);
            }),
            map((result: Observable<ClubManagerStaffMember[][]>) => {
                return result.pipe(
                    map((staffArrays) => staffArrays.flat())
                );
            }),
            map((observable) => observable),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement du staff du club:', err);
                return of([]);
            })
        ) as Observable<ClubManagerStaffMember[]>;
    }

    // ============================================
    // MATCH METHODS
    // ============================================

    /**
     * Récupère tous les matchs d'une équipe avec filtres optionnels (version paginée)
     */
    getTeamMatchesPaginated(teamId: string, filters?: MatchFilterOptions): Observable<ClubManagerMatchResponse> {
        console.log('⚽ [CLUB MANAGER SERVICE] Récupération des matchs paginés de l\'équipe:', teamId, filters);
        
        let params = new HttpParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params = params.set(key, value.toString());
                }
            });
        }

        return this.http.get<ClubManagerMatchResponse>(`${this.baseUrl}/teams/${teamId}/matches`, { params }).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Matchs paginés reçus:', response);
                return response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement des matchs paginés:', err);
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
     */
    getTeamMatchesByUrl(url: string, additionalParams?: Record<string, any>): Observable<ClubManagerMatchResponse> {
        let finalUrl = url;

        if (additionalParams && Object.keys(additionalParams).length > 0) {
            const urlObj = new URL(url);
            Object.entries(additionalParams).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    urlObj.searchParams.set(key, value.toString());
                }
            });
            finalUrl = urlObj.toString();
            console.log('🔗 [CLUB MANAGER SERVICE] URL avec paramètres additionnels:', finalUrl);
        }

        return this.http.get<ClubManagerMatchResponse>(finalUrl).pipe(
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement des matchs par URL:', err);
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
     * @deprecated Utilisez getTeamMatchesPaginated pour accéder aux métadonnées de pagination
     */
    getTeamMatches(teamId: string, filters?: MatchFilterOptions): Observable<ClubManagerMatch[]> {
        return this.getTeamMatchesPaginated(teamId, filters).pipe(
            map((response) => response.data),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement des matchs:', err);
                return of([]);
            })
        );
    }

    /**
     * Récupère uniquement les matchs à venir
     */
    getUpcomingMatches(teamId: string, filters?: Omit<MatchFilterOptions, 'status'>): Observable<ClubManagerMatch[]> {
        return this.getTeamMatches(teamId, { ...filters }).pipe(
            map((matches) => {
                const now = new Date().getTime();
                return matches.filter((m) => {
                    const matchDate = this.parseFrenchDate(m.scheduled_at);
                    return matchDate ? matchDate.getTime() > now : false;
                });
            })
        );
    }

    /**
     * Récupère uniquement les matchs passés
     */
    getPastMatches(teamId: string, filters?: Omit<MatchFilterOptions, 'status'>): Observable<ClubManagerMatch[]> {
        return this.getTeamMatches(teamId, { ...filters }).pipe(
            map((matches) => {
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
    getNextMatch(teamId: string): Observable<ClubManagerMatch | null> {
        return this.getUpcomingMatches(teamId).pipe(
            map((matches) => {
                if (!matches || matches.length === 0) {
                    return null;
                }

                const sorted = matches.sort((a, b) => {
                    const dateA = new Date(a.scheduled_at).getTime();
                    const dateB = new Date(b.scheduled_at).getTime();
                    return dateA - dateB;
                });

                return sorted[0];
            })
        );
    }

    /**
     * Récupère tous les matchs d'un club (toutes équipes confondues)
     */
    getAllClubMatches(clubId: string, filters?: MatchFilterOptions): Observable<ClubManagerMatch[]> {
        console.log('⚽ [CLUB MANAGER SERVICE] Récupération de tous les matchs du club:', clubId);
        
        return this.getClubTeams(clubId).pipe(
            map((teams) => {
                const matchObservables = teams.map((team) => this.getTeamMatches(team.id, filters));
                return matchObservables;
            }),
            map((observables) => {
                if (observables.length === 0) {
                    return of([]);
                }
                return forkJoin(observables);
            }),
            map((result: Observable<ClubManagerMatch[][]>) => {
                return result.pipe(
                    map((matchArrays) => matchArrays.flat())
                );
            }),
            map((observable) => observable),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement des matchs du club:', err);
                return of([]);
            })
        ) as Observable<ClubManagerMatch[]>;
    }

    // ============================================
    // SEASON METHODS
    // ============================================

    /**
     * Récupère les saisons d'une équipe
     */
    getTeamSeasons(teamId: string): Observable<Season[]> {
        console.log('📅 [CLUB MANAGER SERVICE] Récupération des saisons de l\'équipe:', teamId);
        
        return this.http.get<any>(`${this.baseUrl}/teams/${teamId}/seasons`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Saisons reçues:', response);
                return response.data?.seasons || response.data || response;
            }),
            shareReplay(1, this.CACHE_DURATION),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors du chargement des saisons:', err);
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

        console.warn('⚠️ [CLUB MANAGER SERVICE] Unable to parse date:', dateString);
        return null;
    }

    /**
     * Enrichit les matchs avec des données calculées
     */
    enrichMatches(matches: ClubManagerMatch[], teamId: string): EnrichedMatch[] {
        const now = new Date();

        return matches.map((match) => {
            const isHome = match.team_one_id === teamId || match.home_club_id === teamId;

            let matchDate: Date | null = null;
            let daysUntilMatch: number | undefined = undefined;

            if (match.scheduled_at) {
                matchDate = this.parseFrenchDate(match.scheduled_at);
                if (matchDate) {
                    daysUntilMatch = Math.ceil((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                } else {
                    console.warn('⚠️ [CLUB MANAGER SERVICE] Could not parse scheduled_at date:', match.scheduled_at, 'for match:', match.id);
                }
            } else {
                console.warn('⚠️ [CLUB MANAGER SERVICE] Missing scheduled_at for match:', match.id);
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
     * Filtre les matchs par période
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

    // ============================================
    // JERSEYS (KITS) METHODS
    // ============================================

    /**
     * Crée un nouveau maillot
     * Endpoint: POST /v1/jerseys
     */
    createJersey(jerseyData: any): Observable<any> {
        console.log('➕ [CLUB MANAGER SERVICE] Création d\'un maillot:', jerseyData);
        
        return this.http.post<any>(`${this.baseUrl}/jerseys`, jerseyData).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Maillot créé:', response);
                return response.data?.jersey || response.data || response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la création du maillot:', err);
                throw err;
            })
        );
    }

    /**
     * Modifie un maillot existant
     * Endpoint: PUT /v1/jerseys/{id}
     */
    updateJersey(jerseyId: string, jerseyData: any): Observable<any> {
        console.log('✏️ [CLUB MANAGER SERVICE] Modification du maillot:', jerseyId, jerseyData);
        
        return this.http.put<any>(`${this.baseUrl}/jerseys/${jerseyId}`, jerseyData).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Maillot modifié:', response);
                return response.data?.jersey || response.data || response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la modification du maillot:', err);
                throw err;
            })
        );
    }

    /**
     * Supprime un maillot
     * Endpoint: DELETE /v1/jerseys/{id}
     */
    deleteJersey(jerseyId: string): Observable<any> {
        console.log('🗑️ [CLUB MANAGER SERVICE] Suppression du maillot:', jerseyId);
        
        return this.http.delete<any>(`${this.baseUrl}/jerseys/${jerseyId}`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Maillot supprimé:', response);
                return response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la suppression du maillot:', err);
                throw err;
            })
        );
    }

    // ============================================
    // TEAMS CRUD METHODS
    // ============================================

    /**
     * Crée une nouvelle équipe
     * Endpoint: POST /v1/teams
     */
    createTeam(teamData: any): Observable<ClubManagerTeam> {
        console.log('➕ [CLUB MANAGER SERVICE] Création d\'une équipe:', teamData);
        
        return this.http.post<any>(`${this.baseUrl}/teams`, teamData).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Équipe créée:', response);
                return response.data?.team || response.data || response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la création de l\'équipe:', err);
                throw err;
            })
        );
    }

    /**
     * Modifie une équipe existante
     * Endpoint: PUT /v1/teams/{id}
     */
    updateTeam(teamId: string, teamData: any): Observable<ClubManagerTeam> {
        console.log('✏️ [CLUB MANAGER SERVICE] Modification de l\'équipe:', teamId, teamData);
        
        return this.http.put<any>(`${this.baseUrl}/teams/${teamId}`, teamData).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Équipe modifiée:', response);
                return response.data?.team || response.data || response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la modification de l\'équipe:', err);
                throw err;
            })
        );
    }

    /**
     * Supprime une équipe
     * Endpoint: DELETE /v1/teams/{id}
     */
    deleteTeam(teamId: string): Observable<any> {
        console.log('🗑️ [CLUB MANAGER SERVICE] Suppression de l\'équipe:', teamId);
        
        return this.http.delete<any>(`${this.baseUrl}/teams/${teamId}`).pipe(
            map((response) => {
                console.log('✅ [CLUB MANAGER SERVICE] Équipe supprimée:', response);
                return response;
            }),
            catchError((err) => {
                console.error('❌ [CLUB MANAGER SERVICE] Erreur lors de la suppression de l\'équipe:', err);
                throw err;
            })
        );
    }
}
