import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from '../../layout/component/app.menuitem';

@Component({
    selector: 'official-app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `
})
export class OfficialAppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                //label: 'Menu officiel',
                items: [
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-chart-line', routerLink: ['/officiel/dashboard'] },
                    { label: 'Mes matchs', icon: 'pi pi-fw pi-calendar', routerLink: ['/officiel/matchs'] },
                    { label: 'Notifications', icon: 'pi pi-fw pi-bell', routerLink: ['/officiel/notifications'] }
                ]
            }
        ];
    }
}