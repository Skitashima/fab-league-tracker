import { Player, User } from '../types';

// The ID from the URL provided by the user
export const DEFAULT_SPREADSHEET_ID = '1PYYRHrIqjOhUHAOdY6ZtLkDAa5SOPNPomg9Sdwk8spg';

export const formatPlayersForSheet = (players: Player[]): any[][] => {
  // Headers
  const headers = ['id', 'name', 'heroStats', 'tournamentsPlayed', 'totalWins', 'totalPoints', 'recentPerformance'];
  const rows = players.map(p => [
    p.id,
    p.name,
    JSON.stringify(p.heroStats),
    p.tournamentsPlayed,
    p.totalWins,
    p.totalPoints,
    JSON.stringify(p.recentPerformance)
  ]);
  return [headers, ...rows];
};

export const formatUsersForSheet = (users: User[]): any[][] => {
  const headers = ['id', 'email', 'password', 'role', 'playerId'];
  const rows = users.map(u => [
    u.id,
    u.email,
    u.password, // Note: In a real app, passwords should definitely NOT be stored in plain text in a sheet
    u.role,
    u.playerId || ''
  ]);
  return [headers, ...rows];
};

export const parsePlayersFromSheet = (values: any[][]): Player[] => {
  if (!values || values.length < 2) return [];
  // Skip header row
  return values.slice(1).map(row => {
    let heroStats: Record<string, number> = {};
    try {
        if (row[2]) {
            heroStats = JSON.parse(row[2]);
        }
    } catch (e) {
        console.warn("Failed to parse heroStats from sheet", e);
    }

    return {
        id: row[0],
        name: row[1],
        heroStats: heroStats,
        tournamentsPlayed: Number(row[3]),
        totalWins: Number(row[4]),
        totalPoints: Number(row[5]),
        recentPerformance: JSON.parse(row[6] || '[]')
    };
  });
};

export const parseUsersFromSheet = (values: any[][]): User[] => {
  if (!values || values.length < 2) return [];
  return values.slice(1).map(row => ({
    id: row[0],
    email: row[1],
    password: row[2],
    role: row[3] as any,
    playerId: row[4] === '' ? undefined : row[4]
  }));
};

export const updateSheet = async (accessToken: string, spreadsheetId: string, range: string, values: any[][]) => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Error updating sheet');
  }
  return response.json();
};

export const fetchSheet = async (accessToken: string, spreadsheetId: string, range: string) => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Error fetching sheet');
  }
  return response.json();
};