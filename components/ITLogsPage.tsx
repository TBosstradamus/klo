


import React, { useState, useMemo } from 'react';
import { ITLog, ITLogEventType, LogCategory, Officer, RANKS } from '../types';
import SupervisoryAccessWarning from './SupervisoryAccessWarning';

interface ITLogsPageProps {
  logs: ITLog[];
  currentUser: Officer;
}

const LOG_CATEGORIES: { id: LogCategory; label: string }[] = [
  { id: 'dispatch', label: 'DISPATCH logs' },
  { id: 'hr', label: 'Personalabteilung Logs' },
  { id: 'trainer', label: 'Ausbilder Logs' },
  { id: 'officer', label: 'Officer Logs' },
  { id: 'timeclock', label: 'Stempeluhr Logs' },
];

const getEventTypeStyles = (eventType: ITLogEventType): { text: string; badgeColor: string; label: string } => {
  switch (eventType) {
    // Timeclock
    case 'clock_in':
      return { label: 'Eingestempelt', text: 'text-green-300', badgeColor: 'bg-green-600/30' };
    case 'clock_out':
      return { label: 'Ausgestempelt', text: 'text-orange-300', badgeColor: 'bg-orange-600/30' };

    // HR (Grün für Erstellung, Orange für Änderung, Rot für Löschung/Sanktion)
    case 'officer_created':
      return { label: 'Erstellt', text: 'text-green-300', badgeColor: 'bg-green-600/30' };
    case 'credential_created':
      return { label: 'Erstellt', text: 'text-green-300', badgeColor: 'bg-green-600/30' };
    case 'officer_updated':
      return { label: 'Geändert', text: 'text-orange-300', badgeColor: 'bg-orange-600/30' };
    case 'password_regenerated':
      return { label: 'Geändert', text: 'text-orange-300', badgeColor: 'bg-orange-600/30' };
    case 'officer_terminated':
      return { label: 'Gelöscht', text: 'text-red-300', badgeColor: 'bg-red-600/30' };
    case 'credential_deleted':
      return { label: 'Gelöscht', text: 'text-red-300', badgeColor: 'bg-red-600/30' };
    case 'sanction_issued':
      return { label: 'Sanktioniert', text: 'text-red-300', badgeColor: 'bg-red-600/30' };

    // Trainer (Blau/Grün für Zuweisung, Orange für Update, Rot für Entzug)
    case 'checklist_assigned':
      return { label: 'Zugewiesen', text: 'text-blue-300', badgeColor: 'bg-blue-600/30' };
    case 'checklist_item_updated':
      return { label: 'Aktualisiert', text: 'text-orange-300', badgeColor: 'bg-orange-600/30' };
    case 'checklist_unassigned':
      return { label: 'Entzogen', text: 'text-yellow-300', badgeColor: 'bg-yellow-600/30' };

    // Officer (Blau für Ansicht)
    case 'module_viewed':
      return { label: 'Angesehen', text: 'text-sky-300', badgeColor: 'bg-sky-600/30' };
    case 'document_viewed':
      return { label: 'Angesehen', text: 'text-sky-300', badgeColor: 'bg-sky-600/30' };

    // Dispatch (Violett für Zuweisung, Lila für Status, Rot für Löschung)
    case 'officer_assigned_vehicle':
    case 'officer_assigned_header':
      return { label: 'Zugewiesen', text: 'text-violet-300', badgeColor: 'bg-violet-600/30' };
    case 'officer_removed_vehicle':
    case 'officer_removed_header':
      return { label: 'Entfernt', text: 'text-pink-300', badgeColor: 'bg-pink-600/30' };
    case 'vehicle_status_updated':
    case 'vehicle_funk_updated':
    case 'vehicle_callsign_updated':
      return { label: 'Update', text: 'text-indigo-300', badgeColor: 'bg-indigo-600/30' };
    case 'vehicle_cleared':
    case 'header_cleared':
      return { label: 'Geräumt', text: 'text-rose-300', badgeColor: 'bg-rose-600/30' };

    default:
      return { label: 'Unbekannt', text: 'text-gray-300', badgeColor: 'bg-gray-600/30' };
  }
};

const formatLogDuration = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds < 0) return '0s';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
};

