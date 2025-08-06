import { MatchDay } from "./match-day.model";
import { Stadium } from "./stadium.model";
import { Team } from "./team.model";

export interface Match {
  id?: string;
  number?: number;
  team_one_id?: string;
  team_two_id?: string;
  team_one?:Team;
  team_two?:Team;

  stadium_id?: string;
  stadium?:Stadium;

  match_day_id?: string;
  match_day?: MatchDay;

  scheduled_at?: Date;

  leg?: string;

}
