import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ClubService, MyClub } from '../../service/club.service';
import { CoachDashboardV2Component } from '../coach-dashboard-v2/coach-dashboard-v2.component';

interface ClubTeam {
    id: string;
    name: string;
    category: string;
    logo?: string;
    coach: {
        id: string;
        name: string;
        email: string;
    };
    players: number;
    status: 'ACTIVE' | 'INACTIVE';
}

interface ClubManager {
    id: string;
    name: string;
    email: string;
    club: {
        id: string;
        name: string;
        logo?: string;
        address: string;
        phone: string;
        email: string;
    };
    teams: ClubTeam[];
}

@Component({
  selector: 'app-club-dashboard-v2',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, DropdownModule, CardModule,
    TabViewModule, DividerModule, ToastModule, CoachDashboardV2Component
  ],
  providers: [MessageService],
  templateUrl: './club-dashboard-v2.component.html',
  styleUrls: ['./club-dashboard-v2.component.scss']
})
export class ClubDashboardV2Component implements OnInit {
  private clubService = inject(ClubService);
  private messageService = inject(MessageService);
  
  club = signal<MyClub | null>(null);
  manager = signal<ClubManager | null>(null);
  selectedTeamId = '';
  activeTabIndex = 0;

  teamOptions: any[] = [];
  categoryOptions = [
    { label: 'U7', value: 'U7' },
    { label: 'U9', value: 'U9' },
    { label: 'U11', value: 'U11' },
    { label: 'U13', value: 'U13' },
    { label: 'U15', value: 'U15' },
    { label: 'U17', value: 'U17' },
    { label: 'U19', value: 'U19' },
    { label: 'Senior', value: 'Senior' },
    { label: 'Vétéran', value: 'Vétéran' }
  ];

  coachOptions: any[] = [];
  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Inactive', value: 'INACTIVE' }
  ];

  clubSettings = {
    name: '',
    address: '',
    phone: '',
    email: '',
    logo: ''
  };

  teamSettings = {
    name: '',
    category: '',
    coachId: '',
    status: 'ACTIVE'
  };

  notificationSettings = {
    matchReminders: true,
    teamSheetDeadlines: true,
    playerInjuries: true,
    contractExpirations: true
  };

  ngOnInit(): void {
    this.loadClubData();
  }

  selectedTeam() {
    if (!this.manager() || !this.selectedTeamId) return null;
    return this.manager()!.teams.find(team => team.id === this.selectedTeamId);
  }

  loadClubData() {
    this.clubService.getMyClub().subscribe(c => {
      this.club.set(c);
      
      // Créer les données du manager basées sur les données du club
      const mockManager: ClubManager = {
        id: '1',
        name: 'Jean Dupont',
        email: 'jean.dupont@club.com',
        club: {
          id: c?.id || '1',
          name: c?.name || 'Club Sportif Municipal',
          logo: c?.logo,
          address: '123 Avenue du Sport, 75000 Paris',
          phone: '01 23 45 67 89',
          email: 'contact@club.com'
        },
        teams: (c?.teams || []).map(team => ({
          id: team.id,
          name: team.name,
          category: team.category || 'Senior',
          logo: team.logo,
          coach: {
            id: '1',
            name: 'Coach assigné',
            email: 'coach@club.com'
          },
          players: 25,
          status: 'ACTIVE'
        }))
      };

      this.manager.set(mockManager);
      this.teamOptions = mockManager.teams.map(team => ({
        label: `${team.name} (${team.category})`,
        value: team.id,
        ...team
      }));

      this.coachOptions = mockManager.teams.map(team => ({
        label: team.coach.name,
        value: team.coach.id
      }));

      // Sélectionner la première équipe par défaut
      if (mockManager.teams.length > 0) {
        this.selectedTeamId = mockManager.teams[0].id;
        this.loadTeamSettings();
      }

      this.loadClubSettings();
    });
  }

  selectTeam(teamId: string) {
    this.selectedTeamId = teamId;
    this.loadTeamSettings();
    this.messageService.add({
      severity: 'info',
      summary: 'Équipe sélectionnée',
      detail: `Affichage des données de ${this.selectedTeam()?.name}`
    });
  }

  onTeamChange() {
    this.loadTeamSettings();
    this.messageService.add({
      severity: 'info',
      summary: 'Équipe sélectionnée',
      detail: `Affichage des données de ${this.selectedTeam()?.name}`
    });
  }

  loadClubSettings() {
    const club = this.manager()?.club;
    if (club) {
      this.clubSettings = {
        name: club.name,
        address: club.address,
        phone: club.phone,
        email: club.email,
        logo: club.logo || ''
      };
    }
  }

  loadTeamSettings() {
    const team = this.selectedTeam();
    if (team) {
      this.teamSettings = {
        name: team.name,
        category: team.category,
        coachId: team.coach.id,
        status: team.status
      };
    }
  }

  onLogoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.messageService.add({
        severity: 'info',
        summary: 'Logo sélectionné',
        detail: 'Le logo sera uploadé lors de la sauvegarde'
      });
    }
  }

  saveSettings() {
    this.messageService.add({
      severity: 'success',
      summary: 'Paramètres sauvegardés',
      detail: 'Tous les paramètres ont été sauvegardés avec succès'
    });
  }

  resetSettings() {
    this.loadClubSettings();
    this.loadTeamSettings();
    this.messageService.add({
      severity: 'info',
      summary: 'Paramètres réinitialisés',
      detail: 'Les paramètres ont été remis à leur valeur d\'origine'
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  }
}
