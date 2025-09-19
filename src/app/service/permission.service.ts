// src/app/service/permission.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Permission } from '../models/role.model'; // On réutilise le modèle partagé

// Interface décrivant la réponse paginée de l'API pour les permissions
export interface PaginatedPermissionsResponse {
  status: boolean;
  data: Permission[]; // La liste des permissions se trouve dans la propriété `data`
  meta: {
    current_page: string;
    per_page: string;
    total: string;
    last_page: string;
    from: string;
    to: string;
  };
  links: {
    first: string;
    last: string;
    prev: string;
    next: string;
  };
  message: string;
}

// Interface décrivant la réponse de l'API pour une seule permission
export interface SinglePermissionResponse {
  status: boolean;
  data: {
    permission: Permission; // L'objet permission est niché dans `data.permission`
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
} )
export class PermissionService {
  // Utilisation de la variable d'environnement, ce qui est une bonne pratique
  private apiUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient ) {}

  /**
   * Récupère la liste paginée de toutes les permissions.
   * Le retour est typé avec la structure exacte de la réponse de l'API.
   */
  getAll(): Observable<PaginatedPermissionsResponse> {
    return this.http.get<PaginatedPermissionsResponse>(this.apiUrl );
  }

  /**
   * Récupère une seule permission par son slug.
   * Utilise l'opérateur `map` pour extraire et retourner directement l'objet Permission.
   */
  get(slug: string): Observable<Permission> {
    return this.http.get<SinglePermissionResponse>(`${this.apiUrl}/${slug}` ).pipe(
      map(response => response.data.permission)
    );
  }

  /**
   * Crée une nouvelle permission.
   * Retourne la permission créée en l'extrayant de la réponse.
   */
  create(permission: { name: string }): Observable<Permission> {
    return this.http.post<SinglePermissionResponse>(this.apiUrl, permission ).pipe(
      map(response => response.data.permission)
    );
  }

  /**
   * Met à jour une permission existante en utilisant la méthode PUT.
   * Retourne la permission mise à jour en l'extrayant de la réponse.
   */
  update(slug: string, permission: { name: string }): Observable<Permission> {
    return this.http.put<SinglePermissionResponse>(`${this.apiUrl}/${slug}`, permission ).pipe(
      map(response => response.data.permission)
    );
  }

  /**
   * Supprime une permission par son slug.
   * Retourne la réponse brute de l'API (généralement juste un message de succès).
   */
  delete(slug: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${slug}` );
  }
}
