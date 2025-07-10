import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    MenuModule,
    TieredMenuModule
  ],
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
  constructor(
    public layoutService: LayoutService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.profileMenuItems = [
/*       {
        label: 'Changer de mot de passe',
        icon: 'pi pi-key',
        command: () => this.router.navigate(['/changer-mot-de-passe'])
      }, */

      {
        label: 'Se déconnecter',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];

  }

  logout(): void {
    // log out logic (à adapter)
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserFullName(): string {
  const user = this.authService.user();
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
