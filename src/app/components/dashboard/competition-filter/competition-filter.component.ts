import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';

export interface CompetitionOption { id: string; name: string; type: 'LEAGUE'|'CUP'|'TOURNAMENT'; }

@Component({
  selector: 'app-competition-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './competition-filter.component.html',
  styleUrls: ['./competition-filter.component.scss']
})
export class CompetitionFilterComponent {
  @Input() competitions: CompetitionOption[] = [];
  @Input() selectedId: string | null = null;
  @Output() selectedIdChange = new EventEmitter<string | null>();

  onChange(ev: any) {
    this.selectedIdChange.emit(this.selectedId);
  }
}
