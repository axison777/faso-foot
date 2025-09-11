import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Team } from '../../models/team.model';
import { Player } from '../../models/player.model';
import { TeamKit } from '../../models/team-kit.model';
import { Contract } from '../../models/contract.model';
import { SelectModule } from 'primeng/select';
import { ActivatedRoute } from '@angular/router';
import { EquipeService } from '../../service/equipe.service';
import { TeamKitService } from '../../service/team-kit.service';
import { PlayerService } from '../../service/player.service';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-equipe-details',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    DialogModule, ButtonModule, InputTextModule, InputNumberModule,
    CalendarModule, ConfirmDialogModule, ToastModule, TabViewModule, SelectModule,
    DatePickerModule, MultiSelectModule, FileUploadModule
  ],
  templateUrl: './equipe-details.component.html',
  styleUrls: ['./equipe-details.component.scss'],

  providers: [MessageService, ConfirmationService]
})
export class EquipeDetailsComponent implements OnInit {

    loadingKits: boolean = false;
    loadingStaff: boolean = false;
    loadingTrophies: boolean = false;
    loadingPlayers: boolean = false;
    loadingForm: boolean = false;

  // ---------- DATA ----------
  team!: Team;
  players: Player[] = [];
  activeIndex = 0; // TabView index

  // search
  searchPlayer = '';
  loading = false;

  // dialogs & forms
  showPlayerForm = false;
  isEditingPlayer = false;
  playerForm!: FormGroup;

  showPlayerDetails = false;
  currentPlayer: Player | null = null;

  showContracts = false;
  showContractForm = false;
  contractForm!: FormGroup;
  isEditingContract = false;

  showStaffForm = false;
  isEditingStaff = false;
  staffForm!: FormGroup;

  showKitForm = false;
  isEditingKit = false;
  kitForm!: FormGroup;

  showTrophyForm = false;
  isEditingTrophy = false;
  trophyForm!: FormGroup;

  // selects
  positions = [
    { label: 'Gardien', value: 'Gardien' },
    { label: 'Défenseur', value: 'Défenseur' },
    { label: 'Milieu', value: 'Milieu' },
    { label: 'Attaquant', value: 'Attaquant' }
  ];
  contractTypes = [
    { label: 'Professionnel', value: 'Professionnel' },
    { label: 'Jeune', value: 'Jeune' },
    { label: 'Prêt', value: 'Prêt' }
  ];
  kitTypes = [
    { label: 'Domicile', value: 'home' },
    { label: 'Extérieur', value: 'away' },
    { label: 'Neutre', value: 'neutral' }
  ];

  // ---------- MOCK ----------
  private mockTeam: Team = {
    id: 'team-1',
    name: 'ASFA U20',
    phone: '78000100',
    email: 'contact@asfa.com',
    abbreviation: 'ASFA U20',
    logo_url: 'https://placehold.co/128x128/000000/FFFFFF?text=LAN',
    city: { id: 'city-1', name: 'Ouaga' },
    league: { id: 'league-1', name: 'Ligue U20' },
    category: { id: 'category-1', name: 'Football' },
    manager_first_name: 'Issouf',
    manager_last_name: 'KAM',
    manager_role: 'Entraîneur-chef',
    player_count: 22,
    staff_members: [
      { id: 'staff-1', first_name: 'Marie', last_name: 'Kaboré', role: 'Préparatrice physique' },
      { id: 'staff-2', first_name: 'Luc', last_name: 'Traoré', role: 'Physiothérapeute' },
    ],
    kits: [
      { id: 'kit-1', name: 'Maillot Domicile', type: 'home',
        /* shirt_color_1: '#3B82F6', shirt_color_2: '',
        shorts_color_1: '#3B82F6', shorts_color_2: '',
        socks_color: '#3B82F6'  */
        primary_color: '#3B82F6', secondary_color: '#db0505ff', tertiary_color: '#FFFF00'

    },
      { id: 'kit-2', name: 'Maillot Extérieur', type: 'away', shirt_color_1: '#FFFFFF', shirt_color_2: '#3B82F6', shorts_color_1: '#FFFFFF', shorts_color_2: '', socks_color: '#FFFFFF' }
    ],
    trophies: [
      { id: 'trophy-1', name: 'Championnat National', year: '2022', competition_name: 'Coupe du Football' },
      { id: 'trophy-2', name: 'Coupe de la Ligue', year: '2023', competition_name: 'Coupe du Football' },
    ],
  };

