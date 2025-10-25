import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ClubService, MyClub } from '../../service/club.service';
import { ClubManagerService } from '../../service/club-manager.service';
import { TeamKitService } from '../../service/team-kit.service';
import { AuthService } from '../../service/auth.service';
import { CoachDashboardV2Component } from '../coach-dashboard-v2/coach-dashboard-v2.component';
import { KitsDisplayComponent } from '../../components/kits-display/kits-display.component';

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
    TabViewModule, DividerModule, ToastModule, CoachDashboardV2Component,
    KitsDisplayComponent
  ],
  providers: [MessageService],
  templateUrl: './club-dashboard-v2.component.html',
  styleUrls: ['./club-dashboard-v2.component.scss']
})
export class ClubDashboardV2Component implements OnInit {
  private clubService = inject(ClubService);
  private clubManagerService = inject(ClubManagerService);
  private teamKitService = inject(TeamKitService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  
  club = signal<any | null>(null);
  manager = signal<ClubManager | null>(null);
  kits = signal<any[]>([]);
  selectedTeamId = '';
  activeTabIndex = 0;
  loading = false;
  clubId: string | null = null;

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
    // Récupérer l'ID du club de l'utilisateur connecté
    const currentUser = this.authService.currentUser;
    if (currentUser && (currentUser as any).club_id) {
      this.clubId = (currentUser as any).club_id;
      this.loadClubData();
      this.loadKits();
    } else {
      // Si pas de club_id dans le user, essayer de récupérer depuis localStorage
      const storedClubId = localStorage.getItem('user_club_id');
      if (storedClubId) {
        this.clubId = storedClubId;
        this.loadClubData();
        this.loadKits();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Aucun club associé à cet utilisateur'
        });
      }
    }
  }

  selectedTeam() {
    if (!this.manager() || !this.selectedTeamId) return null;
    return this.manager()!.teams.find(team => team.id === this.selectedTeamId);
  }

  loadClubData() {
    if (!this.clubId) return;

    this.loading = true;
    console.log('🏢 [CLUB DASHBOARD] Chargement du club avec ClubManagerService:', this.clubId);
    
    this.clubManagerService.getClubById(this.clubId).subscribe({
      next: (clubData: any) => {
        console.log('✅ [CLUB DASHBOARD] Données du club reçues:', clubData);
        this.club.set(clubData);
        
        const currentUser = this.authService.currentUser;
        
        // Créer les données du manager basées sur les données du club
        const manager: ClubManager = {
          id: currentUser?.id || '1',
          name: `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'Manager',
          email: currentUser?.email || '',
          club: {
            id: clubData?.id || this.clubId || '',
            name: clubData?.name || 'Mon Club',
            logo: clubData?.logo,
            address: clubData?.address || '',
            phone: clubData?.phone || '',
            email: clubData?.email || ''
          },
          teams: (clubData?.teams || []).map((team: any) => {
            console.log('🔍 [MAPPING TEAM]:', team);
            
            // Essayer de trouver le coach depuis plusieurs sources possibles
            let coachName = 'Coach non assigné';
            let coachId = '1';
            let coachEmail = '';
            
            // Cas 1: coach est un objet avec first_name/last_name
            if (team.coach?.first_name || team.coach?.last_name) {
              coachName = `${team.coach.first_name || ''} ${team.coach.last_name || ''}`.trim();
              coachId = team.coach.id || '1';
              coachEmail = team.coach.email || '';
            }
            // Cas 2: manager_first_name/manager_last_name directement sur team
            else if (team.manager_first_name || team.manager_last_name) {
              coachName = `${team.manager_first_name || ''} ${team.manager_last_name || ''}`.trim();
            }
            // Cas 3: staff members - chercher le COACH
            else if (team.staff_members && Array.isArray(team.staff_members)) {
              const coach = team.staff_members.find((s: any) => s.role === 'COACH');
              if (coach) {
                coachName = `${coach.first_name || ''} ${coach.last_name || ''}`.trim();
                coachId = coach.id || '1';
                coachEmail = coach.email || '';
              }
            }
            
            return {
              id: team.id,
              name: team.name || 'Équipe',
              category: team.category?.name || team.category || 'Senior',
              logo: team.logo || team.logo_url,
              coach: {
                id: coachId,
                name: coachName,
                email: coachEmail
              },
              players: team.player_count || team.players_count || 0,
              status: team.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
            };
          })
        };

        console.log('✅ [CLUB DASHBOARD] Manager créé avec', manager.teams.length, 'équipes');
        this.manager.set(manager);
        this.teamOptions = manager.teams.map(team => ({
          label: `${team.name} (${team.category})`,
          value: team.id,
          ...team
        }));

        this.coachOptions = manager.teams.map(team => ({
          label: team.coach.name,
          value: team.coach.id
        }));

        // Sélectionner la première équipe par défaut
        if (manager.teams.length > 0) {
          this.selectedTeamId = manager.teams[0].id;
          this.loadTeamSettings();
        }

        this.loadClubSettings();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des données du club'
        });
        console.error('❌ [CLUB DASHBOARD] Erreur chargement club:', err);
      }
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

  loadKits() {
    this.teamKitService.getAll().subscribe({
      next: (res: any) => {
        console.log('✅ Maillots chargés:', res);
        this.kits.set(res?.data?.jerseys || []);
      },
      error: (err: any) => {
        console.error('❌ Erreur chargement maillots:', err);
      }
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

  // Navigation vers les détails d'une équipe
  goToTeamDetails(teamId: string) {
    this.router.navigate(['/equipes/details', teamId]);
  }

  // Navigation vers la vue complète du club
  goToClubDetails() {
    if (this.clubId) {
      this.router.navigate(['/clubs/details', this.clubId]);
    }
  }

  // Navigation vers la gestion des joueurs
  goToPlayers() {
    this.router.navigate(['/mon-club/joueurs']);
  }

  // Navigation vers les matchs du club
  goToMatches() {
    this.router.navigate(['/mon-club/matchs']);
  }
}
