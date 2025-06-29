import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { LoginCredentials } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  formData: LoginCredentials = {
    email: '',
    password: ''
  };

  error: string = '';
  loading: boolean = false;
  showPassword: boolean = false;
  success: string = '';

  // CORRECTION: Déclarer sans initialiser ici
  defaultCredentials: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // CORRECTION: Initialiser dans le constructeur après l'injection
    this.defaultCredentials = this.authService.getDefaultCredentials();
  }

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(): void {
    this.error = ''; // Effacer l'erreur quand l'utilisateur tape
    this.success = '';
    
    // Vérifier si les identifiants correspondent aux valeurs par défaut
    if (this.formData.email && this.formData.password) {
      this.checkDefaultCredentials();
    }
  }

  private checkDefaultCredentials(): void {
    const isDefaultCredential = this.defaultCredentials.some(
      cred => this.formData.email === cred.email && this.formData.password === cred.password
    );

    if (isDefaultCredential) {
      this.success = "Connexion réussie !";
      this.loading = true;
      
      // Rediriger vers le dashboard après un court délai
      setTimeout(() => {
        this.performLogin();
      }, 800);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    const { email, password } = this.formData;

    // Si ce sont les identifiants par défaut, la redirection est déjà gérée
    const isDefaultCredential = this.defaultCredentials.some(
      cred => email === cred.email && password === cred.password
    );

    if (isDefaultCredential) {
      return;
    }

    if (!email || !password) {
      this.error = "Veuillez remplir tous les champs";
      return;
    }

    this.performLogin();
  }

  private performLogin(): void {
    this.error = '';
    this.loading = true;

    this.authService.login(this.formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.success = "Connexion réussie !";
          setTimeout(() => {
            this.router.navigate(['/villes']); // Redirection vers villes pour l'instant
          }, 800);
        },
        error: (err) => {
          this.error = err.message;
          this.loading = false;
          this.success = '';
        }
      });
  }
}
