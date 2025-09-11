import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PlayerService } from '../../service/player.service';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { Contract } from '../../models/contract.model';
import { EquipeService } from '../../service/equipe.service';
import { TextareaModule } from 'primeng/textarea';

// Modèles locaux (adaptés au nouveau schéma fourni)
export interface EmergencyContact {
  name?: string;
  phone?: string;
  email?: string;
  relationship?: string;
}



export interface Team {
  id?: string;
  name?: string;
  abbreviation?: string;
}

export interface Player {
  id?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string; // date-time string
  birth_place?: string;
  nationality?: string;
  phone?: string;
  email?: string;
  photo?: any;
  photo_url?: string; // base64 or url
  license_number?: string;
  preferred_position?: 'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK' | string;
  height?: number;
  weight?: number;
  blood_type?: string;
  foot_preference?: 'LEFT' | 'RIGHT' | string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;
  career_start?: string;
  career_end?: string;
  secondary_positions?: Array<'GOALKEEPER' | 'DEFENSE' | 'MIDFIELD' | 'ATTACK' | string>;
  emergency_contact?: EmergencyContact[];
  team_id?: string;
  team?: Team | null;
  contracts?: Contract[];

}


@Component({
  selector: 'app-players',
  standalone: true,
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],


  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    InputNumberModule,
    DatePickerModule,
    MultiSelectModule,
    DatePickerModule,
    SelectModule,FileUploadModule,
    TextareaModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class PlayersComponent implements OnInit {
@ViewChild('fileUploader') fileUploader!: FileUpload;

  players: Player[] = [];
  loading = false;
  searchPlayer = '';

  // dialogs & forms
  showPlayerForm = false;
  isEditingPlayer = false;
  playerForm!: FormGroup;

  showPlayerDetails = false;
  currentPlayer: Player | null = null;

  showContracts = false;
  showContractForm = false;
  contractForm!: FormGroup;

  loadingForm: boolean = false;

  // options
  positionOptions = [
    { label: 'Gardien', value: 'GOALKEEPER' },
    { label: 'Défenseur', value: 'DEFENSE' },
    { label: 'Milieu', value: 'MIDFIELD' },
    { label: 'Attaquant', value: 'ATTACK' }
  ];
  footOptions = [ { label: 'Gauche', value: 'LEFT' }, { label: 'Droite', value: 'RIGHT' } ];
  statusOptions = [ { label: 'Actif', value: 'ACTIVE' }, { label: 'Inactif', value: 'INACTIVE' }, { label: 'Suspendu', value: 'SUSPENDED' } ];
  contractTypes = [ { label: 'Professionnel', value: 'Professionnel' }, { label: 'Jeune', value: 'Jeune' }, { label: 'Prêt', value: 'Prêt' } ];

  // mock team for demo
  mockTeam: Team = { id: 'team-1', name: 'ASFA U20', abbreviation: 'ASFA' };
  selectedFile: File | null = null;
  currentPhoto: string | null = null;
  teams?: Team[] = [];
   isEditingContract = false;
  constructor(private fb: FormBuilder, private messageService: MessageService, private confirmationService: ConfirmationService,
    private playerService: PlayerService, private equipeService: EquipeService
  ) {}

  ngOnInit(): void {
    this.playerForm = this.fb.group({
      id: [''],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      date_of_birth: [null],
      birth_place: [''],
      nationality: [''],
      phone: [''],
      email: ['', Validators.email],
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

    this.loadPlayers();

  }

  // ---------- MOCK DATA ----------
  loadPlayers() {
    /* this.players = [
      {
        id: 'player-1',
        first_name: 'Alfred',
        last_name: 'Da',
        date_of_birth: '2001-05-01',
        nationality: 'Burkinabè',
        phone: '555-0101',
        photo_url: '',
        preferred_position: 'ATTACK',
        status: 'ACTIVE',
        emergency_contact: [ { name: 'Mariam', phone: '78000000', relationship: 'Mère' } ],
        contracts: [
          { id: 'c1', player_id: 'player-1', team: this.mockTeam, number: 10, position: 'Attaquant', type: 'Professionnel', start_date: '2020-01-01', end_date: '2022-12-31' },
          { id: 'c2', player_id: 'player-1', team: this.mockTeam, number: 10, position: 'Attaquant', type: 'Professionnel', start_date: '2023-01-01', end_date: '2025-12-31' },
        ]
      },
      {
        id: 'player-2',
        first_name: 'Tiiga',
        last_name: 'Ouédraogo',
        date_of_birth: '2003-08-09',
        phone: '555-0102',
        preferred_position: 'ATTACK',
        status: 'ACTIVE',
        emergency_contact: [],
        contracts: [ { id: 'c3', player_id: 'player-2', team: this.mockTeam, number: 7, position: 'Attaquant', type: 'Jeune', start_date: '2019-01-01', end_date: '2022-12-31' } ]
      },
      {
        id: 'player-3',
        first_name: 'Rasmané',
        last_name: 'Dipama',
        date_of_birth: '2000-03-14',
        phone: '555-0103',
        preferred_position: 'MIDFIELD',
        status: 'ACTIVE',
        contracts: [ { id: 'c4', player_id: 'player-3', team: this.mockTeam, number: 9, position: 'Milieu', type: 'Professionnel', start_date: '2024-01-01', end_date: '2026-12-31' } ]
      }
    ]; */
    this.loading = true;
    this.playerService.getAll().subscribe({
      next: (res: any) => {
        this.players = res?.data?.players || [];
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des joueurs', life: 2500 });
        this.loading = false;
      }
    });

}

  // ---------- HELPERS ----------
  get filteredPlayers(): Player[] {
    const q = this.searchPlayer?.toLowerCase().trim();
    if (!q) return this.players;
    return this.players.filter(p => (p.first_name || '').toLowerCase().includes(q) || (p.last_name || '').toLowerCase().includes(q));
  }

  getActiveContract(player: Player | null | undefined): Contract | undefined {
    if (!player?.contracts?.length) return undefined;
    const sorted = [...player.contracts].sort((a, b) => new Date(b.start_date || 0).getTime() - new Date(a.start_date || 0).getTime());
    return sorted[0];
  }

  toISO(d: any): string | undefined {
    if (!d) return undefined;
    const date = (d instanceof Date) ? d : new Date(d);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0,10);
  }

  // ---------- PLAYER FORM ----------
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


  // ----- emergency contacts helpers -----
  get ecControls() { return (this.playerForm.get('emergency_contact') as FormArray).controls as FormGroup[]; }
  addEmergencyContact() { (this.playerForm.get('emergency_contact') as FormArray).push(this.fb.group({ name: [''], phone: [''], email: [''], relationship: [''] })); }
  removeEmergencyContact(i: number) { (this.playerForm.get('emergency_contact') as FormArray).removeAt(i); }

  // photo handling
/*   onPhotoSelected(ev: any) {
    const file: File = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.playerForm.get('photo_url')?.setValue(reader.result as string);
    };
    reader.readAsDataURL(file);
  } */

      onFileSelect(event: any): void {
    const file = event.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.playerForm.get('logo')?.setValue(file.name);
    }
  }

  openContractsModal(p: Player) {
    this.currentPlayer = p;
    this.showContracts = true;
    this.showContractForm = false;
    this.contractForm.reset({ number: null });
    this.loadTeams();
  }

  newContract() {
    this.showContractForm = true;
    this.contractForm.reset({ id: '', type: '', position: '', number: null, start_date: null, end_date: null });
  }

  editContract(c: Contract) {
    this.isEditingContract=true
    this.showContractForm = true;
    this.contractForm.patchValue({ id: c.id, type: c.type || '', position: c.position || '', number: c.number || null, start_date: c.start_date ? new Date(c.start_date) : null, end_date: c.end_date ? new Date(c.end_date) : null });
  }

  cancelContractForm() {this.isEditingContract=false; this.showContractForm = false; }

  saveContract() {
    if (this.contractForm.invalid || !this.currentPlayer) { this.contractForm.markAllAsTouched(); return; }
    const v = this.contractForm.value;
    const payload: Contract = { id: v.id || ('c-' + Date.now()), player_id: this.currentPlayer.id, team: this.mockTeam, number: v.number, position: v.position, type: v.type, start_date: this.toISO(v.start_date), end_date: this.toISO(v.end_date) };

    if (v.id) {
      this.currentPlayer.contracts = (this.currentPlayer.contracts || []).map(c => c.id === v.id ? payload : c);
      this.messageService.add({ severity: 'success', summary: 'Contrat modifié', detail: `${payload.type}`, life: 2200 });
    } else {
      this.currentPlayer.contracts = [ payload, ...(this.currentPlayer.contracts || []) ];
      this.messageService.add({ severity: 'success', summary: 'Contrat ajouté', detail: `${payload.type}`, life: 2200 });
    }

    this.showContractForm = false;
  }

  deleteContractConfirm(id?: string) {
    if (!this.currentPlayer || !id) return;
    this.confirmationService.confirm({ icon: 'pi pi-exclamation-triangle', message: 'Supprimer ce contrat ?', accept: () => { this.currentPlayer!.contracts = (this.currentPlayer!.contracts || []).filter(c => c.id !== id); this.messageService.add({ severity: 'success', summary: 'Suppression', detail: 'Contrat supprimé.' }); } });
  }

  // ---------- DELETE PLAYER ----------
  confirmDeletePlayer(id: string) {
    this.confirmationService.confirm({ icon: 'pi pi-exclamation-triangle', message: 'Voulez-vous vraiment supprimer ce joueur ?', accept: () => { this.players = this.players.filter(p => p.id !== id); this.messageService.add({ severity: 'success', summary: 'Suppression', detail: 'Joueur supprimé.' }); } });
  }

  openPlayerDetails(p: Player) {
    this.currentPlayer = p;
    this.showPlayerDetails = true;
  }

  getPositionLabel(pos: string | undefined): string {
    if (!pos) return '';
    const opt = this.positionOptions.find(o => o.value === pos);
    return opt ? opt.label : pos;
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return '';
    const opt = this.statusOptions.find(o => o.value === status);
    return opt ? opt.label : status;
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
get cf() { return this.contractForm.controls as {
    [key in keyof any]: FormControl;
  }; }

  loadTeams() {
  this.equipeService.getAll().subscribe({
    next: (res: any) => {
      this.teams = res?.data?.teams || [];

    },
    error: (err) => {
      console.error('Erreur lors du chargement des équipes', err);
    }
  });}

    deleteContract(id: string) {
    if (!this.currentPlayer) return;
    this.confirmationService.confirm({
      icon: 'pi pi-exclamation-triangle',
      message: 'Supprimer ce contrat ?',
      accept: () => {
        this.currentPlayer!.contracts = (this.currentPlayer!.contracts || []).filter(c => c.id !== id);
        this.messageService.add({ severity: 'success', summary: 'Suppression réussie', detail: 'Contrat supprimé.' });
      }
    });
  }

  getFootLabel(foot: string | undefined): string {
    if (!foot) return '';
    const opt = this.footOptions.find(o => o.value === foot);
    return opt ? opt.label : foot;
  }
}
