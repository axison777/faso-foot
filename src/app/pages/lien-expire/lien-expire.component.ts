import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-lien-expire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconFieldModule, InputTextModule, InputIconModule, ButtonModule, ToastModule],
  templateUrl: './lien-expire.component.html',
  styleUrls: ['./lien-expire.component.scss'],
  providers: [MessageService]
})
export class LienExpireComponent {
  loading = false;
  reason: string | null = null;
  form: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    route.queryParamMap.subscribe(p => this.reason = p.get('reason'));
  }

  resend(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Formulaire invalide', detail: 'Veuillez saisir un email valide.' });
      return;
    }
    const email = this.form.value.email as string;
    this.loading = true;
    this.userService.resendInvitation({ email }).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: res.message || 'Nouvelle invitation envoyée avec succès.' });
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erreur lors de l\'envoi du lien.';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
      },
      complete: () => { this.loading = false; }
    });
  }
}
