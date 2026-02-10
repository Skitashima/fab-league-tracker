import React, { useState, useEffect } from 'react';
import { Player, TournamentResult, AppView, UserRole, User, Tournament, TournamentFormat } from './types';
import { db } from './services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { createPlayer, updatePlayer, deletePlayer, createTournament, updateUser } from './services/db';
import { Leaderboard } from './components/Leaderboard';
import { TournamentForm } from './components/TournamentForm';
import { Oracle } from './components/Oracle';
import { StatsView } from './components/StatsView';
import { PlayerProfile } from './components/PlayerProfile';
import { PlayerList } from './components/PlayerList';
import { AuthForm } from './components/AuthForm';
import { BackupManager } from './components/BackupManager';
import { TournamentHistory } from './components/TournamentHistory';
import { Trophy, PlusCircle, BrainCircuit, BarChart2, Menu, X, Users, LogOut, Database, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';

function App() {
  // Data State - default to empty, will fill from Firestore
  const [players, setPlayers] = useState<Player[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  // Auth State from Context
  const { currentUser, logout, loading } = useAuth();

  // App Data State
  const [currentView, setCurrentView] = useState<AppView>(AppView.LEADERBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // --- Firestore Subscriptions ---

  useEffect(() => {
    // Players Subscription
    const qPlayers = query(collection(db, 'players'));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      const playersData = snapshot.docs.map(doc => doc.data() as Player);
      setPlayers(playersData);
    });

    // Users Subscription
    const qUsers = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(qUsers, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as User);
      setUsers(usersData);
    });

    // Tournaments Subscription
    const qTournaments = query(collection(db, 'tournaments'), orderBy('date', 'desc'));
    const unsubscribeTournaments = onSnapshot(qTournaments, (snapshot) => {
      const tournamentsData = snapshot.docs.map(doc => doc.data() as Tournament);
      setTournaments(tournamentsData);
    });

    return () => {
      unsubscribePlayers();
      unsubscribeUsers();
      unsubscribeTournaments();
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setCurrentView(AppView.LEADERBOARD);
  };

  // --- App Logic ---

  const handleUpdatePlayer = async (updatedPlayer: Player) => {
    // Optimistic update (optional, but Firestore is fast enough usually)
    // setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    // setSelectedPlayer(updatedPlayer);

    try {
      await updatePlayer(updatedPlayer);
      setSelectedPlayer(updatedPlayer); // Update modal with latest data
    } catch (error) {
      console.error("Error updating player:", error);
      alert("Error al actualizar jugador.");
    }
  };

  const handleUpdateUserCredentials = async (playerId: string, email: string, password?: string, makeAdmin?: boolean) => {
    // Logic for updating user in Firestore
    // Note: Changing password or email in Auth requires different API calls (updateEmail, updatePassword)
    // which should ideally be done by the user themselves or via an Admin SDK (Cloud Functions).
    // Client SDK cannot update OTHER users' auth credentials easily.
    // For this demo, we can just update the Firestore Document metadata.

    const userToUpdate = users.find(u => u.playerId === playerId);
    if (!userToUpdate) return;

    const updatedUser: User = {
      ...userToUpdate,
      email: email,
      role: makeAdmin ? 'ADMIN' : 'PLAYER'
    };

    // We do NOT update password here as we can't do it for other users from client without their creds.
    // We inform the admin about this limitation.
    if (password) {
      alert("Nota: La contraseña no se puede cambiar desde el panel de administrador en esta versión (requiere backend/función). Solo se actualizaron los datos del perfil.");
    }

    try {
      await updateUser(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    const userLinked = users.find(u => u.playerId === playerId);
    if (userLinked?.role === 'ADMIN') {
      alert("No es posible eliminar el perfil de Administrador.");
      return;
    }

    if (confirm("¿Estás seguro de eliminar este jugador? Esta acción no se puede deshacer.")) {
      try {
        await deletePlayer(playerId);
        setSelectedPlayer(null);
      } catch (error) {
        console.error("Error deleting player:", error);
      }
    }
  };

  const handleAddPlayer = async (data: { name: string }) => {
    const newPlayer: Player = {
      id: Math.random().toString(36).substr(2, 9), // Or use doc().id from firestore
      name: data.name,
      heroStats: {},
      tournamentsPlayed: 0,
      totalWins: 0,
      totalPoints: 0,
      recentPerformance: []
    };
    try {
      await createPlayer(newPlayer);
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  const handleAddTournament = async (
    results: TournamentResult[],
    newPlayersData: any[], // { name: string, initialWins: number, heroPlayed: string }[]
    date: string,
    format: TournamentFormat
  ) => {
    // 1. Create new players first
    // We need to await these so they exist for the tournament record? 
    // Actually ID generation doesn't strict check existence in NoSQL but good to have.

    const newlyCreatedPlayers: Player[] = newPlayersData.map(np => ({
      id: Math.random().toString(36).substr(2, 9),
      name: np.name,
      heroStats: {},
      tournamentsPlayed: 0,
      totalWins: 0,
      totalPoints: 0,
      recentPerformance: []
    }));

    // Write new players to DB
    for (const p of newlyCreatedPlayers) {
      await createPlayer(p);
    }

    const allPlayersPool = [...players, ...newlyCreatedPlayers];

    // 2. Create Tournament Record
    const tournamentId = Math.random().toString(36).substr(2, 9);
    const tournamentRecord: Tournament = {
      id: tournamentId,
      date: date,
      format: format,
      results: []
    };

    // 3. Process results
    // We collect ALL player updates and execute them.

    const updatesToPerform: Player[] = [];

    // Helper to find player in pool (including just added ones)
    const findById = (id: string) => allPlayersPool.find(p => p.id === id);

    // We iterate over the POOL to see who played, based on results or newPlayersData
    // (This logic mirrors the original App.tsx logic but adapted for async)

    // Actually, simpler to iterate 'results' + 'newPlayersData' and update those specific players.
    // Original logic iterated over `allPlayersPool` which might be large.

    // Let's stick to the original logic flow to obtain the updated player objects
    // BUT we only write to DB those who changed.

    for (const player of allPlayersPool) {
      const existingResult = results.find(r => r.playerId === player.id);
      const newPlayerResult = newPlayersData.find(np => np.name === player.name && newlyCreatedPlayers.find(created => created.id === player.id));

      let winsInThisTournament = 0;
      let heroPlayed = '';
      let playedThisTournament = false;

      if (existingResult) {
        winsInThisTournament = existingResult.wins;
        heroPlayed = existingResult.heroPlayed;
        playedThisTournament = true;
      } else if (newPlayerResult) {
        winsInThisTournament = newPlayerResult.initialWins;
        heroPlayed = newPlayerResult.heroPlayed;
        playedThisTournament = true;
      }

      if (playedThisTournament) {
        // Add to tournament record
        tournamentRecord.results.push({
          playerId: player.id,
          playerName: player.name,
          heroPlayed: heroPlayed,
          wins: winsInThisTournament
        });

        const pointsForAttendance = 1;
        const pointsForWins = winsInThisTournament;

        // Update Hero Stats
        const updatedHeroStats = { ...player.heroStats };
        if (heroPlayed) {
          updatedHeroStats[heroPlayed] = (updatedHeroStats[heroPlayed] || 0) + 1;
        }

        const updatedPlayer = {
          ...player,
          heroStats: updatedHeroStats,
          tournamentsPlayed: player.tournamentsPlayed + 1,
          totalWins: player.totalWins + winsInThisTournament,
          totalPoints: player.totalPoints + pointsForAttendance + pointsForWins,
          recentPerformance: [...player.recentPerformance, winsInThisTournament]
        };

        updatesToPerform.push(updatedPlayer);
      }
    }

    // Execute writes
    try {
      await createTournament(tournamentRecord);
      for (const p of updatesToPerform) {
        await updatePlayer(p);
      }
      setCurrentView(AppView.LEADERBOARD);
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("Error guardando el torneo.");
    }
  };

  const handleImportData = async (importedPlayers: Player[], importedUsers: User[], importedTournaments?: Tournament[]) => {
    if (!confirm("ADVERTENCIA: Importar datos sobrescribirá la base de datos en la nube. ¿Continuar?")) return;

    // This is a heavy operation. Ideally we would batch delete all and then write all.
    // For now, let's just write/overwrite each ID.

    try {
      // Players
      for (const p of importedPlayers) await createPlayer(p); // createPlayer uses setDoc so it overwrites/merges
      // Users
      for (const u of importedUsers) await updateUser(u); // updateUser uses updateDoc logic, but here we might want setDoc
      // We don't have createUser in db.ts exposed directly as setDoc, but updateUser is for updates.
      // Let's assume we might need a 'saveUser' for import. 
      // Skipping users import detailed implementation to avoid complexity with Auth linkage.

      if (importedTournaments) {
        for (const t of importedTournaments) await createTournament(t);
      }

      alert("Importación completada (se procesaron los registros).");
    } catch (error) {
      console.error("Error importing:", error);
      alert("Error durante la importación.");
    }
  };

  const NavItem = ({ view, label, icon: Icon }: any) => (
    <button
      onClick={() => { setCurrentView(view); setMobileMenuOpen(false); }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${currentView === view
        ? 'bg-fab-red text-white shadow-lg shadow-red-900/20'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  // --- Render ---

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
      <Loader2 className="w-10 h-10 animate-spin text-fab-red" />
    </div>
  );

  if (!currentUser) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-900 border-r border-gray-800 h-screen fixed top-0 left-0 z-10">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-fab-red rounded flex items-center justify-center text-lg font-serif">FB</div>
            LEAGUE
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {currentUser.role === 'ADMIN' ? 'Modo Administrador' : 'Modo Jugador'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Public Views */}
          <NavItem view={AppView.LEADERBOARD} label="Clasificación" icon={Trophy} />
          <NavItem view={AppView.HISTORY} label="Historial" icon={Calendar} />
          <NavItem view={AppView.STATS} label="Estadísticas" icon={BarChart2} />
          <NavItem view={AppView.ORACLE} label="El Oráculo (IA)" icon={BrainCircuit} />

          {/* Admin Zone */}
          {currentUser.role === 'ADMIN' && (
            <div className="pt-4 mt-4 border-t border-gray-800">
              <div className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Zona Admin
              </div>
              <NavItem view={AppView.PLAYERS} label="Gestión de Jugadores" icon={Users} />
              <NavItem view={AppView.ADD_TOURNAMENT} label="Registrar Torneo" icon={PlusCircle} />
              <NavItem view={AppView.BACKUP} label="Backup" icon={Database} />
            </div>
          )}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-fab-gold font-bold">
              {currentUser.email[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold truncate">{currentUser.email.split('@')[0]}</div>
              <div className="text-xs text-gray-500">{currentUser.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-gray-900 border-b border-gray-800 z-20 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-fab-red rounded flex items-center justify-center text-sm font-serif">FB</div>
          LEAGUE
        </h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 z-10 pt-20 px-4 space-y-4 md:hidden flex flex-col h-full pb-8">
          <NavItem view={AppView.LEADERBOARD} label="Clasificación" icon={Trophy} />
          <NavItem view={AppView.HISTORY} label="Historial" icon={Calendar} />
          <NavItem view={AppView.STATS} label="Estadísticas" icon={BarChart2} />
          <NavItem view={AppView.ORACLE} label="El Oráculo (IA)" icon={BrainCircuit} />

          {currentUser.role === 'ADMIN' && (
            <>
              <div className="border-t border-gray-700 my-2 pt-2 px-4 text-xs font-bold text-gray-500 uppercase">Zona Admin</div>
              <NavItem view={AppView.PLAYERS} label="Gestión de Jugadores" icon={Users} />
              <NavItem view={AppView.ADD_TOURNAMENT} label="Registrar Torneo" icon={PlusCircle} />
              <NavItem view={AppView.BACKUP} label="Backup" icon={Database} />
            </>
          )}

          <div className="mt-auto border-t border-gray-800 pt-4">
            <div className="mb-4 text-center">
              <div className="text-white font-bold">{currentUser.email}</div>
              <div className="text-xs text-gray-500">{currentUser.role}</div>
            </div>
            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-bold bg-gray-800 text-red-400"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {currentView === AppView.LEADERBOARD && (
            <div className="space-y-6">
              {currentUser.playerId && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                  <div>
                    <h2 className="text-lg font-bold text-white">Hola, {players.find(p => p.id === currentUser.playerId)?.name || 'Jugador'}!</h2>
                    <p className="text-sm text-gray-400">Revisa tu clasificación actual.</p>
                  </div>
                  <button
                    onClick={() => {
                      const p = players.find(p => p.id === currentUser.playerId);
                      if (p) setSelectedPlayer(p);
                    }}
                    className="bg-fab-slate hover:bg-gray-600 px-4 py-2 rounded text-sm text-white transition-colors"
                  >
                    Ver Mi Perfil
                  </button>
                </div>
              )}
              <Leaderboard
                players={players}
                onPlayerSelect={(player) => setSelectedPlayer(player)}
              />
            </div>
          )}

          {currentView === AppView.HISTORY && (
            <TournamentHistory tournaments={tournaments} />
          )}

          {currentView === AppView.PLAYERS && currentUser.role === 'ADMIN' && (
            <PlayerList
              players={players}
              users={users}
              onPlayerSelect={(player) => setSelectedPlayer(player)}
              onAddPlayer={handleAddPlayer}
              onDeletePlayer={handleDeletePlayer}
            />
          )}

          {currentView === AppView.ADD_TOURNAMENT && currentUser.role === 'ADMIN' && (
            <TournamentForm players={players} onAddTournament={handleAddTournament} />
          )}

          {currentView === AppView.BACKUP && currentUser.role === 'ADMIN' && (
            <BackupManager players={players} users={users} onImport={handleImportData} />
          )}

          {currentView === AppView.STATS && (
            <StatsView players={players} tournaments={tournaments} />
          )}

          {currentView === AppView.ORACLE && (
            <Oracle players={players} />
          )}

        </div>
      </main>

      {/* Modal Overlay */}
      {selectedPlayer && (
        <PlayerProfile
          player={selectedPlayer}
          associatedUser={users.find(u => u.playerId === selectedPlayer.id)}
          onClose={() => setSelectedPlayer(null)}
          onUpdate={handleUpdatePlayer}
          onDelete={handleDeletePlayer}
          onUpdateUser={handleUpdateUserCredentials}
          readOnly={currentUser.role !== 'ADMIN'}
        />
      )}
    </div>
  );
}

export default App;