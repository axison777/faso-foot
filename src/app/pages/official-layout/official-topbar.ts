import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../layout/service/layout.service';
import { MenuModule } from 'primeng/menu';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from '../../service/auth.service';
import { OfficialMatchService } from '../../service/official-match.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'official-topbar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    StyleClassModule,
    MenuModule,
    TieredMenuModule,
    DialogModule,
    ButtonModule,
    ToastModule
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
        <!-- Nom et rôle de l'utilisateur -->
        <div class="user-info">
          <span class="user-name">{{ getUserFullName() }}</span>
          <span class="user-role">{{ getUserRole() }}</span>
        </div>

        <!-- Notifications -->
        <button 
          class="notification-button" 
          (click)="toggleNotifications()"
          [class.has-notifications]="unreadCount > 0"
        >
          <i class="pi pi-bell"></i>
          <span class="notification-badge" *ngIf="unreadCount > 0">
            {{ unreadCount }}
          </span>
        </button>

        <!-- Avatar avec menu -->
        <button
          class="user-menu-button"
          (click)="profileMenu.toggle($event)"
          pRipple
          [ngClass]="{ 'active': isProfileMenuOpen }"
        >
          <div class="user-avatar">
            <i class="pi pi-user"></i>
          </div>
        </button>
        <p-tieredMenu #profileMenu [model]="profileMenuItems" popup appendTo="body"
        (onHide)="isProfileMenuOpen = false"
        (onShow)="isProfileMenuOpen = true"
        ></p-tieredMenu>
      </div>
    </div>

    <!-- Panneau de notifications latéral -->
    <div class="notifications-panel" [class.open]="notificationsOpen">
      <div class="notifications-header">
        <h3>Notifications</h3>
        <button class="close-btn" (click)="closeNotifications()">
          <i class="pi pi-times"></i>
        </button>
      </div>
      <div class="notifications-content">
        <div class="notification-item" *ngFor="let notification of notifications$ | async">
          <div class="notification-icon">
            <i class="pi" [ngClass]="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-details">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
            <div class="notification-time">{{ notification.createdAt | date:'dd/MM HH:mm' }}</div>
          </div>
        </div>
        <div class="no-notifications" *ngIf="(notifications$ | async)?.length === 0">
          <i class="pi pi-bell-slash"></i>
          <p>Aucune notification</p>
        </div>
      </div>
      <div class="notifications-footer">
        <button class="view-all-btn" (click)="viewAllNotifications()">
          Voir toutes les notifications
        </button>
      </div>
    </div>

    <!-- Overlay pour fermer les notifications -->
    <div class="notifications-overlay" *ngIf="notificationsOpen" (click)="closeNotifications()"></div>

    <p-toast></p-toast>
  `,
  styles: [`
    :host {
      --primary-color: rgb(42, 157, 82);
      --hover-color: #004d40;
      --active-color: #1d7a6c;
      --text-color: #ffffff;
      --shadow-color: rgba(0, 0, 0, 0.2);
      --notification-color: #ff6b6b;
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

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-right: 0.5rem;
    }

    .user-name {
      color: var(--text-color);
      font-weight: 600;
      font-size: 0.9rem;
      line-height: 1.2;
    }

    .user-role {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-color);
      font-size: 1.2rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .notification-button {
      position: relative;
      color: var(--text-color);
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-button:hover {
      background-color: var(--hover-color);
      transform: scale(1.1);
    }

    .notification-badge {
      position: absolute;
      top: 0;
      right: 0;
      background-color: var(--notification-color);
      color: white;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      font-size: 0.7rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--primary-color);
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

    .layout-topbar-action.active {
      background-color: #e7fffb;
      color: #c73e3e;
      transform: scale(1.05);
    }

    .user-menu-button {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-menu-button:hover {
      background-color: var(--hover-color);
      transform: scale(1.05);
    }

    .user-menu-button.active {
      background-color: #e7fffb;
      transform: scale(1.05);
    }

    .user-menu-button .user-avatar {
      margin: 0;
    }

    /* Panneau de notifications */
    .notifications-panel {
      position: fixed;
      top: 60px;
      right: -400px;
      width: 400px;
      height: calc(100vh - 60px);
      background: white;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
      transition: right 0.3s ease;
      z-index: 1200;
      display: flex;
      flex-direction: column;
    }

    .notifications-panel.open {
      right: 0;
    }

    .notifications-header {
      padding: 1rem;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8f9fa;
    }

    .notifications-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.1rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: #666;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #e0e0e0;
    }

    .notifications-content {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 0.75rem;
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.2s;
    }

    .notification-item:hover {
      background: #f8f9fa;
    }

    .notification-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
      flex-shrink: 0;
    }

    .notification-icon i {
      color: #2196f3;
      font-size: 0.9rem;
    }

    .notification-details {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .notification-message {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .notification-time {
      color: #999;
      font-size: 0.8rem;
    }

    .no-notifications {
      text-align: center;
      padding: 2rem;
      color: #999;
    }

    .no-notifications i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      display: block;
    }

    .notifications-footer {
      padding: 1rem;
      border-top: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .view-all-btn {
      width: 100%;
      padding: 0.75rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-all-btn:hover {
      background: var(--hover-color);
    }

    .notifications-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1150;
    }

    @media (max-width: 576px) {
      .layout-topbar {
        height: 56px;
      }

      .user-info {
        display: none;
      }

      .notifications-panel {
        width: 100vw;
        right: -100vw;
      }
    }
  `]
})
export class OfficialTopbar {
  profileMenuItems: MenuItem[] = [];
  isProfileMenuOpen = false;
  notificationsOpen = false;
  notifications$: Observable<any[]>;
  unreadCount$: Observable<number>;
  unreadCount = 0;

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService,
    private officialMatchService: OfficialMatchService
  ) {
    this.notifications$ = this.officialMatchService.getNotifications();
    this.unreadCount$ = this.officialMatchService.getNotifications().pipe(
      map(notifications => notifications.filter(n => !n.read).length)
    );
  }
  
  ngOnInit(): void {
    this.profileMenuItems = [
      {
        label: 'Profil',
        icon: 'pi pi-id-card',
        command: () => this.showProfile()
      },
      {
        label: 'Se déconnecter',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];

    // Souscrire au compteur de notifications
    this.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  getUserFullName(): string {
    const user = this.authService.user();
    return user ? `${user.first_name} ${user.last_name}` : 'Utilisateur';
  }

  getUserRole(): string {
    // Simuler le rôle de l'utilisateur (à adapter selon votre logique)
    return 'Arbitre Central';
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }

  closeNotifications(): void {
    this.notificationsOpen = false;
  }

  viewAllNotifications(): void {
    this.closeNotifications();
    this.router.navigate(['/officiel/notifications']);
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'MATCH_REMINDER':
        return 'pi-calendar';
      case 'REPORT_SUBMITTED':
        return 'pi-file-text';
      case 'INCIDENT_REPORTED':
        return 'pi-exclamation-triangle';
      default:
        return 'pi-info-circle';
    }
  }

  showProfile(): void {
    // Implémenter l'affichage du profil
    console.log('Afficher le profil');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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