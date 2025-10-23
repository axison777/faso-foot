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

    /* Sidebar de base  confilt*/
    // .layout-sidebar {
    //   position: fixed;
    //   top: 0px; /* sous le topbar */
    //   left: 0;
    //   width: 280px;
    //   height: calc(100vh );
    /* Sidebar */
    .layout-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
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

    /* Container pour les logos avec séparateur  conflit*/
    // .logo-container {
    //   display: flex;
    //   align-items: center;
    //   justify-content: center;
    //   gap: 0.75rem;
    //   margin-bottom: 1rem;
    //   width: 100%;
    /* Container uniquement pour FBF */
    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      margin-bottom: 1rem;
    }

    .logo-item {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-image {
      width: auto;
      height: 70px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      transition: transform 0.3s ease;
    }

    .logo-image:hover {
      transform: scale(1.05);
    }

    .logo-text {
      font-weight: 600;
      font-size: 1rem;
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

    /* Responsive */
    @media (max-width: 991px) {
      .logo-image {
        height: 55px;
      }
      .logo-text {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .logo-image {
        height: 50px;
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
