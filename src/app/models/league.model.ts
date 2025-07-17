import { Group } from "./group.model";
import { Season } from "./season.model";
import { Team } from "./team.model";

export interface League {
  id?: string;
  name?: string;
  teams_count?: number;
  teams?: Team[]
  seasons?: Season[];
  logo?: string;
  /////////////
  groups?: Group[];
  group_count?: number;

}

