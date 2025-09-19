// src/app/service/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, Permission } from '../models/role.model';

// Interface décrivant la réponse paginée de l'API pour les rôles
export interface PaginatedRolesResponse {
  status: boolean;
  data: Role[]; // La liste des rôles se trouve dans la propriété `data`
  meta: any;
  links: any;
  message: string;
}

// Interface décrivant la réponse de l'API pour un seul rôle
export interface SingleRoleResponse {
  status: boolean;
  data: {
    role: Role; // L'objet rôle est niché dans `data.role`
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  // Utilisation de la variable d'environnement, ce qui est une bonne pratique
  private apiUrl = `${environment.apiUrl}/roles`;
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste paginée de tous les rôles.
   * Le retour est typé avec la structure exacte de la réponse de l'API.
   */
  getAll(): Observable<PaginatedRolesResponse> {
    console.log('RoleService.getAll() - URL:', this.apiUrl);
    return this.http.get<PaginatedRolesResponse>(this.apiUrl).pipe(
      tap(response => console.log('RoleService.getAll() - Réponse:', response)),
      catchError(error => {
        console.error('RoleService.getAll() - Erreur:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Récupère un seul rôle par son slug.
   * Utilise l'opérateur `map` pour extraire et retourner directement l'objet Role.
   */
  get(slug: string): Observable<Role> {
    const url = `${this.apiUrl}/${slug}`;
    console.log('RoleService.get() - URL:', url);
    
    return this.http.get<SingleRoleResponse>(url).pipe(
      tap(response => console.log('RoleService.get() - Réponse brute:', response)),
      map(response => {
        console.log('RoleService.get() - Rôle extrait:', response.data.role);
        return response.data.role;
      }),
      catchError(error => {
        console.error('RoleService.get() - Erreur:', error);
        return throwError(error);
      })
    );
  }

  /**
   * Crée un nouveau rôle.
   * Le payload attend un nom et un tableau de slugs de permissions.
   * Retourne le rôle créé en l'extrayant de la réponse.
   */
  create(role: { name: string; permissions: string[] }): Observable<Role> {
    console.log('RoleService.create() - URL:', this.apiUrl);
    console.log('RoleService.create() - Payload:', role);
    console.log('RoleService.create() - Headers:', this.httpOptions.headers);

    // Validation côté service
    if (!role.name || typeof role.name !== 'string' || role.name.trim().length === 0) {
      console.error('RoleService.create() - Nom invalide:', role.name);
      return throwError({ error: { message: 'Le nom du rôle est requis et doit être une chaîne non vide' } });
    }

    if (!Array.isArray(role.permissions)) {
      console.error('RoleService.create() - Permissions invalides:', role.permissions);
      return throwError({ error: { message: 'Les permissions doivent être un tableau' } });
    }

    const cleanPayload = {
      name: role.name.trim(),
      permissions: role.permissions.filter(p => p && typeof p === 'string')
    };

    console.log('RoleService.create() - Payload nettoyé:', cleanPayload);

    return this.http.post<SingleRoleResponse>(this.apiUrl, cleanPayload, this.httpOptions).pipe(
      tap(response => console.log('RoleService.create() - Réponse brute:', response)),
      map(response => {
        console.log('RoleService.create() - Rôle créé:', response.data.role);
        return response.data.role;
      }),
      catchError(error => {
        console.error('RoleService.create() - Erreur détaillée:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url,
          headers: error.headers
        });
        return throwError(error);
      })
    );
  }

  /**
   * Met à jour un rôle existant en utilisant la méthode PATCH.
   * Retourne le rôle mis à jour en l'extrayant de la réponse.
   */
  update(slug: string, role: { name: string; permissions: string[] }): Observable<Role> {
    const url = `${this.apiUrl}/${slug}`;
    console.log('RoleService.update() - URL:', url);
    console.log('RoleService.update() - Payload:', role);

    // Validation côté service
    if (!role.name || typeof role.name !== 'string' || role.name.trim().length === 0) {
      console.error('RoleService.update() - Nom invalide:', role.name);
      return throwError({ error: { message: 'Le nom du rôle est requis et doit être une chaîne non vide' } });
    }

    if (!Array.isArray(role.permissions)) {
      console.error('RoleService.update() - Permissions invalides:', role.permissions);
      return throwError({ error: { message: 'Les permissions doivent être un tableau' } });
    }

    const cleanPayload = {
      name: role.name.trim(),
      permissions: role.permissions.filter(p => p && typeof p === 'string')
    };

    console.log('RoleService.update() - Payload nettoyé:', cleanPayload);

    return this.http.patch<SingleRoleResponse>(url, cleanPayload, this.httpOptions).pipe(
      tap(response => console.log('RoleService.update() - Réponse brute:', response)),
      map(response => {
        console.log('RoleService.update() - Rôle mis à jour:', response.data.role);
        return response.data.role;
      }),
      catchError(error => {
        console.error('RoleService.update() - Erreur détaillée:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message,
          url: error.url
        });
        return throwError(error);
      })
    );
  }

  /**
   * Supprime un rôle par son slug.
   * Retourne la réponse brute de l'API (généralement juste un message de succès).
   */
  delete(slug: string): Observable<any> {
    const url = `${this.apiUrl}/${slug}`;
    console.log('RoleService.delete() - URL:', url);
    
    return this.http.delete<any>(url).pipe(
      tap(response => console.log('RoleService.delete() - Réponse:', response)),
      catchError(error => {
        console.error('RoleService.delete() - Erreur:', error);
        return throwError(error);
      })
    );
  }
}