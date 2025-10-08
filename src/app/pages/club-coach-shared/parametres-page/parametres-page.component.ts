import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';

@Component({
  selector: 'app-parametres-page',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TabViewModule],
  template: `
    <div class="parametres-page">
      <div class="page-header">
        <h1>Paramètres</h1>
        <p>Gérez votre club et vos équipes</p>
      </div>

      <p-tabView>
        <p-tabPanel header="Staff">
          <p-card>
            <h3>Gestion du staff</h3>
            <p>Fonctionnalité à venir...</p>
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Maillots">
          <p-card>
            <h3>Gestion des maillots</h3>
            <p>Fonctionnalité à venir...</p>
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Équipes">
          <p-card>
            <h3>Gestion des équipes</h3>
            <p>Fonctionnalité à venir...</p>
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Joueurs">
          <p-card>
            <h3>Association joueurs-équipes</h3>
            <p>Fonctionnalité à venir...</p>
          </p-card>
        </p-tabPanel>
      </p-tabView>
    </div>
  `,
  styles: [`
    .parametres-page {
      .page-header {
        margin-bottom: 2rem;
        h1 { margin: 0 0 .5rem 0; font-size: 2rem; font-weight: 700; color: #0f172a; }
        p { margin: 0; color: #64748b; }
      }
    }
  `]
})
export class ParametresPageComponent {}
