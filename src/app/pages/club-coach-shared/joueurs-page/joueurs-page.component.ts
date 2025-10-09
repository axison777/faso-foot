import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SidebarModule } from 'primeng/sidebar';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-joueurs-page',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, SidebarModule, TagModule, FormsModule],
  template: `
    <div class="joueurs-page">
      <div class="page-header">
        <h1>Joueurs</h1>
        <p>Gérez les joueurs et consultez leurs statistiques</p>
      </div>

      <p-card>
        <p-table [value]="joueurs" [paginator]="true" [rows]="10">
          <ng-template pTemplate="header">
            <tr>
              <th>Nom</th>
              <th>Poste</th>
              <th>Numéro</th>
              <th>Statut</th>
              <th>Buts</th>
              <th>Passes D.</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-joueur>
            <tr>
              <td>{{ joueur.nom }}</td>
              <td>{{ joueur.poste }}</td>
              <td>{{ joueur.numero }}</td>
              <td>
                <p-tag [value]="joueur.statut" [severity]="joueur.statut === 'Actif' ? 'success' : joueur.statut === 'Blessé' ? 'danger' : 'warning'"></p-tag>
              </td>
              <td>{{ joueur.buts }}</td>
              <td>{{ joueur.passes }}</td>
              <td>
                <p-button label="Détails" icon="pi pi-eye" [text]="true" size="small" (click)="showDetails(joueur)"></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-sidebar [(visible)]="detailsVisible" position="right" [style]="{width:'450px'}">
        <h2>Détails du joueur</h2>
        <div *ngIf="selectedJoueur" class="player-details">
          <div class="detail-item">
            <span class="label">Nom complet</span>
            <span class="value">{{ selectedJoueur.nom }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Licence</span>
            <span class="value">{{ selectedJoueur.licence || 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Statut</span>
            <p-tag [value]="selectedJoueur.statut" [severity]="selectedJoueur.statut === 'Actif' ? 'success' : 'danger'"></p-tag>
          </div>
          <div class="detail-item">
            <span class="label">Historique</span>
            <span class="value">{{ selectedJoueur.historique || 'Aucun historique' }}</span>
          </div>
        </div>
      </p-sidebar>
    </div>
  `,
  styles: [`
    .joueurs-page {
      .page-header {
        margin-bottom: 2rem;
        h1 { margin: 0 0 .5rem 0; font-size: 2rem; font-weight: 700; color: #0f172a; }
        p { margin: 0; color: #64748b; }
      }
    }
    .player-details {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-top: 1.5rem;

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: .5rem;

        .label {
          color: #64748b;
          font-size: .85rem;
          font-weight: 500;
        }

        .value {
          color: #0f172a;
          font-size: 1rem;
        }
      }
    }
  `]
})
export class JoueursPageComponent {
  detailsVisible = false;
  selectedJoueur: any = null;

  joueurs = [
    { nom: 'Ouédraogo Tiiga', poste: 'Attaquant', numero: 10, statut: 'Actif', buts: 15, passes: 8, licence: 'LIC-2024-001' },
    { nom: 'Dipama Rasmané', poste: 'Milieu', numero: 8, statut: 'Blessé', buts: 5, passes: 12, licence: 'LIC-2024-002' }
  ];

  showDetails(joueur: any) {
    this.selectedJoueur = joueur;
    this.detailsVisible = true;
  }
}
