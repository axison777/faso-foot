import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';

export type MatchStatus = 'UPCOMING' | 'PLAYED';
export type CompetitionType = 'LEAGUE' | 'CUP' | 'TOURNAMENT';
export interface MatchScore { home: number; away: number; }
export interface MatchItem {
    id: string;
    number?: number;
    competition: { id: string; name: string; type: CompetitionType };
    seasonId?: string;
    opponent: { id: string; name: string; logo?: string };
    homeAway: 'HOME' | 'AWAY';
    stadium: { id: string; name: string };
    scheduledAt: string; // ISO
    status: MatchStatus;
    score?: MatchScore;
    phase?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MatchService {
    baseUrl = environment.apiUrl;
    apiUrl = environment.apiUrl + '/footballMatch';

    constructor(private http: HttpClient) { }

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + '/all');
    }

    getBySeasonId(id: string): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl + 'seasons' + '/' + id);
    }

    reschedule(id: string, data: any): Observable<any[]> {
        return this.http.put<any[]>(this.apiUrl + '/' + id, data);
    }

    getDetails(id: string): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + '/' + id);
    }

    validate(id: string): Observable<any[]> {
        return this.http.post<any[]>(environment.apiUrl + `/match-results/${id}/verification/verify`, { id: id });
    }

    getPlayers(id: string): Observable<any[]> {
        return this.http.get<any[]>(environment.apiUrl + `/callups/match/${id}`);
    }

    // --- Read-only helpers for dashboards ---
    getUpcomingMatchForTeam(teamId: string): Observable<MatchItem | null> {
        const url = `${environment.apiUrl}/teams/${teamId}/matches/upcoming`;
        return this.http.get<any>(url).pipe(
            map(res => (res?.data?.match as MatchItem) || null),
            catchError(() => of(this.mockUpcomingMatch(teamId)))
        );
    }

    getMatchesForTeam(teamId: string, opts: { status?: MatchStatus; competitionId?: string; seasonId?: string }): Observable<MatchItem[]> {
        const url = `${environment.apiUrl}/teams/${teamId}/matches`;
        // Map UPCOMING/PLAYED to the API's expected status values
        const statusMap: { [key: string]: string } = {
            'UPCOMING': 'upcoming',
            'PLAYED': 'played'
        };
        const params: any = {
            ...(opts.status && { status: statusMap[opts.status] || opts.status }),
            ...(opts.competitionId && { competition_id: opts.competitionId }),
            ...(opts.seasonId && { season_id: opts.seasonId })
        };

        // console.log('🔄 [MATCH SERVICE] GET ' + url);
        // console.log('📋 [MATCH SERVICE] Params:', params);

        return this.http.get<any>(url, { params }).pipe(
            map(res => {
                // console.log('📥 [MATCH SERVICE] Réponse brute du backend:', res);
                // Try different response structures
                if (res?.data?.data?.matches) {
                    // console.log('✅ [MATCH SERVICE] Extraction: res.data.data.matches');
                    return res.data.data.matches as MatchItem[];
                }
                if (res?.data?.matches) {
                    // console.log('✅ [MATCH SERVICE] Extraction: res.data.matches');
                    return res.data.matches as MatchItem[];
                }
                if (res?.data) {
                   // console.log('✅ [MATCH SERVICE] Extraction: res.data (array)');
                    return res.data as MatchItem[];
                }
                // console.log('⚠️ [MATCH SERVICE] Aucune structure reconnue, retour tableau vide');
                return [];
            }),
            catchError((err) => {
                console.error('❌ [MATCH SERVICE] Erreur lors du chargement des matchs:', err);
                console.error('❌ [MATCH SERVICE] Status:', err?.status);
                console.error('❌ [MATCH SERVICE] Message:', err?.message);
                console.warn('⚠️ [MATCH SERVICE] Utilisation des données de mock');
                return of(this.mockMatches(teamId, opts.status || 'UPCOMING'));
            })
        );
    }

    getAllMatchesForTeam(teamId: string): Observable<any[]> {
        const url = `${environment.apiUrl}/teams/${teamId}/matches`;
        // console.log('🔄 [MATCH SERVICE] GET ALL matches for team ' + teamId);
        // console.log('📍 [MATCH SERVICE] URL:', url);

        return this.http.get<any>(url).pipe(
            map(res => {
                // console.log('📥 [MATCH SERVICE] Réponse brute COMPLÈTE:', res);
                // console.log('📥 [MATCH SERVICE] Type de réponse:', typeof res);
                // console.log('📥 [MATCH SERVICE] res.data:', res?.data);
                // console.log('📥 [MATCH SERVICE] res.data type:', typeof res?.data);
                // console.log('📥 [MATCH SERVICE] res.data is Array?:', Array.isArray(res?.data));
                // console.log('📥 [MATCH SERVICE] res is Array?:', Array.isArray(res));

                // Essayer différentes structures
                if (res?.data?.data && Array.isArray(res.data.data)) {
                    console.log('✅ [MATCH SERVICE] Extraction: res.data.data (TROUVÉ!)');
                    return res.data.data;
                }
                if (Array.isArray(res?.data)) {
                    console.log('✅ [MATCH SERVICE] Extraction: res.data (array directement)');
                    return res.data;
                }
                if (res?.data?.data?.matches) {
                    console.log('✅ [MATCH SERVICE] Extraction: res.data.data.matches');
                    return res.data.data.matches;
                }
                if (res?.data?.matches) {
                    console.log('✅ [MATCH SERVICE] Extraction: res.data.matches');
                    return res.data.matches;
                }
                if (Array.isArray(res)) {
                    console.log('✅ [MATCH SERVICE] Extraction: res (array directement)');
                    return res;
                }

                // console.log('⚠️ [MATCH SERVICE] Structure inconnue, retour []');
                // console.log('⚠️ [MATCH SERVICE] Clés de res:', Object.keys(res || {}));
                // console.log('⚠️ [MATCH SERVICE] Clés de res.data:', Object.keys(res?.data || {}));
                return [];
            }),
            catchError((err) => {
                console.error('❌ [MATCH SERVICE] Erreur:', err);
                return of([]);
            })
        );
    }

    getCompetitionPhases(teamId: string, opts?: { competitionId?: string }): Observable<string[]> {
        const url = `${environment.apiUrl}/teams/${teamId}/competition-phases`;
        const params: any = { ...(opts?.competitionId && { competition_id: opts.competitionId }) };
        return this.http.get<any>(url, { params }).pipe(
            map(res => (res?.data?.phases as string[]) || []),
            catchError(() => of(['1/8e', '1/4', '1/2', 'Finale']))
        );
    }

    // --- Mocks ---
    private mockUpcomingMatch(teamId: string): MatchItem | null {
        return {
            id: 'm-upc-1',
            competition: { id: 'c1', name: 'Championnat D1', type: 'LEAGUE' },
            opponent: { id: 'op1', name: 'USO' },
            homeAway: 'HOME',
            stadium: { id: 's1', name: 'Stade Municipal' },
            scheduledAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
            status: 'UPCOMING',
            phase: undefined,
        };
    }

    private mockMatches(teamId: string, status: MatchStatus): MatchItem[] {
        const base = new Date();
        const list: MatchItem[] = [];
        for (let i = 0; i < 8; i++) {
            const isPlayed = status === 'PLAYED';
            const dt = new Date(base.getTime() - (isPlayed ? i + 1 : -(i + 1)) * 7 * 24 * 3600 * 1000);
            list.push({
                id: `${teamId}-${status}-${i}`,
                number: i + 1,
                competition: { id: i % 2 === 0 ? 'c1' : 'c2', name: i % 2 === 0 ? 'Championnat D1' : 'Coupe Nationale', type: i % 2 === 0 ? 'LEAGUE' : 'CUP' },
                opponent: { id: 'op' + i, name: 'Adversaire ' + (i + 1) },
                homeAway: i % 2 === 0 ? 'HOME' : 'AWAY',
                stadium: { id: 's' + i, name: 'Stade ' + (i + 1) },
                scheduledAt: dt.toISOString(),
                status,
                score: isPlayed ? { home: Math.floor(Math.random() * 4), away: Math.floor(Math.random() * 4) } : undefined,
                phase: i % 2 === 1 ? ['1/8e', '1/4', '1/2', 'Finale'][i % 4] : undefined,
            });
        }
        return list;
    }
}
