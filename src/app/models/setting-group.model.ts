export interface SettingGroup {
  id?: string;
  match_start_time?: Date;
  allowed_match_days?: string[];
  min_hours_between_team_matches?: number;
  min_days_between_phases?: number;
  cities?: {id:string, min: number}[];

}
