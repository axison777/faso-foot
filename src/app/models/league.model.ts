import { Season } from "./season.model";

export interface League {
  id?: number;
  name?: string;
  teams_count?: number;
  seasons?: Season[]

}
