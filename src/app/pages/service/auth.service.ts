import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { LoginCredentials, User, AuthResponse } from '../../models/auth.model';

// Identifiants par défaut pour accès rapide
const DEFAULT_CREDENTIALS = [
  { email: "admin@cbf.com", password: "admin123", name: "Administrateur", role: "admin" },
  { email: "manager@cbf.com", password: "manager123", name: "Manager", role: "manager" },
  { email: "user@cbf.com", password: "user123", name: "Utilisateur", role: "user" }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;

  constructor() {
    // Vérifier si l'utilisateur est déjà connecté
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('current_user');
    
    if (savedToken && savedUser) {
      this.token = savedToken;
      this.currentUser = JSON.parse(savedUser);
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Vérifier les identifiants par défaut
    const defaultUser = DEFAULT_CREDENTIALS.find(
      cred => cred.email === credentials.email && cred.password === credentials.password
    );

    if (defaultUser) {
      const user: User = {
        id: Date.now(),
        email: defaultUser.email,
        name: defaultUser.name,
        role: defaultUser.role
      };

      const token = `token_${Date.now()}_${Math.random()}`;
      
      const authResponse: AuthResponse = { user, token };

      // Sauvegarder dans localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
      
      this.currentUser = user;
      this.token = token;

      return of(authResponse).pipe(delay(800)); // Simule un délai réseau
    } else {
      return throwError(() => new Error('Email ou mot de passe incorrect'));
    }
  }

  logout(): void {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  getDefaultCredentials() {
    return DEFAULT_CREDENTIALS;
  }
}
