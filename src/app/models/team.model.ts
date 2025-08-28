import { City } from "./city.model";
import { Contract } from "./contract.model";
import { League } from "./league.model";
import { Player } from "./player.model";
import { TeamCategory } from "./team-category.model";
import { TeamKit } from "./team-kit.model";
import { Trophy } from "./trophy.model";

export interface Team {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  abbreviation?: string;
  logo?: string;
  city_id?: string;
  city?: City;
  logo_url?: string;
  manager_first_name?: string;
  manager_last_name?: string;
  manager_role?: string;
  league_id?: string;
  league?: League;
  team_category_id?: string;
  team_category?: TeamCategory;

  kits?: TeamKit[]
  contracts?: Contract[]
  players?: Player
  trophies?: Trophy[]

}
