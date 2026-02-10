import React, { useState } from 'react';
import { Tournament } from '../types';
import { Calendar, Swords, Trophy, ChevronDown, ChevronUp, Users } from 'lucide-react';

interface TournamentHistoryProps {
  tournaments: Tournament[];
}

export const TournamentHistory: React.FC<TournamentHistoryProps> = ({ tournaments }) => {
  // Group tournaments by ID. Since we are storing them in a flat list, we can just map.
  // Sort by date descending
  const sortedTournaments = [...tournaments].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-fab-red" />
          Historial de Torneos
        </h2>
        <span className="text-sm text-gray-400">Total: {tournaments.length}</span>
      </div>

      {sortedTournaments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-xl border border-gray-700">
            <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aún no se han registrado torneos.</p>
        </div>
      ) : (
        <div className="space-y-4">
            {sortedTournaments.map(tournament => (
                <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
        </div>
      )}
    </div>
  );
};

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Find winner(s)
    const maxWins = Math.max(...tournament.results.map(r => r.wins));
    const winners = tournament.results.filter(r => r.wins === maxWins);

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
            <div 
                className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer bg-gray-800 hover:bg-gray-750 transition-colors gap-4"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <span className="bg-fab-red/20 text-fab-red text-xs font-bold px-2 py-1 rounded border border-fab-red/30">
                            {tournament.format}
                        </span>
                        <span className="text-white font-bold text-lg">
                            {new Date(tournament.date).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                        <Users className="w-4 h-4" /> {tournament.results.length} Jugadores
                    </div>
                </div>

                {/* Winner */}
                <div className="flex-1 md:text-right w-full md:w-auto">
                    <div className="text-xs text-fab-gold font-bold uppercase tracking-wider mb-1 flex items-center gap-1 md:justify-end">
                        <Trophy className="w-3 h-3" /> Ganador(es)
                    </div>
                    <div className="text-white font-medium">
                        {winners.map(w => w.playerName).join(', ')} 
                        <span className="text-gray-500 text-sm ml-1">({maxWins} Wins)</span>
                    </div>
                </div>

                {/* Toggle Icon */}
                <div className="text-gray-500">
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="bg-gray-900/50 p-4 border-t border-gray-700 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tournament.results.sort((a,b) => b.wins - a.wins).map((result) => (
                            <div key={result.playerId} className="flex justify-between items-center p-2 rounded bg-gray-800 border border-gray-700/50">
                                <div>
                                    <div className={`font-medium ${result.wins === maxWins ? 'text-fab-gold' : 'text-gray-300'}`}>
                                        {result.playerName}
                                    </div>
                                    <div className="text-xs text-gray-500">{result.heroPlayed}</div>
                                </div>
                                <div className="text-sm font-bold bg-gray-700 px-2 py-1 rounded text-white">
                                    {result.wins} W
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};