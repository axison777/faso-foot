import { Routes } from '@angular/router';

import { Empty } from './empty/empty';
import { EquipesComponent } from './equipes/equipes.component';
import { SaisonsComponent } from './saisons/saisons.component';
import { MatchsComponent } from './matchs/matchs.component';

export default [
    {path: 'equipes', component: EquipesComponent},
    {path: 'saisons', component: SaisonsComponent},
    {path: 'matchs/:id', component: MatchsComponent},
    { path: 'empty', component: Empty },
   // { path: '**', redirectTo: '/notfound' }
] as Routes;
