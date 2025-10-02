import React, { useState, useMemo, useEffect } from 'react';
import { Officer } from '../types';

interface TerminateOfficerModalProps {
    isOpen: boolean;
    onClose: () => void;
    officers: Officer[];
    onTerminate: (officer: Officer) => void;
}

const TerminateOfficerModal: React.FC<TerminateOfficerModalProps> = ({ isOpen, onClose, officers, onTerminate }) => {
    const [officerSearch, setOfficerSearch] = useState('');
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setOfficerSearch('');
            setSelectedOfficer(null);
        }
    }, [isOpen]);

    const filteredOfficers = useMemo(() => {
        if (!officerSearch) return [];
        const lowercasedTerm = officerSearch.toLowerCase();
        return officers.filter(o => 
            `${o.firstName} ${o.lastName}`.toLowerCase().includes(lowercasedTerm) ||
            o.badgeNumber.includes(officerSearch)
        ).slice(0, 5);
    }, [officerSearch, officers]);
    
    const handleTerminateClick = () => {
        if (selectedOfficer) {
            onTerminate(selectedOfficer);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-xl rounded-xl shadow-2xl border border-slate-700 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-blue-400">Officer kündigen</h2>
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                     </button>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Zu kündigenden Officer auswählen</label>
                        {selectedOfficer ? (
                            <div className="flex items-center justify-between p-2 bg-slate-700 rounded-md">
                                <span>{`${selectedOfficer.firstName} ${selectedOfficer.lastName} (#${selectedOfficer.badgeNumber})`}</span>
                                <button type="button" onClick={() => setSelectedOfficer(null)} className="p-1 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors" title="Auswahl aufheben">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={officerSearch}
                                    onChange={e => setOfficerSearch(e.target.value)}
                                    placeholder="Officer nach Name oder Badge-Nummer suchen..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {filteredOfficers.length > 0 && officerSearch && (
                                    <ul className="absolute z-10 w-full bg-slate-800 border border-slate-700 mt-1 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {filteredOfficers.map(o => (
                                            <li key={o.id} onClick={() => { setSelectedOfficer(o); setOfficerSearch(''); }} className="px-3 py-2 hover:bg-blue-500/20 cursor-pointer text-sm">
                                                {`${o.firstName} ${o.lastName}`} <span className="text-xs text-gray-400">(#{o.badgeNumber})</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-8">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors">Abbrechen</button>
                        <button type="button" onClick={handleTerminateClick} disabled={!selectedOfficer} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-sm font-medium transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed">
                            Officer kündigen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminateOfficerModal;