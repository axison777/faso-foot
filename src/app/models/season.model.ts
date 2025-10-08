import { League } from "./league.model";
import { MatchDay } from "./match-day.model";

export interface Season {
  id?: string;
  start_date?: Date;
  end_date?: Date;
  match_days?: MatchDay[];

  league_id?: string;
  league?: League;
}
