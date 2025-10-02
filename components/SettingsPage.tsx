import React, { useState, useMemo } from 'react';
import { ITLog } from '../types';

interface SettingsPageProps {
  logs: ITLog[];
  onBack: () => void;
  onViewLog: (log: ITLog) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ logs, onBack, onViewLog }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const lowercasedTerm = searchTerm.toLowerCase();
    return logs.filter(log => {
      return (
        log.meta?.officerName?.toLowerCase().includes(lowercasedTerm) ||
        log.actor.toLowerCase().includes(lowercasedTerm)
      );
    });
  }, [logs, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-slate-800 p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold text-blue-400">Einstellungen - Personalprotokoll</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-semibold rounded-md text-gray-200 bg-slate-700 hover:bg-blue-500 transition-colors"
        >
          Zurück zur Personalabteilung
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Protokoll durchsuchen (Name, Bearbeiter)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl border border-slate-700">
        {filteredLogs.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-blue-400 uppercase bg-slate-800 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3">Datum & Uhrzeit</th>
                <th scope="col" className="px-6 py-3">Aktion</th>
                <th scope="col" className="px-6 py-3">Officer Name</th>
                <th scope="col" className="px-6 py-3">Bearbeiter</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const isHiring = log.eventType === 'officer_created';
                return (
                  <tr key={log.id} className="bg-slate-900 border-b border-slate-700 hover:bg-slate-800/50 cursor-pointer" onClick={() => onViewLog(log)}>
                    <td className="px-6 py-4">{log.timestamp.toLocaleString('de-DE')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        isHiring
                          ? 'bg-green-600/20 text-green-300'
                          : 'bg-red-600/20 text-red-300'
                      }`}>
                        {isHiring ? 'Eingestellt' : 'Gekündigt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{log.meta?.officerName || 'N/A'}</td>
                    <td className="px-6 py-4">{log.actor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Keine Einträge gefunden.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
