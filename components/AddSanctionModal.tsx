import React, { useState, useMemo, useEffect } from 'react';
import { Officer, SanctionType, SANCTION_TYPES } from '../types';

interface AddSanctionModalProps {
    isOpen: boolean;
    onClose: () => void;
    officers: Officer[];
    onAdd: (officer: Officer, sanctionType: SanctionType, reason: string) => void;
}

const AddSanctionModal: React.FC<AddSanctionModalProps> = ({ isOpen, onClose, officers, onAdd }) => {
    const [officerSearch, setOfficerSearch] = useState('');
    const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
    const [sanctionType, setSanctionType] = useState<SanctionType>(SANCTION_TYPES[0]);
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setOfficerSearch('');
            setSelectedOfficer(null);
            setSanctionType(SANCTION_TYPES[0]);
            setReason('');
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
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOfficer && reason.trim()) {
            onAdd(selectedOfficer, sanctionType, reason.trim());
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-slate-100">Officer sanktionieren</h2>
                     <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Schließen">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                </header>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-300">Officer</label>
                            {selectedOfficer ? (
                                <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                                    <span className="font-semibold">{`${selectedOfficer.firstName} ${selectedOfficer.lastName} (#${selectedOfficer.badgeNumber})`}</span>
                                    <button type="button" onClick={() => setSelectedOfficer(null)} className="p-1 rounded-full text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors" title="Auswahl aufheben">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={officerSearch}
                                        onChange={e => setOfficerSearch(e.target.value)}
                                        placeholder="Officer nach Name oder Badge-Nummer suchen..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {filteredOfficers.length > 0 && officerSearch && (
                                        <ul className="absolute z-10 w-full bg-slate-800 border border-slate-700 mt-1 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {filteredOfficers.map(o => (
                                                <li key={o.id} onClick={() => { setSelectedOfficer(o); setOfficerSearch(''); }} className="px-4 py-2 hover:bg-blue-500/20 cursor-pointer text-sm">
                                                    {`${o.firstName} ${o.lastName}`} <span className="text-xs text-slate-400">(#{o.badgeNumber})</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-300">Sanktionstyp</label>
                            <select value={sanctionType} onChange={e => setSanctionType(e.target.value as SanctionType)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {SANCTION_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-300">Begründung</label>
                            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={5} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors">Abbrechen</button>
                        <button type="submit" disabled={!selectedOfficer || !reason.trim()} className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-colors disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed">Sanktion ausstellen</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSanctionModal;