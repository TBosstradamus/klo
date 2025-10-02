import React, { useState, useMemo } from 'react';
import { ITLog } from '../types';

interface UprankDerankPageProps {
  logs: ITLog[];
  onBack: () => void;
}

const UprankDerankPage: React.FC<UprankDerankPageProps> = ({ logs, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const lowercasedTerm = searchTerm.toLowerCase();
    return logs.filter(log =>
      log.meta?.officerName?.toLowerCase().includes(lowercasedTerm) ||
      log.meta?.oldRank?.toLowerCase().includes(lowercasedTerm) ||
      log.meta?.newRank?.toLowerCase().includes(lowercasedTerm)
    );
  }, [logs, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-gray-950 p-8">
      <header className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
            <h1 className="text-4xl font-bold text-slate-100">Uprank & Derank Protokoll</h1>
            <p className="text-slate-400 mt-1">Eine Übersicht über alle Beförderungen und Degradierungen.</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-200 bg-slate-700/80 hover:bg-slate-700 transition-colors"
        >
          Zurück zur Personalabteilung
        </button>
      </header>
      <div className="mb-6 flex-shrink-0">
        <input
          type="text"
          placeholder="Protokoll durchsuchen (Name, Alter/Neuer Rang)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>
      <main className="flex-1 overflow-y-auto bg-gray-900 rounded-xl border border-gray-800">
        {filteredLogs.length > 0 ? (
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-gray-900 sticky top-0 border-b border-gray-800">
              <tr>
                <th scope="col" className="px-6 py-4">Datum & Uhrzeit</th>
                <th scope="col" className="px-6 py-4">Officer</th>
                <th scope="col" className="px-6 py-4">Alter Rang</th>
                <th scope="col" className="px-6 py-4">Neuer Rang</th>
                <th scope="col" className="px-6 py-4">Geändert von</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="border-b border-gray-800 hover:bg-slate-800/50">
                  <td className="px-6 py-4">{log.timestamp.toLocaleString('de-DE')}</td>
                  <td className="px-6 py-4 font-medium text-slate-100">{log.meta?.officerName || 'N/A'}</td>
                  <td className="px-6 py-4">{log.meta?.oldRank || 'N/A'}</td>
                  <td className="px-6 py-4">{log.meta?.newRank || 'N/A'}</td>
                  <td className="px-6 py-4">{log.actor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Keine passenden Einträge gefunden.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UprankDerankPage;