// app/models/classement.model.ts

export interface CritereClassement {
  id?: string;
  nom: string;
  code: string; 
  priorite: number;
  ordre: 'asc' | 'desc'; 
  actif: boolean;
  description?: string;
}

export interface ConfigurationClassement {
  id?: string;
  nom: string;
  criteres: CritereClassement[];
  dateCreation: Date;
  dateModification: Date;
  parDefaut: boolean;
}

export const CRITERES_PREDEFINIS: Partial<CritereClassement>[] = [
  {
    nom: 'Nombre de points',
    code: 'POINTS',
    description: 'Total des points obtenus (victoire: 3pts, nul: 1pt, défaite: 0pt)',
    ordre: 'desc'
  },
  {
    nom: 'Différence de buts',
    code: 'DIFF_BUTS',
    description: 'Différence entre buts marqués et buts encaissés',
    ordre: 'desc'
  },
  {
    nom: 'Buts marqués',
    code: 'BUTS_MARQUES',
    description: "Total des buts marqués par l'équipe",
    ordre: 'desc'
  },
  {
    nom: 'Buts encaissés',
    code: 'BUTS_ENCAISSES',
    description: "Total des buts encaissés par l'équipe",
    ordre: 'asc'
  },
  {
    nom: 'Matchs gagnés',
    code: 'VICTOIRES',
    description: 'Nombre de victoires',
    ordre: 'desc'
  },
  {
    nom: 'Matchs nuls',
    code: 'NULS',
    description: 'Nombre de matchs nuls',
    ordre: 'desc'
  },
  {
    nom: 'Confrontations directes',
    code: 'CONFRONTATIONS',
    description: 'Résultats des confrontations directes entre équipes à égalité',
    ordre: 'desc'
  }
];

export enum TypeOrdre {
  ASC = 'asc',
  DESC = 'desc'
}

export interface StatistiquesEquipe {
  equipeId: string;
  points: number;
  victoires: number;
  nuls: number;
  defaites: number;
  butsMarques: number;
  butsEncaisses: number;
  differenceButs: number; 
  matchsJoues: number;
}


export interface Critere {
  id?: string;
  nom: string;
  code?: string;
  priorite?: number;
  ordre?: 'asc' | 'desc';
  actif?: boolean;
  description?: string;
}

export interface CriteresResponse {
  criteresDisponibles: Critere[];
  criteresActuels: string[]; // ids des critères sélectionnés
}
