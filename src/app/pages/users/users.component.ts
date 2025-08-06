import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../service/user.service';
import { Ville, VilleService } from '../../service/ville.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { User } from '../../models/user.model';
import { first } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  standalone: true,
  styleUrls: ['./users.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    SelectModule,
    ReactiveFormsModule
  ]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  villes: Ville[] = [];

  selectedUser!: User;
  searchTerm: string = '';
  loading: boolean = false;

  showForm: boolean = false;
  newUser: any = { name: '', city_id: null };
  isEditing: boolean = false;
  editingUserId?: string | null = null;
  userForm!: FormGroup;
  roles=[{ name: 'Admin', value: 'admin' }, { name: 'Manager', value: 'manager' }];

  constructor(
    private userService: UserService,
    private villeService: VilleService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb:FormBuilder
  ) {
     this.userForm = this.fb.group({
          name: ['', Validators.required],
          first_name: ['', Validators.required],
          last_name: ['', Validators.required],
          email: ['', [Validators.required, Validators.email]],
          password: ['',[ Validators.required, Validators.minLength(8)]],
          role: ['', Validators.required],
        });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadVilles();
  }

  loadUsers(): void {
    this.loading = true;
    /* this.userService.getAll().subscribe({
      next: (res: any) => {
        this.users = res?.data || [];
        this.loading = false;
      },
      error: () =>{
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des users',
        })
      }
    }); */
    this.users=[
        { id: '1', first_name: 'Ahmed', last_name: 'Koné', email: 'DxO7J@example.com', role: 'Admin' },
        { id: '1', first_name: 'Fatou', last_name: 'Diallo', email: 'Rg7JF@example.com', role: 'Manager' }

    ]
    this.loading = false;
  }

  loadVilles(): void {
    this.villeService.getAll().subscribe({
      next: (res: any) => {
        this.villes = res?.data.cities || [];
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.userForm.reset();
    this.isEditing = false;
    this.editingUserId = null;
  }

  saveUser(): void {
    if (this.newUser.name.trim() && this.newUser.city_id) {
      const userPayload = {
        name: this.newUser.name.trim(),
        first_name: this.userForm.get('first_name')?.value,
        last_name: this.userForm.get('last_name')?.value,
        email: this.userForm.get('email')?.value.trim(),
        password: this.userForm.get('password')?.value,
        role: this.userForm.get('role')?.value
      };

      const onSuccess = () => {
        this.loadUsers();
        this.toggleForm();
        this.messageService.add({
          severity: 'success',
          summary: this.isEditing ? 'Utilisateur modifié' : 'Utilisateur créé',
          detail: `${this.newUser.name}`,
          life: 3000
        });
      };

      const onError = () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} de l'utilisateur`,
        });
      };

      /* if (this.isEditing && this.editingUserId) {
        this.userService.update(this.editingUserId, {name: userPayload.name}).subscribe({ next: onSuccess, error: onError });
      }
       else */ {
        this.userService.create({first_name: userPayload.first_name, last_name: userPayload.last_name, email: userPayload.email, password: userPayload.password, role: userPayload.role}).subscribe({ next: onSuccess, error: onError });
      }
    }
  }

/*   editUser(user: User): void {
    this.userForm.get('name')?.setValue(user.name);
    this.userForm.get('city_id')?.patchValue(user.city_id);
    this.isEditing = true;
    this.editingUserId = user.id;
    this.showForm = true;
  } */

  deleteUser(id?: string): void {
    this.confirmationService.confirm({
        icon: 'pi pi-exclamation-triangle',
      message: 'Voulez-vous vraiment supprimer ce user ?',
      accept: () => {
        this.userService.delete(id).subscribe(() => {
          this.loadUsers();
          this.messageService.add({
            severity: 'success',
            summary: 'Suppression réussie',
            detail: 'Le user a été supprimé.'
          });
        });
      }
    });
  }

  get filteredUsers(): User[] {
    if (!this.searchTerm) return this.users;
    return this.users.filter(user =>
        // check in first_name last_name couple
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user?.email?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
