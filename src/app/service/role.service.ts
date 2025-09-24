// Service mis à jour avec des améliorations
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, Permission } from '../models/role.model';

export interface PaginatedRolesResponse {
  status: boolean;
  data: Role[];
  meta: any;
  links: any;
  message: string;
}

export interface SingleRoleResponse {
  status: boolean;
  data: {
    role: Role;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  getAll(): Observable<PaginatedRolesResponse> {
    console.log('RoleService.getAll() - URL:', this.apiUrl);
    return this.http.get<PaginatedRolesResponse>(this.apiUrl).pipe(
      tap(response => console.log('RoleService.getAll() - Réponse:', response)),
      catchError(this.handleError)
    );
  }

  get(slug: string): Observable<Role> {
    const url = `${this.apiUrl}/${slug}`;
    console.log('RoleService.get() - URL:', url);
    
    return this.http.get<SingleRoleResponse>(url).pipe(
      tap(response => console.log('RoleService.get() - Réponse brute:', response)),
      map(response => {
        console.log('RoleService.get() - Rôle extrait:', response.data.role);
        return response.data.role;
      }),
      catchError(this.handleError)
    );
  }

  create(role: { name: string; permissions: string[] }): Observable<Role> {
    console.log('=== RoleService.create() ===');
    console.log('URL:', this.apiUrl);
    console.log('Payload reçu:', role);

    // Validation côté service renforcée
    const validationError = this.validateRolePayload(role);
    if (validationError) {
      console.error('RoleService.create() - Erreur de validation:', validationError);
      return throwError(() => ({ error: { message: validationError } }));
    }

    const cleanPayload = this.cleanRolePayload(role);
    console.log('Payload nettoyé:', cleanPayload);
    console.log('Headers:', this.httpOptions);

    return this.http.post<SingleRoleResponse>(this.apiUrl, cleanPayload, this.httpOptions).pipe(
      tap(response => {
        console.log('RoleService.create() - Réponse brute:', response);
        console.log('RoleService.create() - Status de la réponse:', response.status);
      }),
      map(response => {
        console.log('RoleService.create() - Rôle créé:', response.data.role);
        return response.data.role;
      }),
      catchError(this.handleError)
    );
  }

  update(slug: string, role: { name: string; permissions: string[] }): Observable<Role> {
    const url = `${this.apiUrl}/${slug}`;
    console.log('=== RoleService.update() ===');
    console.log('URL:', url);
    console.log('Slug:', slug);
    console.log('Payload reçu:', role);

    // Validation du slug
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      console.error('RoleService.update() - Slug invalide:', slug);
      return throwError(() => ({ error: { message: 'Le slug du rôle est requis' } }));
    }

    // Validation du payload
    const validationError = this.validateRolePayload(role);
    if (validationError) {
      console.error('RoleService.update() - Erreur de validation:', validationError);
      return throwError(() => ({ error: { message: validationError } }));
    }

    const cleanPayload = this.cleanRolePayload(role);
    console.log('Payload nettoyé:', cleanPayload);
    console.log('Headers:', this.httpOptions);

    return this.http.patch<SingleRoleResponse>(url, cleanPayload, this.httpOptions).pipe(
      tap(response => {
        console.log('RoleService.update() - Réponse brute:', response);
        console.log('RoleService.update() - Status de la réponse:', response.status);
      }),
      map(response => {
        console.log('RoleService.update() - Rôle mis à jour:', response.data.role);
        return response.data.role;
      }),
      catchError(this.handleError)
    );
  }

  delete(slug: string): Observable<any> {
    const url = `${this.apiUrl}/${slug}`;
    console.log('RoleService.delete() - URL:', url);
    
    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      console.error('RoleService.delete() - Slug invalide:', slug);
      return throwError(() => ({ error: { message: 'Le slug du rôle est requis pour la suppression' } }));
    }
    
