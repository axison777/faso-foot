import { HttpClient } from '@angular/common/http';
import { inject, Injectable, computed, effect, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User, Permission as UserPermission } from '../models/user.model';
import { environment } from '../../environments/environment';

interface LoginResponse {

       data: {
        user: User;
        access_token: string;
       }

}

@Injectable({ providedIn: 'root' })
export class AuthService {
  apiUrl = environment.apiUrl + '/auth/';
  private _user = signal<User | null>(null);
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => this._user() !== null);

  private http = inject(HttpClient);

  constructor() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      this._user.set(JSON.parse(storedUser));
    }

    effect(() => {
      const user = this._user();
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    });
  }

  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl + 'login', credentials).pipe(
      tap(response => {
        console.log('🔐 [AUTH] Réponse complète du backend:', response.data);
        console.log('👤 [AUTH] User reçu:', response?.data?.user);
        console.log('🏷️ [AUTH] User ID:', response?.data?.user?.id);
        console.log('🏟️ [AUTH] Team ID:', response?.data?.user?.team_id);
        console.log('🏢 [AUTH] Club ID:', response?.data?.user?.club_id);
        console.log('👔 [AUTH] Coach ID:', response?.data?.user?.coach_id);
        console.log('⚖️ [AUTH] Official ID:', response?.data?.user?.official_id);
        console.log('✅ [AUTH] Is Coach:', response?.data?.user?.is_coach);
        console.log('🏢 [AUTH] Is Club Manager:', response?.data?.user?.is_club_manager);
        console.log('⚖️ [AUTH] Is Official:', response?.data?.user?.is_official);
        console.log('📋 [AUTH] Roles:', response?.data?.user?.roles);
        console.log('🔑 [AUTH] Token:', response?.data?.access_token ? 'Token présent' : 'Token absent');

        this._user.set(response?.data?.user);
        localStorage.setItem('token', response?.data?.access_token);
      })
    );
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  get currentUser(): User | null {
    return this._user();
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  // Permissions helpers
  hasPermission(slug: string): boolean {
    const user = this._user();
    if (!user?.roles?.length) return false;
    // Bypass for admin role
    const isAdmin = user.roles.some(r => (r.slug || '').toLowerCase() === 'admin');
    if (isAdmin) return true;
    return user.roles.some(role =>
      role.permissions?.some(p => p.slug === slug) || false
    );
  }

  hasAnyPermission(slugs: string[]): boolean {
    const user = this._user();
    if (!user?.roles?.length) return false;
    const isAdmin = user.roles.some(r => (r.slug || '').toLowerCase() === 'admin');
    if (isAdmin) return true;
    return slugs.some(s => this.hasPermission(s));
  }

  getUserRole(): string | null {
    const user = this._user();
   if(user?.is_coach){
    return 'coach';
   }
//    if(user?.is_club){
//     return 'club';
//    }
   if(user?.is_official){
    return 'official';
   }
   if(user?.is_club_manager){
    return 'club_manager';
   }
   if(user?.roles?.some(r => (r.slug || '').toLowerCase() === 'admin')){
    return 'admin';
   }
   return null;
  }



}
