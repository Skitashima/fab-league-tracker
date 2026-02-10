import React, { useState, useEffect } from 'react';
import { Player, HEROES, User } from '../types';
import { X, Trophy, Swords, Calendar, Edit2, Save, Activity, Trash2, Key, Mail, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PlayerProfileProps {
  player: Player;
  associatedUser?: User;
  onClose: () => void;
  onUpdate: (updatedPlayer: Player) => void;
  onDelete?: (playerId: string) => void;
  onUpdateUser?: (playerId: string, email: string, password?: string, isAdmin?: boolean) => void;
  readOnly?: boolean;
}

export const PlayerProfile: React.FC<PlayerProfileProps> = ({ 
  player, 
  associatedUser,
  onClose, 
  onUpdate, 
  onDelete, 
  onUpdateUser,
  readOnly = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: player.name
  });
  
  // User Credentials State
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isAdminRole, setIsAdminRole] = useState(false);

  useEffect(() => {
    if (associatedUser) {
        setUserEmail(associatedUser.email);
        setUserPassword(associatedUser.password || '');
        setIsAdminRole(associatedUser.role === 'ADMIN');
    } else {
        setUserEmail('');
        setUserPassword('');
        setIsAdminRole(false);
    }
  }, [associatedUser, isEditing]);

  const handleSave = () => {
    if (!associatedUser && !readOnly && userEmail.trim() && !userPassword.trim()) {
        alert("Para crear un nuevo usuario debes asignar una contraseña.");
        return;
    }

    onUpdate({
      ...player,
      name: formData.name
    });

    if (onUpdateUser && !readOnly) {
        if (userEmail.trim()) {
            onUpdateUser(player.id, userEmail, userPassword, isAdminRole);
        }
    }

    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onDelete) {
        setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
      if (onDelete) {
          onDelete(player.id);
          onClose();
      }
  };

  const isAdminProfile = associatedUser?.role === 'ADMIN';

  // Prepare chart data
  const chartData = player.recentPerformance.map((wins, index) => ({
    tournament: `T${index + 1}`,
    wins: wins,
    points: wins + 1 
  }));

  const avgWins = player.tournamentsPlayed > 0 
    ? (player.totalWins / player.tournamentsPlayed).toFixed(1) 
    : "0";

  // Calculate Hero Distribution for this player
  const heroData = Object.entries(player.heroStats).map(([name, value]) => ({ name, value }));
  const COLORS = ['#C23B22', '#D4AF37', '#2D3748', '#4A5568', '#718096'];

  const getTopHero = () => {
     if (heroData.length === 0) return 'N/A';
     return heroData.sort((a,b) => b.value - a.value)[0].name;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 flex flex-col relative overflow-hidden">
        
        {/* Delete Confirmation Overlay */}
        {showDeleteConfirm && (
            <div className="absolute inset-0 z-50 bg-gray-900/95 flex items-center justify-center p-6 animate-in fade-in duration-200">
                <div className="text-center space-y-4 max-w-sm">
                    <div className="w-16 h-16 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white">¿Eliminar este perfil?</h3>
                    <p className="text-gray-400 text-sm">
                        Se perderán todos los registros de puntos y torneos de <span className="font-bold text-white">{player.name}</span>.
                    </p>
                    <div className="flex gap-3 justify-center pt-2">
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
                        <Button variant="danger" onClick={confirmDelete}>Confirmar Eliminación</Button>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 flex justify-between items-start sticky top-0 z-10">
          <div className="flex-1">
            {isEditing ? (
              <div className="mr-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1 space-y-3">
                    <h4 className="text-xs font-bold text-fab-gold uppercase">Perfil de Juego</h4>
                    <div>
                    <label className="text-xs text-gray-500 uppercase">Nombre</label>
                    <input 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-fab-red outline-none"
                    />
                    </div>
                </div>

                {!readOnly && (
                    <div className="col-span-2 md:col-span-1 space-y-3 bg-gray-900/50 p-3 rounded border border-gray-700">
                        <h4 className="text-xs font-bold text-blue-400 uppercase">Cuenta de Usuario</h4>
                        <div>
                            <label className="text-xs text-gray-500 uppercase flex items-center gap-1"><Mail size={12}/> Email (Login)</label>
                            <input 
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                placeholder="Sin asignar"
                                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase flex items-center gap-1"><Key size={12}/> Contraseña</label>
                            <input 
                                value={userPassword}
                                onChange={(e) => setUserPassword(e.target.value)}
                                placeholder={associatedUser ? "********" : "Nueva contraseña (Requerido)"}
                                type="text"
                                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:border-blue-500 outline-none ${!associatedUser && userEmail && !userPassword ? 'border-red-500/50' : 'border-gray-600'}`}
                            />
                        </div>
                        
                        <div className="pt-2 border-t border-gray-700/50 flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="adminRole"
                                checked={isAdminRole}
                                onChange={(e) => setIsAdminRole(e.target.checked)}
                                disabled={associatedUser?.role === 'ADMIN'}
                                className="w-4 h-4 rounded border-gray-600 text-fab-red focus:ring-fab-red bg-gray-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <label htmlFor="adminRole" className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1 cursor-pointer select-none">
                                <ShieldAlert size={12} className={isAdminRole ? "text-fab-red" : "text-gray-500"} />
                                {associatedUser?.role === 'ADMIN' ? 'Es Administrador (Fijo)' : 'Conceder Admin'}
                            </label>
                        </div>
                    </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">{player.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-gray-400 font-medium text-sm">
                   <Swords className="w-4 h-4 text-fab-gold" />
                   Top Héroe: <span className="text-white">{getTopHero()}</span>
                </div>
                {associatedUser && !readOnly && (
                    <div className="mt-2 flex flex-col gap-1">
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {associatedUser.email}
                        </div>
                        {associatedUser.role === 'ADMIN' && (
                            <div className="text-xs text-fab-red flex items-center gap-1 font-bold">
                                <ShieldAlert className="w-3 h-3" /> ADMINISTRADOR
                            </div>
                        )}
                    </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!readOnly && (
              <>
                {isEditing ? (
                  <div className="flex gap-2">
                     <Button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4" /> Guardar
                     </Button>
                  </div>
                ) : (
                   <div className="flex gap-2">
                      {onDelete && !isAdminProfile && (
                        <Button onClick={handleDelete} variant="danger" className="p-2" title="Eliminar Jugador" type="button">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="secondary" onClick={() => setIsEditing(true)} className="p-2" title="Editar Jugador">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                  </div>
                )}
              </>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center">
              <Trophy className="text-fab-red mb-2 w-6 h-6" />
              <div className="text-2xl font-bold text-white">{player.totalPoints}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Puntos</div>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center">
              <Calendar className="text-blue-400 mb-2 w-6 h-6" />
              <div className="text-2xl font-bold text-white">{player.tournamentsPlayed}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Torneos</div>
            </div>
            <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center text-center">
              <Activity className="text-green-400 mb-2 w-6 h-6" />
              <div className="text-2xl font-bold text-white">{avgWins}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Avg. Wins</div>
            </div>
          </div>

           {/* Hero Distribution (New) */}
           {heroData.length > 0 && (
            <div className="bg-gray-700/20 p-4 rounded-xl border border-gray-700">
                <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Héroes Jugados</h3>
                <div className="flex flex-wrap gap-2">
                    {heroData.sort((a,b) => b.value - a.value).map((h, i) => (
                        <div key={h.name} className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
                            <span className="text-white font-medium">{h.name}</span>
                            <span className="bg-fab-gold text-gray-900 text-xs font-bold px-1.5 rounded">{h.value}</span>
                        </div>
                    ))}
                </div>
            </div>
           )}

          {/* Chart */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white border-l-4 border-fab-red pl-3">Rendimiento</h3>
            <div className="h-48 bg-gray-900/50 rounded-xl p-4 border border-gray-700">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="tournament" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="wins" name="Victorias" stroke="#C23B22" strokeWidth={3} dot={{ fill: '#C23B22' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 italic">
                  No hay datos.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};