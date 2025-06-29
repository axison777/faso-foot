import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AccueilComponent } from './app/pages/accueil/accueil.component';
import { SaisonsComponent } from './app/pages/saisons/saisons.component';
import { VillesComponent } from './app/pages/villes/villes.component';
import { StadesComponent } from './app/pages/stades/stades.component';
import { EquipesComponent } from './app/pages/equipes/equipes.component';
import { LoginComponent } from './app/pages/login/login.component';

export const appRoutes: Routes = [
    // Route de connexion SANS layout (page indépendante)
    { path: 'login', component: LoginComponent },
    
    // Routes avec layout principal (protégées par le guard)
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', redirectTo: '/accueil', pathMatch: 'full' }, // Redirection vers accueil après connexion
            { path: 'accueil', component: AccueilComponent },
            { path: 'saisons', component: SaisonsComponent },
            { path: 'villes', component: VillesComponent },
            {
                path: 'villes/new',
                loadComponent: () => import('./app/pages/villes/add-ville/add-ville.component')
                    .then(m => m.AddVilleComponent)
            },
            { path: 'stades', component: StadesComponent },
            { path: 'equipes', component: EquipesComponent },
        ]
    },
    
    // Autres routes sans layout
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    
    // Redirection par défaut vers login si non authentifié
    { path: '**', redirectTo: '/login' }
];
