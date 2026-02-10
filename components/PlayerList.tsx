import React, { useState } from 'react';
import { Player, User } from '../types';
import { Shield, Users, Plus, X, Save, Trash2, AlertTriangle, Trophy } from 'lucide-react';
import { Button } from './Button';

interface PlayerListProps {
  players: Player[];
  users: User[];
  onPlayerSelect: (player: Player) => void;
  onAddPlayer: (data: { name: string }) => void;
  onDeletePlayer?: (playerId: string) => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, users, onPlayerSelect, onAddPlayer, onDeletePlayer }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{id: string, name: string} | null>(null);
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddPlayer({ name: newName });
      setNewName('');
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, playerId: string, playerName: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (onDeletePlayer) {
      setPlayerToDelete({ id: playerId, name: playerName });
    }
  };

  const confirmDelete = () => {
    if (playerToDelete && onDeletePlayer) {
      onDeletePlayer(playerToDelete.id);
      setPlayerToDelete(null);
    }
  };

  const isPlayerAdmin = (playerId: string) => {
    return users.some(u => u.playerId === playerId && u.role === 'ADMIN');
  };

  // Helper to find most played hero
  const getTopHero = (stats: Record<string, number>) => {
    const entries = Object.entries(stats);
    if (entries.length === 0) return 'Sin jugar';
    return entries.sort((a,b) => b[1] - a[1])[0][0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="text-fab-red" />
          Gestión de Jugadores
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400 hidden sm:block">
            Total: {players.length}
          </div>
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nuevo Jugador
          </Button>
        </div>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-xl border border-gray-700">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay jugadores registrados.</p>
          <Button onClick={() => setIsAdding(true)} variant="secondary" className="mt-4">
            Agregar el primero
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {players.map(player => (
            <div 
              key={player.id}
              onClick={() => onPlayerSelect(player)}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-fab-red hover:shadow-lg hover:shadow-red-900/10 transition-all cursor-pointer group relative overflow-hidden isolate"
            >
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity z-0 pointer-events-none">
                <Shield className="w-24 h-24 text-gray-400" />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-fab-gold transition-colors truncate max-w-[150px]">{player.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Shield className="w-4 h-4" />
                      {getTopHero(player.heroStats)}
                    </div>
                  </div>
                  {onDeletePlayer && !isPlayerAdmin(player.id) && (
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteClick(e, player.id, player.name)}
                      className="text-gray-500 hover:text-red-400 hover:bg-gray-700/50 p-2 rounded-lg transition-colors z-20 relative"
                      title="Eliminar jugador"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900/50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500 uppercase">Puntos</div>
                    <div className="text-lg font-bold text-fab-red">{player.totalPoints}</div>
                  </div>
                  <div className="bg-gray-900/50 p-2 rounded text-center">
                    <div className="text-xs text-gray-500 uppercase">Torneos</div>
                    <div className="text-lg font-bold text-gray-300">{player.tournamentsPlayed}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Player Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Nuevo Jugador</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:border-fab-red focus:ring-1 focus:ring-fab-red outline-none transition-all"
                  placeholder="Ej. KatsuMain99"
                  autoFocus
                  required
                />
              </div>
              
              <div className="bg-gray-900/50 p-3 rounded text-sm text-gray-400 border border-gray-700">
                <p>El héroe se asignará individualmente en cada torneo que juegue.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" fullWidth onClick={() => setIsAdding(false)}>
                  Cancelar
                </Button>
                <Button type="submit" fullWidth className="flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm border border-gray-700 p-6 text-center transform scale-100 transition-all">
                <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Jugador?</h3>
                <p className="text-gray-400 mb-6 text-sm">
                    ¿Estás seguro de que deseas eliminar a <span className="text-white font-bold">{playerToDelete.name}</span>? 
                    <br/>Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="secondary" onClick={() => setPlayerToDelete(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={confirmDelete}>Sí, Eliminar</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};