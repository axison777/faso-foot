import { Club } from "./club.model";
import { Player } from "./player.model";
import { Team } from "./team.model";

export interface Contract {
    id?: string;
    player_id?: string;
    player?: Player
    type?: string;
    start_date?: string;
    end_date?: string;
    team?: Team;
    number?: number;
    position?: string;
    role?: string;

    salary_amount?: number;
    status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
    clauses?: { type: string; value: string }[];
    club_id?: string;
    club?: Club;
}
