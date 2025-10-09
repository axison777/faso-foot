import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../service/auth.service';

import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    PasswordModule,
    ToastModule,

  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loginForm!: FormGroup;
  loading = false;
  error = '';
  success = '';
  showPassword = false;
  defaultCredentials: any[] = [{ email: 'admin@fasoleague.com', password: 'P@ssword123' }];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Si l'utilisateur est déjà connecté, le rediriger vers son dashboard
    if (this.authService.isAuthenticated()) {
      const user = this.authService.currentUser;
      
      if (user?.is_official === true) {
        this.router.navigate(['/officiel/dashboard']);
      } else if (user?.is_coach === true || user?.is_coach === 1) {
        this.router.navigate(['/mon-equipe/dashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {

    if (this.loginForm.invalid) {
      this.error = "Veuillez remplir tous les champs correctement.";
      return;
    }

    this.loading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.messageService.add({ severity: 'success', summary: 'Connexion réussie' });
          
          // Récupérer l'utilisateur connecté pour déterminer la redirection
          const user = this.authService.currentUser;
          
          // Redirection basée sur le type d'utilisateur
          if (user?.is_official === true) {
            // Rediriger vers le dashboard des officiels
            this.router.navigate(['/officiel/dashboard']);
          } else if (user?.is_coach === true || user?.is_coach === 1) {
            // Rediriger vers le dashboard des coachs
            this.router.navigate(['/mon-equipe/dashboard']);
          } else {
            // Redirection par défaut (admin ou autre)
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Connexion échouée', 
            detail: err.error?.message || 'Identifiants incorrects' 
          });
          this.loading = false;
        }
      });
  }
}
