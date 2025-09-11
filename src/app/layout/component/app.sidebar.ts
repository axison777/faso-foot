import { Component, HostBinding } from '@angular/core';
import { AppMenu } from './app.menu';
import { LayoutService } from '../service/layout.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AppMenu, CommonModule],
  template: `
    <div class="layout-sidebar" [class.sidebar-visible]="isSidebarVisible">
      <div class="sidebar-logo">
        <div class="logo-container">
          <div class="logo-item">
            <img src="assets/images/Logo-FBF.png" alt="Logo FBF" class="logo-image" />
          </div>
          <div class="logo-divider"></div>
          <div class="logo-item">
            <img src="assets/images/lfp.png" alt="Logo LFP" class="logo-image" />
          </div>
        </div>
        <span class="logo-text">Fédération Burkinabè<br/>de Football</span>
      </div>
      <app-menu></app-menu>
    </div>
    <!-- Overlay pour mobile -->
    <div
      class="layout-mask"
      *ngIf="isSidebarVisible && isMobile"
      (click)="layoutService.onMenuToggle()"
    ></div>
  `,
  styles: [`
    :host {
      --primary-color: rgb(42, 157, 82);
      --hover-color: #48bca8;
      --active-color: #1d7a6c;
      --text-color: #ffffff;
      --shadow-color: rgba(0, 0, 0, 0.2);
      --content-border-radius: 6px;
      --element-transition-duration: 0.3s;
      --layout-section-transition-duration: 0.3s;
      --surface-overlay: var(--primary-color);
      --surface-hover: #004d40;
    }

    /* Sidebar de base */
    .layout-sidebar {
      position: fixed;
      top: 0px; /* sous le topbar */
      left: 0;
      width: 280px;
      height: calc(100vh );
      background-color: var(--surface-overlay);
      color: var(--text-color);
      display: flex;
      flex-direction: column;
      padding: 1rem 1.5rem;
      user-select: none;
      overflow-y: auto;
      transition: transform var(--layout-section-transition-duration);
      box-shadow: 2px 0 12px var(--shadow-color);
      border-radius: 0 0px 6px 0;
      z-index: 1100;
      transform: translateX(0);
    }

    /* Sidebar masqué par défaut en mobile */
    @media (max-width: 991px) {
      .layout-sidebar {
        transform: translateX(-100%);
      }
      .layout-sidebar.sidebar-visible {
        transform: translateX(0);
      }
    }

    .sidebar-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Container pour les logos avec séparateur */
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      width: 100%;
    }

    .logo-item {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
    }

    .logo-image {
      width: auto;
      height: 60px; /* Réduit de 90px à 60px */
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      transition: transform 0.3s ease;
    }

    .logo-image:hover {
      transform: scale(1.05);
    }

    /* Trait séparateur vertical */
    .logo-divider {
      width: 1px;
      height: 40px;
      background-color: rgba(255, 255, 255, 0.3);
      flex-shrink: 0;
    }

    .logo-text {
      font-weight: 600;
      font-size: 1rem; /* Réduit de 1.2rem à 1rem */
      text-align: center;
      line-height: 1.3;
      letter-spacing: 0.3px;
      user-select: none;
      color: rgba(255, 255, 255, 0.95);
    }

    /* Overlay pour mobile */
    .layout-mask {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1099;
    }

    /* Menu */
    .layout-menu {
      margin: 0;
      padding: 0;
      list-style-type: none;
      flex: 1;
      overflow-y: auto;
      user-select: none;
    }

    .layout-root-menuitem > .layout-menuitem-root-text {
      font-size: 0.857rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--text-color);
      margin: 0.75rem 0;
    }

    .layout-root-menuitem > a {
      display: none;
    }

    .layout-menu a {
      display: flex;
      align-items: center;
      position: relative;
      outline: none;
      color: var(--text-color);
      cursor: pointer;
      padding: 0.75rem 1rem;
      border-radius: var(--content-border-radius);
      transition: background-color var(--element-transition-duration), box-shadow var(--element-transition-duration);
      user-select: none;
    }

    .layout-menu a .layout-menuitem-icon {
      margin-right: 0.5rem;
    }

    .layout-menu a .layout-submenu-toggler {
      font-size: 75%;
      margin-left: auto;
      transition: transform var(--element-transition-duration);
    }

    .layout-menu a.active-route {
      font-weight: 700;
      color: var(--primary-color);
    }

    .layout-menu a:hover {
      background-color: var(--surface-hover);
    }

    li.active-menuitem > a .layout-submenu-toggler {
      transform: rotate(-180deg);
    }

    /* Sous-menus */
    .layout-menu ul {
      margin: 0;
      padding: 0;
      list-style: none;
      overflow: hidden;
      border-radius: var(--content-border-radius);
    }

    .layout-menu ul li a {
      margin-left: 1rem;
    }

    .layout-menu ul ul li a {
      margin-left: 2rem;
    }

    .layout-menu ul ul ul li a {
      margin-left: 2.5rem;
    }

    .layout-menu ul ul ul ul li a {
      margin-left: 3rem;
    }

    .layout-menu ul ul ul ul ul li a {
      margin-left: 3.5rem;
    }

    .layout-menu ul ul ul ul ul ul li a {
      margin-left: 4rem;
    }

    /* Animations sous-menu */
    .layout-submenu-enter-from,
    .layout-submenu-leave-to {
      max-height: 0;
    }

    .layout-submenu-enter-to,
    .layout-submenu-leave-from {
      max-height: 1000px;
    }

    .layout-submenu-leave-active {
      overflow: hidden;
      transition: max-height 0.45s cubic-bezier(0, 1, 0, 1);
    }

    .layout-submenu-enter-active {
      overflow: hidden;
      transition: max-height 1s ease-in-out;
    }

    /* Responsive pour mobile */
    @media (max-width: 991px) {
      .logo-image {
        height: 50px; /* Plus petit sur mobile */
      }

      .logo-divider {
        height: 35px;
      }

      .logo-text {
        font-size: 0.9rem;
      }

      .logo-container {
        gap: 0.5rem;
      }
    }

    /* Très petits écrans */
    @media (max-width: 480px) {
      .logo-image {
        height: 45px;
      }

      .logo-divider {
        height: 30px;
      }

      .logo-text {
        font-size: 0.85rem;
        line-height: 1.2;
      }
    }
  `]
})
export class AppSidebar {
  constructor(public layoutService: LayoutService) {}

  get isSidebarVisible(): boolean {
    const state = this.layoutService.layoutState();
    // Afficher si overlay actif ou menu mobile actif ou desktop non inactif
    return (
      state.overlayMenuActive ||
      state.staticMenuMobileActive ||
      (!state.staticMenuDesktopInactive && this.layoutService.isDesktop())
    );
  }

  get isMobile(): boolean {
    return this.layoutService.isMobile();
  }
}
