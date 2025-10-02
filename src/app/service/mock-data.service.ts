import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ClubDashboard, ClubStats, TeamStats, MatchListItem } from '../models/dashboard.model';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {

  getMockClub(): Observable<ClubDashboard> {
    const mockClub: ClubDashboard = {
      id: 'club-1',
      name: 'FC Ouagadougou',
      logo: 'https://via.placeholder.com/100/329157/FFFFFF?text=FCO',
      teams: [
        {
          id: 'team-1',
          name: 'FC Ouagadougou Seniors',
          logo: 'https://via.placeholder.com/80/329157/FFFFFF?text=SEN',
          category: { id: 'cat-1', name: 'Seniors' }
        },
        {
          id: 'team-2',
          name: 'FC Ouagadougou U19',
          logo: 'https://via.placeholder.com/80/167B4A/FFFFFF?text=U19',
          category: { id: 'cat-2', name: 'U19' }
        },
        {
          id: 'team-3',
          name: 'FC Ouagadougou U17',
          logo: 'https://via.placeholder.com/80/22c55e/FFFFFF?text=U17',
          category: { id: 'cat-3', name: 'U17' }
        }
      ],
      stats: {
        totalMatches: 45,
        wins: 28,
        draws: 10,
        losses: 7,
        goalsFor: 82,
        goalsAgainst: 35,
        ranking: 2
      }
    };
    return of(mockClub).pipe(delay(500));
  }

  getMockClubStats(): Observable<ClubStats> {
    return of({
      totalMatches: 45,
      wins: 28,
      draws: 10,
      losses: 7,
      goalsFor: 82,
      goalsAgainst: 35,
      ranking: 2
    }).pipe(delay(300));
  }

  getMockTeam(): Observable<Team> {
    const mockTeam: Team = {
      id: 'team-1',
      name: 'AS Bobo-Dioulasso',
      logo: 'https://via.placeholder.com/100/329157/FFFFFF?text=ASB',
      category: { id: 'cat-1', name: 'Seniors' },
      club: { id: 'club-2', name: 'AS Bobo-Dioulasso' },
      player_count: 25
    };
    return of(mockTeam).pipe(delay(500));
  }

  getMockTeamStats(teamId: string): Observable<TeamStats> {
    const stats: TeamStats = {
      teamId,
      played: 15,
      wins: 9,
      draws: 4,
      losses: 2,
      goalsFor: 28,
      goalsAgainst: 12,
      goalDifference: 16,
      recentForm: ['V', 'V', 'N', 'V', 'D']
    };
    return of(stats).pipe(delay(300));
  }

  getMockNextMatch(teamId: string): Observable<MatchListItem | null> {
    const nextMatch: MatchListItem = {
      id: 'match-1',
      number: 16,
      competition: {
        id: 'comp-1',
        name: 'Championnat National D1',
        type: 'LEAGUE' as const
      },
      seasonId: 'season-1',
      opponent: {
        id: 'team-x',
        name: 'ASFA Yennenga',
        logo: 'https://via.placeholder.com/64/dc2626/FFFFFF?text=ASF'
      },
      homeAway: 'HOME',
      stadium: {
        id: 'stadium-1',
        name: 'Stade du 4 Août'
      },
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'UPCOMING'
    };
    return of(nextMatch).pipe(delay(300));
  }

  getMockMatches(teamId: string, status: 'UPCOMING' | 'PLAYED'): Observable<MatchListItem[]> {
    if (status === 'UPCOMING') {
      return of([
        {
          id: 'match-1',
          number: 16,
          competition: {
            id: 'comp-1',
            name: 'Championnat National D1',
            type: 'LEAGUE' as const
          },
          opponent: {
            id: 'team-x',
            name: 'ASFA Yennenga',
            logo: 'https://via.placeholder.com/32/dc2626/FFFFFF?text=ASF'
          },
          homeAway: 'HOME' as const,
          stadium: { id: 'stadium-1', name: 'Stade du 4 Août' },
          scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'UPCOMING' as const
        },
        {
          id: 'match-2',
          number: 17,
          competition: {
            id: 'comp-1',
            name: 'Championnat National D1',
            type: 'LEAGUE' as const
          },
          opponent: {
            id: 'team-y',
            name: 'Rail Club du Kadiogo',
            logo: 'https://via.placeholder.com/32/f59e0b/FFFFFF?text=RCK'
          },
          homeAway: 'AWAY' as const,
          stadium: { id: 'stadium-2', name: 'Stade Municipal' },
          scheduledAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'UPCOMING' as const
        },
        {
          id: 'match-3',
          number: 18,
          competition: {
            id: 'comp-2',
            name: 'Coupe du Faso',
            type: 'CUP' as const
          },
          opponent: {
            id: 'team-z',
            name: 'Étoile Filante',
            logo: 'https://via.placeholder.com/32/22c55e/FFFFFF?text=EF'
          },
          homeAway: 'HOME' as const,
          stadium: { id: 'stadium-1', name: 'Stade du 4 Août' },
          scheduledAt: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'UPCOMING' as const,
          phase: 'Quart de finale'
        }
      ]).pipe(delay(400));
    } else {
      return of([
        {
          id: 'match-p1',
          number: 15,
          competition: {
            id: 'comp-1',
            name: 'Championnat National D1',
            type: 'LEAGUE' as const
          },
          opponent: {
            id: 'team-a',
            name: 'US Ouagadougou',
            logo: 'https://via.placeholder.com/32/329157/FFFFFF?text=USO'
          },
          homeAway: 'AWAY' as const,
          stadium: { id: 'stadium-3', name: 'Stade Issoufou Joseph Conombo' },
          scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PLAYED' as const,
          score: { home: 1, away: 2 }
        },
        {
          id: 'match-p2',
          number: 14,
          competition: {
            id: 'comp-1',
            name: 'Championnat National D1',
            type: 'LEAGUE' as const
          },
          opponent: {
            id: 'team-b',
            name: 'AS Douanes',
            logo: 'https://via.placeholder.com/32/167B4A/FFFFFF?text=ASD'
          },
          homeAway: 'HOME' as const,
          stadium: { id: 'stadium-1', name: 'Stade du 4 Août' },
          scheduledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PLAYED' as const,
          score: { home: 3, away: 1 }
        },
        {
          id: 'match-p3',
          number: 13,
          competition: {
            id: 'comp-1',
            name: 'Championnat National D1',
            type: 'LEAGUE' as const
          },
          opponent: {
            id: 'team-c',
            name: 'Rahimo FC',
            logo: 'https://via.placeholder.com/32/dc2626/FFFFFF?text=RFC'
          },
          homeAway: 'HOME' as const,
          stadium: { id: 'stadium-1', name: 'Stade du 4 Août' },
          scheduledAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PLAYED' as const,
          score: { home: 2, away: 2 }
        },
        {
          id: 'match-p4',
          number: 12,
          competition: {
            id: 'comp-1',
            name: 'Championnat National D1',
            type: 'LEAGUE' as const
          },
          opponent: {
            id: 'team-d',
            name: 'AS Sonabel',
            logo: 'https://via.placeholder.com/32/f59e0b/FFFFFF?text=ASS'
          },
          homeAway: 'AWAY' as const,
          stadium: { id: 'stadium-4', name: 'Stade de Koudougou' },
          scheduledAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'PLAYED' as const,
          score: { home: 0, away: 1 }
        }
      ]).pipe(delay(400));
    }
  }
}
