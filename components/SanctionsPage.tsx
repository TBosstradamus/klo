import React, { useState, useMemo } from 'react';
import { Sanction } from '../types';

interface SanctionsPageProps {
  sanctions: Sanction[];
  onBack: () => void;
  onAddSanction: () => void;
  onViewSanction: (sanction: Sanction) => void;
}

const SanctionsPage: React.FC<SanctionsPageProps> = ({ sanctions, onBack, onAddSanction, onViewSanction }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSanctions = useMemo(() => {
    if (!searchTerm) return sanctions;
    const lowercasedTerm = searchTerm.toLowerCase();
    return sanctions.filter(s =>
      `${s.officer.firstName} ${s.officer.lastName}`.toLowerCase().includes(lowercasedTerm) ||
      s.sanctionType.toLowerCase().includes(lowercasedTerm)
    );
  }, [sanctions, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-gray-950 p-8">
      <header className="flex items-center justify-between mb-8 flex-shrink-0">
        <div>
            <h1 className="text-4xl font-bold text-slate-100">Sanktionen</h1>
            <p className="text-slate-400 mt-1">Verwalten und einsehen aller disziplinarischen Maßnahmen.</p>
        </div>
        <div className="flex items-center gap-4">
            <button
                onClick={onBack}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-slate-200 bg-slate-700/80 hover:bg-slate-700 transition-colors"
            >
                Zurück
            </button>
            <button
                onClick={onAddSanction}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-500 transition-colors"
            >
                Officer sanktionieren
            </button>
        </div>
      </header>
      <div className="mb-6 flex-shrink-0">
        <input
            type="text"
            placeholder="Sanktionen durchsuchen (Name, Typ)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>
      <main className="flex-1 overflow-y-auto bg-gray-900 rounded-xl border border-gray-800">
        {filteredSanctions.length > 0 ? (
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-gray-900 sticky top-0 border-b border-gray-800">
              <tr>
                <th scope="col" className="px-6 py-4">Datum & Uhrzeit</th>
                <th scope="col" className="px-6 py-4">Officer</th>
                <th scope="col" className="px-6 py-4">Sanktionstyp</th>
                <th scope="col" className="px-6 py-4">Ausgestellt von</th>
              </tr>
            </thead>
            <tbody>
              {filteredSanctions.map(sanction => (
                <tr key={sanction.id} className="border-b border-gray-800 hover:bg-slate-800/50 cursor-pointer" onClick={() => onViewSanction(sanction)}>
                  <td className="px-6 py-4">{sanction.timestamp.toLocaleString('de-DE')}</td>
                  <td className="px-6 py-4 font-medium text-slate-100">{`${sanction.officer.firstName} ${sanction.officer.lastName}`}</td>
                  <td className="px-6 py-4">{sanction.sanctionType}</td>
                  <td className="px-6 py-4">{sanction.issuedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>Keine Sanktionen gefunden.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SanctionsPage;