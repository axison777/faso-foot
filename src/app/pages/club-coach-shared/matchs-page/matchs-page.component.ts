import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matchs-page',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TableModule, TabViewModule, DropdownModule, FormsModule],
  template: `
    <div class="matchs-page">
      <div class="page-header">
        <h1>Calendrier des matchs</h1>
        <p>Consultez tous les matchs de la saison</p>
      </div>

      <p-card>
        <div class="filters">
          <p-dropdown [options]="competitions" [(ngModel)]="selectedCompetition" placeholder="Toutes les compétitions" optionLabel="name" [showClear]="true"></p-dropdown>
          <p-dropdown [options]="teams" [(ngModel)]="selectedTeam" placeholder="Toutes les équipes" optionLabel="name" [showClear]="true"></p-dropdown>
        </div>

        <p-table [value]="matchs" [paginator]="true" [rows]="10">
          <ng-template pTemplate="header">
            <tr>
              <th>Date</th>
              <th>Équipe</th>
              <th>Adversaire</th>
              <th>Compétition</th>
              <th>Stade</th>
              <th>Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-match>
            <tr>
              <td>{{ match.date | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ match.team }}</td>
              <td>{{ match.opponent }}</td>
              <td>{{ match.competition }}</td>
              <td>{{ match.stadium }}</td>
              <td>
                <p-button label="Détails" icon="pi pi-eye" [text]="true" size="small"></p-button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>
    </div>
  `,
  styles: [`
    .matchs-page {
      .page-header {
        margin-bottom: 2rem;
        h1 { margin: 0 0 .5rem 0; font-size: 2rem; font-weight: 700; color: #0f172a; }
        p { margin: 0; color: #64748b; }
      }
      .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }
    }
  `]
})
export class MatchsPageComponent {
  competitions = [
    { name: 'Championnat D1', code: 'D1' },
    { name: 'Coupe Nationale', code: 'CN' }
  ];

  teams = [
    { name: 'Équipe A', code: 'A' },
    { name: 'Équipe B', code: 'B' }
  ];

  selectedCompetition: any = null;
  selectedTeam: any = null;

  matchs = [
    { date: new Date(), team: 'Équipe A', opponent: 'USO', competition: 'Championnat', stadium: 'Stade Municipal' },
    { date: new Date(Date.now() + 7*24*3600*1000), team: 'Équipe A', opponent: 'ASFA', competition: 'Championnat', stadium: 'Stade 4 Août' }
  ];
}
