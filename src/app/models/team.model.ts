import { City } from "./city.model";

export interface Team {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
  abbreviation?: string;
  logo?: string;
  city_id?: number;
  city?: City;

}
