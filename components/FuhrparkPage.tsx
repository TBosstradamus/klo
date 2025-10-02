import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Vehicle, MailboxMessage, Officer, RANKS } from '../types';
import SupervisoryAccessWarning from './SupervisoryAccessWarning';

interface FuhrparkPageProps {
  vehicles: Vehicle[];
  onEditVehicle: (vehicle: Vehicle) => void;
  mailboxMessages: MailboxMessage[];
  onMarkAsRead: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  currentUser: Officer;
  onOpenAddVehicleModal: () => void;
}

const Mailbox: React.FC<{
    messages: MailboxMessage[];
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ messages, onMarkAsRead, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const unreadCount = messages.filter(m => !m.isRead).length;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-gray-300 hover:bg-slate-700 transition-colors"
                title="Postfach"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
                    <div className="p-2 sticky top-0 bg-slate-800/80 backdrop-blur-sm z-10 border-b border-slate-700">
                        <h4 className="font-semibold text-sm text-center text-blue-400">Benachrichtigungen</h4>
                    </div>
                    {messages.length > 0 ? (
                        <ul className="p-2 space-y-2">
                            {messages.map(msg => (
                                <li 
                                    key={msg.id} 
                                    className={`p-2 rounded-md border transition-colors ${msg.isRead ? 'bg-slate-800/50 border-slate-700/50' : 'bg-blue-900/40 border-blue-700/80'}`}
                                >
                                    <p className={`text-sm mb-1 ${msg.isRead ? 'text-gray-400' : 'text-gray-200'}`}>{msg.message}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString('de-DE')}</span>
                                        <div className="flex gap-1">
                                            {!msg.isRead && (
                                                <button onClick={() => onMarkAsRead(msg.id)} title="Als gelesen markieren" className="p-1 rounded-full text-green-400 hover:bg-green-500/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                                            )}
                                            <button onClick={() => onDelete(msg.id)} title="Löschen" className="p-1 rounded-full text-red-400 hover:bg-red-500/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-center text-sm text-gray-500">Keine neuen Nachrichten.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const VehicleCard: React.FC<{ vehicle: Vehicle; onEdit: () => void; disabled?: boolean; }> = ({ vehicle, onEdit, disabled = false }) => {
    const formatDate = (date: Date | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const getCheckupStatus = () => {
        if (!vehicle.nextCheckup) {
            return { color: 'bg-slate-700 text-gray-300', isWarning: false, label: formatDate(vehicle.nextCheckup) };
        }
        const nextCheckupDate = new Date(vehicle.nextCheckup);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(today.getDate() + 2);
        twoDaysFromNow.setHours(0, 0, 0, 0);
        
        const lastCheckupDate = vehicle.lastCheckup ? new Date(vehicle.lastCheckup) : null;
        if (lastCheckupDate && lastCheckupDate >= nextCheckupDate) {
             return { color: 'bg-green-600/40 text-green-200', isWarning: false, label: formatDate(vehicle.nextCheckup) };
        }

        if (nextCheckupDate < today) {
            return { color: 'bg-red-600/50 text-red-200', isWarning: true, label: formatDate(vehicle.nextCheckup) };
        }
        if (nextCheckupDate <= twoDaysFromNow) {
            return { color: 'bg-orange-600/50 text-orange-200', isWarning: false, label: formatDate(vehicle.nextCheckup) };
        }

        return { color: 'bg-slate-700 text-gray-300', isWarning: false, label: formatDate(vehicle.nextCheckup) };
    };
    
    const status = getCheckupStatus();

    return (
        <button 
          onClick={!disabled ? onEdit : undefined}
          disabled={disabled}
          className={`bg-slate-800/50 rounded-lg border border-slate-700 p-4 flex flex-col text-left justify-between transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${disabled
              ? 'cursor-not-allowed opacity-70'
              : 'hover:border-blue-500 hover:bg-slate-700/50 hover:-translate-y-1'
            }
          `}
        >
          <div>
            <h3 className="text-lg font-bold text-white truncate">{vehicle.name}</h3>
            <p className="text-sm text-gray-400">{vehicle.category} • {vehicle.capacity} Sitze</p>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-700/50 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Letzter Checkup:</span>
              <span className={`font-semibold px-2 py-0.5 rounded ${vehicle.lastCheckup ? 'bg-slate-700 text-gray-300' : 'bg-slate-700 text-gray-300'}`}>{formatDate(vehicle.lastCheckup)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Nächster Checkup:</span>
              <span className={`font-semibold px-2 py-0.5 rounded flex items-center gap-1.5 ${status.color}`}>
                {status.isWarning && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                )}
                {status.label}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
                <span className="text-gray-400">Letzter KM-Stand:</span>
                <span className="font-semibold text-gray-300">{vehicle.lastMileage > 0 ? vehicle.lastMileage.toLocaleString('de-DE') : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-400">Aktueller KM-Stand:</span>
                <span className="font-semibold text-gray-300">{vehicle.mileage.toLocaleString('de-DE')}</span>
            </div>
          </div>
        </button>
    );
};

const FuhrparkPage: React.FC<FuhrparkPageProps> = ({ vehicles, onEditVehicle, mailboxMessages, onMarkAsRead, onDeleteMessage, currentUser, onOpenAddVehicleModal }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const lieutenantIndex = RANKS.indexOf('Lieutenant');
  const currentUserRankIndex = RANKS.indexOf(currentUser.rank);
  const isHighRank = lieutenantIndex !== -1 && currentUserRankIndex >= lieutenantIndex;

  const hasFleetAccess = currentUser.departmentRoles.includes('Fuhrparkmanager') || currentUser.departmentRoles.includes('Admin');
  const showWarningAndDisable = isHighRank && !hasFleetAccess;
  const canManageFleet = useMemo(() => currentUser.departmentRoles.includes('Fuhrparkmanager') || currentUser.departmentRoles.includes('Admin'), [currentUser.departmentRoles]);

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles;
    const lowercasedTerm = searchTerm.toLowerCase();
    return vehicles.filter(vehicle =>
      vehicle.name.toLowerCase().includes(lowercasedTerm) ||
      vehicle.category.toLowerCase().includes(lowercasedTerm)
    );
  }, [vehicles, searchTerm]);

  return (
    <div className="relative flex flex-col h-full bg-slate-800 p-8">
      {showWarningAndDisable && <SupervisoryAccessWarning />}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold text-blue-400">Fuhrpark</h1>
        <div className="flex items-center gap-4">
          {canManageFleet && (
              <button
                  onClick={onOpenAddVehicleModal}
                  className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-500 transition-colors"
              >
                  Fahrzeug hinzufügen
              </button>
          )}
          <Mailbox messages={mailboxMessages} onMarkAsRead={onMarkAsRead} onDelete={onDeleteMessage} />
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Streife nach Name oder Kategorie suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl border border-slate-700 p-6">
        {filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVehicles.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={() => onEditVehicle(vehicle)} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Keine Fahrzeuge gefunden.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FuhrparkPage;