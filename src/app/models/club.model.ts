import { City } from "./city.model";
import { Team } from "./team.model";

export interface Club {
  id?: string;
  name?: string;
  abbreviation?: string;
  logo?: string;
  fonded_year?: string;
  status?:  "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DISSOLVED";


  //////////
 phone?: string;
  email?: string;

  city_id?: string;
  city?: City;


  teams?: Team[];
  team_count?: number

  responsable_first_name?: string;
  responsable_last_name?: string;
  responsable_position?: string;
  responsable_phone?: string;
  responsable_email?: string;

}


