import { City } from "./city.model";
import { Stadium } from "./stadium.model";
import { Suspension } from "./suspension.model";
import { TeamKit } from "./team-kit.model";
import { Team } from "./team.model";

export interface Club {
  id?: string;
  name?: string;
  abbreviation?: string;
  logo?: string;
  fonded_year?: string;
  status?:  "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DISSOLVED";

  // Informations de contact
  phone?: string;
  email?: string;
  website?: string;

  // Adresse
  street?: string;
  city?: string | City;
  city_id?: string;
  country?: string;

  // Relations
  teams?: Team[];
  team_count?: number;

  // Responsable
  responsable_first_name?: string;
  responsable_last_name?: string;
  responsable_position?: string;
  responsable_phone?: string;
  responsable_email?: string;

  // Équipements
  kits?: TeamKit[];
  stadium_id?: string;
  stadium?: Stadium;
  suspensions?: Suspension[];
}


