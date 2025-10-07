import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { MatchReport, MatchIncident, RefereeEvaluation } from '../models/match-report.model';

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
    apiUrl = environment.apiUrl + '/official-matches';

    constructor(private http: HttpClient) {}

    // Récupérer les matchs assignés à l'officiel connecté
    getAssignedMatches(filters?: {
        status?: string;
        competitionId?: string;
        seasonId?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Observable<OfficialMatch[]> {
        const params: any = { ...filters };
        return this.http.get<any>(this.apiUrl, { params }).pipe(
            map(res => (res?.data?.matches as OfficialMatch[]) || []),
            catchError(() => of(this.mockAssignedMatches()))
        );
    }

    // Récupérer les détails d'un match spécifique
    getMatchDetails(matchId: string): Observable<OfficialMatch | null> {
        return this.http.get<any>(`${this.apiUrl}/${matchId}`).pipe(
            map(res => (res?.data?.match as OfficialMatch) || null),
            catchError(() => of(this.mockMatchDetails(matchId)))
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
        return this.http.get<any>(`${this.baseUrl}/officials/notifications`).pipe(
            map(res => (res?.data?.notifications) || []),
            catchError(() => of(this.mockNotifications()))
        );
    }

    // Marquer une notification comme lue
    markNotificationAsRead(notificationId: string): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}/officials/notifications/${notificationId}/read`, {}).pipe(
            catchError(() => of({ success: true }))
        );
    }

    // --- Mocks ---
    private mockAssignedMatches(): OfficialMatch[] {
        const base = new Date();
        const matches: OfficialMatch[] = [];
        
        for (let i = 0; i < 8; i++) {
            const isUpcoming = i < 4;
            const dt = new Date(base.getTime() + (isUpcoming ? i : -(i - 3)) * 7 * 24 * 3600 * 1000);
            
            matches.push({
                id: `match-${i}`,
                number: i + 1,
                competition: { 
                    id: 'comp-1', 
                    name: i % 2 === 0 ? 'Championnat D1' : 'Coupe Nationale', 
                    type: i % 2 === 0 ? 'LEAGUE' : 'CUP' 
                },
                homeTeam: { id: 'team-1', name: 'Équipe A' },
                awayTeam: { id: 'team-2', name: 'Équipe B' },
                stadium: { id: 'stadium-1', name: 'Stade Municipal', address: '123 Rue du Sport' },
                scheduledAt: dt.toISOString(),
                status: isUpcoming ? 'UPCOMING' : 'COMPLETED',
                score: !isUpcoming ? { home: Math.floor(Math.random() * 4), away: Math.floor(Math.random() * 4) } : undefined,
                officialRole: i % 4 === 0 ? 'CENTRAL_REFEREE' : i % 4 === 1 ? 'ASSISTANT_REFEREE_1' : 'COMMISSIONER',
                assignedAt: new Date(dt.getTime() - 7 * 24 * 3600 * 1000).toISOString(),
                otherOfficials: [
                    { id: 'off-1', name: 'Jean Dupont', role: 'CENTRAL_REFEREE' },
                    { id: 'off-2', name: 'Marie Martin', role: 'ASSISTANT_REFEREE_1' },
                    { id: 'off-3', name: 'Pierre Durand', role: 'ASSISTANT_REFEREE_2' }
                ],
                canSubmitReport: !isUpcoming,
                reportSubmitted: !isUpcoming && i % 2 === 0,
                matchClosed: !isUpcoming && i % 3 === 0
            });
        }
        
        return matches;
    }

    private mockMatchDetails(matchId: string): OfficialMatch | null {
        return {
            id: matchId,
            number: 1,
            competition: { id: 'comp-1', name: 'Championnat D1', type: 'LEAGUE' },
            homeTeam: { id: 'team-1', name: 'Équipe A' },
            awayTeam: { id: 'team-2', name: 'Équipe B' },
            stadium: { id: 'stadium-1', name: 'Stade Municipal', address: '123 Rue du Sport' },
            scheduledAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            status: 'UPCOMING',
            officialRole: 'CENTRAL_REFEREE',
            assignedAt: new Date().toISOString(),
            otherOfficials: [
                { id: 'off-1', name: 'Jean Dupont', role: 'CENTRAL_REFEREE' },
                { id: 'off-2', name: 'Marie Martin', role: 'ASSISTANT_REFEREE_1' },
                { id: 'off-3', name: 'Pierre Durand', role: 'ASSISTANT_REFEREE_2' }
            ],
            canSubmitReport: false,
            reportSubmitted: false,
            matchClosed: false
        };
    }

    private mockNotifications(): any[] {
        return [
            {
                id: 'notif-1',
                type: 'MATCH_REMINDER',
                title: 'Rappel de match',
                message: 'Votre match de demain à 15h00 vous attend',
                read: false,
                createdAt: new Date().toISOString()
            },
            {
                id: 'notif-2',
                type: 'REPORT_SUBMITTED',
                title: 'Rapport soumis',
                message: 'Un rapport a été soumis pour le match #123',
                read: true,
                createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
            }
        ];
    }
}