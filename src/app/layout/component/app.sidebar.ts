import { Component, ElementRef } from '@angular/core';
import { AppMenu } from './app.menu';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AppMenu],
  template: `
    <div class="layout-sidebar">
      <div class="sidebar-logo">
        <img src="assets/Logo-FBF.png" alt="Logo CBF" class="logo-image"   />
        <span class="logo-text">Championnat BF<br />CBF</span>
      </div>
      <app-menu></app-menu>
    </div>
  `,
  styles: [`
    :host {
      --primary-color:rgb(42, 157, 82);
      --hover-color: #48bca8;
      --active-color: #1d7a6c;
      --text-color: #ffffff;
      --shadow-color: rgba(0, 0, 0, 0.2);
    }

    .layout-sidebar {
      width: 280px;
      height: 100vh;
      background: var(--sidebar-bg);
      color: var(--text-color);
      display: flex;
      flex-direction: column;
      padding: 0;
     /*  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; */
      user-select: none;
      transition: width 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1001;
    }

    .sidebar-logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem 0;
      margin-bottom: 2rem;
    }

    .logo-image {
      width: 80px;
      height: auto;
      margin-bottom: 0.5rem;
      margin-left: 0.5rem;
      margin-right: 0.5rem;
    }

    .logo-text {
      color: var(--text-color);
      font-size: 1.2rem;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.5px;
    }

    app-menu {
      flex: 1;
      overflow-y: auto;
      padding: 0 1.5rem;
    }

    app-menu ::ng-deep .menuitem {
      color: var(--text-color);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.95rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
      position: relative;
      overflow: hidden;
    }

    app-menu ::ng-deep .menuitem:hover {
      background-color: var(--hover-color);
    }

    app-menu ::ng-deep .menuitem.active {
      background-color: var(--active-color);
      font-weight: 600;
    }

    app-menu ::ng-deep .menuitem i {
      color: var(--text-color);
    }

    @media (max-width: 768px) {
      .layout-sidebar {
        width: 80px;
      }

      .logo-text {
        display: none;
      }

      app-menu ::ng-deep .menuitem span {
        display: none;
      }
    }
  `]
})
export class AppSidebar {
  constructor(public el: ElementRef) {}
}
