import { City } from "./city.model";

export interface Stadium {
  id?: number;
  city_id?: number;
  city?: City;
  name?: string;
  abbreviation?: string;
  max_matches_per_day?: number;

}
