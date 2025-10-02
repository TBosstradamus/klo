import React, { useState, useEffect } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string, rememberMe: boolean) => Promise<boolean>;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberedUsername, setRememberedUsername] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open to avoid lingering values
      setError('');
      setIsLoading(false);
      
      const rememberedUserJSON = localStorage.getItem('rememberedUser');
      if (rememberedUserJSON) {
        const { username, password } = JSON.parse(rememberedUserJSON);
        setUsername(username);
        setPassword(password);
        setRememberMe(true);
        setRememberedUsername(username);
      } else {
        setUsername('');
        setPassword('');
        setRememberMe(false);
        setRememberedUsername(null);
      }
    }
  }, [isOpen]);

  const handleSwitchAccount = () => {
    setRememberedUsername(null);
    setUsername('');
    setPassword('');
    setRememberMe(false);
    localStorage.removeItem('rememberedUser');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(username, password, rememberMe);
    if (!success) {
      setError('Benutzername oder Passwort ist falsch.');
      setIsLoading(false);
    }
    // On success, the modal will be closed by the parent component, which also handles saving/removing 'rememberedUser'
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="w-full max-w-sm p-8 space-y-8 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800" onClick={e => e.stopPropagation()}>
        <div>
          <h2 className="text-center text-3xl font-bold text-slate-100">
            Mitarbeiter-Login
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            {rememberedUsername ? `Angemeldet bleiben als ${rememberedUsername}` : 'Bitte melden Sie sich an'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Benutzername</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-700 disabled:text-slate-400"
                placeholder="Benutzername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!!rememberedUsername}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={!!rememberedUsername}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                Angemeldet bleiben
              </label>
            </div>
            
            {rememberedUsername && (
                <div className="text-sm">
                    <button type="button" onClick={handleSwitchAccount} className="font-medium text-blue-500 hover:text-blue-400">
                        Anderer Account?
                    </button>
                </div>
            )}
          </div>


          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;