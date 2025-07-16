import { Season } from "./season.model";
import { Team } from "./team.model";

export interface Group {
  id?: string;
  name?: string;
  seasons?: Season[];
  league_name?: string;
  league_logo?: string;
  teams?: Team[]
  teams_count?: number
}
