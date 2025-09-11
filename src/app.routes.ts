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
import { UsersComponent } from './app/pages/users/users.component';
import { LiguesComponent } from './app/pages/ligues/ligues.component';
/* import { CalendarComponent } from './app/pages/calendar/calendar.component'; */
import { AuthGuard } from './app/auth.guard';
import { ExportMatchComponent } from './app/pages/export-match/export-match.component';
import { CompetitionsComponent } from './app/pages/competitions/competitions.component';
import { ClubsComponent } from './app/pages/clubs/clubs.component';
import { PlayersComponent } from './app/pages/players/players.component';
import { EquipeDetailsComponent } from './app/pages/equipe-details/equipe-details.component';
import { PlayerDetailsComponent } from './app/pages/player-details/player-details.component';
import { TeamCategoriesComponent } from './app/pages/team-categories/team-categories.component';
export const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    {path:'export-pdf',component:ExportMatchComponent, canActivate: [AuthGuard] },
    {
        path: '',
        component: AppLayout,
        children: [
           // { path: '', component: Dashboard },
            //{ path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            //{ path: 'documentation', component: Documentation },
            { path: '', component: AccueilComponent,canActivate: [AuthGuard] },
            { path: 'accueil', component: AccueilComponent,canActivate: [AuthGuard] },
            { path: 'saisons', component: SaisonsComponent, canActivate: [AuthGuard] },
            { path: 'villes', component: VillesComponent,canActivate: [AuthGuard] },
            { path: 'stades', component: StadesComponent, canActivate: [AuthGuard] },
            { path: 'equipes', component: EquipesComponent, canActivate: [AuthGuard] },
             {path: 'matchs/:id', component: MatchsComponent, canActivate: [AuthGuard] },
             {path: 'utilisateurs', component: UsersComponent, canActivate: [AuthGuard] },
             {path: 'ligues', component:LiguesComponent, canActivate: [AuthGuard] },
             {path: 'competitions', component:CompetitionsComponent, canActivate: [AuthGuard] },
             {path: 'clubs', component:ClubsComponent, canActivate: [AuthGuard] },
             {path: 'joueurs', component:PlayersComponent, canActivate: [AuthGuard] },
             {path: 'equipe-details/:id', component:EquipeDetailsComponent, canActivate: [AuthGuard] },
             {path: 'joueur-details/:id', component:PlayerDetailsComponent, canActivate: [AuthGuard] },
             {path: 'categories-equipe', component:TeamCategoriesComponent, canActivate: [AuthGuard] },

            {path: 'ajout-saison', component: FormulaireSaisonComponent, canActivate: [AuthGuard] },
            {path: 'calendrier', component: CalendrierComponent, canActivate: [AuthGuard] },
          /*    {path: 'calendar', component:CalendarComponent}, */


        ]
    },

    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
