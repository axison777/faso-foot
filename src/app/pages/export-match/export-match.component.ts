import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


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



/* async   generatePDF() {
  const element = this.calendarRef.nativeElement;
 const canvas = await html2canvas(element, {
    scale: 2, // réduit la taille finale du PDF
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();

  const imgProps = pdf.getImageProperties(imgData);
  let  imgHeight = (imgProps.height * pageWidth) / imgProps.width;

  let position = 0;

  // ajout de la première page
  pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);

  // ajout des pages suivantes si nécessaire
  while (imgHeight > pageHeight) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    imgHeight -= pageHeight;
  }

  pdf.save('sa');
} */

}
