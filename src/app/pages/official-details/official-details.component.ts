import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OfficialService } from '../../service/official.service';
import { Official } from '../../models/official.model';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-official-details',
  templateUrl: './official-details.component.html',
  styleUrls: ['./official-details.component.scss'],
  standalone: true,
  imports: [CommonModule, ToastModule]
})
export class OfficialDetailsComponent implements OnInit {
  official: Official | null = null;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private officialService: OfficialService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOfficial(id);
    }
  }

  loadOfficial(id: string): void {
    this.loading = true;
    this.officialService.getById(id).subscribe({
      next: (res: any) => {
        const raw = res?.data?.official;
        if (raw) {
          this.official = this.mapOfficial(raw);
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de charger les détails de l'officiel"
        });
      }
    });
  }

  private mapOfficial(raw: any): Official {
    return {
      id: raw.id,
      first_name: raw.first_name,
      last_name: raw.last_name,
      date_of_birth: raw.date_of_birth ? new Date(raw.date_of_birth) : undefined,
      birth_place: raw.birth_place,
      nationality: raw.nationality,
      official_type: raw.official_type,
      license_number: raw.license_number,
      level: raw.level,
      status: raw.status,
      certification_date: raw.certification_date ? new Date(raw.certification_date) : undefined,
      certification_expiry: raw.certification_expiry ? new Date(raw.certification_expiry) : undefined,
      structure: raw.structure,
      experience: raw.experience ? Number(raw.experience) : undefined,
      specializations: raw.specializations?.map((s: any) => ({
        id: s.id,
        officialId: raw.id,
        type: s.type,
        certifiedAt: s.certified_at ? new Date(s.certified_at) : undefined,
        level: s.level
      })),
      assignments: raw.assignments?.map((a: any) => ({
        id: a.id,
        officialId: a.official_id,
        matchId: a.match_id,
        role: a.role,
        createdAt: a.assigned_at ? new Date(a.assigned_at) : undefined
      })),
      reports: raw.reports?.map((r: any) => ({
        id: r.id,
        officialId: raw.id,
        content: r.content,
        reportDate: r.submitted_at ? new Date(r.submitted_at) : undefined
      })),
      statistics: raw.statistics
        ? {
          id: raw.statistics.id,
          officialId: raw.id,
          matchesOfficiated: Number(raw.statistics.matches_officiated || 0),
          yellowCardsGiven: Number(raw.statistics.yellow_cards || 0),
          redCardsGiven: Number(raw.statistics.red_cards || 0),
          penaltiesAwarded: Number(raw.statistics.penalties_awarded || 0)
        }
        : undefined,
      createdAt: raw.created_at ? new Date(raw.created_at) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : undefined
    };
  }

  goBack(): void {
    this.router.navigate(['/officials']);
  }

  deleteOfficial(): void {
    if (!this.official?.id) return;
    this.officialService.delete(this.official.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Suppression réussie',
          detail: "L'officiel a été supprimé."
        });
        this.router.navigate(['/officials']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: "Impossible de supprimer l'officiel"
        });
      }
    });
  }
}
