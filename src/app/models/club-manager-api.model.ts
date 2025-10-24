/**
 * Modèles TypeScript pour les réponses API de la vue Club Manager
 * Basé sur les réponses réelles du backend
 */

// ============================================
// CLUB MODELS
// ============================================

export interface ClubManagerClub {
    id: string;
    name: string;
    abbreviation: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DISSOLVED';
    logo?: string;
    phone?: string;
    email?: string;
    website?: string;
    fonded_year?: string;
    
    // Relations
    teams?: ClubManagerTeam[];
}

// ============================================
// TEAM MODELS  
// ============================================

export interface ClubManagerTeam {
    id: string;
    name: string;
    abbreviation: string;
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DISSOLVED';
    logo?: string;
    phone?: string;
    email?: string;
    city_id?: string;
    
    // Relations
    league?: {
        id: string;
        name: string;
    };
    club?: {
        id: string;
        name: string;
    };
    category?: {
        id: string;
        name: string;
    };
    
    // Compteurs
    player_count?: number;
    staff_count?: number;
}

// ============================================
// PLAYER MODELS (réutiliser ceux du coach)
// ============================================

export interface ClubManagerPlayer {
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
    preferred_position: string;
    jersey_number: number;
    license_number: string;
    status: 'ACTIVE' | 'INJURED' | 'SUSPENDED' | 'TIRED';
    photo?: string;
    
    // Team relation
    team_id?: string;
    team?: ClubManagerTeam;
    
    // Optional fields
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
// STAFF MODELS
// ============================================

export interface ClubManagerStaffMember {
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
    
    // Team relation
    team_id?: string;
    team?: ClubManagerTeam;
}

// ============================================
// MATCH MODELS (réutiliser ceux du coach)
// ============================================

export type MatchStatus = 'not_started' | 'in_progress' | 'finished' | 'cancelled' | 'postponed' | 'planned' | 'completed' | 'validated';

export interface ClubManagerMatch {
    id: string;
    team_one_id: string;
    team_two_id: string;
    home_club_id: string;
    away_club_id: string;
    season_id: string;
    pool_id: string;
    match_day_id: string;
    stadium_id: string;
    scheduled_at: string;
    match_start_time: string | null;
    status?: MatchStatus;
    leg: 'first_leg' | 'second_leg';
    is_derby: 0 | 1;
    is_rescheduled: 0 | 1;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    
    // Relations
    team_one: ClubManagerTeam;
    team_two: ClubManagerTeam;
    season: Season;
    pool: Pool;
    match_day: MatchDay;
    stadium: Stadium;
}

export interface Season {
    id: string;
    league_id: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

export interface Pool {
    id: string;
    season_id: string;
    name: string;
    match_start_time: string;
    min_days_between_phases: number;
    min_hours_between_team_matches: number;
    allowed_match_days: string;
    created_at: string;
    updated_at: string;
}

export interface MatchDay {
    id: string;
    pool_id: string;
    season_id: string;
    number: number;
    label: string | null;
    leg: 'first_leg' | 'second_leg';
    status: 'planned' | 'in_progress' | 'completed';
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
}

export interface Stadium {
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
// API RESPONSE WRAPPERS
// ============================================

export interface ClubApiResponse {
    status: boolean;
    data: {
        club: ClubManagerClub;
    };
    message: string;
}

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
    links: PaginationLinks;
}

export interface ClubManagerMatchResponse extends PaginatedResponse<ClubManagerMatch> {}

// ============================================
// FILTER OPTIONS FOR API CALLS
// ============================================

export interface MatchFilterOptions {
    status?: MatchStatus;
    season_id?: string;
    pool_id?: string;
    date_from?: string; // YYYY-MM-DD
    date_to?: string; // YYYY-MM-DD
    type?: string;
    stadium_id?: string;
    match_day_id?: string;
    per_page?: number;
    page?: number;
}

// ============================================
// ENRICHED DATA MODELS
// ============================================

export interface EnrichedMatch extends ClubManagerMatch {
    isHome: boolean;
    opponent: ClubManagerTeam;
    myTeam: ClubManagerTeam;
    matchDate: Date | null;
    daysUntilMatch?: number;
    isUpcoming: boolean;
    isPast: boolean;
}

export interface PlayerWithStats extends ClubManagerPlayer {
    age: number;
    contractStatus: 'VALID' | 'EXPIRING' | 'EXPIRED';
    displayName: string;
}

// ============================================
// TEAM ENRICHED DATA
// ============================================

export interface TeamWithData extends ClubManagerTeam {
    players?: ClubManagerPlayer[];
    staff?: ClubManagerStaffMember[];
    upcomingMatches?: ClubManagerMatch[];
    pastMatches?: ClubManagerMatch[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getMatchStatusLabel(status: MatchStatus | undefined): string {
    if (!status) return 'Non défini';
    
    const labels: Record<MatchStatus, string> = {
        not_started: 'Non commencé',
        planned: 'Planifié',
        in_progress: 'En cours',
        finished: 'Terminé',
        completed: 'Complété',
        validated: 'Validé',
        postponed: 'Reporté',
        cancelled: 'Annulé'
    };
    
    return labels[status] || status;
}

export function getMatchStatusClass(status: MatchStatus | undefined): string {
    if (!status) return 'status-unknown';
    
    const classes: Record<MatchStatus, string> = {
        not_started: 'status-not-started',
        planned: 'status-planned',
        in_progress: 'status-in-progress',
        finished: 'status-finished',
        completed: 'status-completed',
        validated: 'status-validated',
        postponed: 'status-postponed',
        cancelled: 'status-cancelled'
    };
    
    return classes[status] || 'status-unknown';
}

export function getLegLabel(leg: 'first_leg' | 'second_leg'): string {
    const labels: Record<'first_leg' | 'second_leg', string> = {
        first_leg: 'ALLER',
        second_leg: 'RETOUR'
    };
    
    return labels[leg] || leg;
}
