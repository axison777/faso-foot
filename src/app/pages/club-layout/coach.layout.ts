import { Component, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppTopbar } from '../../layout/component/app.topbar';
import { AppFooter } from '../../layout/component/app.footer';
import { LayoutService } from '../../layout/service/layout.service';
import { CoachMenuComponent } from './coach.menu';

@Component({
    selector: 'coach-layout',
    standalone: true,
    imports: [CommonModule, AppTopbar, CoachMenuComponent, RouterModule, AppFooter],
    styles: [`
      .route-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.35);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2500;
      }
      .route-overlay .ball {
        animation: bounce 0.6s infinite cubic-bezier(.28,.84,.42,1);
        text-shadow: 0 2px 6px rgba(0,0,0,0.3);
        filter: drop-shadow(0 6px 12px rgba(0,0,0,0.35));
        will-change: transform;
      }
      .route-overlay .ball svg { width: 76px; height: 76px; display: block; }
      .route-overlay .shadow {
        width: 110px;
        height: 14px;
        background: radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 70%);
        border-radius: 50%;
        margin-top: 8px;
        animation: shadow-scale 0.6s infinite cubic-bezier(.28,.84,.42,1);
        will-change: transform, opacity;
      }
      @keyframes bounce {
        0%   { transform: translateY(0) scaleX(1.05) scaleY(0.95); }
        35%  { transform: translateY(-60px) scaleX(1) scaleY(1); }
        50%  { transform: translateY(-60px) scaleX(1) scaleY(1); }
        100% { transform: translateY(0) scaleX(1.05) scaleY(0.95); }
      }
      @keyframes shadow-scale {
        0%, 100% { transform: scaleX(1.1); opacity: 0.55; }
        50% { transform: scaleX(0.6); opacity: 0.25; }
      }
      .layout-main-container.blurred, .layout-sidebar.blurred, .layout-topbar.blurred {
        filter: blur(3px);
        pointer-events: none;
        user-select: none;
      }
    `],
    template: `<div class="layout-wrapper" [ngClass]="containerClass">
        <app-topbar [ngClass]="{ 'blurred': isNavigating }"></app-topbar>
        <coach-menu [ngClass]="{ 'blurred': isNavigating }"></coach-menu>
        <div class="layout-main-container" [ngClass]="{ 'blurred': isNavigating }">
            <div class="layout-main">
                <router-outlet></router-outlet>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask animate-fadein"></div>
        <div class="route-overlay" *ngIf="isNavigating">
        <div class="content" style="display:flex;flex-direction:column;align-items:center;">
        <div class="ball" aria-label="Chargement">
          <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="38" cy="38" r="36" fill="#ffffff" stroke="#0b5a2f" stroke-width="2"/>
                <path d="M38 20 L49 30 L45 45 L31 45 L27 30 Z" fill="#329157"/>
                <circle cx="16" cy="32" r="6" fill="#329157"/>
                <circle cx="60" cy="32" r="6" fill="#329157"/>
                <circle cx="26" cy="60" r="6" fill="#329157"/>
                <circle cx="50" cy="60" r="6" fill="#329157"/>
                <defs>
                  <clipPath id="fbfClip">
                    <circle cx="38" cy="38" r="18"></circle>
                  </clipPath>
                </defs>
                <image href="assets/images/Logo-FBF.png" x="20" y="20" width="36" height="36"
                       clip-path="url(#fbfClip)" preserveAspectRatio="xMidYMid slice"/>
              </svg>
            </div>
            <div class="shadow"></div>
          </div>
        </div>
    </div> `
})
export class CoachLayout implements OnDestroy {
    overlayMenuOpenSubscription: Subscription;
    isNavigating = false;
    private navigationStartTime = 0;
    private minOverlayMs = 1200;
    private hideTimeout: any = null;

    menuOutsideClickListener: any;

    @ViewChild(CoachMenuComponent) appSidebar!: CoachMenuComponent;
    @ViewChild(AppTopbar) appTopBar!: AppTopbar;

    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router
    ) {
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                    if (this.isOutsideClicked(event)) {
                        this.hideMenu();
                    }
                });
            }

            if (this.layoutService.layoutState().staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.subscribe((evt: any) => {
            if (evt?.constructor?.name === 'NavigationStart') {
                this.navigationStartTime = Date.now();
                this.isNavigating = true;
                if (this.hideTimeout) {
                    clearTimeout(this.hideTimeout);
                    this.hideTimeout = null;
                }
            }
            if (evt?.constructor?.name === 'NavigationEnd' || evt?.constructor?.name === 'NavigationCancel' || evt?.constructor?.name === 'NavigationError') {
                const elapsed = Date.now() - this.navigationStartTime;
                const wait = Math.max(this.minOverlayMs - elapsed, 0);
                this.hideTimeout = setTimeout(() => {
                    this.isNavigating = false;
                    this.hideTimeout = null;
                }, wait);
                this.hideMenu();
            }
        });
    }

    isOutsideClicked(event: MouseEvent) {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarEl = document.querySelector('.layout-menu-button');
        const eventTarget = event.target as Node;

        return !(sidebarEl?.isSameNode(eventTarget) || sidebarEl?.contains(eventTarget) || topbarEl?.isSameNode(eventTarget) || topbarEl?.contains(eventTarget));
    }

    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({ ...prev, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
        this.unblockBodyScroll();
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    get containerClass() {
        return {
            'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
            'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
            'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive && this.layoutService.layoutConfig().menuMode === 'static',
            'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
            'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
        };
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }
    }
}
