import React from 'react';
import { Sanction } from '../types';

interface SanctionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    sanction: Sanction | null;
}

const DetailItem: React.FC<{ label: string; value: string | React.ReactNode; }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-slate-400">{label}</p>
        <div className="text-lg text-slate-100 font-semibold">{value}</div>
    </div>
);


const SanctionDetailModal: React.FC<SanctionDetailModalProps> = ({ isOpen, onClose, sanction }) => {
    if (!isOpen || !sanction) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-800" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-slate-100">Sanktionsdetails</h2>
                     <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Schließen">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                     </button>
                </header>
                <main className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem label="Officer" value={`${sanction.officer.firstName} ${sanction.officer.lastName} (#${sanction.officer.badgeNumber})`} />
                        <DetailItem label="Sanktionstyp" value={sanction.sanctionType} />
                        <DetailItem label="Ausgestellt von" value={sanction.issuedBy} />
                        <DetailItem label="Datum & Uhrzeit" value={sanction.timestamp.toLocaleString('de-DE')} />
                    </div>
                    <DetailItem 
                        label="Begründung" 
                        value={
                            <p className="text-base whitespace-pre-wrap bg-slate-800/50 p-4 rounded-lg border border-slate-700 max-h-48 overflow-y-auto font-normal text-slate-300">
                                {sanction.reason}
                            </p>
                        } 
                    />
                </main>
            </div>
        </div>
    );
};

export default SanctionDetailModal;