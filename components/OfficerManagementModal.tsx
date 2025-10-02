import React, { useState, useEffect } from 'react';
import { Officer } from '../types';

interface OfficerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  officers: Officer[];
  onOpenDetail: (officer: Officer) => void;
  isAdminView?: boolean;
  onOpenAssignRoles?: (officer: Officer) => void;
}

const ActionButton: React.FC<{ children: React.ReactNode; onClick: () => void; title: string; className?: string }> = 
({ children, onClick, title, className = '' }) => (
    <button onClick={e => { e.stopPropagation(); onClick(); }} className={`p-2 rounded-full transition-colors ${className}`} title={title}>
        {children}
    </button>
);

const OfficerCard: React.FC<{ 
    officer: Officer; 
    onOpenDetail: () => void; 
    isAdminView?: boolean;
    onOpenAssignRoles?: (officer: Officer) => void;
}> = ({ officer, onOpenDetail, isAdminView, onOpenAssignRoles }) => {
    return (
        <div 
            onClick={onOpenDetail}
            className="relative bg-slate-800/50 rounded-xl p-4 text-center flex flex-col items-center justify-between border border-slate-700/50 group transition-colors duration-200 hover:border-blue-500/50 cursor-pointer"
        >
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                {isAdminView && onOpenAssignRoles && (
                     <ActionButton onClick={() => onOpenAssignRoles(officer)} title="Ränge zuweisen" className="text-yellow-400 hover:text-yellow-300 bg-slate-700 hover:bg-yellow-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                    </ActionButton>
                )}
                 <ActionButton onClick={onOpenDetail} title="Personalakte ansehen" className="text-blue-400 hover:text-blue-300 bg-slate-700 hover:bg-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                 </ActionButton>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center pt-4">
              <div className="text-sm font-bold text-slate-500 mb-1">{officer.badgeNumber}</div>
              <div className="text-6xl">{officer.gender === 'male' ? '👮🏻‍♂️' : '👮🏻‍♀️'}</div>
              <div className="flex flex-col mt-2">
                  <span className="text-xs text-blue-400 uppercase font-semibold tracking-wider">{officer.rank}</span>
                  <span className="font-medium text-base mt-1 text-slate-200">{`${officer.firstName} ${officer.lastName}`}</span>
              </div>
            </div>
            {isAdminView && officer.departmentRoles && officer.departmentRoles.length > 0 && (
                <div className="w-full pt-3 mt-3 border-t border-slate-700/50">
                    <div className="flex flex-wrap justify-center gap-1.5">
                        {officer.departmentRoles.map(role => (
                            <span key={role} className="px-2 py-1 text-[10px] font-semibold text-yellow-300 bg-yellow-600/30 rounded-full">
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


const OfficerManagementModal: React.FC<OfficerManagementModalProps> = ({ isOpen, onClose, officers, onOpenDetail, isAdminView = false, onOpenAssignRoles }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredOfficers = officers.filter(officer =>
    `${officer.firstName} ${officer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.badgeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.rank.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-900 w-11/12 max-w-7xl h-5/6 rounded-2xl shadow-2xl border border-gray-800 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
            <div>
                <h2 className="text-2xl font-bold text-slate-100">Officer Verwalten</h2>
                <p className="text-sm text-slate-400">{isAdminView ? 'Admin-Ansicht' : 'Standardansicht'}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Schließen">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
           </button>
        </header>

        <main className="p-6 flex-1 flex flex-col overflow-hidden">
            <div className="mb-6 flex-shrink-0">
              <input
                type="text"
                placeholder="Officer suchen (Name, Badge, Rang)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-lg mx-auto bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredOfficers.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filteredOfficers.map(officer => (
                    <OfficerCard 
                        key={officer.id} 
                        officer={officer} 
                        onOpenDetail={() => onOpenDetail(officer)}
                        isAdminView={isAdminView}
                        onOpenAssignRoles={onOpenAssignRoles}
                    />
                  ))}
                </div>
              ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                      <p>Keine Officer gefunden.</p>
                  </div>
              )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default OfficerManagementModal;