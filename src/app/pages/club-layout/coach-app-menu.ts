import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from '../../layout/component/app.menuitem';

@Component({
    selector: 'coach-app-menu',
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
export class CoachAppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                //label: 'Menu équipe',
                items: [
                    { label: 'Tableau de bord', icon: 'pi pi-fw pi-chart-line', routerLink: ['/mon-equipe/dashboard'] },
                    { label: 'Matchs', icon: 'pi pi-fw pi-calendar', routerLink: ['/mon-equipe/matchs'] },
                    { label: 'Joueurs', icon: 'pi pi-fw pi-users', routerLink: ['/mon-equipe/joueurs'] }
                ]
            }
        ];
    }
}