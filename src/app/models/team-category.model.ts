import { Team } from "./team.model";

export interface TeamCategory {
    id: string;
    name?: string;
    gender?: "MALE" | "FEMALE" | "MIXED";
    description?: string;
    teams_count?: number;
    teams?: Team[];
}
