import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { ClubLayout } from './app/pages/club-layout/club.layout';
import { CoachLayout } from './app/pages/club-layout/coach.layout';
import { OfficialLayout } from './app/pages/official-layout/official.layout';
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
import { OfficialsComponent } from './app/pages/officials/officials.component';
import { OfficialDetailsComponent } from './app/pages/official-details/official-details.component';
import { ClubDetailsComponent } from './app/pages/club-details/club-details.component';
import { SaisonDetailsComponent } from './app/pages/saison-details/saison-details.component';
import { MatchSetupComponent } from './app/pages/match-setup/match-setup.component';
import { RolesComponent } from './app/pages/roles/roles.component';
import { RoleRedirectGuard } from './app/role-redirect.guard';

export const appRoutes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'activation-compte', loadComponent: () => import('./app/pages/activation-compte/activation-compte.component').then(m => m.ActivationCompteComponent) },
    { path: 'lien-expire', loadComponent: () => import('./app/pages/lien-expire/lien-expire.component').then(m => m.LienExpireComponent) },
    { path: 'forgot-password', loadComponent: () => import('./app/pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    { path: 'change-forgotpassword', loadComponent: () => import('./app/pages/change-forgotpassword/change-forgotpassword.component').then(m => m.ChangeForgotPasswordComponent) },
    {path:'export-pdf',component:ExportMatchComponent, canActivate: [AuthGuard] },
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard, RoleRedirectGuard],
        data:{role:['admin']},
        children: [
           // { path: '', component: Dashboard },
            //{ path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            //{ path: 'documentation', component: Documentation },
            { path: '', component: AccueilComponent,canActivate: [AuthGuard] },
            { path: 'accueil', component: AccueilComponent,canActivate: [AuthGuard] },
            { 
                path: 'saisons', 
                canActivate: [AuthGuard],
                children: [
                    { path: '', component: SaisonsComponent },
                    { path: 'ajout', component: FormulaireSaisonComponent },
                    { path: 'details/:id', component: SaisonDetailsComponent },
                    { path: 'calendrier', component: CalendrierComponent }
                ]
            },
            { path: 'villes', component: VillesComponent,canActivate: [AuthGuard] },
            { path: 'stades', component: StadesComponent, canActivate: [AuthGuard] },
            { 
                path: 'equipes', 
                canActivate: [AuthGuard],
                children: [
                    { path: '', component: EquipesComponent },
                    { path: 'details/:id', component: EquipeDetailsComponent }
                ]
            },
            { path: 'matchs/:id', component: MatchsComponent, canActivate: [AuthGuard] },
            { path: 'utilisateurs', component: UsersComponent, canActivate: [AuthGuard] },
            { path: 'ligues', component:LiguesComponent, canActivate: [AuthGuard] },
            { path: 'competitions', component:CompetitionsComponent, canActivate: [AuthGuard] },
            { 
                path: 'clubs', 
                canActivate: [AuthGuard],
                children: [
                    { path: '', component: ClubsComponent },
                    { path: 'details/:id', component: ClubDetailsComponent }
                ]
            },
            { 
                path: 'joueurs', 
                canActivate: [AuthGuard],
                children: [
                    { path: '', component: PlayersComponent },
                    { path: 'details/:id', component: PlayerDetailsComponent }
                ]
            },
            { path: 'categories-equipe', component:TeamCategoriesComponent, canActivate: [AuthGuard] },
            { path: 'roles', component: RolesComponent, canActivate: [AuthGuard] },
            { 
                path: 'officiels', 
                canActivate: [AuthGuard],
                children: [
                    { path: '', component: OfficialsComponent },
                    { path: 'details/:id', component: OfficialDetailsComponent }
                ]
            },
            { path: 'match-setup/:id', component: MatchSetupComponent, canActivate: [AuthGuard] },

        ]
    },
    {
        path: 'mon-club',
        component: ClubLayout,
        canActivate: [AuthGuard, RoleRedirectGuard],
        data:{role:['club','admin']},
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./app/pages/club-dashboard-v2/club-dashboard-v2.component').then(m => m.ClubDashboardV2Component) },
            { path: 'matchs', loadComponent: () => import('./app/pages/club-matches/club-matches.component').then(m => m.ClubMatchesComponent) },
            { path: 'joueurs', loadComponent: () => import('./app/pages/club-players/club-players.component').then(m => m.ClubPlayersComponent) },
            { path: 'parametres', loadComponent: () => import('./app/pages/club-coach-shared/parametres-page/parametres-page.component').then(m => m.ParametresPageComponent) }
        ]
    },
    {
        path: 'officiel',
        component: OfficialLayout,
        canActivate: [AuthGuard, RoleRedirectGuard],
        data:{role:['official','admin']},
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./app/pages/official-dashboard/official-dashboard.component').then(m => m.OfficialDashboardComponent) },
            { path: 'matchs', loadComponent: () => import('./app/pages/official-matches/official-matches.component').then(m => m.OfficialMatchesComponent) },
            { path: 'match-details/:id', loadComponent: () => import('./app/pages/official-match-details/official-match-details.component').then(m => m.OfficialMatchDetailsComponent) },
            { path: 'notifications', loadComponent: () => import('./app/pages/official-notifications/official-notifications.component').then(m => m.OfficialNotificationsComponent) }
        ]
    },
    {
        path: 'mon-equipe',
        component: CoachLayout,
        canActivate: [AuthGuard, RoleRedirectGuard],
        data:{role:['coach','admin']},
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./app/pages/coach-dashboard-v2/coach-dashboard-v2.component').then(m => m.CoachDashboardV2Component) },
            { path: 'matchs', loadComponent: () => import('./app/pages/coach-matches/coach-matches.component').then(m => m.CoachMatchesComponent) },
            { path: 'joueurs', loadComponent: () => import('./app/pages/coach-players/coach-players.component').then(m => m.CoachPlayersComponent) },
            { path: 'feuille-match/:id', loadComponent: () => import('./app/pages/coach-match-sheet/coach-match-sheet.component').then(m => m.CoachMatchSheetComponent) }
        ]
    },

    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
