import { City } from "./city.model";

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

}
