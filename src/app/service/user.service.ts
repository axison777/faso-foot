import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private rolesUrl = environment.apiUrl + '/roles'; // Endpoint pour récupérer les rôles

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

  // Récupérer tous les utilisateurs sans pagination (pour avoir tous les users)
  getAllUsers(): Observable<ApiResponse<User[]>> {
    let params = new HttpParams().set('per_page', '1000'); // Grande valeur pour récupérer tous
    return this.http.get<ApiResponse<User[]>>(this.apiUrl, { params });
  }

  // Récupérer un utilisateur par son slug
  getBySlug(slug: string): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${slug}`);
  }

  // Créer un utilisateur
  create(user: CreateUserRequest): Observable<ApiResponse<string>> {
    console.log('=== DÉBOGAGE SERVICE ===');
    console.log('URL complète:', this.apiUrl);
    console.log('Données utilisateur à envoyer:', JSON.stringify(user, null, 2));
    console.log('Type de roles:', typeof user.roles, Array.isArray(user.roles));
    console.log('Valeurs des rôles:', user.roles);
    console.log('========================');
    
    return this.http.post<ApiResponse<string>>(this.apiUrl, user);
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

  // Supprimer un utilisateur par son slug
  delete(slug: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${slug}`);
  }

  // Mettre à jour un utilisateur par son slug
  update(slug: string, user: CreateUserRequest): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.apiUrl}/${slug}`, user);
  }
}