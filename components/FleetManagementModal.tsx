
import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle, VehicleCategory, VEHICLE_CATEGORIES } from '../types';

interface FleetManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  activeVehicleIds: Set<string>;
  onAddToGrid: (vehicle: Vehicle) => void;
  onRemoveFromGrid: (vehicleId: string) => void;
}

const ActionButton: React.FC<{ children: React.ReactNode; onClick: () => void; title: string; className?: string }> = 
({ children, onClick, title, className = '' }) => (
    <button onClick={onClick} className={`p-2 rounded-full transition-colors ${className}`} title={title}>
        {children}
    </button>
);

const FleetManagementModal: React.FC<FleetManagementModalProps> = ({ isOpen, onClose, vehicles, activeVehicleIds, onAddToGrid, onRemoveFromGrid }) => {
  const [searchTerms, setSearchTerms] = useState<Record<VehicleCategory, string>>(
    VEHICLE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: '' }), {} as Record<VehicleCategory, string>)
  );

  const vehiclesByCategory = useMemo(() => {
    return vehicles.reduce((acc, vehicle) => {
      if (!acc[vehicle.category]) {
        acc[vehicle.category] = [];
      }
      acc[vehicle.category].push(vehicle);
      return acc;
    }, {} as Record<VehicleCategory, Vehicle[]>);
  }, [vehicles]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-700 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-blue-400">Fuhrpark verwalten</h2>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
           </button>
        </div>
        
        <div className="p-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
            {VEHICLE_CATEGORIES.map(category => {
                const filteredVehicles = (vehiclesByCategory[category] || []).filter(v =>
                v.name.toLowerCase().includes(searchTerms[category].toLowerCase())
                );
                return (
                <details key={category} className="bg-slate-800/50 rounded-lg border border-slate-700 open:ring-1 open:ring-blue-500/50 transition-shadow group" open>
                    <summary className="p-3 cursor-pointer font-semibold text-blue-400 flex justify-between items-center list-none">
                        <span>{category} ({filteredVehicles.length})</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 transform transition-transform duration-200 group-open:rotate-90" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </summary>
                    <div className="p-3 border-t border-slate-700">
                    <div className="mb-3">
                        <input
                        type="text"
                        placeholder="Suchen..."
                        value={searchTerms[category]}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, [category]: e.target.value }))}
                        className="flex-grow w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                    <ul className="space-y-2">
                        {filteredVehicles.map(vehicle => {
                          const isVehicleActive = activeVehicleIds.has(vehicle.id);
                          return (
                            <li key={vehicle.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700/50">
                                <div>
                                <span className="font-medium">{vehicle.name}</span>
                                <span className="text-xs text-gray-400 ml-2">({vehicle.capacity} Sitze)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isVehicleActive ? (
                                    <ActionButton onClick={() => onRemoveFromGrid(vehicle.id)} title="Von Dispatch entfernen" className="text-red-400 hover:text-red-300 hover:bg-red-500/20">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                    </ActionButton>
                                  ) : (
                                    <ActionButton onClick={() => onAddToGrid(vehicle)} title="Zu Dispatch hinzufügen" className="text-green-400 hover:text-green-300 hover:bg-green-500/20">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                      </svg>
                                    </ActionButton>
                                  )}
                                </div>
                            </li>
                        )})}
                        {filteredVehicles.length === 0 && (
                            <li className="text-center text-sm text-gray-500 py-2">Keine Fahrzeuge in dieser Kategorie gefunden.</li>
                        )}
                    </ul>
                    </div>
                </details>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FleetManagementModal;
