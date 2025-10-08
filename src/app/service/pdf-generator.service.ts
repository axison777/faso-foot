import { Injectable } from '@angular/core';
import { PDFDocument, PDFImage, rgb, StandardFonts } from 'pdf-lib';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
   private apiUrl = environment.apiUrl;

  constructor() { }

  async generateCalendarPdf(phase: any, leagueName?: string, leagueLogo?: string, startDate?: string, endDate?: string, poolName?: string, filename: string = 'calendrier_ligue1.pdf'): Promise<void> {


    // Créer un nouveau document PDF
    const pdfDoc = await PDFDocument.create();

    // Charger les polices
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Couleurs
    const primaryColor = rgb(0.243, 0.706, 0.537); // #3EB489
    const darkColor = rgb(0, 0.275, 0.235); // #00463C
    const lightGray = rgb(0.9, 0.94, 0.933); // #e6f4ee

    let currentPage = pdfDoc.addPage([595, 842]); // A4
    let yPosition = 800;
    let leagueLogoImage: PDFImage | null = null;
    let teamsLogos: Map<string, PDFImage> = new Map();

    // Charger les logos
    if (leagueLogo) {
      leagueLogoImage = await this.embedImage(pdfDoc, leagueLogo);
    }

    //Pré-charger tous les logos des équipes
    const teamLogos: Map<string, PDFImage> = new Map();
    await this.preloadTeamLogos(pdfDoc, phase,  teamLogos);

    // En-tête sur la première page
    this.drawHeader(currentPage, font, fontBold, primaryColor, darkColor,
                   leagueName || 'Championnat', phase, poolName || '', yPosition, leagueLogoImage);
    yPosition -= 50;

    // Parcourir chaque journée
    for (const day of phase.matchdays) {
      // Vérifier si on a assez de place pour la journée
      const estimatedHeight = this.estimateMatchdayHeight(day);
      //si c'est la première page
      if (yPosition - estimatedHeight < 50) {
        currentPage = pdfDoc.addPage([595, 842]);
        yPosition = 800;
      }

      yPosition = this.drawMatchday(currentPage, font, fontBold, darkColor, lightGray,
                                  day, yPosition, teamLogos);
      yPosition -= 30; // Espacement entre les journées
    }

    // Sauvegarder le PDF
    const pdfBytes = await pdfDoc.save();
    this.downloadPdf(pdfBytes, filename);
  }

  private drawHeader(page: any, font: any, fontBold: any, primaryColor: any,
                    darkColor: any, leagueName: string, phase: any,
                    poolName: string, yPosition: number, leagueLogoImage: PDFImage | null) {

    // Fond coloré pour l'en-tête
    page.drawRectangle({
      x: 0,
      y: yPosition - 40,
      width: 595,
      height: 100,
      color: primaryColor,
    });

    // Logo de la ligue
    if (leagueLogoImage) {
      page.drawImage(leagueLogoImage, {
        x: 10,
        y: yPosition - 15,
        width: 50,
        height: 50,
      });
    }

    // Titre principal
    page.drawText(leagueName || 'Championnat', {
      x: 297.5,
      y: yPosition +1,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1),
      textAlign: 'center' as any
    });

    // Sous-titre
    page.drawText('Calendrier des matchs', {
      x: 297.5,
      y: yPosition - 20,
      size: 18,
      font: fontBold,
      color: darkColor,
      textAlign: 'center' as any
    });

    // Saison
    const seasonText = `Saison ${new Date(phase.start).getFullYear()} - ${new Date(phase.end).getFullYear()} (${phase?.name}) ${poolName ? `(${poolName})` : ''}`;
    page.drawText(seasonText, {
      x: 297.5,
      y: yPosition - 35,
      size: 12,
      font: font,
      color: rgb(0.82, 0.94, 0.9),
      textAlign: 'center' as any
    });
  }

  private drawMatchday(page: any, font: any, fontBold: any, darkColor: any,
                      lightGray: any, day: any, yPosition: number, teamLogos: Map<string, PDFImage>): number {

    let currentY = yPosition;

    // Titre de la journée
    page.drawRectangle({
      x: 40,
      y: currentY - 25,
      width: 515,
      height: 25,
      color: darkColor,
    });

    page.drawText(day.label, {
      x: 50,
      y: currentY - 18,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    currentY -= 35;

    // Parcourir les groupes de dates
    for (const group of day.groupedMatchesByDate) {
      // En-tête de date
      page.drawRectangle({
        x: 50,
        y: currentY - 20,
        width: 495,
        height: 20,
        color: lightGray,
      });

      const dateStr = new Date(group.date).toLocaleDateString('fr-FR');
      page.drawText(dateStr, {
        x: 60,
        y: currentY - 15,
        size: 12,
        font: fontBold,
        color: darkColor,
      });

      currentY -= 30;

      // Matches
      for (const match of group.matches) {
        currentY = this.drawMatch(page, font, fontBold, match, currentY, teamLogos);
      }
    }

    return currentY;
  }
  private drawMatch(page: any, font: any, fontBold: any, match: any, yPosition: number, teamLogos: Map<string, PDFImage>): number {
    const matchHeight = 70; // Augmenté pour accommoder les logos

    // Fond du match
    page.drawRectangle({
      x: 60,
      y: yPosition - matchHeight,
      width: 475,
      height: matchHeight,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.76, 0.88, 0.84),
      borderWidth: 1,
    });

    // Numéro du match
    page.drawText(`Match ${match.number || ''}`, {
      x: 75,
      y: yPosition - 20,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // === ÉQUIPE 1 (côté gauche) ===
    const team1Logo = teamLogos.get(match.team1_id);
    const team1StartX = 120;

    if (team1Logo) {
      // Logo équipe 1
      page.drawImage(team1Logo, {
        x: team1StartX,
        y: yPosition - 45,
        width: 25,
        height: 25,
      });

      // Nom équipe 1 (à droite du logo)
      page.drawText(match.team1, {
        x: team1StartX + 35,
        y: yPosition - 32,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
    } else {
      // Nom équipe 1 sans logo
      page.drawText(match.team1, {
        x: team1StartX,
        y: yPosition - 32,
        size: 11,
        font: font,
        color: rgb(0, 0, 0),
      });
    }

    // === "VS" au centre ===
    page.drawText('VS', {
      x: 297.5,
      y: yPosition - 32,
      size: 14,
      font: fontBold,
      color: rgb(0, 0.275, 0.235),
      textAlign: 'center' as any
    });

    // Cases pour les scores
    page.drawText('[___]', {
      x: 260,
      y: yPosition - 32,
      size: 12,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('[___]', {
      x: 320,
      y: yPosition - 32,
      size: 12,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // === ÉQUIPE 2 (côté droit) ===
    const team2Logo = teamLogos.get(match.team2_id);
    const team2StartX = 380;

    // Nom équipe 2
    page.drawText(match.team2, {
      x: team2StartX,
      y: yPosition - 32,
      size: 11,
      font: font,
      color: rgb(0, 0, 0),
    });

    if (team2Logo) {
      // Logo équipe 2 (à droite du nom)
      const textWidth = font.widthOfTextAtSize(match.team2, 11);
      page.drawImage(team2Logo, {
        x: team2StartX + textWidth + 10,
        y: yPosition - 45,
        width: 25,
        height: 25,
      });
    }

    // === INFORMATIONS DU MATCH ===
    // Stade
    const stadiumText = match.stadium;
    const textWidth = font.widthOfTextAtSize(stadiumText, 9);
    page.drawText(stadiumText, {
      x: 260 - (textWidth / 10),
      y: yPosition - 52,
      size: 9,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
      textAlign: 'left' as any
    });

    // Date et heure
    const matchDateTime = `${match.time}`;
    page.drawText(matchDateTime, {
      x: 290.5,
      y: yPosition - 65,
      size: 10,
      font: fontBold,
      color: rgb(0, 0, 0),
      textAlign: 'left' as any
    });

    // Indicateurs spéciaux
    let indicators: string[] = [];
    if (match.is_derby === 1) indicators.push('DERBY');
    //if (match.is_rescheduled === 1) indicators.push('REPORTÉ');

    if (indicators.length > 0) {
      page.drawText(`(${indicators.join(' - ')})`, {
        x: 480,
        y: yPosition - 20,
        size: 8,
        font: fontBold,
        color: rgb(0.8, 0.2, 0.2),
      });
    }

    return yPosition - matchHeight - 8;
  }

//   private drawMatch(page: any, font: any, fontBold: any, match: any, yPosition: number): number {
//     const matchHeight = 60;

//     // Fond du match
//     page.drawRectangle({
//       x: 60,
//       y: yPosition - matchHeight,
//       width: 475,
//       height: matchHeight,
//       color: rgb(1, 1, 1),
//       borderColor: rgb(0.76, 0.88, 0.84),
//       borderWidth: 1,
//     });

//     // Numéro du match
//     page.drawText(`${match.number}`, {
//       x: 75,
//       y: yPosition - 20,
//       size: 12,
//       font: fontBold,
//       color: rgb(0, 0, 0),
//     });

//     // Équipes
//     const team1Text = match.team1;
//     const team2Text = match.team2;

//     page.drawText(team1Text, {
//       x: 150,
//       y: yPosition - 20,
//       size: 11,
//       font: font,
//       color: rgb(0, 0, 0),
//     });

//     page.drawText('vs', {
//       x: 297.5,
//       y: yPosition - 20,
//       size: 12,
//       font: fontBold,
//       color: rgb(0, 0.275, 0.235),
//       textAlign: 'center' as any
//     });

//     page.drawText(team2Text, {
//       x: 350,
//       y: yPosition - 20,
//       size: 11,
//       font: font,
//       color: rgb(0, 0, 0),
//     });

//     // Stade
//     page.drawText(match.stadium, {
//       x: 297.5,
//       y: yPosition - 40,
//       size: 10,
//       font: font,
//       color: rgb(0.33, 0.33, 0.33),
//       textAlign: 'center' as any
//     });

//     // Heure
//     page.drawText(match.time, {
//       x: 297.5,
//       y: yPosition - 55,
//       size: 11,
//       font: fontBold,
//       color: rgb(0, 0, 0),
//       textAlign: 'center' as any
//     });

//     return yPosition - matchHeight - 5;
//   }

  private estimateMatchdayHeight(day: any): number {
    let height = 60; // Titre de la journée

    for (const group of day.groupedMatchesByDate) {
      height += 30; // En-tête de date
      height += group.matches.length * 65; // Chaque match
    }

    return height;
  }

  private downloadPdf(pdfBytes: Uint8Array, filename: string) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ============ MÉTHODES POUR GÉRER LES IMAGES ============
 /**
   * Pré-charge tous les logos des équipes depuis les données des matchs
   */
 private async preloadTeamLogos(pdfDoc: PDFDocument, phase: any, teamLogos: Map<string, PDFImage>): Promise<void> {
    const logoPromises: Promise<void>[] = [];
    const processedLogos = new Set<string>(); // Éviter les doublons

    console.log(phase);
    phase.matchdays.forEach((day: any) => {
      day.groupedMatchesByDate.forEach((group: any) => {
        group.matches.forEach((match: any) => {
          // Logo équipe 1
          if (match.team1_logo && match.team1_logo !== 'N/A' && !processedLogos.has(match.team1_id)) {
            processedLogos.add(match.team1_id);
            logoPromises.push(
              this.loadTeamLogo(pdfDoc, match.team1_id, match.team1_logo, teamLogos)
            );
          }

          // Logo équipe 2
          if (match.team2_logo && match.team2_logo !== 'N/A' && !processedLogos.has(match.team2_id)) {
            processedLogos.add(match.team2_id);
            logoPromises.push(
              this.loadTeamLogo(pdfDoc, match.team2_id, match.team2_logo, teamLogos)
            );
          }
        });
      });
    });

    // Attendre que tous les logos soient chargés
    await Promise.all(logoPromises);
    console.log(`${teamLogos.size} logos d'équipes chargés`);
  }

  /**
   * Charge un logo d'équipe spécifique
   */
  private async loadTeamLogo(pdfDoc: PDFDocument, teamId: string, logoPath: string, teamLogos: Map<string, PDFImage>): Promise<void> {
    try {
      const logoImage = await this.embedImage(pdfDoc, logoPath);
      if (logoImage) {
        teamLogos.set(teamId, logoImage);
      }
    } catch (error) {
      console.warn(`Impossible de charger le logo pour l'équipe ${teamId}:`, error);
    }
  }
  /**
   * Charge et intègre une image dans le document PDF
   */
  private async embedImage(pdfDoc: PDFDocument, imageUrl: string): Promise<PDFImage | null> {
    try {
      // Si c'est une URL, on la fetch

      if (imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
        console.log('Chargement de l\'image depuis une URL:', imageUrl);
        const relativePath =new URL(imageUrl).pathname.replace('/storage/','');

        // const apiUrl = `http://localhost:8000/image/${relativePath}`;
        const apiUrl = `${this.apiUrl}/image/${relativePath}`;


        const imageBytes = await fetch(apiUrl).then(response => response.arrayBuffer());
        const uint8Array = new Uint8Array(imageBytes);

        // Déterminer le type d'image
        if (this.isPng(uint8Array)) {
          return await pdfDoc.embedPng(uint8Array);
        } else if (this.isJpeg(uint8Array)) {
          return await pdfDoc.embedJpg(uint8Array);
        }
      }
      // Si c'est une image en base64
      else if (imageUrl.startsWith('data:image/')) {
        const base64Data = imageUrl.split(',')[1];
        const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        if (imageUrl.includes('png')) {
          return await pdfDoc.embedPng(imageBytes);
        } else {
          return await pdfDoc.embedJpg(imageBytes);
        }
      }

      return null;
    } catch (error) {
      console.warn(`Impossible de charger l'image: ${imageUrl}`, error);
      return null;
    }
  }

  /**
   * Extrait toutes les équipes uniques de la phase
   */
  private extractAllTeams(phase: any): string[] {
    const teams = new Set<string>();

    phase.matchdays.forEach((day: any) => {
      day.groupedMatchesByDate.forEach((group: any) => {
        group.matches.forEach((match: any) => {
          teams.add(match.team1);
          teams.add(match.team2);
        });
      });
    });

    return Array.from(teams);
  }

  /**
   * Récupère l'URL du logo d'une équipe
   * À adapter selon votre système de stockage des logos
   */
  private async getTeamLogoUrl(teamName: string): Promise<string | null> {
    // Exemple d'implémentation - à adapter selon vos besoins
    try {
      // Option 1: Logos stockés localement
      return `/assets/logos/teams/${this.sanitizeTeamName(teamName)}.png`;

      // Option 2: API pour récupérer les logos
      // const response = await fetch(`/api/teams/${teamName}/logo`);
      // return response.ok ? response.url : null;

      // Option 3: Mapping manuel
      // const logoMapping: { [key: string]: string } = {
      //   'PSG': '/assets/logos/psg.png',
      //   'Marseille': '/assets/logos/om.png',
      //   // ... autres équipes
      // };
      // return logoMapping[teamName] || null;

    } catch (error) {
      console.warn(`Logo non trouvé pour l'équipe: ${teamName}`);
      return null;
    }
  }

  /**
   * Nettoie le nom d'équipe pour l'utiliser comme nom de fichier
   */
  private sanitizeTeamName(teamName: string): string {
    return teamName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  /**
   * Vérifie si les bytes correspondent à un PNG
   */
  private isPng(bytes: Uint8Array): boolean {
    return bytes.length >= 4 &&
           bytes[0] === 0x89 &&
           bytes[1] === 0x50 &&
           bytes[2] === 0x4E &&
           bytes[3] === 0x47;
  }

  /**
   * Vérifie si les bytes correspondent à un JPEG
   */
  private isJpeg(bytes: Uint8Array): boolean {
    return bytes.length >= 2 &&
           bytes[0] === 0xFF &&
           bytes[1] === 0xD8;
  }
}
