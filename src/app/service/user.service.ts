import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

// Interface pour la réponse de l'API
interface ApiResponse<T> {
  status: boolean;
  data: T;
  message: string;
  meta?: {
    current_page: string;
    per_page: string;
    total: string;
    last_page: string;
    from: string;
    to: string;
  };
  links?: {
    first: string;
    last: string;
    prev: string;
    next: string;
  };
}

// Interface pour la création d'utilisateur selon votre API
interface CreateUserRequest {
  last_name: string;
  first_name: string;
  email: string;
  roles: string[];
}

// Interface pour les rôles disponibles
interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/users';
  private rolesUrl = environment.apiUrl + '/roles';

  constructor(private http: HttpClient) {}

  // Récupérer tous les rôles disponibles depuis le backend
  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.rolesUrl);
  }

  // Récupérer tous les utilisateurs avec pagination
  getAll(page: number = 1, perPage: number = 10): Observable<ApiResponse<User[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  // Récupérer tous les utilisateurs sans pagination
  getAllUsers(): Observable<ApiResponse<User[]>> {
    let params = new HttpParams().set('per_page', '1000');
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params })
      .pipe(
        tap(response => console.log('Réponse getAllUsers:', response)),
        catchError(error => {
          console.error('Erreur getAllUsers:', error);
          return throwError(() => error);
        })
      );
  }

  // Récupérer un utilisateur par son slug - MÉTHODE CORRIGÉE
  getBySlug(slug: string): Observable<ApiResponse<User>> {
    const url = `${this.apiUrl}/${slug}`;
    
    console.log('=== DEBUG getBySlug ===');
    console.log('URL construite:', url);
    console.log('Slug reçu:', slug);
    console.log('apiUrl de base:', this.apiUrl);
    
    return this.http.get<ApiResponse<User>>(url)
      .pipe(
        tap(response => {
          console.log('=== RÉPONSE getBySlug ===');
          console.log('Réponse complète:', response);
          console.log('Status:', response?.status);
          console.log('Data:', response?.data);
          console.log('Message:', response?.message);
          
          // Vérifier la structure des rôles
          if (response?.data && (response.data as any).roles) {
            console.log('Rôles dans la réponse:', (response.data as any).roles);
            console.log('Type des rôles:', typeof (response.data as any).roles);
          }
        }),
        catchError(error => {
          console.error('=== ERREUR getBySlug ===');
          console.error('Erreur complète:', error);
          console.error('Status:', error.status);
          console.error('URL qui a échoué:', url);
          console.error('Message d\'erreur:', error.message);
          console.error('Corps de l\'erreur:', error.error);
          
          return throwError(() => error);
        })
      );
  }

  // Créer un utilisateur
  create(user: CreateUserRequest): Observable<ApiResponse<string>> {
    console.log('=== CRÉATION UTILISATEUR ===');
    console.log('URL complète:', this.apiUrl);
    console.log('Données utilisateur à envoyer:', JSON.stringify(user, null, 2));
    console.log('Type de roles:', typeof user.roles, Array.isArray(user.roles));
    console.log('Valeurs des rôles:', user.roles);
    
    return this.http.post<ApiResponse<string>>(this.apiUrl, user)
      .pipe(
        tap(response => console.log('Réponse création:', response)),
        catchError(error => {
          console.error('Erreur création utilisateur:', error);
          return throwError(() => error);
        })
      );
  }

  // Mettre à jour un utilisateur par son slug
  update(slug: string, user: CreateUserRequest): Observable<ApiResponse<string>> {
    const url = `${this.apiUrl}/${slug}`;
    
    console.log('=== MISE À JOUR UTILISATEUR ===');
    console.log('URL:', url);
    console.log('Slug:', slug);
    console.log('Données:', user);
    
    return this.http.put<ApiResponse<string>>(url, user)
      .pipe(
        tap(response => console.log('Réponse mise à jour:', response)),
        catchError(error => {
          console.error('Erreur mise à jour utilisateur:', error);
          return throwError(() => error);
        })
      );
  }

  // Supprimer un utilisateur par son slug
  delete(slug: string): Observable<ApiResponse<any>> {
    const url = `${this.apiUrl}/${slug}`;
    
    console.log('=== SUPPRESSION UTILISATEUR ===');
    console.log('URL:', url);
    console.log('Slug:', slug);
    
    return this.http.delete<ApiResponse<any>>(url)
      .pipe(
        tap(response => console.log('Réponse suppression:', response)),
        catchError(error => {
          console.error('Erreur suppression utilisateur:', error);
          return throwError(() => error);
        })
      );
  }

  // Activation de compte via invitation
  confirmInvitation(payload: { token: string; password: string; password_confirmation: string }): Observable<ApiResponse<string>> {
    const url = environment.apiUrl + '/users/users/confirm-invitation';
    return this.http.post<ApiResponse<string>>(url, payload);
  }

  // Renvoyer le lien d'invitation
  resendInvitation(payload: { email: string }): Observable<ApiResponse<string>> {
    const url = environment.apiUrl + '/users/users/invitation/resend';
    return this.http.post<ApiResponse<string>>(url, payload);
  }
}