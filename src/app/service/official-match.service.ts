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

        // Endpoint correct : GET /Official/officialMatchs/{officialId}
        return this.http.get<any>(`${this.apiUrl}/officialMatchs/${currentUser.official_id}`).pipe(
            map(res => {
                // Extraire les infos de l'officiel depuis data.official (singulier !)
                const official = res?.data?.official;
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

        // Endpoint correct : GET /Official/officialMatchs/{officialId}
        return this.http.get<any>(`${this.apiUrl}/officialMatchs/${currentUser.official_id}`).pipe(
            map(res => {
                // Extraire les matchs depuis data.official.matches (singulier !)
                const official = res?.data?.official;
                let matches = official?.matches || [];
                
                // Le backend renvoie déjà le bon format ! Pas besoin de mapper
                // Les matchs ont déjà: id, homeTeam, awayTeam, stadium, competition, etc.
                
                // Appliquer les filtres côté client si nécessaire
                if (filters?.status) {
                    if (filters.status === 'UPCOMING') {
                        // Matchs à venir = non clôturés ET date future
                        matches = matches.filter((m: any) => !m.matchClosed);
                    } else if (filters.status === 'COMPLETED') {
                        // Matchs terminés = clôturés
                        matches = matches.filter((m: any) => m.matchClosed);
                    } else {
                        // Autres statuts
                        matches = matches.filter((m: any) => m.status === filters.status);
                    }
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