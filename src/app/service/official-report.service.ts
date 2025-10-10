import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces pour les rapports d'officiels
export interface OfficialReportPayload {
  match_id: string;
  official_id: string;
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWED';
  review_notes?: string;
  match_result: {
    team_one_final_score: number;
    team_two_final_score: number;
    team_one_half_time_score: number;
    team_two_half_time_score: number;
    has_extra_time: boolean;
    team_one_extra_time_score?: number;
    team_two_extra_time_score?: number;
    has_penalties: boolean;
    team_one_penalty_score?: number;
    team_two_penalty_score?: number;
  };
  match_evaluation: {
    difficulty_level: 'Easy' | 'Normal' | 'Difficult' | 'Very Difficult';
    team_one_attitude: string;
    team_two_attitude: string;
    public_attitude: string;
    field_condition: string;
    organization_observation: string;
    general_organization: string;
    control_service: string;
    police_service: string;
    medical_service: string;
    press_service: string;
    spectator_count: number;
    incidents_or_remarks: string;
  };
  main_referee_evaluation?: {
    referee_id: string;
    match_control_score: number;
    match_control_remarks: string;
    physical_condition_score: number;
    physical_condition_remarks: string;
    personality_score: number;
    personality_remarks: string;
    collaboration_score: number;
    collaboration_remarks: string;
    coefficient: number;
  };
  fourth_official_evaluation?: {
    referee_id: string;
    technical_area_control_score: number;
    technical_area_control_remarks: string;
    substitution_management_score: number;
    substitution_management_remarks: string;
    coefficient: number;
  };
  sanctions?: Array<{
    player_id: string;
    team_id: string;
    type: 'WARNING' | 'YELLOW_CARD' | 'RED_CARD' | 'EXPULSION';
    jersey_number: string;
    team: string;
    license_number: string;
    player_name: string;
    minute: number;
    reason: string;
  }>;
  assistant_evaluations?: Array<{
    assistant_number: '1' | '2';
    referee_id: string;
    law_interpretation_score: number;
    law_interpretation_remarks: string;
    physical_condition_score: number;
    physical_condition_remarks: string;
    collaboration_score: number;
    collaboration_remarks: string;
    coefficient: number;
  }>;
}

export interface OfficialReport {
  id: string;
  match_id: string;
  official_id: string;
  status: string;
  submitted_at?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
  is_draft: boolean;
  is_submitted: boolean;
  is_reviewed: boolean;
  can_edit: boolean;
  can_submit: boolean;
  can_review: boolean;
  is_complete: boolean;
  match?: {
    id: string;
    date: string;
    venue: string;
  };
  official?: {
    id: string;
    name: string;
    role: string;
  };
  match_result?: any;
  match_evaluation?: any;
  sanctions?: any[];
  main_referee_evaluation?: any;
  assistant_evaluations?: any[];
  fourth_official_evaluation?: any;
}

@Injectable({
  providedIn: 'root'
})
export class OfficialReportService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer la liste des matchs d'un officiel
   */
  getOfficialMatches(officialId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Official/officialMatchs/${officialId}`).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Récupérer la liste des officiels d'un match
   */
  getMatchOfficials(matchId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Official/matchOfficials/${matchId}`).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Créer un rapport d'officiel
   */
  createReport(payload: OfficialReportPayload): Observable<{ report: OfficialReport }> {
    return this.http.post<any>(`${this.apiUrl}/official-reports`, payload).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Récupérer un rapport par son ID
   */
  getReportById(reportId: string): Observable<{ report: OfficialReport }> {
    return this.http.get<any>(`${this.apiUrl}/official-reports/${reportId}`).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Soumettre un rapport
   */
  submitReport(reportId: string): Observable<{ report: OfficialReport }> {
    return this.http.post<any>(`${this.apiUrl}/official-reports/${reportId}/submit`, {}).pipe(
      map(res => res?.data || res)
    );
  }

  /**
   * Mettre à jour un rapport (mode brouillon)
   */
  updateReport(reportId: string, payload: Partial<OfficialReportPayload>): Observable<{ report: OfficialReport }> {
    return this.http.put<any>(`${this.apiUrl}/official-reports/${reportId}`, payload).pipe(
      map(res => res?.data || res)
    );
  }
}
