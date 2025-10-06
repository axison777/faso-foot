import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../layout/service/layout.service';
import { AppMenuItem } from '../../layout/component/app.menuitem';

@Component({
    selector: 'club-menu',
    standalone: true,
    imports: [CommonModule, AppMenuItem],
    template: `
        <div class="layout-sidebar">
            <a class="layout-sidebar-anchor"></a>
            <div class="sidebar-header">
                <span class="sidebar-title">Mon Club</span>
            </div>
            <ul class="layout-menu">
                <ng-container *ngFor="let item of model; let i = index;">
                    <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
                </ng-container>
            </ul>
        </div>
    `,
    styles: [`
        .sidebar-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--surface-border);
            margin-bottom: 0.5rem;
        }
        .sidebar-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--primary-color);
        }
    `]
})
export class ClubMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Navigation',
                items: [
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-chart-line', routerLink: ['/mon-club/dashboard'] },
                    { label: 'Matchs', icon: 'pi pi-fw pi-calendar', routerLink: ['/mon-club/matchs'] },
                    { label: 'Joueurs', icon: 'pi pi-fw pi-users', routerLink: ['/mon-club/joueurs'] },
                    { label: 'Paramètres', icon: 'pi pi-fw pi-cog', routerLink: ['/mon-club/parametres'] }
                ]
            }
        ];
    }
}
