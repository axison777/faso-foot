import { HttpClient } from '@angular/common/http';
import { inject, Injectable, computed, effect, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

interface LoginResponse {
  user: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
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
    this._user.set({email: credentials.email, first_name: 'Ahmed', last_name: 'Koné', id: 0, role: 'Admin'}); // Temporary user object
    return this.http.post<LoginResponse>('/api/login', credentials).pipe(
      tap(response => {
        /* this._user.set(response.user); */
        localStorage.setItem('token', response.token);
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
}
