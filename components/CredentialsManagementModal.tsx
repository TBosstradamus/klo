import React, { useState, useMemo, useEffect } from 'react';
import { Officer, AccessCredentials } from '../types';

interface CredentialsManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    officers: Officer[];
    credentials: AccessCredentials[];
    onCreate: (officer: Officer) => void;
    onRegenerate: (credential: AccessCredentials) => void;
    onDelete: (credential: AccessCredentials) => void;
}

const CredentialsManagementModal: React.FC<CredentialsManagementModalProps> = ({
    isOpen,
    onClose,
    officers,
    credentials,
    onCreate,
    onRegenerate,
    onDelete
}) => {
    const [mode, setMode] = useState<'list' | 'create'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [createSearchTerm, setCreateSearchTerm] = useState('');
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setMode('list');
            setSearchTerm('');
            setCreateSearchTerm('');
            setSelectedOfficer(null);
        }
    }, [isOpen]);

    const officersWithCredentials = useMemo(() => {
        return credentials.map(cred => {
            const officer = officers.find(o => o.id === cred.officerId);
            return { ...cred, officer };
        }).filter(item => item.officer);
    }, [credentials, officers]);
    
    const filteredCredentials = useMemo(() => {
        if (!searchTerm) return officersWithCredentials;
        const lowercasedTerm = searchTerm.toLowerCase();
        return officersWithCredentials.filter(({ officer, username }) => 
            officer && (`${officer.firstName} ${officer.lastName}`.toLowerCase().includes(lowercasedTerm) ||
            officer.badgeNumber.includes(searchTerm) ||
            username.toLowerCase().includes(lowercasedTerm))
        );
    }, [searchTerm, officersWithCredentials]);
    
    const officersWithoutCredentials = useMemo(() => {
        const credentialedIds = new Set(credentials.map(c => c.officerId));
        return officers.filter(o => !credentialedIds.has(o.id));
    }, [officers, credentials]);

    const filteredOfficersForCreation = useMemo(() => {
        if (!createSearchTerm) return [];
        const lowercasedTerm = createSearchTerm.toLowerCase();
        return officersWithoutCredentials.filter(o =>
            `${o.firstName} ${o.lastName}`.toLowerCase().includes(lowercasedTerm) ||
            o.badgeNumber.includes(createSearchTerm)
        ).slice(0, 5);
    }, [createSearchTerm, officersWithoutCredentials]);

    const handleCreate = () => {
        if (selectedOfficer) {
            onCreate(selectedOfficer);
            setSelectedOfficer(null);
            setCreateSearchTerm('');
            setMode('list');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-4xl h-5/6 rounded-xl shadow-2xl border border-slate-700 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-blue-400">Zugangsdaten verwalten</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                
                {mode === 'list' ? (
                    <div className="p-4 flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <input
                                type="text"
                                placeholder="Suchen (Name, Badge, Benutzername)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-xs"
                            />
                            <button onClick={() => setMode('create')} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors">
                                Neu anlegen
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                             {filteredCredentials.map(({ id, officer, username, createdAt }) => officer && (
                                <div key={id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg mb-2 border border-slate-700">
                                    <div>
                                        <p className="font-bold">{`${officer.firstName} ${officer.lastName}`} <span className="text-sm font-normal text-gray-400">(#{officer.badgeNumber})</span></p>
                                        <p className="text-sm text-gray-400">Benutzername: <span className="font-mono">{username}</span></p>
                                        <p className="text-xs text-gray-500">Erstellt am: {createdAt.toLocaleDateString('de-DE')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onRegenerate({ id, officerId: officer.id, username, createdAt })} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-xs font-semibold transition-colors">Passwort ändern</button>
                                        <button onClick={() => onDelete({ id, officerId: officer.id, username, createdAt })} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs font-semibold transition-colors">Entfernen</button>
                                    </div>
                                </div>
                            ))}
                            {filteredCredentials.length === 0 && <p className="text-center text-gray-500 mt-4">Keine Einträge gefunden.</p>}
                        </div>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="mb-4">
                             <label className="block text-sm font-medium mb-1">Officer auswählen</label>
                             {selectedOfficer ? (
                                <div className="flex items-center justify-between p-2 bg-slate-700 rounded-md">
                                    <span>{`${selectedOfficer.firstName} ${selectedOfficer.lastName} (#${selectedOfficer.badgeNumber})`}</span>
                                    <button type="button" onClick={() => setSelectedOfficer(null)} className="p-1 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors" title="Auswahl aufheben">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                             ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={createSearchTerm}
                                        onChange={e => setCreateSearchTerm(e.target.value)}
                                        placeholder="Officer suchen..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {filteredOfficersForCreation.length > 0 && createSearchTerm && (
                                        <ul className="absolute z-10 w-full bg-slate-800 border border-slate-700 mt-1 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {filteredOfficersForCreation.map(o => (
                                                <li key={o.id} onClick={() => { setSelectedOfficer(o); setCreateSearchTerm(''); }} className="px-3 py-2 hover:bg-blue-500/20 cursor-pointer text-sm">
                                                    {`${o.firstName} ${o.lastName}`} <span className="text-xs text-gray-400">(#{o.badgeNumber})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                             )}
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button type="button" onClick={() => setMode('list')} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors">Zurück zur Liste</button>
                            <button type="button" onClick={handleCreate} disabled={!selectedOfficer} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md text-sm font-medium transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">
                                Jetzt anlegen
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CredentialsManagementModal;