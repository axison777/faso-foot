import { Contract } from "./contract.model";

export interface Player {
  id?: string;

  first_name?: string;
  last_name?: string;
  date_of_birth?: string; // format: date-time
  birth_place?: string;
  nationality?: string;

  phone?: string;
  email?: string; // format: email
  photo_url?: string; // format: binary (<= 2048 chars)
  license_number?: string; // unique: players.license_number
  photo?: any;

  preferred_position?: "GOALKEEPER" | "DEFENSE" | "MIDFIELD" | "ATTACK";
  height?: number;
  weight?: number;
  blood_type?: string;

  foot_preference?: "LEFT" | "RIGHT";
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";

  career_start?: string; // format: date-time
  career_end?: string;   // format: date-time

  secondary_positions?: ("GOALKEEPER" | "DEFENSE" | "MIDFIELD" | "ATTACK")[];

  emergency_contact?: {
    name?: string;
    phone?: string;
    email?: string; // format: email
    relationship?: string;
  }[];

  // Relations possibles
  team_id?: string;
  team?: any;
  contracts?: Contract[];
}
