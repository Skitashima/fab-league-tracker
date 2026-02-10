export type UserRole = 'ADMIN' | 'PLAYER';

export interface User {
  id: string;
  email: string;
  password?: string; // In a real app, this would be hashed. For demo, plain text.
  role: UserRole;
  playerId?: string; // Link to the player profile
}

export interface Player {
  id: string;
  name: string;
  // mainHero removed, now calculated dynamically
  heroStats: Record<string, number>; // Map of HeroName -> TimesPlayed
  tournamentsPlayed: number;
  totalWins: number;
  totalPoints: number; // calculated as tournamentsPlayed + totalWins
  recentPerformance: number[]; // last 5 match win counts
}

export type TournamentFormat = 'CC' | 'Sage' | 'Limitado';

export interface TournamentResult {
  playerId: string;
  wins: number;
  heroPlayed: string;
}

// New Interface for History
export interface Tournament {
  id: string;
  date: string;
  format: TournamentFormat;
  results: {
    playerId: string;
    playerName: string;
    heroPlayed: string;
    wins: number;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppView {
  LEADERBOARD = 'LEADERBOARD',
  HISTORY = 'HISTORY', // New View
  PLAYERS = 'PLAYERS',
  ADD_TOURNAMENT = 'ADD_TOURNAMENT',
  ORACLE = 'ORACLE',
  STATS = 'STATS',
  BACKUP = 'BACKUP'
}

export const HEROES = [
  "Katsu", "Dorinthea", "Rhinar", "Bravo", "Kano", "Viserai", 
  "Dash", "Azalea", "Boltyn", "Levia", "Briar", "Oldhim", 
  "Lexi", "Iyslander", "Dromai", "Fai", "Uzuri", "Riptide", 
  "Teklovossen", "Maxx", "Kayo", "Betsy", "Olympia", "Victor", 
  "Zen", "Nuu", "Enigma", "Aurora", "Oscilio", "Florian", "Verdance"
];