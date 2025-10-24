// Interface pour les permissions
export interface Permission {
  slug: string;
  name: string;
}

// Interface pour les rôles complets (avec permissions)
export interface UserRole {
  slug: string;
  name: string;
  permissions?: Permission[];
}

// Interface utilisateur mise à jour pour correspondre au backend
export interface User {
  id?: string;
  slug?: string | null;
  email?: string;
  first_name?: string;
  last_name?: string;
  roles?: UserRole[]; // Changé de string[] vers UserRole[]
  club_id?: string; // ID du club pour les managers
  team_id?: string; // ID de l'équipe pour les coaches
  official_id?: string; // ✅ ID de l'officiel (différent de l'ID utilisateur)
  coach_id?: string | null; // ✅ ID du coach (différent de l'ID utilisateur)
  is_active?: boolean;
  is_official?: boolean; // Indicateur pour les officiels
  is_coach?: boolean | number; // Indicateur pour les coachs (peut être boolean ou 0/1)
  is_club_manager?: boolean | number; // Indicateur pour les managers (peut être boolean ou 0/1)
  created_at?: string;
  updated_at?: string;
}

// Interface pour la création d'utilisateur (toujours avec des strings pour les rôles)
export interface CreateUserRequest {
  last_name: string;
  first_name: string;
  email: string;
  roles: string[]; // On envoie toujours des slugs pour la création/modification
}
