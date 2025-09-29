export interface Specialization {
    id?: number;
    officialId?: string;
    type: 'VAR' | 'FUTSAL' | 'YOUTH' | 'OTHER';
    certifiedAt?: Date;
    level?: string;
}

export interface MatchAssignment {
    id?: number;
    officialId?: string;
    matchId?: string;
    role?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OfficialReport {
    id?: number;
    officialId?: string;
    content: string;
    reportDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OfficialStatistics {
    id?: number;
    officialId?: string;
    matchesOfficiated: number;
    yellowCardsGiven: number;
    redCardsGiven: number;
    penaltiesAwarded: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MatchPivot {
    official_id: string;
    match_id: string;
    role: string;
}

export interface Match {
    id: string;
    // ... autres propriétés si besoin
    pivot: MatchPivot;
}

export interface Official {
    id?: string;
    first_name: string;
    last_name: string;
    date_of_birth?: Date;
    birth_place?: string;
    nationality?: string;
    email?: string;

    official_type: 'REFEREE' | 'COMMISSIONER';
    license_number: string;
    level: 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';
    status: 'ACTIVE' | 'SUSPENDED' | 'RETIRED';

    certification_date?: Date;
    certification_expiry?: Date;
    structure?: string;
    experience?: number;

    specializations?: Specialization[];
    assignments?: MatchAssignment[];
    reports?: OfficialReport[];
    statistics?: OfficialStatistics;

    createdAt?: Date;
    updatedAt?: Date;

    matches?: Match[];

}