    return this.http.delete<any>(url).pipe(
      tap(response => console.log('RoleService.delete() - Réponse:', response)),
      catchError(this.handleError)
    );
  }

  // Méthodes privées pour la validation et le nettoyage
  private validateRolePayload(role: { name: string; permissions: string[] }): string | null {
    if (!role) {
      return 'Les données du rôle sont requises';
    }

    if (!role.name || typeof role.name !== 'string') {
      return 'Le nom du rôle est requis et doit être une chaîne de caractères';
    }

    if (role.name.trim().length === 0) {
      return 'Le nom du rôle ne peut pas être vide';
    }

    if (role.name.trim().length < 2) {
      return 'Le nom du rôle doit contenir au moins 2 caractères';
    }

    if (!Array.isArray(role.permissions)) {
      return 'Les permissions doivent être un tableau';
    }

    if (role.permissions.length === 0) {
      return 'Au moins une permission doit être sélectionnée';
    }

    // Vérifier que toutes les permissions sont des chaînes non vides
    const invalidPermissions = role.permissions.filter(p => !p || typeof p !== 'string' || p.trim().length === 0);
    if (invalidPermissions.length > 0) {
      return 'Toutes les permissions doivent être des identifiants valides (chaînes non vides)';
    }

    return null;
  }

  private cleanRolePayload(role: { name: string; permissions: string[] }): { name: string; permissions: string[] } {
    return {
      name: role.name.trim(),
      permissions: role.permissions
        .filter(p => p && typeof p === 'string' && p.trim().length > 0)
        .map(p => p.trim())
    };
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('=== RoleService - Erreur HTTP ===');
    console.error('Status:', error.status);
    console.error('Status Text:', error.statusText);
    console.error('URL:', error.url);
    console.error('Error Object:', error.error);
    console.error('Message:', error.message);
    console.error('Headers:', error.headers);
    console.error('=== Fin Erreur HTTP ===');

    // Formater l'erreur pour un affichage plus convivial
    let userMessage = 'Une erreur est survenue lors de la communication avec le serveur.';

    switch (error.status) {
      case 400:
        userMessage = 'Données invalides. Vérifiez les informations saisies.';
        if (error.error && error.error.message) {
          userMessage = error.error.message;
        } else if (error.error && typeof error.error === 'object') {
    // Gérer les erreurs de validation Laravel/API
          const errorMessages = this.extractValidationErrors(error.error);
          if (errorMessages.length > 0) {
            userMessage = `Erreurs de validation : ${errorMessages.join(', ')}`;
          }
        }
        break;
      case 401:
        userMessage = 'Vous n\'êtes pas autorisé à effectuer cette action.';
        break;
      case 403:
        userMessage = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        break;
      case 404:
        userMessage = 'Ressource non trouvée.';
        break;
      case 422:
        userMessage = 'Données non valides.';
        if (error.error && error.error.message) {
          userMessage = error.error.message;
        }
        break;
      case 500:
        userMessage = 'Erreur interne du serveur. Veuillez réessayer plus tard.';
        break;
      case 0:
        userMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
        break;
    }

    // Préserver la structure d'erreur originale tout en ajoutant un message utilisateur
    const enhancedError = {
      ...error,
      error: {
        ...error.error,
        userMessage: userMessage
      }
    };

    return throwError(() => enhancedError);
  }

  private extractValidationErrors(errorObj: any): string[] {
    const messages: string[] = [];
    
    if (!errorObj) return messages;

    // Gérer les erreurs de validation Laravel standard
    if (errorObj.errors && typeof errorObj.errors === 'object') {
      Object.values(errorObj.errors).forEach((fieldErrors: any) => {
        if (Array.isArray(fieldErrors)) {
          messages.push(...fieldErrors);
        } else if (typeof fieldErrors === 'string') {
          messages.push(fieldErrors);
        }
      });
    }

    // Gérer un message d'erreur simple
    if (errorObj.message && typeof errorObj.message === 'string') {
      messages.push(errorObj.message);
    }

    return messages;
  }
}