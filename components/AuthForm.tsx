import React, { useState } from 'react';
import { Button } from './Button';
import { Shield, Key, Mail, User as UserIcon, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthForm: React.FC = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error de autenticación. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">

        {/* Header */}
        <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-b border-gray-700 text-center">
          <div className="w-16 h-16 bg-fab-red rounded-xl mx-auto flex items-center justify-center text-2xl font-serif text-white shadow-lg shadow-red-900/40 mb-4">
            FB
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">FaB LEAGUE</h2>
          <p className="text-gray-400 mt-2 text-sm">
            {isLogin ? 'Ingresa para gestionar la liga' : 'Crea tu perfil de jugador'}
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre de Jugador</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-fab-red focus:ring-1 focus:ring-fab-red outline-none transition-all"
                      placeholder="Ej. KatsuMain99"
                      required={!isLogin}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-fab-red focus:ring-1 focus:ring-fab-red outline-none transition-all"
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-fab-red focus:ring-1 focus:ring-fab-red outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" fullWidth disabled={loading} className="mt-6 py-3 text-lg font-bold flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  {isLogin ? <LogIn className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  {isLogin ? 'Ingresar' : 'Registrarse'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            </p>
            <button
              onClick={() => { setIsLogin(!isLogin); setEmail(''); setPassword(''); setName(''); setError(null); }}
              className="mt-2 text-fab-gold hover:text-yellow-300 font-bold text-sm transition-colors"
            >
              {isLogin ? "Crear perfil de Jugador" : "Volver al Login"}
            </button>
          </div>
        </div>

        {isLogin && (
          <div className="bg-gray-900/50 p-4 text-center text-xs text-gray-500 border-t border-gray-800">
            <p>Admin Demo: <span className="text-gray-300">santiagokita@gmail.com</span> / <span className="text-gray-300">admin123</span></p>
          </div>
        )}
      </div>
    </div>
  );
};