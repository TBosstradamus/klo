import React from 'react';
import { ITLog } from '../types';

interface SettingsLogDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    log: ITLog | null;
}

const DetailItem: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-blue-400 uppercase font-semibold tracking-wider">{label}</p>
        <p className="text-md text-gray-200 font-medium">{value}</p>
    </div>
);


const SettingsLogDetailModal: React.FC<SettingsLogDetailModalProps> = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;
    
    const isHiring = log.eventType === 'officer_created';
    const actionLabel = isHiring ? 'Eingestellt von' : 'Gekündigt von';
    const actionName = isHiring ? 'Einstellung' : 'Kündigung';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-blue-400">Protokolldetails</h2>
                     <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0LL10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                     </button>
                </div>
                <div className="p-6 space-y-4">
                    <DetailItem label="Aktion" value={actionName} />
                    <DetailItem label="Officer Name" value={log.meta?.officerName || 'N/A'} />
                    <DetailItem 
                        label={actionLabel} 
                        value={log.actor} 
                    />
                    <DetailItem label="Datum & Uhrzeit" value={log.timestamp.toLocaleString('de-DE')} />
                    <DetailItem label="Details" value={log.details} />
                </div>
            </div>
        </div>
    );
};

export default SettingsLogDetailModal;
