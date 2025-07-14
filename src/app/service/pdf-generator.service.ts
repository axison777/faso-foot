import { Injectable } from '@angular/core';
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {

  constructor() { }

  /**
   * Génère un PDF d'un calendrier de matchs à partir des données de phase.
   * @param phase L'objet de phase contenant les données du calendrier.
   * @param filename Le nom du fichier PDF à sauvegarder (par défaut 'calendrier_ligue1.pdf').
   */
  async generateCalendarPdf(phase: any, filename: string = 'calendrier_ligue1.pdf'): Promise<void> {
    if (!phase) {
      console.error('Les données de phase sont manquantes pour la génération du PDF.');
      return;
    }

    // 1. Créer un élément div temporaire en mémoire
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px'; // Le positionner hors de l'écran
    tempDiv.style.width = '800px'; // Largeur de rendu pour html2canvas (ajustez si besoin)
    tempDiv.style.background = '#fff'; // Assurer un fond blanc pour le PDF
    tempDiv.style.padding = '20px'; // Ajouter un padding pour la marge du contenu

    // 2. Injecter les styles CSS nécessaires
    // Il est crucial d'inclure les styles qui affectent le layout et l'apparence
    // pour que html2canvas capture le rendu voulu.
    // Dans styles :
const styles = `
  <style>
    .export-body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
    }

    .div1 {
      background-color: #3EB489;
      text-align: center;
      padding: 20px;
      color: white;
    }

    .div1_1 img {
      width: 50px;
      height: 50px;
      margin-bottom: 10px;
    }

    .div1_1 div {
      font-size: 22px;
      font-weight: bold;
    }

    .div1_2 {
      font-size: 18px;
      font-weight: bold;
      margin-top: 8px;
      color: #00463C;
    }

    .div1_3 {
      font-size: 14px;
      color: #d2f1e5;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 10px;
    }

    .card {
      border: 1px solid #d1e7dd;
      border-left: 5px solid #00463C;
      border-radius: 4px;
      background: #ffffff;
      padding: 10px;
      box-shadow: none;
    }

    .card_title {
      background-color: #00463C;
      color: white;
      padding: 8px;
      font-size: 16px;
      font-weight: bold;
    }

    .card_date_group {
      margin-top: 10px;
    }

    .card_infos_head {
      background-color: #e6f4ee;
      padding: 6px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }

    .card_infos_details {
      display: flex;
      justify-content: space-between;
      padding: 6px;
      font-size: 13px;
      border-bottom: 1px dashed #c3e0d7;
    }

    .card_infos_details:last-child {
      border-bottom: none;
    }

    .text-right {
      text-align: right;
    }

    @media print {
      .card {
        page-break-inside: avoid;
      }
    }

    .card,
.card_date_group,
.card_infos,
.card_infos_details {
  page-break-inside: avoid;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  -moz-column-break-inside: avoid;
}

.container {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Ajoute aussi ceci pour améliorer le rendu PDF */
@media print {
  .card,
  .card_date_group,
  .card_infos,
  .card_infos_details {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .container {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
.card,
.card_date_group,
.card_infos,
.card_infos_details {
  page-break-inside: avoid;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  -moz-column-break-inside: avoid;
}

.container {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Ajoute aussi ceci pour améliorer le rendu PDF */
@media print {
  .card,
  .card_date_group,
  .card_infos,
  .card_infos_details {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .container {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
.card,
.card_date_group,
.card_infos,
.card_infos_details {
  page-break-inside: avoid;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  -moz-column-break-inside: avoid;
}

.container {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Ajoute aussi ceci pour améliorer le rendu PDF */
@media print {
  .card,
  .card_date_group,
  .card_infos,
  .card_infos_details {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .container {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}

  </style>
`;


    // 3. Construire le contenu HTML dynamique en utilisant les données `phase`
    const htmlContent = `
  ${styles}
  <div class="export-body">
    <div class="div1">
      <div class="div1_1">
        <div style="height: 70px; padding-top: 28px">LIGUE 1</div>
      </div>
      <div class="div1_2">Calendrier des matchs</div>
      <div class="div1_3">
        Saison ${new Date(phase.start).getFullYear()} - ${new Date(phase.end).getFullYear()}
      </div>
    </div>

    <div class="container">
      ${phase.matchdays.map((day: any) => `
        <div class="card">
          <div class="card_title">${day.label}</div>

          ${day.groupedMatchesByDate.map((group: any) => `
            <div class="card_date_group">
              <div class="card_infos_head" style="margin-top: 1rem;">
                <p style="margin: 0">${new Date(group.date).toLocaleDateString('fr-FR')}</p>
                <span style="margin-left: auto">${group.matches[0]?.time || ''}</span>
              </div>

              ${group.matches.map((match: any) => `
                <div class="card_infos page-break-avoid">
                  <div class="card_infos_details">
                    <p>
                      ${match.team1}
                      <span style="font-size: 11px; color: green">VS</span>
                      ${match.team2}
                    </p>
                    <span class="text-right">${match.stadium}</span>
                  </div>
                  <div class="card_infos_separateur"></div>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  </div>
`;


    tempDiv.innerHTML = htmlContent;

    // 4. Ajouter temporairement la div au corps du document pour la capture
    document.body.appendChild(tempDiv);

    try {
      // 5. Utiliser html2canvas pour capturer le contenu de la div temporaire
      const canvas = await html2canvas(tempDiv, {
        ///scale: 2, // Augmente la résolution pour une meilleure qualité
        useCORS: true // Nécessaire si vous avez des images provenant d'une autre origine
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf('p', 'mm', 'a4');

      const imgWidth = 210; // Largeur A4 en mm
      const pageHeight = 297; // Hauteur A4 en mm

      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Ajouter la première page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Ajouter des pages supplémentaires si le contenu dépasse une page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      // 6. Sauvegarder le PDF
      pdf.save(filename);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      // Ici, vous pourriez déclencher une notification utilisateur
    } finally {
      // 7. Supprimer la div temporaire du DOM
      document.body.removeChild(tempDiv);
    }
  }
}
