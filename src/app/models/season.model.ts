import { MatchDay } from "./match-day.model";

export interface Season {
  id?: number;
  start_date?: Date;
  end_date?: Date;
  match_days?: MatchDay[];
}
