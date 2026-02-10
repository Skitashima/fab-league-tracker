import React from 'react';
import { Player } from '../types';
import { Trophy, Medal, Crown, Shield, ExternalLink } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  onPlayerSelect?: (player: Player) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ players, onPlayerSelect }) => {
  const sortedPlayers = [...players].sort((a, b) => b.totalPoints - a.totalPoints);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-fab-gold" />;
      case 1: return <Medal className="w-6 h-6 text-gray-300" />;
      case 2: return <Medal className="w-6 h-6 text-amber-700" />;
      default: return <span className="text-gray-500 font-bold">#{index + 1}</span>;
    }
  };

  const getTopHero = (stats: Record<string, number>) => {
     const entries = Object.entries(stats);
     if (entries.length === 0) return 'Sin jugar';
     return entries.sort((a,b) => b[1] - a[1])[0][0];
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
      <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="text-fab-red" />
          Tabla de Clasificación
        </h2>
        <div className="text-sm text-gray-400">
          Temp. 1 - Rathe
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-700/50 text-gray-300">
              <th className="p-4 font-semibold">Rango</th>
              <th className="p-4 font-semibold">Jugador / Héroe (Más usado)</th>
              <th className="p-4 font-semibold text-center hidden sm:table-cell">Torneos</th>
              <th className="p-4 font-semibold text-center hidden sm:table-cell">Victorias</th>
              <th className="p-4 font-semibold text-right text-fab-gold">Puntos Totales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedPlayers.map((player, index) => (
              <tr 
                key={player.id} 
                onClick={() => onPlayerSelect && onPlayerSelect(player)}
                className="hover:bg-gray-700/50 transition-colors cursor-pointer group"
                title="Ver perfil completo"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getRankIcon(index)}
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-bold text-white text-lg flex items-center gap-2">
                      {player.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity text-gray-400" />
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {getTopHero(player.heroStats)}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center hidden sm:table-cell text-gray-300">
                  {player.tournamentsPlayed} <span className="text-xs text-gray-500">(+1 pt/ea)</span>
                </td>
                <td className="p-4 text-center hidden sm:table-cell text-gray-300">
                  {player.totalWins} <span className="text-xs text-gray-500">(+1 pt/ea)</span>
                </td>
                <td className="p-4 text-right">
                  <span className="text-2xl font-black text-fab-gold">{player.totalPoints}</span>
                </td>
              </tr>
            ))}
            
            {sortedPlayers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                  No hay datos de jugadores aún. Registra un torneo para comenzar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};