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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl + '/users';

  constructor(private http: HttpClient) {}

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
    return this.http.post<ApiResponse<string>>(this.apiUrl, user);
  }

  // Supprimer un utilisateur par son slug
  delete(slug: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${slug}`);
  }

  // Note: Pas de méthode update car elle n'est pas documentée dans votre API
  // Si elle existe, vous pouvez l'ajouter plus tard avec le même pattern
}