  private mockPlayers: Player[] = [
    {
      id: 'player-1',
      first_name: 'Alfred',
      last_name: 'Da',
      phone: '555-0101',
      contracts: [
        { id: 'c1', player_id: 'player-1', team: this.mockTeam, number: 10, position: 'Attaquant', type: 'Professionnel', start_date: '2020-01-01', end_date: '2022-12-31' },
        { id: 'c2', player_id: 'player-1', team: this.mockTeam, number: 10, position: 'Attaquant', type: 'Professionnel', start_date: '2023-01-01', end_date: '2025-12-31' },
      ]
    },
    {
      id: 'player-2',
      first_name: 'Tiiga',
      last_name: 'Ouédraogo',
      phone: '555-0102',
      contracts: [
        { id: 'c3', player_id: 'player-2', team: this.mockTeam, number: 7, position: 'Attaquant', type: 'Jeune', start_date: '2019-01-01', end_date: '2022-12-31' },
      ]
    },
    {
      id: 'player-3',
      first_name: 'Rasmané',
      last_name: 'Dipama',
      phone: '555-0103',
      contracts: [
        { id: 'c4', player_id: 'player-3', team: this.mockTeam, number: 9, position: 'Milieu', type: 'Professionnel', start_date: '2024-01-01', end_date: '2026-12-31' },
      ]
    }
  ];

    positionOptions = [
    { label: 'Gardien', value: 'GOALKEEPER' },
    { label: 'Défenseur', value: 'DEFENSE' },
    { label: 'Milieu', value: 'MIDFIELD' },
    { label: 'Attaquant', value: 'ATTACK' }
  ];
  footOptions = [ { label: 'Gauche', value: 'LEFT' }, { label: 'Droite', value: 'RIGHT' } ];
  statusOptions = [ { label: 'Actif', value: 'ACTIVE' }, { label: 'Inactif', value: 'INACTIVE' }, { label: 'Suspendu', value: 'SUSPENDED' } ];


  teams?: Team[] = [];
  selectedFile: File | null = null;
  currentPhoto: string | null = null;



  constructor(
    private fb: FormBuilder,
    private toast: MessageService,
    private confirm: ConfirmationService,
    private route: ActivatedRoute,
    private equipeService: EquipeService,
    private messageService: MessageService,
    private tkService: TeamKitService,
    private playerService : PlayerService
  ) {}

