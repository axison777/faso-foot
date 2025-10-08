import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { MatchService, MatchItem } from '../../../service/match.service';
import { CompetitionFilterComponent, CompetitionOption } from '../competition-filter/competition-filter.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ToolbarModule, DropdownModule, SelectModule, CompetitionFilterComponent, DatePipe, NgIf, NgFor],
  templateUrl: './matches-list.component.html',
  styleUrls: ['./matches-list.component.scss']
})
export class MatchesListComponent implements OnInit {
  @Input() teamId!: string;

  private matchService = inject(MatchService);

  status: 'UPCOMING'|'PLAYED' = 'UPCOMING';
  competitionId: string | null = null;
  seasonId: string | null = null;

  competitions: CompetitionOption[] = [
    { id: 'c1', name: 'Championnat', type: 'LEAGUE' },
    { id: 'c2', name: 'Coupe', type: 'CUP' },
  ];

  loading = false;
  rows = signal<MatchItem[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load() {
    if (!this.teamId) return;
    this.loading = true;
    this.matchService.getMatchesForTeam(this.teamId, { status: this.status, competitionId: this.competitionId || undefined, seasonId: this.seasonId || undefined }).subscribe(list => {
      this.rows.set(list);
      this.loading = false;
    });
  }
}
