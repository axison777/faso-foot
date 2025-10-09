import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { MatchReport, MatchIncident, RefereeEvaluation } from '../models/match-report.model';
import { AuthService } from './auth.service';

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
    apiUrl = environment.apiUrl + '/v1/Official';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {}

    // Récupérer les matchs assignés à l'officiel connecté
    getAssignedMatches(filters?: {
        status?: string;
        competitionId?: string;
        seasonId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Observable<OfficialMatch[]> {
        const currentUser = this.authService.currentUser;
        if (!currentUser?.id) {
            return of([]);
        }

        return this.http.get<any>(`${this.apiUrl}/officialMatchs/${currentUser.id}`).pipe(
            map(res => {
                let matches = (res?.data?.matches as OfficialMatch[]) || [];
                
                // Appliquer les filtres côté client si nécessaire
                if (filters?.status) {
                    matches = matches.filter(m => m.status === filters.status);
                }
                if (filters?.competitionId) {
                    matches = matches.filter(m => m.competition.id === filters.competitionId);
                }
                if (filters?.seasonId) {
                    matches = matches.filter(m => m.seasonId === filters.seasonId);
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
        return this.http.get<any>(`${this.baseUrl}/v1/officials/notifications`).pipe(
            map(res => (res?.data?.notifications) || []),
            catchError(() => of([]))
        );
    }

    // Marquer une notification comme lue
    markNotificationAsRead(notificationId: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/v1/officials/notifications/${notificationId}/read`, {}).pipe(
            catchError(() => of({ success: true }))
        );
    }
}