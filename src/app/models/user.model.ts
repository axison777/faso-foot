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
  slug?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  roles?: UserRole[]; // Changé de string[] vers UserRole[]
  is_active?: boolean;
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