import { Player } from "./player.model";
import { Team } from "./team.model";

export interface Contract {
    id?: string;
    player_id?: string;
    player?: Player
    type?: string;
    start_date?: string;
    end_date?: string;
    team: Team;
    number?: number;
    position?: string;
    role?: string;
}
