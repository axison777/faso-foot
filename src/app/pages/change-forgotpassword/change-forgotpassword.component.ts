import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-change-forgotpassword',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IconFieldModule, InputTextModule, InputIconModule, PasswordModule, ButtonModule, ToastModule],
  templateUrl: './change-forgotpassword.component.html',
  styleUrls: ['./change-forgotpassword.component.scss'],
  providers: [MessageService]
})
export class ChangeForgotPasswordComponent implements OnInit {
  token: string | null = null;
  loading = signal(false);
  form: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Properly init the reactive form now that fb is injected
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    });

    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      if (!this.token) {
        this.router.navigate(['/lien-expire']);
      }
    });
  }

  submit(): void {
    if (!this.token) {
      this.router.navigate(['/lien-expire']);
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Formulaire invalide', detail: 'Veuillez corriger les erreurs.' });
      return;
    }
    const { password, password_confirmation } = this.form.value as any;
    if (password !== password_confirmation) {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    this.loading.set(true);
    this.userService.confirmInvitation({ token: this.token, password, password_confirmation }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Votre mot de passe a été modifié avec succès, veuillez vous connecter avec vos nouveaux identifiants !' });
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Lien invalide ou expiré.';
        // Redirection automatique si token invalide/expiré
        if (/expir|invalid|invalide/i.test(msg)) {
          this.router.navigate(['/lien-expire'], { queryParams: { reason: 'expired' } });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
        }
      },
      complete: () => this.loading.set(false)
    });
  }
}
