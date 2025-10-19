/**
 * Modèles TypeScript pour les réponses API de la vue Coach
 * Basé sur les réponses réelles du backend
 */

// ============================================
// PLAYER MODELS
// ============================================

export interface CoachPlayer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birth_place: string;
  date_of_birth: string;
  blood_type: string;
  nationality: string;
  height: number; // cm
  weight: number; // kg
  foot_preference: 'LEFT' | 'RIGHT' | 'BOTH';
  preferred_position: string; // GK, CB, RB, LB, CDM, CM, RM, LM, RW, LW, ST
  jersey_number: number;
  license_number: string;
  status: 'ACTIVE' | 'INJURED' | 'SUSPENDED' | 'TIRED';
  photo?: string;
  
  // Optional fields that might be added later
  fitness_level?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  injury_type?: string;
  injury_start_date?: string;
  injury_end_date?: string;
  suspension_reason?: string;
  suspension_end_date?: string;
  contract_end_date?: string;
  
  // Statistics
  statistics?: PlayerStatistics;
}

export interface PlayerStatistics {
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  matches_played: number;
  minutes_played: number;
  shots_on_target?: number;
  pass_accuracy?: number;
  tackles?: number;
  interceptions?: number;
}

// ============================================
// MATCH MODELS
// ============================================

/**
 * Statuts possibles d'un match (basés sur le backend)
 */
export type MatchStatus = 
  | 'not_started'
  | 'in_progress'
  | 'finished'
  | 'cancelled'
  | 'postponed'
  | 'planned'
  | 'completed'
  | 'validated';

export interface CoachMatch {
  id: string;
  team_one_id: string;
  team_two_id: string;
  home_club_id: string;
  away_club_id: string;
  season_id: string;
  pool_id: string;
  match_day_id: string;
  stadium_id: string;
  scheduled_at: string; // ISO date string
  match_start_time: string | null;
  status?: MatchStatus; // Statut du match
  leg: 'first_leg' | 'second_leg';
  is_derby: 0 | 1;
  is_rescheduled: 0 | 1;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  
  // Relations
  team_one: CoachTeam;
  team_two: CoachTeam;
  season: CoachSeason;
  pool: CoachPool;
  match_day: CoachMatchDay;
  stadium: CoachStadium;
}

export interface CoachTeam {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  email: string;
  phone: string;
  city_id: string;
  league_id: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  fondation_year: string | null;
  manager_first_name: string | null;
  manager_last_name: string | null;
  manager_role: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachSeason {
  id: string;
  league_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface CoachPool {
  id: string;
  season_id: string;
  name: string;
  match_start_time: string;
  min_days_between_phases: number;
  min_hours_between_team_matches: number;
  allowed_match_days: string; // JSON array as string
  created_at: string;
  updated_at: string;
}

export interface CoachMatchDay {
  id: string;
  pool_id: string;
  season_id: string;
  number: number;
  leg: 'first_leg' | 'second_leg';
  status: 'planned' | 'in_progress' | 'completed';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface CoachStadium {
  id: string;
  name: string;
  abbreviation: string;
  city_id: string;
  type_of_field: string | null;
  max_matches_per_day: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// STAFF MODELS
// ============================================

export interface CoachStaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  license_number?: string;
  photo?: string;
  date_of_birth?: string;
  nationality?: string;
}

// ============================================
// API RESPONSE WRAPPERS
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PlayersResponse {
  players: CoachPlayer[];
}

export interface MatchesResponse {
  matches?: CoachMatch[];
  data?: CoachMatch[];
  total?: number;
}

export interface StaffResponse {
  staff: CoachStaffMember[];
}

// ============================================
// FILTER OPTIONS FOR API CALLS
// ============================================

export interface MatchFilterOptions {
  status?: 'upcoming' | 'played' | 'in_progress' | 'postponed';
  season_id?: string;
  pool_id?: string;
  date_from?: string; // YYYY-MM-DD
  date_to?: string; // YYYY-MM-DD
  type?: string;
  stadium_id?: string;
  match_day_id?: string;
}

// ============================================
// HELPER TYPES FOR COMPUTED DATA
// ============================================

export interface EnrichedMatch extends CoachMatch {
  // Computed properties added by the frontend
  isHome: boolean;
  opponent: CoachTeam;
  myTeam: CoachTeam;
  matchDate: Date;
  daysUntilMatch?: number;
  isUpcoming: boolean;
  isPast: boolean;
}

export interface PlayerWithStats extends CoachPlayer {
  age: number;
  contractStatus: 'VALID' | 'EXPIRING' | 'EXPIRED';
  displayName: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retourne le label français pour un statut de match
 */
export function getMatchStatusLabel(status: MatchStatus | undefined): string {
  if (!status) return 'Non défini';
  
  const labels: Record<MatchStatus, string> = {
    'not_started': 'Non commencé',
    'planned': 'Planifié',
    'in_progress': 'En cours',
    'finished': 'Terminé',
    'completed': 'Complété',
    'validated': 'Validé',
    'postponed': 'Reporté',
    'cancelled': 'Annulé'
  };
  
  return labels[status] || status;
}

/**
 * Retourne la classe CSS pour un statut de match
 */
export function getMatchStatusClass(status: MatchStatus | undefined): string {
  if (!status) return 'status-unknown';
  
  const classes: Record<MatchStatus, string> = {
    'not_started': 'status-not-started',
    'planned': 'status-planned',
    'in_progress': 'status-in-progress',
    'finished': 'status-finished',
    'completed': 'status-completed',
    'validated': 'status-validated',
    'postponed': 'status-postponed',
    'cancelled': 'status-cancelled'
  };
  
  return classes[status] || 'status-unknown';
}
