import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CoachPlayer,
  CoachMatch,
  CoachTeam,
  CoachStaffMember,
  ApiResponse,
  PlayersResponse,
  MatchesResponse,
  StaffResponse,
  MatchFilterOptions,
  EnrichedMatch
} from '../models/coach-api.model';

/**
 * Service centralisé pour tous les appels API de la vue Coach
 * Gère les joueurs, matchs, équipe et staff
 */
@Injectable({
  providedIn: 'root'
})
export class CoachService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // ============================================
  // TEAM METHODS
  // ============================================

  /**
   * Récupère les informations complètes d'une équipe
   */
  getTeamById(teamId: string): Observable<CoachTeam> {
    console.log('🔄 [COACH SERVICE] GET /teams/' + teamId);
    
    return this.http.get<ApiResponse<CoachTeam>>(`${this.baseUrl}/teams/${teamId}`).pipe(
      map(res => {
        console.log('✅ [COACH SERVICE] Équipe reçue:', res);
        return res.data || res as any;
      }),
      catchError(err => {
        console.error('❌ [COACH SERVICE] Erreur lors du chargement de l\'équipe:', err);
        throw err;
      })
    );
  }

  // ============================================
  // PLAYER METHODS
  // ============================================

  /**
   * Récupère tous les joueurs d'une équipe
   */
  getTeamPlayers(teamId: string): Observable<CoachPlayer[]> {
    console.log('🔄 [COACH SERVICE] GET /teams/' + teamId + '/players');
    
    return this.http.get<ApiResponse<PlayersResponse>>(`${this.baseUrl}/teams/${teamId}/players`).pipe(
      map(res => {
        console.log('✅ [COACH SERVICE] Joueurs reçus:', res);
        // Gérer différentes structures de réponse
        if (res?.data?.players) {
          return res.data.players;
        }
        if (Array.isArray(res?.data)) {
          return res.data;
        }
        if (Array.isArray(res)) {
          return res;
        }
        return [];
      }),
      catchError(err => {
        console.error('❌ [COACH SERVICE] Erreur lors du chargement des joueurs:', err);
        return of([]);
      })
    );
  }

  /**
   * Récupère les détails complets d'un joueur
   */
  getPlayerDetails(playerId: string): Observable<CoachPlayer> {
    console.log('🔄 [COACH SERVICE] GET /players/show/' + playerId);
    
    return this.http.get<ApiResponse<{ player: CoachPlayer }>>(`${this.baseUrl}/players/show/${playerId}`).pipe(
      map(res => {
        console.log('✅ [COACH SERVICE] Détails du joueur:', res);
        return res.data?.player || res.data || res as any;
      }),
      catchError(err => {
        console.error('❌ [COACH SERVICE] Erreur lors du chargement du joueur:', err);
        throw err;
      })
    );
  }

  // ============================================
  // MATCH METHODS
  // ============================================

  /**
   * Récupère tous les matchs d'une équipe avec filtres optionnels
   */
  getTeamMatches(teamId: string, filters?: MatchFilterOptions): Observable<CoachMatch[]> {
    console.log('🔄 [COACH SERVICE] GET /teams/' + teamId + '/matches');
    console.log('📋 [COACH SERVICE] Filtres:', filters);

    // Construire les paramètres de requête
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<any>(`${this.baseUrl}/teams/${teamId}/matches`, { params }).pipe(
      map(res => {
        console.log('✅ [COACH SERVICE] Matchs reçus:', res);
        
        // Gérer différentes structures de réponse
        if (res?.data?.data && Array.isArray(res.data.data)) {
          return res.data.data as CoachMatch[];
        }
        if (Array.isArray(res?.data)) {
          return res.data as CoachMatch[];
        }
        if (res?.data?.matches && Array.isArray(res.data.matches)) {
          return res.data.matches as CoachMatch[];
        }
        if (res?.matches && Array.isArray(res.matches)) {
          return res.matches as CoachMatch[];
        }
        return [];
      }),
      catchError(err => {
        console.error('❌ [COACH SERVICE] Erreur lors du chargement des matchs:', err);
        return of([]);
      })
    );
  }

  /**
   * Récupère uniquement les matchs à venir
   */
  getUpcomingMatches(teamId: string, filters?: Omit<MatchFilterOptions, 'status'>): Observable<CoachMatch[]> {
    return this.getTeamMatches(teamId, { ...filters, status: 'upcoming' });
  }

  /**
   * Récupère uniquement les matchs passés
   */
  getPastMatches(teamId: string, filters?: Omit<MatchFilterOptions, 'status'>): Observable<CoachMatch[]> {
    return this.getTeamMatches(teamId, { ...filters, status: 'played' });
  }

  /**
   * Récupère le prochain match à jouer
   */
  getNextMatch(teamId: string): Observable<CoachMatch | null> {
    return this.getUpcomingMatches(teamId).pipe(
      map(matches => {
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
  // STAFF METHODS
  // ============================================

  /**
   * Récupère le staff d'une équipe
   */
  getTeamStaff(teamId: string): Observable<CoachStaffMember[]> {
    console.log('🔄 [COACH SERVICE] GET /teams/' + teamId + '/staffs');
    
    return this.http.get<ApiResponse<StaffResponse>>(`${this.baseUrl}/teams/${teamId}/staffs`).pipe(
      map(res => {
        console.log('✅ [COACH SERVICE] Staff reçu:', res);
        
        if (res?.data?.staff) {
          return res.data.staff;
        }
        if (Array.isArray(res?.data)) {
          return res.data;
        }
        return [];
      }),
      catchError(err => {
        console.error('❌ [COACH SERVICE] Erreur lors du chargement du staff:', err);
        return of([]);
      })
    );
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Enrichit les matchs avec des données calculées (adversaire, domicile/extérieur, etc.)
   */
  enrichMatches(matches: CoachMatch[], teamId: string): EnrichedMatch[] {
    const now = new Date();
    
    return matches.map(match => {
      const isHome = match.team_one_id === teamId || match.home_club_id === teamId;
      const matchDate = new Date(match.scheduled_at);
      const daysUntilMatch = Math.ceil((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...match,
        isHome,
        opponent: isHome ? match.team_two : match.team_one,
        myTeam: isHome ? match.team_one : match.team_two,
        matchDate,
        daysUntilMatch,
        isUpcoming: matchDate > now,
        isPast: matchDate < now
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
        return matches.filter(m => m.matchDate >= now && m.matchDate <= endOfToday);
        
      case 'week':
        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        return matches.filter(m => m.matchDate >= now && m.matchDate <= endOfWeek);
        
      case 'month':
        const endOfMonth = new Date(now);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        return matches.filter(m => m.matchDate >= now && m.matchDate <= endOfMonth);
        
      case 'all':
      default:
        return matches;
    }
  }

  /**
   * Trie les matchs
   */
  sortMatches(
    matches: EnrichedMatch[], 
    sortBy: 'date_asc' | 'date_desc' | 'competition' | 'opponent'
  ): EnrichedMatch[] {
    return [...matches].sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return a.matchDate.getTime() - b.matchDate.getTime();
          
        case 'date_desc':
          return b.matchDate.getTime() - a.matchDate.getTime();
          
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
    const sixMonthsFromNow = new Date(now.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
    
    if (endDate < now) return 'EXPIRED';
    if (endDate <= sixMonthsFromNow) return 'EXPIRING';
    return 'VALID';
  }

  /**
   * Groupe les matchs par saison
   */
  groupMatchesBySeason(matches: EnrichedMatch[]): Map<string, EnrichedMatch[]> {
    const grouped = new Map<string, EnrichedMatch[]>();
    
    matches.forEach(match => {
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
    
    matches.forEach(match => {
      const competitionId = match.pool?.id || 'unknown';
      if (!grouped.has(competitionId)) {
        grouped.set(competitionId, []);
      }
      grouped.get(competitionId)!.push(match);
    });
    
    return grouped;
  }
}
