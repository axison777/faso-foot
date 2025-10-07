import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../layout/service/layout.service';
import { AppMenuitem } from '../../layout/component/app.menuitem';

@Component({
    selector: 'official-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem],
    template: `
        <div class="layout-sidebar">
            <a class="layout-sidebar-anchor"></a>
            <div class="sidebar-header">
                <span class="sidebar-title">Dashboard Officiel</span>
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
export class OfficialMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Navigation',
                items: [
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-chart-line', routerLink: ['/officiel/dashboard'] },
                    { label: 'Mes matchs', icon: 'pi pi-fw pi-calendar', routerLink: ['/officiel/matchs'] },
                    { label: 'Rapports', icon: 'pi pi-fw pi-file-text', routerLink: ['/officiel/rapports'] },
                    { label: 'Notifications', icon: 'pi pi-fw pi-bell', routerLink: ['/officiel/notifications'] }
                ]
            }
        ];
    }
}