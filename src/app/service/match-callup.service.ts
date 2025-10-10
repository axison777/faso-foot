import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CallupPlayer {
  id: string;
  player_id: string;
  jersey_number: string;
  position: string;
  is_starter: boolean | string;
  substitute_order: string | null;
  first_name: string;
  last_name: string;
  photo: string | null;
  preferred_position: string;
  date_of_birth: string;
  nationality: string;
  role: string;
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
    return this.http.get<any>(`${this.apiUrl}/callups/match/${matchId}`).pipe(
      map(res => res?.data?.match_callups || null),
      catchError((error) => {
        console.error('Erreur chargement callups:', error);
        return of(null);
      })
    );
  }
}
