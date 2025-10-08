import { City } from "./city.model";

export interface Stadium {
  id?: string;
  city_id?: string;
  city?: City;
  name?: string;
  abbreviation?: string;
  max_matches_per_day?: number;
  type_of_field?: string;

}
