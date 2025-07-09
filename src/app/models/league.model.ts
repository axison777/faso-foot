import { Season } from "./season.model";

export interface League {
  id?: string;
  name?: string;
  teams_count?: number;
  seasons?: Season[];
  logo?: string;

}
