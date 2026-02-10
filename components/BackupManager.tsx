import React, { useRef, useState } from 'react';
import { Player, User, Tournament } from '../types';
import { Button } from './Button';
import { Download, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';

interface BackupManagerProps {
  players: Player[];
  users: User[];
  onImport: (players: Player[], users: User[], tournaments?: Tournament[]) => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ players, users, onImport }) => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const tournaments = localStorage.getItem('fab_tournaments') ? JSON.parse(localStorage.getItem('fab_tournaments') || '[]') : [];

      const data = {
        timestamp: new Date().toISOString(),
        players,
        users,
        tournaments
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fab-league-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setStatus('success');
      setMessage('Archivo de respaldo descargado correctamente.');
    } catch (err) {
      setStatus('error');
      setMessage('Error al generar el archivo.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!json.players || !Array.isArray(json.players) || !json.users || !Array.isArray(json.users)) {
          throw new Error("Formato de archivo inválido. Faltan jugadores o usuarios.");
        }

        onImport(json.players, json.users, json.tournaments || []);
        setStatus('success');
        setMessage(`Datos restaurados exitosamente: ${json.players.length} jugadores, ${json.users.length} usuarios y ${(json.tournaments || []).length} torneos.`);
      } catch (err) {
        setStatus('error');
        setMessage('Error al leer el archivo. Asegúrate de que es un backup válido generado por esta app.');
      }
      // Reset input to allow selecting the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileJson className="text-fab-gold" />
          Copia de Seguridad (Archivos JSON)
        </h2>
      </div>

      <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg text-sm text-blue-200">
        <p>
          Para simplificar la configuración y evitar requerimientos de Google Cloud, el sistema de copias de seguridad ahora utiliza archivos locales. 
          Guarda el archivo generado en tu ordenador o nube preferida (Drive, Dropbox, etc.).
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export */}
        <div className="bg-gray-700/20 p-6 rounded-lg border border-gray-700 flex flex-col items-center text-center space-y-4 hover:border-fab-red transition-colors group">
          <div className="p-4 bg-gray-800 rounded-full group-hover:bg-fab-red/20 transition-colors">
             <Download className="w-10 h-10 text-fab-red" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Exportar Datos</h3>
            <p className="text-sm text-gray-400 mt-1">Descarga un archivo .json con todos los jugadores y resultados actuales.</p>
          </div>
          <Button onClick={handleExport} className="w-full flex justify-center gap-2">
            <Download className="w-4 h-4" /> Descargar Backup
          </Button>
        </div>

        {/* Import */}
        <div className="bg-gray-700/20 p-6 rounded-lg border border-gray-700 flex flex-col items-center text-center space-y-4 hover:border-green-500 transition-colors group">
          <div className="p-4 bg-gray-800 rounded-full group-hover:bg-green-500/20 transition-colors">
            <Upload className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Importar Datos</h3>
            <p className="text-sm text-gray-400 mt-1">Restaura la base de datos desde un archivo .json previamente descargado.</p>
          </div>
          <div className="w-full">
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />
            <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="secondary" 
                className="w-full flex justify-center gap-2"
            >
                <Upload className="w-4 h-4" /> Seleccionar Archivo
            </Button>
          </div>
        </div>
      </div>

      {/* Status */}
      {status !== 'idle' && (
        <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${
            status === 'error' ? 'bg-red-900/30 text-red-200 border border-red-800' :
            'bg-green-900/30 text-green-200 border border-green-800'
        }`}>
            {status === 'error' ? <AlertCircle className="w-5 h-5 flex-shrink-0" /> : 
             <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm font-medium">{message}</span>
        </div>
      )}
    </div>
  );
};