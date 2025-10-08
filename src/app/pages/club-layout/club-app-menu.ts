import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from '../../layout/component/app.menuitem';

@Component({
    selector: 'club-app-menu',
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
export class ClubAppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                //label: 'Menu club',
                items: [
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-chart-line', routerLink: ['/mon-club/dashboard'] },
                    { label: 'Matchs', icon: 'pi pi-fw pi-calendar', routerLink: ['/mon-club/matchs'] },
                    { label: 'Joueurs', icon: 'pi pi-fw pi-users', routerLink: ['/mon-club/joueurs'] },
                    { label: 'Gestion Club', icon: 'pi pi-fw pi-building', routerLink: ['/mon-club/gestion'] },
                    { label: 'Paramètres', icon: 'pi pi-fw pi-cog', routerLink: ['/mon-club/parametres'] }
                ]
            }
        ];
    }
}