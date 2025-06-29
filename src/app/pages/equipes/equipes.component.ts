// equipes.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
//import { Team, League } from '../service/team.model';

import { MessageService } from 'primeng/api';
import { TeamService } from '../../service/team.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { NgIf } from '@angular/common';


export interface League {
  id: number;
  name: string;
}

export interface Team {
  id: number;
  name: string;
  league: League;
}

@Component({
  selector: 'app-equipes',
  imports: [
    FormsModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    NgIf
  ],
  templateUrl: './equipes.component.html',
  styleUrls: ['./equipes.component.scss'],
  providers: [MessageService],
})
export class EquipesComponent implements OnInit {
@ViewChild('dt') dt!: Table;
  teams: Team[] = [];
  leagues: League[] = [];

  newTeamName: string = '';
  selectedLeagueId: number | null = null;
  selectedLeague: League | null = null;

  loading = false;
  displayDialog: boolean = false;
  selectedLeagueFilter: League | null = null;

  submitted: boolean = false;



  constructor(
    private teamService: TeamService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    //this.loadData();
    this.leagues = [
      { id: 1, name: 'Ligue A' },
      { id: 2, name: 'Ligue B' },
      { id: 3, name: 'Ligue C' }
    ];

    this.teams = [
      { id: 1, name: 'Équipe Alpha', league: this.leagues[0] },
      { id: 2, name: 'Équipe Bravo', league: this.leagues[1] },
      { id: 3, name: 'Équipe Charlie', league: this.leagues[2] }
    ];
  }

  loadData() {
    this.loading = true;
    this.teamService.getTeams().subscribe((data) => {
      this.teams = data;
      this.loading = false;
    });

    this.teamService.getLeagues().subscribe((data) => {
      this.leagues = data;
    });
  }

  createTeam() {
    if (!this.newTeamName || !this.selectedLeagueId) return;

    this.teamService
      .createTeam({ name: this.newTeamName, leagueId: this.selectedLeagueId })
      .subscribe({
        next: (team) => {
          this.teams.push(team);
          this.messageService.add({
            severity: 'success',
            summary: 'Équipe créée',
            detail: `${team.name} a été ajoutée`,
          });
          this.newTeamName = '';
          this.selectedLeagueId = null;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de créer l’équipe',
          });
        },
      });
  }

  ///////////// fake
  openNewTeamDialog() {
    this.displayDialog = true;
    this.newTeamName = '';
    this.selectedLeague = null;
  }

 /*  saveTeam() {
    if (!this.newTeamName || !this.selectedLeague) return;

    const newTeam: Team = {
      id: this.teams.length + 1,
      name: this.newTeamName,
      league: this.selectedLeague
    };

    this.teams.push(newTeam);
    this.displayDialog = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Équipe ajoutée',
      detail: `${newTeam.name} a été créée.`,
      life: 3000
    });
  } */

    saveTeam() {
  this.submitted = true;

  if (!this.newTeamName || !this.selectedLeague) return;

  const newTeam: Team = {
    id: this.teams.length + 1,
    name: this.newTeamName,
    league: this.selectedLeague
  };

  this.teams.push(newTeam);
  this.displayDialog = false;
  this.submitted = false;

  this.messageService.add({
    severity: 'success',
    summary: 'Équipe ajoutée',
    detail: `${newTeam.name} a été créée.`,
    life: 3000
  });
}

  filterByLeague() {
  if (this.dt) {
    if (this.selectedLeagueFilter) {
      this.dt.filter(this.selectedLeagueFilter.name, 'league.name', 'equals');
    } else {
      this.dt.filter('', 'league.name', 'equals'); 
    }
  }
  }
  getLigueName(league: League): string {
    return league?.name ?? '';
  }


}