const LogDetailRenderer: React.FC<{ log: ITLog }> = ({ log }) => {
    const ICONS: Partial<Record<ITLogEventType, React.ReactNode>> = {
        'clock_in': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>,
        'clock_out': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>,
        'officer_assigned_vehicle': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>,
        'officer_assigned_header': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>,
        'officer_removed_vehicle': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zm10-3a1 1 0 10-2 0v1h-1a1 1 0 100 2h4a1 1 0 100-2h-1V8z" /></svg>,
        'officer_removed_header': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zm10-3a1 1 0 10-2 0v1h-1a1 1 0 100 2h4a1 1 0 100-2h-1V8z" /></svg>,
        'vehicle_status_updated': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.224 0 1 1 0 10-1.732 1 7.5 7.5 0 0012.688 0 1 1 0 10-1.732-1zM5.424 7.532a1 1 0 00-1-1.732 7.5 7.5 0 000 12.688 1 1 0 101-1.732 5.5 5.5 0 010-9.224z" clipRule="evenodd" /><path fillRule="evenodd" d="M5.75 10a1 1 0 011-1h6.5a1 1 0 110 2h-6.5a1 1 0 01-1-1z" clipRule="evenodd" /></svg>,
        'vehicle_cleared': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>,
    };

    const icon = ICONS[log.eventType] || <div className="w-5 h-5"></div>;
    const { meta } = log;

    switch (log.category) {
        case 'dispatch':
            switch (log.eventType) {
                case 'officer_assigned_vehicle':
                    return <div className="flex items-center gap-3"><span className="text-violet-400">{icon}</span><div><strong className="text-slate-100">{meta?.officerName}</strong> wurde <strong className="text-slate-100">{meta?.vehicleName}</strong> (Sitz {meta?.seatIndex}) zugewiesen.</div></div>;
                case 'officer_removed_vehicle':
                    return <div className="flex items-center gap-3"><span className="text-pink-400">{icon}</span><div><strong className="text-slate-100">{meta?.officerName}</strong> wurde von <strong className="text-slate-100">{meta?.sourceName}</strong> ({meta?.source}) entfernt.</div></div>;
                case 'officer_assigned_header':
                    return <div className="flex items-center gap-3"><span className="text-violet-400">{icon}</span><div><strong className="text-slate-100">{meta?.officerName}</strong> wurde der Rolle <strong className="text-slate-100">{meta?.role}</strong> zugewiesen.</div></div>;
                case 'officer_removed_header':
                     return <div className="flex items-center gap-3"><span className="text-pink-400">{icon}</span><div><strong className="text-slate-100">{meta?.officerName}</strong> wurde von Rolle <strong className="text-slate-100">{meta?.sourceName}</strong> entfernt.</div></div>;
                case 'vehicle_status_updated':
                    return <div className="flex items-center gap-3"><span className="text-indigo-400">{icon}</span><div>Status für <strong className="text-slate-100">{meta?.vehicleName}</strong> wurde auf <strong className="text-slate-100">Code {meta?.status}</strong> geändert.</div></div>;
                case 'vehicle_cleared':
                    return <div className="flex items-center gap-3"><span className="text-rose-400">{icon}</span><div>Alle Officer wurden aus <strong className="text-slate-100">{meta?.vehicleName}</strong> entfernt.</div></div>;
                case 'header_cleared':
                     return <div className="flex items-center gap-3"><span className="text-rose-400">{icon}</span><div>Header-Rolle <strong className="text-slate-100">{meta?.role}</strong> wurde geräumt.</div></div>;
                default:
                    return <div>{log.details}</div>;
            }
        case 'timeclock':
            switch (log.eventType) {
                case 'clock_in':
                    return <div className="flex items-center gap-3"><span className="text-green-400">{icon}</span><div><strong className="text-slate-100">{meta?.officerName || log.actor}</strong> hat sich eingestempelt.</div></div>;
                case 'clock_out':
                    return <div className="flex items-center gap-3"><span className="text-orange-400">{icon}</span><div><strong className="text-slate-100">{meta?.officerName || log.actor}</strong> hat sich ausgestempelt.<div className="text-xs text-slate-400">Dauer: <strong>{formatLogDuration(meta?.durationInSeconds)}</strong> | Gesamt: <strong>{formatLogDuration(meta?.newTotalHours)}</strong></div></div></div>;
                default:
                     return <div>{log.details}</div>;
            }
        default:
            return <div>{log.details}</div>;
    }
};


const ITLogsPage: React.FC<ITLogsPageProps> = ({ logs, currentUser }) => {
  const [activeCategory, setActiveCategory] = useState<LogCategory>('dispatch');
  const [searchTerm, setSearchTerm] = useState('');

  const lieutenantIndex = RANKS.indexOf('Lieutenant');
  const currentUserRankIndex = RANKS.indexOf(currentUser.rank);
  const isHighRank = lieutenantIndex !== -1 && currentUserRankIndex >= lieutenantIndex;
  
  const hasAdminAccess = currentUser.departmentRoles.includes('Admin');
  const showWarning = isHighRank && !hasAdminAccess;

  const sortedAndFilteredLogs = useMemo(() => {
    const categoryLogs = logs.filter(log => log.category === activeCategory);
    const sorted = [...categoryLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (!searchTerm) return sorted;

    const lowercasedTerm = searchTerm.toLowerCase();
    return sorted.filter(log =>
      log.details.toLowerCase().includes(lowercasedTerm) ||
      log.actor.toLowerCase().includes(lowercasedTerm)
    );
  }, [logs, searchTerm, activeCategory]);

  return (
    <div className="relative flex flex-col h-full bg-slate-800 p-8">
      {showWarning && <SupervisoryAccessWarning />}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold text-blue-400">IT-Protokolle</h1>
      </div>

      <div className="flex border-b border-slate-700 mb-4">
          {LOG_CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`px-4 py-3 text-sm font-medium transition-colors focus:outline-none -mb-px ${
                activeCategory === id
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Aktuelles Protokoll durchsuchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl border border-slate-700">
        {sortedAndFilteredLogs.length > 0 ? (
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-blue-400 uppercase bg-slate-800/50 sticky top-0">
              <tr>
                <th scope="col" className="px-6 py-3 w-1/5">Datum & Uhrzeit</th>
                <th scope="col" className="px-6 py-3 w-1/6">Ereignistyp</th>
                <th scope="col" className="px-6 py-3 w-2/3">Details</th>
                <th scope="col" className="px-6 py-3 w-1/6">Akteur</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredLogs.map(log => {
                const eventStyle = getEventTypeStyles(log.eventType);
                return (
                  <tr key={log.id} className="bg-slate-900 border-b border-slate-700 hover:bg-slate-800/50">
                    <td className="px-6 py-4">{log.timestamp.toLocaleString('de-DE')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${eventStyle.badgeColor} ${eventStyle.text}`}>
                        {eventStyle.label}
                      </span>
                    </td>
                    <td className="px-6 py-4"><LogDetailRenderer log={log} /></td>
                    <td className="px-6 py-4">{log.actor}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>{searchTerm ? 'Keine passenden Einträge gefunden.' : 'Für diesen Bereich sind noch keine Protokolle verfügbar.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ITLogsPage;