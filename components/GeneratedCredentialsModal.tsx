import React, { useState } from 'react';

interface GeneratedCredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    credentials: { username: string; password: string } | null;
}

const GeneratedCredentialsModal: React.FC<GeneratedCredentialsModalProps> = ({ isOpen, onClose, credentials }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !credentials) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(credentials.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-blue-400 text-center mb-4">Zugangsdaten generiert</h2>
                    <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-sm rounded-md p-3 mb-4 text-center">
                        <strong>Achtung:</strong> Das Passwort wird nur einmal angezeigt. Speichern Sie es an einem sicheren Ort.
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-400">Benutzername</label>
                            <div className="mt-1 p-2 bg-slate-800 rounded-md font-mono text-gray-200 border border-slate-700">{credentials.username}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400">Passwort</label>
                             <div className="mt-1 flex items-center gap-2">
                                <div className="flex-1 p-2 bg-slate-800 rounded-md font-mono text-gray-200 border border-slate-700">{credentials.password}</div>
                                <button
                                    onClick={handleCopy}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}`}
                                >
                                    {copied ? 'Kopiert!' : 'Kopieren'}
                                </button>
                             </div>
                        </div>
                    </div>
                     <div className="mt-6 flex justify-center">
                        <button onClick={onClose} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition-colors">Schließen</button>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default GeneratedCredentialsModal;