import React, { useState } from 'react';
import { Player, TournamentResult, HEROES, TournamentFormat } from '../types';
import { Button } from './Button';
import { Plus, Trash2, UserPlus, Save, X, Calendar, Swords } from 'lucide-react';

interface TournamentFormProps {
  players: Player[];
  onAddTournament: (
    results: TournamentResult[], 
    newPlayers: { name: string, initialWins: number, heroPlayed: string }[],
    date: string,
    format: TournamentFormat
  ) => void;
}

export const TournamentForm: React.FC<TournamentFormProps> = ({ players, onAddTournament }) => {
  // Global Tournament Data
  const [tournamentDate, setTournamentDate] = useState(new Date().toISOString().split('T')[0]);
  const [tournamentFormat, setTournamentFormat] = useState<TournamentFormat>('CC');

  // Player Selection
  const [selectedExisting, setSelectedExisting] = useState<{ id: string; wins: number; hero: string }[]>([]);
  const [newPlayers, setNewPlayers] = useState<{ tempId: number; name: string; hero: string; wins: number }[]>([]);
  
  // Helpers
  const handleExistingChange = (id: string, field: 'wins' | 'hero', value: string | number) => {
    setSelectedExisting(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleExistingPlayer = (id: string) => {
    if (selectedExisting.find(p => p.id === id)) {
      setSelectedExisting(prev => prev.filter(p => p.id !== id));
    } else {
      // Try to find the most played hero for this player as default, or fallback to first hero
      const player = players.find(p => p.id === id);
      let defaultHero = HEROES[0];
      if (player && Object.keys(player.heroStats).length > 0) {
        // Sort heroes by usage and pick top
        defaultHero = Object.entries(player.heroStats).sort((a,b) => b[1] - a[1])[0][0];
      }

      setSelectedExisting(prev => [...prev, { id, wins: 0, hero: defaultHero }]);
    }
  };

  const removeExistingPlayer = (id: string) => {
     setSelectedExisting(prev => prev.filter(p => p.id !== id));
  };

  const addNewPlayerField = () => {
    setNewPlayers(prev => [...prev, { tempId: Date.now(), name: '', hero: HEROES[0], wins: 0 }]);
  };

  const removeNewPlayerField = (tempId: number) => {
    setNewPlayers(prev => prev.filter(p => p.tempId !== tempId));
  };

  const updateNewPlayer = (tempId: number, field: string, value: string | number) => {
    setNewPlayers(prev => prev.map(p => p.tempId === tempId ? { ...p, [field]: value } : p));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (selectedExisting.length === 0 && newPlayers.length === 0) {
      alert("Debes agregar al menos un jugador al torneo.");
      return;
    }
    
    const results: TournamentResult[] = selectedExisting.map(p => ({
      playerId: p.id,
      wins: p.wins,
      heroPlayed: p.hero
    }));
    
    // Map new players
    const playersToCreate = newPlayers.map(p => ({
      name: p.name,
      initialWins: p.wins,
      heroPlayed: p.hero
    }));

    // Pass data + metadata to parent
    onAddTournament(results, playersToCreate, tournamentDate, tournamentFormat);
    
    // Reset inputs, but keep date/format as they might input another one
    setSelectedExisting([]);
    setNewPlayers([]);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 max-w-4xl mx-auto animate-in fade-in">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Save className="text-fab-red" />
        Registrar Torneo
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Tournament Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div>
                <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Fecha del Torneo</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <input 
                        type="date"
                        value={tournamentDate}
                        onChange={(e) => setTournamentDate(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-9 text-white focus:border-fab-red outline-none"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Formato</label>
                <div className="relative">
                    <Swords className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                    <select
                        value={tournamentFormat}
                        onChange={(e) => setTournamentFormat(e.target.value as TournamentFormat)}
                        className="w-full bg-gray-700 border border-gray-600 rounded p-2 pl-9 text-white focus:border-fab-red outline-none"
                    >
                        <option value="CC">Classic Constructed (CC)</option>
                        <option value="Sage">Sage / Skirmish</option>
                        <option value="Limitado">Limitado (Sealed/Draft)</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Existing Players Section */}
        {players.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-fab-gold mb-3">1. Seleccionar Jugadores Registrados</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4 max-h-40 overflow-y-auto pr-2">
              {players.map(player => {
                const isSelected = !!selectedExisting.find(p => p.id === player.id);
                return (
                  <div 
                    key={player.id}
                    onClick={() => toggleExistingPlayer(player.id)}
                    className={`cursor-pointer p-2 rounded border text-sm transition-all select-none ${
                      isSelected 
                        ? 'bg-fab-red/20 border-fab-red text-white' 
                        : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium truncate">{player.name}</div>
                  </div>
                );
              })}
            </div>

            {/* Config for Selected */}
            {selectedExisting.length > 0 && (
              <div className="bg-gray-900/50 p-4 rounded-lg space-y-3 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Detalles de Jugadores ({selectedExisting.length})</span>
                  <span className="text-xs text-gray-500 normal-case">Asigna Héroe y Victorias</span>
                </h4>
                
                <div className="space-y-2">
                    {selectedExisting.map(p => {
                    const player = players.find(pl => pl.id === p.id);
                    if (!player) return null;
                    return (
                        <div key={p.id} className="flex flex-col md:flex-row items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700">
                        <div className="flex items-center gap-2 flex-1 w-full">
                            <button 
                                type="button" 
                                onClick={() => removeExistingPlayer(p.id)}
                                className="text-gray-500 hover:text-red-400"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="text-white font-medium truncate w-32 md:w-auto">{player.name}</span>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                            {/* Hero Selector */}
                            <select 
                                value={p.hero}
                                onChange={(e) => handleExistingChange(p.id, 'hero', e.target.value)}
                                className="flex-1 md:w-40 bg-gray-700 border border-gray-600 rounded p-1 text-sm text-white focus:border-fab-red outline-none"
                            >
                                {HEROES.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>

                            {/* Wins Input */}
                            <div className="flex items-center gap-1 bg-gray-700 rounded px-2 border border-gray-600">
                                <span className="text-xs text-gray-400">Wins</span>
                                <input
                                type="number"
                                min="0"
                                max="10"
                                value={p.wins}
                                onChange={(e) => handleExistingChange(p.id, 'wins', parseInt(e.target.value) || 0)}
                                className="w-10 bg-transparent text-center text-white outline-none font-bold"
                                />
                            </div>
                        </div>
                        </div>
                    );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Players Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-fab-gold">2. Nuevos Jugadores (No registrados)</h3>
            <Button type="button" variant="secondary" onClick={addNewPlayerField} className="text-sm py-1 px-3">
              <Plus className="w-4 h-4 mr-1 inline" /> Agregar
            </Button>
          </div>
          
          <div className="space-y-3">
            {newPlayers.map((np) => (
              <div key={np.tempId} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-gray-700/30 p-2 rounded border border-gray-600">
                <input 
                    placeholder="Nombre"
                    value={np.name}
                    onChange={(e) => updateNewPlayer(np.tempId, 'name', e.target.value)}
                    className="flex-1 w-full bg-gray-700 border border-gray-600 rounded p-2 text-white placeholder-gray-500 focus:border-fab-red outline-none text-sm"
                    required
                />
                
                <select 
                    value={np.hero}
                    onChange={(e) => updateNewPlayer(np.tempId, 'hero', e.target.value)}
                    className="w-full md:w-40 bg-gray-700 border border-gray-600 rounded p-2 text-white focus:border-fab-red outline-none text-sm"
                >
                    {HEROES.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                
                <div className="flex items-center gap-1 bg-gray-700 rounded px-2 border border-gray-600 w-full md:w-auto p-1">
                    <span className="text-xs text-gray-400">Wins</span>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        value={np.wins}
                        onChange={(e) => updateNewPlayer(np.tempId, 'wins', parseInt(e.target.value) || 0)}
                        className="w-full md:w-10 bg-transparent text-center text-white outline-none font-bold"
                    />
                </div>

                <button 
                  type="button" 
                  onClick={() => removeNewPlayerField(np.tempId)}
                  className="text-red-400 hover:text-red-300 p-2 self-end md:self-center"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            {newPlayers.length === 0 && (
              <p className="text-sm text-gray-500 italic">No hay jugadores nuevos en este torneo.</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <Button type="submit" fullWidth className="text-lg py-3">
            Confirmar Torneo ({tournamentFormat})
          </Button>
          <p className="text-center text-gray-500 text-xs mt-2">
            Fecha: {tournamentDate} • Regla: +1 Punto por Participación, +1 Punto por Victoria.
          </p>
        </div>
      </form>
    </div>
  );
};