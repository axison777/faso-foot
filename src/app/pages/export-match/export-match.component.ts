import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';



@Component({
  selector: 'app-export-match',
  imports: [CommonModule],
  templateUrl: './export-match.component.html',
  styleUrl: './export-match.component.scss'
})
export class ExportMatchComponent {
/*     phase=  {
    name: 'Phase Aller',
    start: '2025-08-12',
    end: '2025-10-15',
    matchdays: [
      {
        label: '1ère Journée',
        matches: [
          { team1: 'AS SONABEL', team2: 'SALITAS', stadium: 'Stade municipal Ouaga', date: '2025-08-12', time: '15:30' },
          { team1: 'RCK', team2: 'MAJESTIC', stadium: 'Stade du 4 août Ouaga', date: '2025-08-12', time: '18:00' },
          { team1: 'EFO', team2: 'USFA', stadium: 'Stade Wobi Bobo', date: '2025-08-13', time: '15:30' },
          { team1: 'KOZAF', team2: 'USO', stadium: 'Stade municipal Ouaga', date: '2025-08-13', time: '18:00' }
        ]
      },
      {
        label: '2e Journée',
        matches: [
          { team1: 'SALITAS', team2: 'RCK', stadium: 'Stade municipal Ouaga', date: '2025-08-19', time: '15:30' },
          { team1: 'AS SONABEL', team2: 'KOZAF', stadium: 'Stade du 4 août Ouaga', date: '2025-08-20', time: '16:00' },
          { team1: 'USO', team2: 'EFO', stadium: 'Stade Wobi Bobo', date: '2025-08-20', time: '18:30' },
          { team1: 'MAJESTIC', team2: 'USFA', stadium: 'Stade municipal Ouaga', date: '2025-08-21', time: '15:30' }
        ]
      },
      {
        label: '3e Journée',
        matches: [
          { team1: 'AS SONABEL', team2: 'EFO', stadium: 'Stade municipal Ouaga', date: '2025-08-26', time: '15:30' },
          { team1: 'RCK', team2: 'USO', stadium: 'Stade du 4 août Ouaga', date: '2025-08-27', time: '16:00' },
          { team1: 'USFA', team2: 'SALITAS', stadium: 'Stade Wobi Bobo', date: '2025-08-27', time: '18:00' },
          { team1: 'MAJESTIC', team2: 'KOZAF', stadium: 'Stade municipal Ouaga', date: '2025-08-28', time: '15:30' }
        ]
      },
      {
        label: '4e Journée',
        matches: [
          { team1: 'USFA', team2: 'AS SONABEL', stadium: 'Stade municipal Ouaga', date: '2025-09-01', time: '15:30' },
          { team1: 'SALITAS', team2: 'KOZAF', stadium: 'Stade Wobi Bobo', date: '2025-09-01', time: '17:30' },
          { team1: 'EFO', team2: 'MAJESTIC', stadium: 'Stade du 4 août Ouaga', date: '2025-09-02', time: '15:30' },
          { team1: 'USO', team2: 'RCK', stadium: 'Stade municipal Ouaga', date: '2025-09-03', time: '18:00' }
        ]
      },
      {
        label: '5e Journée',
        matches: [
          { team1: 'KOZAF', team2: 'AS SONABEL', stadium: 'Stade municipal Ouaga', date: '2025-09-08', time: '15:30' },
          { team1: 'USO', team2: 'SALITAS', stadium: 'Stade Wobi Bobo', date: '2025-09-08', time: '18:30' },
          { team1: 'EFO', team2: 'RCK', stadium: 'Stade du 4 août Ouaga', date: '2025-09-09', time: '15:30' },
          { team1: 'MAJESTIC', team2: 'USFA', stadium: 'Stade municipal Ouaga', date: '2025-09-10', time: '17:00' }
        ]
      }
    ]
  }
 */

  @ViewChild('calendarRef', { static: false }) calendarRef!: ElementRef;
  @Input() phase: any;
  constructor(private router: Router) {
  const nav = this.router.getCurrentNavigation();
  this.phase = nav?.extras?.state?.['phase'] ?? null;
}


  getDayName(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }



generatePDF() {
  const element = this.calendarRef.nativeElement;
  const opt = {
    margin: 0,
    filename: 'calendrier.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf()
    .set(opt)
    .from(element)
    .save()

}


}
