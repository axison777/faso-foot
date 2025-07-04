import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
//import { Dashboard } from './app/pages/dashboard/dashboard';
//import { Documentation } from './app/pages/documentation/documentation';
//import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AccueilComponent } from './app/pages/accueil/accueil.component';
import { SaisonsComponent } from './app/pages/saisons/saisons.component';
import { VillesComponent } from './app/pages/villes/villes.component';
import { StadesComponent } from './app/pages/stades/stades.component';
import { EquipesComponent } from './app/pages/equipes/equipes.component';
import { LoginComponent } from './app/pages/login/login.component';
import { MatchsComponent } from './app/pages/matchs/matchs.component';
import { FormulaireSaisonComponent } from './app/pages/saisons/formulaire-saison/formulaire-saison.component';
import { CalendrierComponent } from './app/pages/saisons/calendrier/calendrier.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
           // { path: '', component: Dashboard },
            //{ path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            //{ path: 'documentation', component: Documentation },
            { path: '', component: AccueilComponent },
            { path: 'accueil', component: AccueilComponent },
            { path: 'saisons', component: SaisonsComponent },
            { path: 'villes', component: VillesComponent },
            { path: 'stades', component: StadesComponent },
            { path: 'equipes', component: EquipesComponent },
             {path: 'matchs/:id', component: MatchsComponent},
            { path: 'login', component: LoginComponent },
            {path: 'ajout-saison', component: FormulaireSaisonComponent},
            {path: 'calendrier/:id', component: CalendrierComponent}
        ]
    },

    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
