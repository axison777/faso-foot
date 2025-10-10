import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    MenuModule,
//     TieredMenuModule
//   ],
    TieredMenuModule,
    DialogModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
    ReactiveFormsModule
  ],
  providers: [MessageService],
  template: `
    <div class="layout-topbar" [class.sidebar-visible]="isSidebarVisible">
      <!-- Bouton burger (toggle sidebar) -->
      <button class="layout-topbar-action" (click)="layoutService.onMenuToggle()">
        <i class="pi pi-bars"></i>
      </button>

      <!-- Actions utilisateur -->
      <div class="layout-topbar-actions">

     <!--  <button class="login-button">Se connecter</button> -->

        <span class="user-name hidden md:inline font-bold text-md text-white">
          {{ getUserFullName() }}
        </span>



        <button
          class="layout-topbar-action"
          (click)="profileMenu.toggle($event)"
          pRipple
        [ngClass]="{ 'active': isProfileMenuOpen }"
        >
          <i class="pi pi-user"></i>
        </button>
        <p-tieredMenu #profileMenu [model]="profileMenuItems" popup appendTo="body"
        (onHide)="isProfileMenuOpen = false"
        (onShow)="isProfileMenuOpen = true"
        ></p-tieredMenu>
      </div>
    </div>

    <p-toast></p-toast>

    <!-- Profil -->
    <p-dialog [(visible)]="showProfile" [modal]="true" [draggable]="false" [style]="{width:'520px'}" [header]="'Profil'">
      <div class="profile-body">
        <div class="row"><span class="label">Nom :</span><span class="value">{{ user?.last_name }}</span></div>
        <div class="row"><span class="label">Prénom :</span><span class="value">{{ user?.first_name }}</span></div>
        <div class="row"><span class="label">Email :</span><span class="value">{{ user?.email }}</span></div>
      </div>
      <ng-template pTemplate="footer">
        <button pButton type="button" label="Fermer" class="p-button-text" (click)="showProfile=false"></button>
        <button pButton type="button" label="Modifier le mot de passe" class="p-button-warning" (click)="openChangePassword()"></button>
      </ng-template>
    </p-dialog>

    <!-- Changer mot de passe -->
    <p-dialog [(visible)]="showChangePass" [modal]="true" [draggable]="false" [style]="{width:'520px'}" [header]="'Modifier le mot de passe'">
      <form [formGroup]="changePassForm" (ngSubmit)="submitChangePassword()" class="flex flex-col gap-3">
        <div>
          <label>Mot de passe actuel</label>
          <input pInputText type="password" formControlName="current_password" class="w-full" />
        </div>
        <div>
          <label>Nouveau mot de passe</label>
          <input pInputText type="password" formControlName="new_password" class="w-full" />
        </div>
        <div>
          <label>Confirmation</label>
          <input pInputText type="password" formControlName="new_password_confirmation" class="w-full" />
        </div>
        <div class="flex justify-end gap-2 mt-2">
          <button pButton type="button" label="Annuler" class="p-button-text" (click)="showChangePass=false"></button>
          <button pButton type="submit" label="Valider" class="p-button-success" [disabled]="changePassForm.invalid || loading"></button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    :host {
      --primary-color: rgb(42, 157, 82);
      --hover-color: #004d40;
      --active-color: #1d7a6c;
      --text-color: #ffffff;
      --shadow-color: rgba(0, 0, 0, 0.2);
    }
    ::ng-deep .p-tieredmenu.p-tieredmenu-overlay {
  z-index: 1300 !important;
  margin-left: 8px !important;
  margin-top: 5px !important;
}

    .layout-topbar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 60px;
      background-color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      transition: all 0.3s ease;
      z-index: 1100;
      box-shadow: 0 2px 6px var(--shadow-color);
    }

    .layout-topbar.sidebar-visible {
      left: 280px;
      width: calc(100% - 280px);
    }

    .layout-topbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .layout-topbar-action {
      color: var(--text-color);
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.3rem;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      user-select: none;
    }

    .layout-topbar-action:hover {
      background-color: var(--hover-color);
      transform: scale(1.1);
    }

    .user-name {
      color: var(--text-color);
    }

    @media (max-width: 576px) {
      .layout-topbar {
        height: 56px;
      }

      .user-name {
        display: none;
      }
    }

    .layout-topbar-action.active {
    background-color: #e7fffb;;
    color: #c73e3e;
    transform: scale(1.05);
}

.login-button{
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background-color:rgb(255, 247, 246);
  color: #c73e3e;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  border: none;
}



  `]
})
export class AppTopbar {
  userFullName = 'Jean Ouédraogo';

  profileMenuItems: MenuItem[] = [];
  isProfileMenuOpen = false;
  showProfile = false;
  showChangePass = false;
  loading = false;
  user: any = null;
  changePassForm: any;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;
    this.changePassForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      new_password_confirmation: ['', Validators.required]
    });
    this.profileMenuItems = [
      {
        label: 'Profil',
        icon: 'pi pi-id-card',
        command: () => { this.user = this.authService.currentUser; this.showProfile = true; }
      },
      {
        label: 'Se déconnecter',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];

  }

  openChangePassword(): void {
    this.showProfile = false;
    this.showChangePass = true;
  }

  submitChangePassword(): void {
    if (this.changePassForm.invalid) {
      this.changePassForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Formulaire invalide', detail: 'Veuillez corriger les erreurs.' });
      return;
    }
    const { current_password, new_password, new_password_confirmation } = this.changePassForm.value as any;
    const token = this.authService.token || '';
    this.loading = true;
    this.userService.resetPassword({ token, current_password, new_password, new_password_confirmation }).subscribe({
      next: (res) => {
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: res.message || 'Mot de passe changé avec succès.' });
        this.showChangePass = false;
        this.changePassForm.reset();
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erreur lors du changement de mot de passe.';
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
      },
      complete: () => { this.loading = false; }
    });
  }

//   openChangePassword(): void {
//     this.showProfile = false;
//     this.showChangePass = true;
//   }

//   submitChangePassword(): void {
//     if (this.changePassForm.invalid) {
//       this.changePassForm.markAllAsTouched();
//       this.messageService.add({ severity: 'warn', summary: 'Formulaire invalide', detail: 'Veuillez corriger les erreurs.' });
//       return;
//     }
//     const { current_password, new_password, new_password_confirmation } = this.changePassForm.value as any;
//     const token = this.authService.token || '';
//     this.loading = true;
//     this.userService.resetPassword({ token, current_password, new_password, new_password_confirmation }).subscribe({
//       next: (res) => {
//         this.messageService.add({ severity: 'success', summary: 'Succès', detail: res.message || 'Mot de passe changé avec succès.' });
//         this.showChangePass = false;
//         this.changePassForm.reset();
//       },
//       error: (err) => {
//         const msg = err?.error?.message || 'Erreur lors du changement de mot de passe.';
//         this.messageService.add({ severity: 'error', summary: 'Erreur', detail: msg });
//       },
//       complete: () => { this.loading = false; }
//     });
//   }

  logout(): void {
    // log out logic (à adapter)
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserFullName(): string {
  const user = this.authService.user();
  console.log(user);

  return user ? `${user.first_name} ${user.last_name}` : '';
}

  get isSidebarVisible(): boolean {
    const state = this.layoutService.layoutState();

    return (
      (!state.staticMenuDesktopInactive && this.layoutService.isDesktop()) ||
      (state.staticMenuMobileActive === true && this.layoutService.isMobile()) ||
      (state.overlayMenuActive === true)
    );
  }
}
