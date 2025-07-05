import { MatchDay } from "./match-day.model";
import { Stadium } from "./stadium.model";
import { Team } from "./team.model";

export interface Match {
  id?: number;
  
  team_one_id?: number;
  team_two_id?: number;
  team_one?:Team;
  team_two?:Team;

  stadium_id?: number;
  stadium?:Stadium;

  match_day_id?: number;
  match_day?: MatchDay;

  scheduled_at?: Date;

  leg?: string;

}
