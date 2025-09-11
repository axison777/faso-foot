import { Club } from "./club.model";
import { Team } from "./team.model";

export interface TeamKit {
    id?: string;
    name?: string;
    type?: "home" | "away" | "third";
    shorts_color_1?: string;
    shorts_color_2?: string
    shirt_color_1?: string;
    shirt_color_2?: string;
    socks_color?: string;
    photo_url?: string;
    team_id?: string;
    team?: Team;
    club_id?: string;
    club?: Club

    primary_color?: string;
    secondary_color?: string;
    tertiary_color?: string;

}
