import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { MatchReport, MatchIncident, RefereeEvaluation } from '../models/match-report.model';
import { AuthService } from './auth.service';

// Interface pour les informations de l'officiel
export interface OfficialInfo {
    id: string;
    first_name: string;
    last_name: string;
    level: string; // NATIONAL, INTERNATIONAL, etc.
    license_number: string;
    official_type: string; // COMMISSIONER, REFEREE, etc.
    status: string; // ACTIVE, INACTIVE
    date_of_birth?: string;
    birth_place?: string;
    nationality?: string;
    experience?: string;
    structure?: string;
    certification_date?: string;
    certification_expiry?: string;
}

export interface OfficialMatch {
    id: string;
    number?: number;
    competition: { 
        id: string; 
        name: string; 
        type: 'LEAGUE' | 'CUP' | 'TOURNAMENT' 
    };
    seasonId?: string;
    homeTeam: { 
        id: string; 
        name: string; 
        logo?: string 
    };
    awayTeam: { 
        id: string; 
        name: string; 
        logo?: string 
    };
    stadium: { 
        id: string; 
        name: string; 
        address?: string 
    };
    scheduledAt: string; // ISO
    status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
    score?: { home: number; away: number };
    phase?: string;
    
    // Assignation officielle
    officialRole: 'CENTRAL_REFEREE' | 'ASSISTANT_REFEREE_1' | 'ASSISTANT_REFEREE_2' | 'FOURTH_OFFICIAL' | 'COMMISSIONER';
    assignedAt: string;
    
    // Autres officiels du match
    otherOfficials?: Array<{
        id: string;
        name: string;
        role: string;
    }>;
    
    // Rapports
    reports?: MatchReport[];
    incidents?: MatchIncident[];
    events?: Array<{
        id: string;
        minute: number;
        type: string;
        description: string;
    }>;
    
    // Validation
    canSubmitReport: boolean;
    reportSubmitted: boolean;
    matchClosed: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class OfficialMatchService {
    baseUrl = environment.apiUrl;
    apiUrl = environment.apiUrl + '/Official';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    // Récupérer les informations de l'officiel connecté
    getOfficialInfo(): Observable<OfficialInfo | null> {
        const currentUser = this.authService.currentUser;
        if (!currentUser?.official_id) {
            return of(null);
        }

        // Essayer différents endpoints possibles
        // Option 1: /officials/{id}/matches
        return this.http.get<any>(`${this.baseUrl}/officials/${currentUser.official_id}/matches`).pipe(
            map(res => {
                // Extraire les infos de l'officiel depuis data.officials[0]
                const official = res?.data?.officials?.[0];
                if (!official) return null;
                
                return {
                    id: official.id,
                    first_name: official.first_name,
                    last_name: official.last_name,
                    level: official.level,
                    license_number: official.license_number,
                    official_type: official.official_type,
                    status: official.status,
                    date_of_birth: official.date_of_birth,
                    birth_place: official.birth_place,
                    nationality: official.nationality,
                    experience: official.experience,
                    structure: official.structure,
                    certification_date: official.certification_date,
                    certification_expiry: official.certification_expiry
                } as OfficialInfo;
            }),
            catchError(() => of(null))
        );
    }

    // Récupérer les matchs assignés à l'officiel connecté
    getAssignedMatches(filters?: {
        status?: string;
        competitionId?: string;
        seasonId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Observable<OfficialMatch[]> {
        const currentUser = this.authService.currentUser;
        if (!currentUser?.official_id) {
            return of([]);
        }

        // Essayer différents endpoints possibles
        // Option 1: /officials/{id}/matches
        return this.http.get<any>(`${this.baseUrl}/officials/${currentUser.official_id}/matches`).pipe(
            map(res => {
                // Extraire les matchs depuis data.officials[0].matches
                const official = res?.data?.officials?.[0];
                let matches = official?.matches || [];
                
                // Mapper les matchs au format attendu
                matches = matches.map((match: any) => ({
                    id: match.id,
                    homeTeam: {
                        id: match.team_one_id || match.home_club_id,
                        name: match.home_team?.name || 'Équipe Domicile',
                        logo: match.home_team?.logo
                    },
                    awayTeam: {
                        id: match.team_two_id || match.away_club_id,
                        name: match.away_team?.name || 'Équipe Extérieur',
                        logo: match.away_team?.logo
                    },
                    stadium: {
                        id: match.stadium_id,
                        name: match.stadium?.name || 'Stade',
                        address: match.stadium?.address
                    },
                    scheduledAt: match.scheduled_at,
                    status: match.status || 'UPCOMING',
                    officialRole: match.pivot?.role || 'MAIN_REFEREE',
                    assignedAt: match.pivot?.created_at || match.created_at,
                    competition: {
                        id: match.competition_id || match.pool_id,
                        name: match.competition?.name || 'Compétition',
                        type: match.competition?.type || 'LEAGUE'
                    },
                    seasonId: match.season_id,
                    canSubmitReport: true,
                    reportSubmitted: false,
                    matchClosed: false
                }));
                
                // Appliquer les filtres côté client si nécessaire
                if (filters?.status) {
                    matches = matches.filter((m: any) => m.status === filters.status);
                }
                if (filters?.competitionId) {
                    matches = matches.filter((m: any) => m.competition.id === filters.competitionId);
                }
                if (filters?.seasonId) {
                    matches = matches.filter((m: any) => m.seasonId === filters.seasonId);
                }
                
                return matches;
            }),
            catchError(() => of([]))
        );
    }

    // Récupérer les détails d'un match spécifique
    getMatchDetails(matchId: string): Observable<OfficialMatch | null> {
        return this.http.get<any>(`${this.apiUrl}/matchOfficials/${matchId}`).pipe(
            map(res => (res?.data?.match as OfficialMatch) || null),
            catchError(() => of(null))
        );
    }

    // Soumettre un rapport de match
    submitMatchReport(report: MatchReport): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${report.matchId}/reports`, report).pipe(
            catchError(() => of({ success: true, message: 'Rapport soumis avec succès' }))
        );
    }

    // Signaler un incident
    reportIncident(incident: MatchIncident): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${incident.matchId}/incidents`, incident).pipe(
            catchError(() => of({ success: true, message: 'Incident signalé avec succès' }))
        );
    }

    // Valider la feuille de match (commissaire)
    validateMatchSheet(matchId: string, validation: {
        teamsReady: boolean;
        playersPresent: boolean;
        fieldReady: boolean;
        comments?: string;
    }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${matchId}/validate-sheet`, validation).pipe(
            catchError(() => of({ success: true, message: 'Feuille de match validée' }))
        );
    }

    // Clôturer un match (quand tous les rapports sont soumis)
    closeMatch(matchId: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/${matchId}/close`, {}).pipe(
            catchError(() => of({ success: true, message: 'Match clôturé avec succès' }))
        );
    }

    // Récupérer les notifications de l'officiel
    getNotifications(): Observable<any[]> {
        // Temporairement désactivé - endpoint 404
        // TODO: Vérifier le bon endpoint avec le backend
        return of([]);
        
        // return this.http.get<any>(`${this.baseUrl}/officials/notifications`).pipe(
        //     map(res => (res?.data?.notifications) || []),
        //     catchError(() => of([]))
        // );
    }

    // Marquer une notification comme lue
    markNotificationAsRead(notificationId: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/officials/notifications/${notificationId}/read`, {}).pipe(
            catchError(() => of({ success: true }))
        );
    }
}