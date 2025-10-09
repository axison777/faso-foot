import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IconFieldModule, InputTextModule, InputIconModule, ButtonModule, ToastModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  providers: [MessageService]
})
export class ForgotPasswordComponent {
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Formulaire invalide', detail: 'Veuillez saisir un email valide.' });
      return;
    }
    const email = this.form.value.email as string;
    this.loading = true;
    this.userService.forgotPassword({ email }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Si cet email existe nous vous enverrons un lien de réinitialisation." });
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => {
        // Toujours un message générique pour ne pas divulguer l'existence d'un compte
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: "Si cet email existe nous vous enverrons un lien de réinitialisation." });
      },
      complete: () => { this.loading = false; }
    });
  }
}
