import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
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
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                //label: 'Menu principal',
                items: [
                    { label: 'Accueil', icon: 'pi pi-fw pi-home', routerLink: ['/accueil'] },
                    { label: 'Saisons', icon: 'pi pi-fw pi-calendar', routerLink: ['/saisons']},
                    { label: 'Equipes', icon: 'pi pi-fw pi-users', routerLink: ['/equipes'] },
                    { label: 'Paramètres', icon: 'pi pi-fw pi-cog',
                        items: [
                             { label: 'Villes', icon: 'pi pi-fw pi-map-marker', routerLink: ['/villes'] },
                            { label: 'Stades', icon: 'pi pi-fw pi-building', routerLink: ['/stades'] }]
                     },


                ]
            },



        ];
    }
}
