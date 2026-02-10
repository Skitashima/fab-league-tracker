import React, { useState, useMemo } from 'react';
import { Player, Tournament, TournamentFormat } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PieChart, Pie } from 'recharts';
import { Filter, Users } from 'lucide-react';

interface StatsViewProps {
  players: Player[];
  tournaments: Tournament[];
}

export const StatsView: React.FC<StatsViewProps> = ({ players, tournaments }) => {
  const [selectedFormat, setSelectedFormat] = useState<TournamentFormat | 'ALL'>('ALL');

  // Filter tournaments based on selection
  const filteredTournaments = useMemo(() => {
    if (selectedFormat === 'ALL') return tournaments;
    return tournaments.filter(t => t.format === selectedFormat);
  }, [tournaments, selectedFormat]);

  // Recalculate stats based on filtered tournaments
  const statsData = useMemo(() => {
    const data: Record<string, { 
        name: string; 
        totalPoints: number; 
        tournamentsPlayed: number;
        heroStats: Record<string, number> 
    }> = {};

    // Initialize with all current players to ensure they appear even if they have 0 stats in this filter
    players.forEach(p => {
        data[p.id] = {
            name: p.name,
            totalPoints: 0,
            tournamentsPlayed: 0,
            heroStats: {}
        };
    });

    // Aggregate from filtered history
    filteredTournaments.forEach(t => {
        t.results.forEach(r => {
            if (!data[r.playerId]) {
                // If player was deleted but exists in history, optionally handle here. 
                // For now, we only show current players or re-add them if needed.
                // We'll skip deleted players to match the leaderboard.
                return; 
            }
            
            data[r.playerId].totalPoints += (r.wins + 1); // 1 pt participation + wins
            data[r.playerId].tournamentsPlayed += 1;
            
            const hero = r.heroPlayed;
            data[r.playerId].heroStats[hero] = (data[r.playerId].heroStats[hero] || 0) + 1;
        });
    });

    return Object.values(data);
  }, [filteredTournaments, players]);

  // Derived Data for Charts
  
  // 1. Meta Distribution (Heroes)
  const heroDistribution: Record<string, number> = {};
  statsData.forEach(p => {
    Object.entries(p.heroStats).forEach(([hero, count]) => {
        heroDistribution[hero] = (heroDistribution[hero] || 0) + count;
    });
  });
  const pieData = Object.entries(heroDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value);

  // 2. Points Ranking
  const pointsData = [...statsData]
    .sort((a,b) => b.totalPoints - a.totalPoints)
    .filter(p => p.totalPoints > 0)
    .slice(0, 5);

  // 3. Participation Ranking
  const participationData = [...statsData]
    .sort((a,b) => b.tournamentsPlayed - a.tournamentsPlayed)
    .filter(p => p.tournamentsPlayed > 0)
    .slice(0, 5);
  
  const COLORS = ['#C23B22', '#D4AF37', '#2D3748', '#4A5568', '#718096', '#E53E3E', '#DD6B20'];

  return (
    <div className="space-y-6">
        
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="flex items-center gap-2 text-white font-bold">
            <Filter className="text-fab-gold w-5 h-5" />
            Filtro de Formato:
        </div>
        <div className="flex bg-gray-900 rounded-lg p-1">
            {(['ALL', 'CC', 'Sage', 'Limitado'] as const).map((fmt) => (
                <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        selectedFormat === fmt 
                        ? 'bg-fab-red text-white shadow' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    {fmt === 'ALL' ? 'Todos' : fmt}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Players Points Chart */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Top Puntos ({selectedFormat === 'ALL' ? 'Total' : selectedFormat})</h3>
          <div className="h-80 w-full flex-1">
            {pointsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pointsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100} stroke="#E2E8F0" fontSize={12} />
                    <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F7FAFC' }}
                    cursor={{ fill: '#374151', opacity: 0.4 }}
                    />
                    <Bar dataKey="totalPoints" fill="#C23B22" radius={[0, 4, 4, 0]} barSize={20} name="Puntos">
                    {pointsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#D4AF37' : '#C23B22'} />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-500 italic">No hay datos para este formato.</div>
            )}
          </div>
        </div>

        {/* Participation Chart (New) */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Mayor Participación
          </h3>
          <div className="h-80 w-full flex-1">
             {participationData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                    <XAxis type="number" stroke="#9CA3AF" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100} stroke="#E2E8F0" fontSize={12} />
                    <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F7FAFC' }}
                    cursor={{ fill: '#374151', opacity: 0.4 }}
                    />
                    <Bar dataKey="tournamentsPlayed" fill="#4299E1" radius={[0, 4, 4, 0]} barSize={20} name="Torneos">
                    {participationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#63B3ED' : '#4299E1'} />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-500 italic">No hay datos de participación.</div>
             )}
          </div>
        </div>

        {/* Meta Distribution */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-6">Meta de Héroes ({selectedFormat === 'ALL' ? 'Global' : selectedFormat})</h3>
          <div className="h-80 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                </PieChart>
            </ResponsiveContainer>
            ) : (
                <p className="text-gray-500">No hay datos de héroes para este formato.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};