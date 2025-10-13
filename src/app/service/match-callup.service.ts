import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CallupPlayer {
  id: string;
  player_id: string;
  jersey_number: string | number;
  position: string;
  is_starter: boolean | string | number;
  substitute_order: string | number | null;
  first_name: string;
  last_name: string;
  photo: string | null;
  preferred_position: string;
  date_of_birth: string;
  nationality: string;
  role: string;
  callup_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamCallup {
  id: string;
  match_id: string;
  team_id: string;
  team_name: string;
  team_logo: string | null;
  coach_id: string;
  coach_name: string;
  status: string;
  formation: string | null;
  captain_id: string;
  captain_name: string;
  captain_jersey_number: string;
  captain: {
    id: string;
    name: string;
    jersey_number: string;
  };
  coach: {
    id: string;
    name: string;
  };
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  players: CallupPlayer[];
  total_players: number | string;
  starters_count: number | string;
  substitutes_count: number | string;
  is_finalized: boolean;
  can_be_edited: boolean;
}

export interface MatchCallups {
  id: string;
  team_one_callup: TeamCallup;
  team_two_callup: TeamCallup;
}

@Injectable({
  providedIn: 'root'
})
export class MatchCallupService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtenir les appels d'un match (feuilles de match)
   */
  getMatchCallups(matchId: string): Observable<MatchCallups | null> {
    console.log(`[MatchCallupService] Récupération des callups pour le match: ${matchId}`);
    console.log(`[MatchCallupService] URL complète: ${this.apiUrl}/callups/match/${matchId}`);
    
    return this.http.get<any>(`${this.apiUrl}/callups/match/${matchId}`).pipe(
      map(res => {
        console.log('[MatchCallupService] Réponse API reçue:', res);
        const callups = res?.data?.match_callups;
        
        if (callups) {
          console.log('[MatchCallupService] Callups trouvés:', {
            team_one: callups.team_one_callup?.team_name,
            team_one_players: callups.team_one_callup?.players?.length || 0,
            team_two: callups.team_two_callup?.team_name,
            team_two_players: callups.team_two_callup?.players?.length || 0
          });
          
          // Log détaillé des premiers joueurs pour vérifier la structure
          if (callups.team_one_callup?.players?.length > 0) {
            console.log('[MatchCallupService] Premier joueur team_one:', callups.team_one_callup.players[0]);
          }
          if (callups.team_two_callup?.players?.length > 0) {
            console.log('[MatchCallupService] Premier joueur team_two:', callups.team_two_callup.players[0]);
          }
        } else {
          console.warn('[MatchCallupService] Aucun callup trouvé dans la réponse');
        }
        
        return callups || null;
      }),
      catchError((error) => {
        console.error('[MatchCallupService] Erreur lors du chargement des callups:', {
          message: error.message,
          status: error.status,
          url: error.url,
          error: error
        });
        return of(null);
      })
    );
  }
}
