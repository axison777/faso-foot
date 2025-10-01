import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../service/auth.service';

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

    constructor(private auth: AuthService) {}

    ngOnInit() {
        const can = (slug: string) => this.auth.hasPermission(slug);
        this.model = [
            {
                //label: 'Menu principal',
                items: [
                    { label: 'Accueil', icon: 'pi pi-fw pi-home', routerLink: ['/accueil'], visible: can('acceder-dashboard') },
                    { label: 'Saisons', icon: 'pi pi-fw pi-calendar', routerLink: ['/saisons'] },
                    { label: 'Clubs', icon: 'custom-icon club', routerLink: ['/clubs'] },
                    { label: 'Equipes', icon: 'pi pi-fw pi-users', routerLink: ['/equipes'], visible: can('acceder-onglet-equipes') },
                    { label: 'Joueurs', icon: 'custom-icon player', routerLink: ['/joueurs'] },
                    { label: 'Officiels', icon: 'custom-icon referee', routerLink: ['/officiels'] },
                    { label: 'Paramètres', icon: 'pi pi-fw pi-cog', visible: can('acceder-onglet-parametres'),
                        items: [
                            { label: "Catégories d'équipe", icon: 'custom-icon category', routerLink: ['/categories-equipe'] },
                            { label: 'Stades', icon: 'pi pi-fw pi-building', routerLink: ['/stades'] },
                            { label: 'Ligues', icon: 'pi pi-fw pi-shield', routerLink: ['/ligues'], visible: can('acceder-onglet-ligues') },
                           /*  { label: 'Compétitions', icon: 'custom-icon podium', routerLink: ['/competitions'] }, */
                            { label: 'Villes', icon: 'pi pi-fw pi-map-marker', routerLink: ['/villes'] },
                            { label: 'Utilisateurs', icon: 'pi pi-fw pi-id-card', routerLink: ['/utilisateurs'] },
                            { label: 'Rôles', icon: 'pi pi-fw pi-id-card', routerLink: ['/roles'] },
                        ]
                     },




                ]
            },



        ];
    }
}
