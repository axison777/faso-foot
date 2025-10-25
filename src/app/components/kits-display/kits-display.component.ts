import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KitViewerComponent } from '../kit-viewer/kit-viewer.component';

@Component({
  selector: 'app-kits-display',
  standalone: true,
  imports: [CommonModule, KitViewerComponent],
  template: `
    <div class="kits-display">
      <h3 class="kits-title">
        <i class="pi pi-shield"></i>
        Maillots du club
      </h3>

      <div *ngIf="kits && kits.length > 0" class="kits-grid">
        <div *ngFor="let kit of kits" class="kit-item">
          <div class="kit-viewer">
            <app-kit-viewer
              [shirtColor]="kit.primary_color || kit.shirt_color_1"
              [shortColor]="kit.secondary_color || kit.shorts_color_1"
              [socksColor]="kit.tertiary_color || kit.socks_color"
              [width]="140"
              [height]="180"
              [autoRotate]="true"
            ></app-kit-viewer>
          </div>
          <div class="kit-info">
            <span class="kit-type">{{ getKitTypeName(kit.type) }}</span>
          </div>
        </div>
      </div>

      <div *ngIf="!kits || kits.length === 0" class="no-kits">
        <i class="pi pi-shield"></i>
        <p>Aucun maillot configuré</p>
      </div>
    </div>
  `,
  styles: [`
    .kits-display {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);

      .kits-title {
        margin: 0 0 1.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        i {
          color: #3b82f6;
        }
      }

      .kits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1.5rem;

        .kit-item {
          text-align: center;

          .kit-viewer {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            border: 2px solid #e2e8f0;
            transition: all 0.2s;

            &:hover {
              border-color: #3b82f6;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
          }

          .kit-info {
            .kit-type {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 0.5rem 1rem;
              border-radius: 20px;
              font-size: 0.875rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          }
        }
      }

      .no-kits {
        text-align: center;
        padding: 3rem 1rem;
        color: #94a3b8;

        i {
          font-size: 3rem;
          display: block;
          margin-bottom: 1rem;
          color: #cbd5e1;
        }

        p {
          margin: 0;
          font-size: 1rem;
        }
      }
    }
  `]
})
export class KitsDisplayComponent {
  @Input() kits: any[] = [];

  kitTypeOptions = [
    { label: 'Domicile', value: 'home' },
    { label: 'Extérieur', value: 'away' },
    { label: 'Neutre', value: 'third' }
  ];

  getKitTypeName(type: string): string {
    const found = this.kitTypeOptions.find(k => k.value === type);
    return found?.label || type;
  }
}
