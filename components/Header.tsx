import React, { useState } from 'react';
import { Officer, DragData, HeaderRole } from '../types';

interface HeaderProps {
  onOpenFleetModal: () => void;
  headerRoles: Record<HeaderRole, Officer | null>;
  onDropOnHeader: (dragData: DragData, role: HeaderRole) => void;
  onHeaderDragStart: (officer: Officer, role: HeaderRole) => string;
  onRequestClearHeader: (role: HeaderRole) => void;
  currentUser: Officer;
  isPinningMode: boolean;
  onTogglePinningMode: () => void;
}

const HeaderSlot: React.FC<{
  role: HeaderRole;
  label: string;
  officer: Officer | null;
  onDrop: (dragData: DragData, role: HeaderRole) => void;
  onDragStart: (officer: Officer, role: HeaderRole) => string;
  onRequestClear: (role: HeaderRole) => void;
  variant: 'dispatch' | 'air';
}> = ({ role, label, officer, onDrop, onDragStart, onRequestClear, variant }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const data = e.dataTransfer.getData('application/json');
        if (data) {
            const dragData: DragData = JSON.parse(data);
            if (dragData.source?.headerRole === role) return; // Prevent dropping on self
            onDrop(dragData, role);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (officer) {
            const data = onDragStart(officer, role);
            e.dataTransfer.setData('application/json', data);
            e.currentTarget.style.opacity = '0.4';
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
    };
    
    let bgColor = 'bg-slate-700/60';
    if (variant === 'dispatch') {
        bgColor = officer ? 'bg-green-600' : 'bg-red-600';
    } else if (variant === 'air') {
        bgColor = officer ? 'bg-green-600' : 'bg-slate-700/60';
    }
    const ringColor = isDragOver ? 'ring-2 ring-blue-400' : 'ring-1 ring-slate-700';

    return (
        <div className="text-center">
            <span className="text-xs font-semibold text-gray-400 block mb-1">{label}</span>
            <div 
                className={`w-48 h-10 flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${bgColor} ${ringColor}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div 
                    draggable={!!officer}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className={`flex-1 text-sm font-semibold truncate text-center text-white ${officer ? 'cursor-grab active:cursor-grabbing' : ''}`}
                >
                    {officer ? `${officer.firstName} ${officer.lastName}` : 'Unbesetzt'}
                </div>
                {officer && (
                  <button
                      onClick={() => onRequestClear(role)}
                      className="ml-2 text-red-400 hover:text-red-300 transition-colors rounded-full p-1 hover:bg-red-500/20"
                      title={`${label} auflösen`}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                  </button>
                )}
            </div>
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ 
  onOpenFleetModal, 
  headerRoles,
  onDropOnHeader, 
  onHeaderDragStart, 
  onRequestClearHeader,
  currentUser,
  isPinningMode,
  onTogglePinningMode
}) => {
  const isUserInDispatchRole = headerRoles.dispatch?.id === currentUser.id || headerRoles['co-dispatch']?.id === currentUser.id;

  return (
    <header className="py-2 px-4 bg-slate-900/80 backdrop-blur-sm shadow-lg border-b border-slate-700 z-10 flex items-center justify-between gap-4">
      {/* Left: Add Patrol Button & Pin Button */}
      <div className="flex-1 flex justify-start items-center">
        <button
          onClick={onOpenFleetModal}
          disabled={!isUserInDispatchRole}
          title={isUserInDispatchRole ? 'Eine neue Streife hinzufügen' : 'Nur als Dispatch oder Co-Dispatch verfügbar.'}
          className={`px-4 py-2 text-sm font-semibold rounded-md flex items-center justify-center transition-all duration-300
            ${isUserInDispatchRole
              ? 'text-white bg-green-600 hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/50'
              : 'bg-slate-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {!isUserInDispatchRole && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
          )}
          <span className={!isUserInDispatchRole ? 'blur-sm' : ''}>
            Streife hinzufügen
          </span>
        </button>

        <button
          onClick={onTogglePinningMode}
          disabled={!isUserInDispatchRole}
          title={isUserInDispatchRole ? 'Streifen anpinnen/entpinnen' : 'Nur als Dispatch oder Co-Dispatch verfügbar.'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ml-3 relative
            ${isUserInDispatchRole
              ? isPinningMode
                ? 'text-white bg-blue-600 hover:bg-blue-500 ring-2 ring-offset-2 ring-offset-slate-900 ring-blue-500'
                : 'text-gray-300 bg-slate-700 hover:bg-slate-600'
              : 'bg-slate-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {!isUserInDispatchRole && (
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`text-xl ${!isUserInDispatchRole ? 'opacity-30' : ''}`}>📌</span>
        </button>
      </div>

      {/* Center: Dispatch & Title */}
      <div className="flex items-end gap-4">
        <HeaderSlot
            role="dispatch"
            label="Dispatch"
            officer={headerRoles.dispatch}
            onDrop={onDropOnHeader}
            onDragStart={onHeaderDragStart}
            onRequestClear={onRequestClearHeader}
            variant="dispatch"
        />
        <h1 className="flex-shrink-0 text-2xl font-bold tracking-wider uppercase whitespace-nowrap pb-1 text-glow-white">LSPD DISPATCH</h1>
        <HeaderSlot
            role="co-dispatch"
            label="Co-Dispatch"
            officer={headerRoles['co-dispatch']}
            onDrop={onDropOnHeader}
            onDragStart={onHeaderDragStart}
            onRequestClear={onRequestClearHeader}
            variant="dispatch"
        />
      </div>
      
      {/* Right: Air Units */}
      <div className="flex-1 flex justify-end items-center gap-4">
        <div className="flex items-end gap-4">
            <HeaderSlot
                role="air1"
                label="Air 1"
                officer={headerRoles.air1}
                onDrop={onDropOnHeader}
                onDragStart={onHeaderDragStart}
                onRequestClear={onRequestClearHeader}
                variant="air"
            />
            <HeaderSlot
                role="air2"
                label="Air 2"
                officer={headerRoles.air2}
                onDrop={onDropOnHeader}
                onDragStart={onHeaderDragStart}
                onRequestClear={onRequestClearHeader}
                variant="air"
            />
        </div>
      </div>
    </header>
  );
};

export default Header;
