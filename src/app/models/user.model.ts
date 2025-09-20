export interface User {
  slug?: string;           // Utilisation de slug au lieu d'id
  email?: string;
  first_name?: string;
  last_name?: string;
  roles?: string[];        // Array de rôles au lieu d'un seul rôle
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface pour la création d'utilisateur (selon votre API)
export interface CreateUserRequest {
  last_name: string;
  first_name: string;
  email: string;
  roles: string[];
}