  ngOnInit(): void {

    let id=this.route.snapshot.params['id'];
    this.loadTeam(id);
    this.loadKits();
    this.loadPlayers();


    // init data
    /* this.team = structuredClone(this.mockTeam);
    this.players = structuredClone(this.mockPlayers); */



    // forms
    this.playerForm = this.fb.group({
      id: [''],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      date_of_birth: [null],
      birth_place: [''],
      nationality: [''],
      phone: [''],
      email: [''],
      photo_url: [''],
      license_number: [''],
      preferred_position: [''],
      height: [null],
      weight: [null],
      blood_type: [''],
      foot_preference: [''],
      status: ['ACTIVE'],
      career_start: [null],
      career_end: [null],
      secondary_positions: [[]],
      emergency_contact: this.fb.array([]),
      team_id: ['']
    });

    this.contractForm = this.fb.group({
    id: [null], // facultatif, utile en édition
    player_id: ['', Validators.required],
    club_id: ['', Validators.required],
    start_date: [null, Validators.required],
    end_date: [null, Validators.required],
    salary_amount: [null, Validators.required],
    status: ['ACTIVE', Validators.required], // valeur par défaut
    clauses: this.fb.array([]) // gestion dynamique des clauses
    });


    this.staffForm = this.fb.group({
      id: [''],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      role: ['', Validators.required],
    });

    this.kitForm = this.fb.group({
      id: [''],
      /* name: ['', Validators.required], */
      type: ['', Validators.required],
      shirt_color_1: [null],
      shirt_color_2: [null],
      shorts_color_1: [null],
      shorts_color_2: [null],
      socks_color: [null],

      primary_color: [null],
      secondary_color: [null],
      tertiary_color: [null],
    });

    this.trophyForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      competition_name: ['', Validators.required],
      year: [new Date().getFullYear(), Validators.required],
    });
  }

  loadTeam(id: string) {
    this.loading = true;
    this.equipeService.getById(id).subscribe({
      next: (res: any) => {
        this.team = res?.data.team;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement de l\'equipe',
        });
      }
    });
  }

  loadKits() {
    this.loadingKits = true;
    this.tkService.getAll().subscribe({
      next: (res: any) => {
        this.team.kits = res?.data.jerseys || [];
        this.loadingKits = false;
      },
      error: () => {
        this.loadingKits = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des maillots',
        });
      }
    });
  }

  loadPlayers() {
    this.loadingPlayers = true;
    this.playerService.getAll().subscribe({
      next: (res: any) => {
        this.players = res?.data?.players || [];
        this.loadingPlayers = false;

      },
      error: () => {
        this.loadingPlayers = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des joueurs',
        });
      }
    });
  }

  // ---------- GETTERS ----------
  get f() { return this.playerForm.controls as {
    [key in keyof any]: FormControl;
  }; }
  get cf() { return this.contractForm.controls as {
    [key in keyof any]: FormControl;
  }; }
  get sf() { return this.staffForm.controls as {
    [key in keyof any]: FormControl;
  }; }
  get kf() { return this.kitForm.controls as {
    [key in keyof any]: FormControl;
  }; }
  get tf() { return this.trophyForm.controls as {
    [key in keyof any]: FormControl;
  }; }

  // ---------- UTILS ----------
  getActiveContract(player: Player | null | undefined): Contract | undefined {
    if (!player?.contracts?.length) return undefined;
    const sorted = [...player.contracts].sort((a, b) =>
      new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime()
    );
    return sorted[0];
  }

  // ---------- PLAYERS ----------
    showPlayerDialog(p?: Player) {
      this.isEditingPlayer = !!p?.id;
      this.showPlayerForm = true;
      this.currentPhoto = p?.photo_url ?? null;
      if (p) {
        // patch values
        this.playerForm.patchValue({
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          date_of_birth: p.date_of_birth ? new Date(p.date_of_birth) : null,
          birth_place: p.birth_place,
          nationality: p.nationality,
          phone: p.phone,
          email: p.email,
          photo: p.photo_url,
          license_number: p.license_number,
          preferred_position: p.preferred_position,
          height: p.height,
          weight: p.weight,
          blood_type: p.blood_type,
          foot_preference: p.foot_preference,
          status: p.status,
          career_start: p.career_start ? new Date(p.career_start) : null,
          career_end: p.career_end ? new Date(p.career_end) : null,
          secondary_positions: p.secondary_positions || [],
          team_id: p.team_id || ''
        });

        // rebuild emergency contacts
        const fa = this.playerForm.get('emergency_contact') as FormArray;
        fa.clear();
        (p.emergency_contact || []).forEach(ec => fa.push(this.fb.group({ name: [ec.name], phone: [ec.phone], email: [ec.email], relationship: [ec.relationship] })));

        this.currentPlayer = p;
      } else {
        this.playerForm.reset({ status: 'ACTIVE', secondary_positions: [], emergency_contact: [] });
        this.currentPhoto = null;
        this.selectedFile = null;
        const fa = this.playerForm.get('emergency_contact') as FormArray;
        fa.clear();
        this.currentPlayer = null;
        this.currentPhoto = null;
      }
    }

    closePlayerForm() { this.showPlayerForm = false;
      this.playerForm.reset({ status: 'ACTIVE', secondary_positions: [], emergency_contact: [] });
      this.selectedFile = null;
      this.currentPhoto = null;
    }

     savePlayer(): void {
  if (this.playerForm.invalid) {
    this.playerForm.markAllAsTouched();
    return;
  }

  this.loadingForm = true;
  const v = this.playerForm.value;
  const formData = new FormData();

  // Champs simples
  if (v.first_name) formData.append('first_name', v.first_name);
  if (v.last_name) formData.append('last_name', v.last_name);
  if (v.date_of_birth) formData.append('date_of_birth', this.toISO(v.date_of_birth)!);
  if (v.birth_place) formData.append('birth_place', v.birth_place);
  if (v.nationality) formData.append('nationality', v.nationality);
  if (v.phone) formData.append('phone', v.phone);
  if (v.email) formData.append('email', v.email);
  if (v.license_number) formData.append('license_number', v.license_number);
  if (v.preferred_position) formData.append('preferred_position', v.preferred_position);
 if (v.secondary_positions?.length) {
  v.secondary_positions.forEach((pos: string, index: number) => {
    formData.append(`secondary_positions[${index}]`, pos);
  });
}

  if (v.height) formData.append('height', v.height);
  if (v.weight) formData.append('weight', v.weight);
  if (v.blood_type) formData.append('blood_type', v.blood_type);
  if (v.foot_preference) formData.append('foot_preference', v.foot_preference);
  if (v.status) formData.append('status', v.status);
  if (v.career_start) formData.append('career_start', this.toISO(v.career_start)!);
  if (v.career_end) formData.append('career_end', this.toISO(v.career_end)!);
  if (v.team_id) formData.append('team_id', v.team_id);

  // Champs complexes → stringify
  if (v.emergency_contact?.length) {
  v.emergency_contact.forEach((ec: any, index: number) => {
    if (ec.name) formData.append(`emergency_contact[${index}][name]`, ec.name);
    if (ec.phone) formData.append(`emergency_contact[${index}][phone]`, ec.phone);
    if (ec.email) formData.append(`emergency_contact[${index}][email]`, ec.email);
    if (ec.relationship) formData.append(`emergency_contact[${index}][relationship]`, ec.relationship);
  });
}


  if (this.currentPlayer?.contracts?.length) {
    formData.append('contracts', JSON.stringify(this.currentPlayer.contracts));
  }

  // Upload photo si nouvelle sélection
  if (this.selectedFile) {
    formData.append('photo_url', this.selectedFile);
  }

  // Edition → PUT
  if (this.isEditingPlayer && v.id) {
    formData.append('_method', 'PUT');
  }

  const request$ = this.isEditingPlayer && v.id
    ? this.playerService.update(v.id, formData)
    : this.playerService.create(formData);

  request$.subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: this.isEditingPlayer ? 'Joueur modifié' : 'Joueur ajouté',
        detail: `${v.first_name} ${v.last_name}`,
        life: 2500
      });
      this.loadPlayers();
      this.showPlayerForm = false;
      this.loadingForm = false;
      this.selectedFile = null;
        this.playerForm.reset({ status: 'ACTIVE', secondary_positions: [], emergency_contact: [] });
        this.currentPhoto = null;
    },
    error: () => {
      this.loadingForm = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue',
        life: 2500
      });
    }
  });
}
  openPlayerDetails(p: Player) {
    this.currentPlayer = p;
    this.showPlayerDetails = true;
  }

   get ecControls() { return (this.playerForm.get('emergency_contact') as FormArray).controls as FormGroup[]; }
  addEmergencyContact() { (this.playerForm.get('emergency_contact') as FormArray).push(this.fb.group({ name: [''], phone: [''], email: [''], relationship: [''] })); }
  removeEmergencyContact(i: number) { (this.playerForm.get('emergency_contact') as FormArray).removeAt(i); }

  // photo handling
  onPhotoSelected(ev: any) {
    const file: File = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.playerForm.get('photo_url')?.setValue(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  deleteEntity(type: 'joueur'|'staff'|'maillot'|'trophy', id: string) {
    this.confirm.confirm({
      icon: 'pi pi-exclamation-triangle',
      message: 'Voulez-vous vraiment supprimer cet élément ?',
      accept: () => {
        switch (type) {
          case 'joueur': this.players = this.players.filter(p => p.id !== id); break;
          case 'staff': this.team.staff_members = this.team.staff_members?.filter(m => m.id !== id); break;
          case 'maillot': this.team.kits = this.team.kits?.filter(k => k.id !== id); break;
          case 'trophy': this.team.trophies = this.team.trophies?.filter(t => t.id !== id); break;
        }
        this.toast.add({ severity: 'success', summary: 'Suppression réussie', detail: 'Élément supprimé.' });
      }
    });
  }

  // ---------- CONTRACTS ----------
  openContractsModal(p: Player) {
    this.currentPlayer = {
      id: 'player-1',
      first_name: 'Alfred',
      last_name: 'Da',
      phone: '555-0101',
      contracts: [
        { id: 'c1', player_id: 'player-1', team: this.mockTeam, number: 10, position: 'Attaquant', type: 'Professionnel', start_date: '2020-01-01', end_date: '2022-12-31' },
        { id: 'c2', player_id: 'player-1', team: this.mockTeam, number: 10, position: 'Attaquant', type: 'Professionnel', start_date: '2023-01-01', end_date: '2025-12-31' },
      ]
    };
    this.showContracts = true;
    this.showContractForm = false;
    this.contractForm.reset();
    this.loadTeams();

  }

  newContract() {
    this.showContractForm = true;
    this.contractForm.reset({ id: '', type: '', position: '', number: null, start_date: null, end_date: null });
  }

  editContract(c: Contract) {
    this.isEditingContract=true
    this.showContractForm = true;
    this.contractForm.patchValue({
      id: c.id, type: c.type || '', position: c.position || '', number: c.number || null,
      start_date: c.start_date ? new Date(c.start_date) : null,
      end_date: c.end_date ? new Date(c.end_date) : null
    });
  }

  cancelContractForm() { this.showContractForm = false;
    this.isEditingContract=false
    this.contractForm.reset()
   }

   saveContract() {
  if (this.contractForm.invalid) {
    this.contractForm.markAllAsTouched();
    return;
  }

  const formValue = this.contractForm.value;

  const payload: any = {
    player_id: formValue.player_id,
    club_id: formValue.club_id,
    start_date: formValue.start_date ? new Date(formValue.start_date).toISOString() : null,
    end_date: formValue.end_date ? new Date(formValue.end_date).toISOString() : null,
    salary_amount: formValue.salary_amount,
    status: formValue.status,
    clauses: formValue.clauses?.map((c: any) => ({
      type: c.type,
      value: c.value
    }))
  };

  if (formValue.id) {
    payload['id'] = formValue.id; // si édition
  }

/*
    if (v.id) {
      this.currentPlayer.contracts = (this.currentPlayer.contracts || []).map(c => c.id === v.id ? payload : c);
      this.toast.add({ severity: 'success', summary: 'Contrat modifié', detail: `${payload.type}`, life: 2200 });
    } else {
      this.currentPlayer.contracts = [payload, ...(this.currentPlayer.contracts || [])];
      this.toast.add({ severity: 'success', summary: 'Contrat ajouté', detail: `${payload.type}`, life: 2200 });
    }
    this.showContractForm = false; */
}



  deleteContract(id: string) {
    if (!this.currentPlayer) return;
    this.confirm.confirm({
      icon: 'pi pi-exclamation-triangle',
      message: 'Supprimer ce contrat ?',
      accept: () => {
        this.currentPlayer!.contracts = (this.currentPlayer!.contracts || []).filter(c => c.id !== id);
        this.toast.add({ severity: 'success', summary: 'Suppression réussie', detail: 'Contrat supprimé.' });
      }
    });
  }

  // ---------- STAFF ----------
  showStaffDialog(member?: any) {
    this.isEditingStaff = !!member?.id;
    this.showStaffForm = true;
    this.staffForm.reset();
    if (member) this.staffForm.patchValue(member);
  }
  closeStaffForm() { this.showStaffForm = false; }

  saveStaff() {
    if (this.staffForm.invalid) { this.staffForm.markAllAsTouched(); return; }
    const val = this.staffForm.value;
    if (this.isEditingStaff && val.id) {
      this.team.staff_members = this.team.staff_members?.map(m => m.id === val.id ? val : m);
      this.toast.add({ severity: 'success', summary: 'Staff modifié', detail: `${val.first_name} ${val.last_name}` });
    } else {
      val.id = 'staff-' + ((this.team.staff_members?.length || 0) + 1);
      this.team.staff_members = [...(this.team.staff_members || []), val];
      this.toast.add({ severity: 'success', summary: 'Staff ajouté', detail: `${val.first_name} ${val.last_name}` });
    }
    this.showStaffForm = false;
  }

  // ---------- KITS ----------
  showKitDialog(kit?: TeamKit) {
    this.isEditingKit = !!kit?.id;
    this.showKitForm = true;
    this.kitForm.reset();
    if (kit) this.kitForm.patchValue(kit);
  }
  closeKitForm() { this.showKitForm = false; }

  saveKit() {
    if (this.kitForm.invalid) { this.kitForm.markAllAsTouched(); return; }
    this.loadingForm = true;
    const v = this.kitForm.value as TeamKit;
    v.team_id = this.team.id;
    v.club_id = this.team.club_id;
    const onSuccess = () => {
        this.toast.add({ severity: 'success', summary: this.isEditingKit ? 'Maillot modifié' : 'Maillot ajouté', detail: `${v.name}` });
        this.loadKits();
        this.loadingForm = false;
        this.showKitForm = false;
    }
    const onError = () => {this.toast.add({ severity: 'error', summary: 'Erreur', detail: 'Une erreur est survenue' });
        this.loadingForm = false;
    };
    if (this.isEditingKit && v.id) {
      this.tkService.update(v.id, v).subscribe({
        next: onSuccess,
        error: onError
      });

    } else {
        this.tkService.create(v).subscribe({
          next: onSuccess,
          error: onError
        });
    }
    this.showKitForm = false;
  }

  // ---------- TROPHIES ----------
  showTrophyDialog(trophy?: any) {
    this.isEditingTrophy = !!trophy?.id;
    this.showTrophyForm = true;
    this.trophyForm.reset({ year: new Date().getFullYear() });
    if (trophy) this.trophyForm.patchValue(trophy);
  }
  closeTrophyForm() { this.showTrophyForm = false; }

  saveTrophy() {
    if (this.trophyForm.invalid) { this.trophyForm.markAllAsTouched(); return; }
    const v = this.trophyForm.value;
    if (this.isEditingTrophy && v.id) {
      this.team.trophies = this.team.trophies?.map(t => t.id === v.id ? v : t);
      this.toast.add({ severity: 'success', summary: 'Trophée modifié', detail: `${v.name}` });
    } else {
      v.id = 'trophy-' + ((this.team.trophies?.length || 0) + 1);
      this.team.trophies = [...(this.team.trophies || []), v];
      this.toast.add({ severity: 'success', summary: 'Trophée ajouté', detail: `${v.name}` });
    }
    this.showTrophyForm = false;
  }

  // ---------- HELPERS ----------
  toISO(d: any): string | undefined {
    if (!d) return undefined;
    const date = (d instanceof Date) ? d : new Date(d);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0,10);
  }

  get filteredPlayers(): Player[] { return this.players.filter(p => !this.searchPlayer || p.first_name?.toLowerCase().includes(this.searchPlayer.toLowerCase()) || p.last_name?.toLowerCase().includes(this.searchPlayer.toLowerCase())); }

  getKitLabel(value:string){
    return this.kitTypes.find(k=>k.value===value)?.label
  }



get clauses(): FormArray {
  return this.contractForm.get('clauses') as FormArray;
}

addClause() {
  this.clauses.push(
    this.fb.group({
      type: ['', Validators.required],
      value: ['', Validators.required]
    })
  );
}

removeClause(index: number) {
  this.clauses.removeAt(index);
}

loadTeams() {
  this.equipeService.getAll().subscribe({
    next: (res: any) => {
      this.teams = res?.data?.teams || [];

    },
    error: (err) => {
      console.error('Erreur lors du chargement des équipes', err);
    }
  });}

    onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.playerForm.get('logo')?.setValue(file.name);
    }
  }

   getStatusLabel(status: string | undefined): string {
    if (!status) return '';
    const opt = this.statusOptions.find(o => o.value === status);
    return opt ? opt.label : status;
  }

    getFootLabel(foot: string | undefined): string {
    if (!foot) return '';
    const opt = this.footOptions.find(o => o.value === foot);
    return opt ? opt.label : foot;
  }


}


