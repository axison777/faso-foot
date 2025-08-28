import { Club } from "./club.model";

export interface TeamKit {
    id?: string;
    type?: "home" | "away" | "neutral";
    main_color?: string;
    shorts_color?: string;
    shirt_color?: string;
    socks_color?: string;
    photo_url?: string;
    club_id?: string;
    club: Club;

}
