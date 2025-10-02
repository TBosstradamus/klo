import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Officer, OfficerChecklist, ChecklistMailboxMessage, RANKS } from '../types';
import SupervisoryAccessWarning from './SupervisoryAccessWarning';

interface ChecklistPageProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  officers: Officer[];
  onOpenOfficerChecklist: (officer: Officer) => void;
  officerChecklists: Record<string, OfficerChecklist>;
  currentUser: Officer;
  onOpenTemplateModal: () => void;
  checklistMailbox: ChecklistMailboxMessage[];
  onMarkChecklistMessageAsRead: (messageId: string) => void;
  onDeleteChecklistMessage: (messageId: string) => void;
  calculateChecklistProgress: (checklist: OfficerChecklist | undefined) => { completed: number; total: number; percentage: number };
  onApproveAssignmentTakeover: (messageId: string) => void;
  onDenyAssignmentTakeover: (messageId: string) => void;
}

const Mailbox: React.FC<{
    messages: ChecklistMailboxMessage[];
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    currentUser: Officer;
    onApprove: (id: string) => void;
    onDeny: (id: string) => void;
}> = ({ messages, onMarkAsRead, onDelete, currentUser, onApprove, onDeny }) => {
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
    
    const canManageRequests = currentUser.departmentRoles.includes('Leitung Field Training Officer') || currentUser.departmentRoles.includes('Admin');

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
                        <h4 className="font-semibold text-sm text-center text-blue-400">FTO Benachrichtigungen</h4>
                    </div>
                    {messages.length > 0 ? (
                        <ul className="p-2 space-y-2">
                            {messages.map(msg => (
                                <li 
                                    key={msg.id} 
                                    className={`p-2 rounded-md border transition-colors ${msg.isRead ? 'bg-slate-800/50 border-slate-700/50' : 'bg-blue-900/40 border-blue-700/80'}`}
                                >
                                    <p className={`text-sm mb-1 ${msg.isRead ? 'text-gray-400' : 'text-gray-200'}`}>
                                        <strong>{msg.officerName}:</strong> {msg.message}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString('de-DE')}</span>
                                        <div className="flex gap-1">
                                            {msg.type === 'assignment_request' && canManageRequests ? (
                                                <>
                                                    <button onClick={() => onApprove(msg.id)} title="Annehmen" className="px-2 py-0.5 text-xs rounded-md bg-green-600 hover:bg-green-500 transition-colors">Annehmen</button>
                                                    <button onClick={() => onDeny(msg.id)} title="Ablehnen" className="px-2 py-0.5 text-xs rounded-md bg-red-600 hover:bg-red-500 transition-colors">Ablehnen</button>
                                                </>
                                            ) : (
                                                <>
                                                    {!msg.isRead && (
                                                        <button onClick={() => onMarkAsRead(msg.id)} title="Als gelesen markieren" className="p-1 rounded-full text-green-400 hover:bg-green-500/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                                                    )}
                                                    <button onClick={() => onDelete(msg.id)} title="Löschen" className="p-1 rounded-full text-red-400 hover:bg-red-500/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                                </>
                                            )}
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

const OfficerCard: React.FC<{ 
    officer: Officer; 
    onOpenChecklist: () => void;
    checklist: OfficerChecklist | undefined;
    calculateChecklistProgress: (checklist: OfficerChecklist | undefined) => { completed: number; total: number; percentage: number };
}> = ({ officer, onOpenChecklist, checklist, calculateChecklistProgress }) => {
    const isAssigned = checklist && checklist.assignedTo;
    const progress = calculateChecklistProgress(checklist);

    const getProgressColor = () => {
        if (progress.percentage === 100) return 'bg-green-500';
        if (progress.percentage > 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div 
            onClick={onOpenChecklist}
            className={`relative rounded-xl p-4 text-center flex flex-col items-center justify-between border group transition-all duration-200 cursor-pointer hover:-translate-y-1
                ${isAssigned 
                    ? 'bg-blue-900/50 border-blue-700 hover:border-blue-500' 
                    : 'bg-slate-800 border-slate-700/50 hover:border-blue-500/50'
                }
            `}
        >
            <div className="flex-1 flex flex-col items-center justify-center pt-4">
              {isAssigned && (
                <div className="px-2.5 py-1 text-xs text-blue-300 font-semibold mb-2 truncate bg-slate-700/80 border border-slate-600 rounded-full">
                    Zugewiesen an: {checklist.assignedTo}
                </div>
              )}
              <div className="text-sm font-bold text-slate-500 mb-1">{officer.badgeNumber}</div>
              <div className="text-6xl">{officer.gender === 'male' ? '👮🏻‍♂️' : '👮🏻‍♀️'}</div>
              <div className="flex flex-col mt-2">
                  <span className="text-xs text-blue-400 uppercase font-semibold tracking-wider">{officer.rank}</span>
                  <span className="font-medium text-base mt-1">{`${officer.firstName} ${officer.lastName}`}</span>
              </div>
            </div>
            <div className="w-full pt-3 mt-3 border-t border-slate-700/50">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>Fortschritt</span>
                    <span>{progress.completed} / {progress.total}</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-1.5">
                    <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor()}`} 
                        style={{ width: `${progress.percentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

const ChecklistPage: React.FC<ChecklistPageProps> = ({ 
    searchTerm, 
    setSearchTerm, 
    officers, 
    onOpenOfficerChecklist, 
    officerChecklists, 
    currentUser, 
    onOpenTemplateModal,
    checklistMailbox,
    onMarkChecklistMessageAsRead,
    onDeleteChecklistMessage,
    calculateChecklistProgress,
    onApproveAssignmentTakeover,
    onDenyAssignmentTakeover
}) => {
    const lieutenantIndex = RANKS.indexOf('Lieutenant');
    const currentUserRankIndex = RANKS.indexOf(currentUser.rank);
    const isHighRank = lieutenantIndex !== -1 && currentUserRankIndex >= lieutenantIndex;

    const hasFTOAccess = currentUser.departmentRoles.includes('Field Training Officer') 
        || currentUser.departmentRoles.includes('Leitung Field Training Officer') 
        || currentUser.departmentRoles.includes('Admin');
        
    const showWarning = isHighRank && !hasFTOAccess;

    const canEditTemplate = useMemo(() => 
        currentUser.departmentRoles.includes('Leitung Field Training Officer') || currentUser.departmentRoles.includes('Admin'),
        [currentUser.departmentRoles]
    );

    const filteredOfficers = useMemo(() => {
        if (!searchTerm) return officers;
        const lowercasedTerm = searchTerm.toLowerCase();
        return officers.filter(o =>
            `${o.firstName} ${o.lastName}`.toLowerCase().includes(lowercasedTerm) ||
            o.badgeNumber.toLowerCase().includes(lowercasedTerm) ||
            o.rank.toLowerCase().includes(lowercasedTerm)
        );
    }, [officers, searchTerm]);
    
    const canSeeMailbox = useMemo(() => 
        currentUser.departmentRoles.includes('Leitung Field Training Officer') || 
        currentUser.departmentRoles.includes('Admin'),
        [currentUser.departmentRoles]
    );

    const canSeeForceCompleteMessages = useMemo(() => 
        currentUser.departmentRoles.includes('Leitung Field Training Officer') ||
        currentUser.departmentRoles.includes('Admin'),
        [currentUser.departmentRoles]
    );

    const visibleMessages = useMemo(() => 
        checklistMailbox.filter(msg => 
            msg.type !== 'force_completed' || (msg.type === 'force_completed' && canSeeForceCompleteMessages)
        ), 
        [checklistMailbox, canSeeForceCompleteMessages]
    );


    return (
    <div className="relative flex flex-col h-full bg-slate-800 p-8">
      {showWarning && <SupervisoryAccessWarning />}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold text-blue-400">Checkliste</h1>
        <div className="flex items-center gap-4">
            {canSeeMailbox && (
                <Mailbox 
                    messages={visibleMessages} 
                    onMarkAsRead={onMarkChecklistMessageAsRead} 
                    onDelete={onDeleteChecklistMessage}
                    currentUser={currentUser}
                    onApprove={onApproveAssignmentTakeover}
                    onDeny={onDenyAssignmentTakeover}
                />
            )}
            {canEditTemplate && (
                <button
                    onClick={onOpenTemplateModal}
                    className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-500 transition-colors"
                >
                    Checkliste bearbeiten
                </button>
            )}
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Officer suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl border border-slate-700 p-6">
         {filteredOfficers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredOfficers.map(officer => (
                    <OfficerCard 
                        key={officer.id} 
                        officer={officer}
                        onOpenChecklist={() => onOpenOfficerChecklist(officer)}
                        checklist={officerChecklists[officer.id]}
                        calculateChecklistProgress={calculateChecklistProgress}
                    />
                ))}
            </div>
         ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Kein Officer gefunden.</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ChecklistPage;