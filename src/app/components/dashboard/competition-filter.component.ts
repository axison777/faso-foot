import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';

export interface CompetitionOption {
  id: string;
  name: string;
  type: 'LEAGUE' | 'CUP' | 'TOURNAMENT';
}

@Component({
  selector: 'app-competition-filter',
  standalone: true,
  imports: [CommonModule, SelectModule, FormsModule],
  template: `
    <div class="competition-filter">
      <label>Compétition</label>
      <p-select 
        [(ngModel)]="selectedCompetitionId"
        [options]="competitions"
        optionLabel="name"
        optionValue="id"
        placeholder="Toutes les compétitions"
        (onChange)="onCompetitionChange()"
        [style]="{ width: '100%' }"
        appendTo="body">
        <ng-template #selectedItem let-item>
          <div class="competition-option" *ngIf="item">
            <i class="pi" [ngClass]="{
              'pi-trophy': item.type === 'LEAGUE',
              'pi-star': item.type === 'CUP',
              'pi-flag': item.type === 'TOURNAMENT'
            }"></i>
            <span>{{ item.name }}</span>
          </div>
        </ng-template>
        <ng-template #item let-option>
          <div class="competition-option">
            <i class="pi" [ngClass]="{
              'pi-trophy': option.type === 'LEAGUE',
              'pi-star': option.type === 'CUP',
              'pi-flag': option.type === 'TOURNAMENT'
            }"></i>
            <span>{{ option.name }}</span>
          </div>
        </ng-template>
      </p-select>
    </div>
  `,
  styles: [`
    .competition-filter {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
      font-size: 0.95rem;
    }

    .competition-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .competition-option i {
      color: rgb(50,145,87);
    }
  `]
})
export class CompetitionFilterComponent {
  @Input() competitions: CompetitionOption[] = [];
  @Input() selectedCompetitionId: string | null = null;
  @Output() selectedCompetitionIdChange = new EventEmitter<string | null>();
  @Output() competitionChange = new EventEmitter<string | null>();

  onCompetitionChange(): void {
    this.selectedCompetitionIdChange.emit(this.selectedCompetitionId);
    this.competitionChange.emit(this.selectedCompetitionId);
  }
}
