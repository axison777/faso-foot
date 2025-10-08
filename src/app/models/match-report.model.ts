export interface MatchReport {
    id?: string;
    matchId: string;
    officialId: string;
    reportType: 'REFEREE' | 'COMMISSIONER';
    
    // Informations générales
    weather?: string;
    fieldCondition?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    attendance?: number;
    incidents?: string;
    
    // Score et événements (pour arbitres)
    firstHalfScore?: { home: number; away: number };
    secondHalfScore?: { home: number; away: number };
    finalScore?: { home: number; away: number };
    events?: MatchEvent[];
    
    // Discipline
    yellowCards?: CardEvent[];
    redCards?: CardEvent[];
    
    // Évaluation des arbitres (pour commissaires)
    refereeEvaluation?: RefereeEvaluation;
    
    // Résumé et signature
    summary?: string;
    electronicSignature?: string;
    commissionerCode?: string;
    
    // Statut
    status: 'DRAFT' | 'SUBMITTED' | 'VALIDATED';
    submittedAt?: Date;
    validatedAt?: Date;
    
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MatchEvent {
    id?: string;
    type: 'GOAL' | 'PENALTY' | 'INJURY' | 'SUBSTITUTION' | 'OTHER';
    minute: number;
    team: 'HOME' | 'AWAY';
    playerName?: string;
    playerNumber?: number;
    description?: string;
}

export interface CardEvent {
    id?: string;
    type: 'YELLOW' | 'RED';
    minute: number;
    team: 'HOME' | 'AWAY';
    playerName: string;
    playerNumber: number;
    reason?: string;
}

export interface RefereeEvaluation {
    centralReferee?: OfficialEvaluation;
    assistantReferee1?: OfficialEvaluation;
    assistantReferee2?: OfficialEvaluation;
    fourthOfficial?: OfficialEvaluation;
}

export interface OfficialEvaluation {
    officialId: string;
    officialName: string;
    role: 'CENTRAL' | 'ASSISTANT_1' | 'ASSISTANT_2' | 'FOURTH';
    
    // Critères d'évaluation (sur 10)
    lawApplication: number;
    positioning: number;
    matchControl: number;
    communication: number;
    collaboration: number;
    
    // Note globale
    overallRating: number;
    overallGrade: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
    
    // Commentaires
    comments?: string;
}

export interface MatchIncident {
    id?: string;
    matchId: string;
    type: 'BEFORE_MATCH' | 'DURING_MATCH' | 'AFTER_MATCH';
    category: 'TEAM_INCOMPLETE' | 'FIELD_UNPLAYABLE' | 'DELAY' | 'DISCIPLINE' | 'TECHNICAL' | 'OTHER';
    description: string;
    reportedBy: string;
    reportedAt: Date;
    status: 'PENDING' | 'RESOLVED' | 'ESCALATED';
    resolution?: string;
}