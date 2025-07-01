import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule, CommonModule, StyleClassModule],
  template: `
    <div class="layout-topbar" [class.sidebar-visible]="isStaticMenuDesktopActive || isStaticMenuMobileActive">
         <button class="layout-topbar-action" (click)="layoutService.onMenuToggle()">
          <i class="pi pi-bars"></i>
        </button>
      <div class="layout-topbar-actions">

     <!--    <div class="layout-config-menu">
          <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
            <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
          </button>
          <div class="relative">
            <button
              class="layout-topbar-action layout-topbar-action-highlight"
              pStyleClass="@next"
              enterFromClass="hidden"
              enterActiveClass="animate-scalein"
              leaveToClass="hidden"
              leaveActiveClass="animate-fadeout"
              [hideOnOutsideClick]="true"
            >
              <i class="pi pi-palette"></i>
            </button>
            <app-configurator />
          </div>
        </div>
        <button class="layout-topbar-action" pStyleClass="@next" [hideOnOutsideClick]="true">
          <i class="pi pi-bell"></i>
        </button> -->
        <button class="layout-topbar-action">
          <i class="pi pi-user"></i>
          <span>Admin User</span>
        </button>
      </div>
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


    .layout-topbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #329157;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  transition: all 0.3s ease;
  z-index: 999;

  &.sidebar-visible {
    left: 280px;
    width: calc(100% - 280px);
  }
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
    }

    .layout-topbar-action:hover {
      background-color: var(--hover-color);
      transform: scale(1.1);
    }

    .layout-topbar-action-highlight::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      background: #ff6b6b;
      border-radius: 50%;
      top: 8px;
      right: 8px;
    }

    @media (max-width: 576px) {
      .layout-topbar {
        height: 56px;
        padding: 0 1rem;
      }

      .layout-topbar-action span {
        display: none;
      }
    }
  `]
})
export class AppTopbar {
  items!: MenuItem[];

  constructor(public layoutService: LayoutService) {}

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }
  get isStaticMenuDesktopActive(): boolean {
  return !this.layoutService.layoutState().staticMenuDesktopInactive && this.layoutService.isDesktop();

}
  get isStaticMenuMobileActive(): boolean {
  return !this.layoutService.layoutState().staticMenuMobileActive && this.layoutService.isMobile();
}
}
