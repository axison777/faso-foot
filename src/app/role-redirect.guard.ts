// src/app/guards/role-redirect.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './service/auth.service';

export const RoleRedirectGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier d'abord si l'utilisateur est authentifié
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Récupérer le rôle de l'utilisateur
  const userRole = authService.getUserRole();

  if (!userRole) {
    // If no role, allow navigation without redirect
    return true;
  }

  // Définir les routes autorisées par rôle
  const roleRoutes: { [key: string]: string } = {
    'admin': '/accueil',
    'club_manager': '/mon-club/dashboard',
    'coach': '/mon-equipe/dashboard',
    'official': '/officiel/dashboard'
  };

  // Si on est sur la page d'accueil ou login, rediriger selon le rôle
  if (state.url === '/' || state.url === '/accueil') {
    const redirectUrl = roleRoutes[userRole];
    if (redirectUrl && redirectUrl !== state.url) {
      router.navigate([redirectUrl]);
      return false;
    }
  }

  return true;
};
