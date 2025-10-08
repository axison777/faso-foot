import { Group } from "./group.model";
import { League } from "./league.model";
import { Season } from "./season.model";
import { Team } from "./team.model";

export interface Competition {
  id?: string;
  name?: string;
  logo?: string;
  leagues?: League[];
  league_count?: number;



}

