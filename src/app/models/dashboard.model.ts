import { Team } from './team.model';
import { Match } from './match.model';

export interface ClubDashboard {
  id: string;
  name: string;
  logo?: string;
  teams: Team[];
  stats: ClubStats;
}

export interface ClubStats {
  totalMatches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  ranking?: number;
}

export interface TeamStats {
  teamId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  recentForm: ('V' | 'N' | 'D')[];
}

export interface MatchListItem {
  id: string;
  number?: number;
  competition: {
    id: string;
    name: string;
    type: 'LEAGUE' | 'CUP' | 'TOURNAMENT';
  };
  seasonId?: string;
  opponent: {
    id: string;
    name: string;
    logo?: string;
  };
  homeAway: 'HOME' | 'AWAY';
  stadium: {
    id: string;
    name: string;
  };
  scheduledAt: string;
  status: 'UPCOMING' | 'PLAYED' | 'CANCELLED';
  score?: {
    home: number;
    away: number;
  };
  phase?: string;
}

export interface StandingItem {
  teamId: string;
  teamName: string;
  rank: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}
