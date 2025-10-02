import React, { useState, useEffect, useMemo } from 'react';
import { Officer, OfficerChecklist } from '../types';

interface OfficerChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    officer: Officer | null;
    checklist: OfficerChecklist | undefined;
    onUpdateContent: (officerId: string, content: string) => void;
    onUpdateNotes: (officerId: string, notes: string) => void;
    onToggleForceCompleteRequest: (officerId: string) => void;
    onAssign: (officerId: string) => void;
    onUnassign: (officerId: string) => void;
    checklistTemplate: string;
    currentUser: Officer;
    onUndoCompletion: (officerId: string) => void;
    onRequestAssignmentTakeover: (officer: Officer) => void;
}

const calculateChecklistProgress = (checklist: OfficerChecklist | undefined) => {
    if (!checklist) return { completed: 0, total: 0, percentage: 0 };
    
    if (checklist.isForceCompleted) {
        const lines = (checklist.content || '').split('\n');
        const total = lines.filter(line => line.trim() !== '' && !line.trim().startsWith('#')).length;
        return { completed: total, total: total > 0 ? total : 1, percentage: 100 };
    }
    
    const content = checklist.content;
    if (!content) return { completed: 0, total: 0, percentage: 0 };

    const lines = content.split('\n');
    const relevantLines = lines.filter(line => line.trim() !== '' && !line.trim().startsWith('#'));
    const total = relevantLines.length;
    const completed = relevantLines.filter(line => line.trim().startsWith('[x]')).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
};

const getProgressText = (checklist: OfficerChecklist | undefined, progress: { completed: number; total: number; }) => {
    if (checklist?.isForceCompleted) {
        return "Abschluss erzwungen";
    }
    if (progress.total > 0 && progress.completed === progress.total) {
        return "Checkliste beendet";
    }
    return `Abgeschlossen: ${progress.completed} von ${progress.total}`;
};

// A new component to render the markdown-like checklist content
const ChecklistRenderer: React.FC<{
    content: string;
    onCheckboxToggle: (lineIndex: number) => void;
    isReadOnly?: boolean;
}> = ({ content, onCheckboxToggle, isReadOnly = false }) => {
    const lines = content.split('\n');

    return (
        <div className="w-full h-full bg-slate-800 border border-slate-700 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto">
            {lines.map((line, index) => {
                // Heading: #Heading#
                const headingMatch = line.match(/^#(.*?)#$/);
                if (headingMatch) {
                    return <strong key={index} className="text-blue-400 text-lg block my-3 font-bold">{headingMatch[1]}</strong>;
                }

                // Normal text lines become checklist items
                if (line.trim() !== '') {
                    const isChecked = line.startsWith('[x] ');
                    const isFailed = line.startsWith('[o] ');
                    
                    const text = isChecked || isFailed ? line.substring(4) : line;

                    let textClasses = "ml-3 transition-colors";
                    if (isChecked) textClasses += " line-through text-green-400/70";
                    if (isFailed) textClasses += " line-through text-red-400/70";

                    const getBoxContent = () => {
                        if (isChecked) return '✓';
                        if (isFailed) return '✗';
                        return '';
                    };
                    const boxClasses = `w-5 h-5 border-2 rounded-md flex-shrink-0 flex items-center justify-center text-sm font-bold transition-all ${!isReadOnly ? 'cursor-pointer' : ''}
                        ${isChecked ? 'bg-green-500/20 border-green-500 text-green-300' : ''}
                        ${isFailed ? 'bg-red-500/20 border-red-500 text-red-300' : ''}
                        ${!isChecked && !isFailed ? `border-slate-500 ${!isReadOnly ? 'hover:border-blue-500' : ''}` : ''}
                    `;

                    return (
                        <div key={index} className="flex items-center my-2">
                            <span className={boxClasses} onClick={() => !isReadOnly && onCheckboxToggle(index)}>
                                {getBoxContent()}
                            </span>
                            <span className={textClasses}>{text}</span>
                        </div>
                    );
                }

                // Render empty lines to preserve spacing
                return <div key={index} className="h-4" />;
            })}
        </div>
    );
};

const OfficerChecklistModal: React.FC<OfficerChecklistModalProps> = ({ 
    isOpen, 
    onClose, 
    officer, 
    checklist,
    onUpdateContent,
    onAssign,
    onUnassign,
    checklistTemplate,
    currentUser,
    onUpdateNotes,
    onToggleForceCompleteRequest,
    onUndoCompletion,
    onRequestAssignmentTakeover
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [newNoteText, setNewNoteText] = useState('');
    const [isViewingCompleted, setIsViewingCompleted] = useState(false);
    
    const currentContent = checklist?.content || checklistTemplate || '';
    const progress = calculateChecklistProgress(checklist);
    const isCompleted = progress.percentage === 100 || checklist?.isForceCompleted;

    const getProgressColor = () => {
        if (progress.percentage === 100) return 'bg-green-500';
        if (progress.percentage > 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const isLeitungOrAdmin = useMemo(() =>
        currentUser.departmentRoles.includes('Leitung Field Training Officer') || currentUser.departmentRoles.includes('Admin'),
        [currentUser.departmentRoles]
    );

    const isAssignedToCurrentUser = useMemo(() =>
        checklist?.assignedTo === `${currentUser.firstName} ${currentUser.lastName}`,
        [checklist, currentUser]
    );

    const isChecklistAssigned = useMemo(() => !!checklist?.assignedTo, [checklist]);

    const isLockedForCurrentUser = useMemo(() =>
        isChecklistAssigned && !isAssignedToCurrentUser && !isLeitungOrAdmin,
        [isChecklistAssigned, isAssignedToCurrentUser, isLeitungOrAdmin]
    );
    
    const canRequestTakeover = useMemo(() =>
        !isLeitungOrAdmin && isLockedForCurrentUser && currentUser.departmentRoles.includes('Field Training Officer'),
        [isLeitungOrAdmin, isLockedForCurrentUser, currentUser.departmentRoles]
    );

    const canEditTemplate = isLeitungOrAdmin;

    const canViewNotes = useMemo(() =>
        currentUser.departmentRoles.includes('Field Training Officer') || isLeitungOrAdmin,
        [currentUser.departmentRoles, isLeitungOrAdmin]
    );
    
    const canForceComplete = useMemo(() =>
        (currentUser.departmentRoles.includes('Field Training Officer') || isLeitungOrAdmin) && !isLockedForCurrentUser,
        [currentUser.departmentRoles, isLeitungOrAdmin, isLockedForCurrentUser]
    );

    const canUndoCompletion = isLeitungOrAdmin;


    useEffect(() => {
        if (isOpen) {
            setIsEditing(false);
            setIsViewingCompleted(false);
            setEditedContent(currentContent);
            setNewNoteText('');
        }
    }, [isOpen, currentContent]);

    if (!isOpen || !officer) return null;

    const handleEnterEditMode = () => {
        setEditedContent(currentContent);
        setIsEditing(true);
    };

    const handleSave = () => {
        onUpdateContent(officer.id, editedContent);
        setIsEditing(false);
    };
    
    const handleAddNote = () => {
        if (!officer || newNoteText.trim() === '') return;
    
        const now = new Date();
        const timestamp = now.toLocaleString('de-DE', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const author = `${currentUser.firstName} ${currentUser.lastName}`;
    
        const newNoteEntry = `--- ${timestamp} | ${author} ---\n${newNoteText.trim()}`;
    
        const existingNotes = checklist?.notes || '';
        const updatedNotes = existingNotes ? `${newNoteEntry}\n\n${existingNotes}` : newNoteEntry;
    
        onUpdateNotes(officer.id, updatedNotes);
        setNewNoteText('');
    };

    const handleCheckboxToggle = (lineIndex: number) => {
        if (isLockedForCurrentUser || !checklist?.assignedTo) {
            return;
        }
        
        const lines = currentContent.split('\n');
        const line = lines[lineIndex];

        if (line.trim() === '' || line.trim().startsWith('#')) return;

        let newLine;
        if (line.startsWith('[x] ')) { // If checked, mark as failed
            newLine = `[o] ${line.substring(4)}`;
        } else if (line.startsWith('[o] ')) { // If failed, uncheck
            newLine = line.substring(4);
        } else { // If unchecked, mark as checked
            newLine = `[x] ${line}`;
        }
        
        lines[lineIndex] = newLine;
        onUpdateContent(officer.id, lines.join('\n'));
    };
    
    const progressText = getProgressText(checklist, progress);
    
    const isCompletedAndAcknowledged = isCompleted && checklist?.completionAcknowledged === true;

    const renderCompletedView = () => (
        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center bg-slate-800/50 rounded-lg">
            {isViewingCompleted ? (
                <>
                    <div className="w-full flex-1 flex flex-col overflow-hidden mb-4">
                        <ChecklistRenderer content={currentContent} onCheckboxToggle={() => {}} isReadOnly={true} />
                    </div>
                </>
            ) : (
                <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-100 mb-2">Checkliste abgeschlossen</h3>
                    <p className="max-w-xl text-gray-400 mb-6">
                        {checklist?.isForceCompleted
                            ? `Die Checkliste wurde von Officer ${officer.firstName} ${officer.lastName} vorzeitig beendet. Dennoch wurden alle bis zu diesem Zeitpunkt relevanten Punkte überprüft und entsprechend dokumentiert, sodass die Checkliste trotz der vorzeitigen Beendigung als abgeschlossen gilt.`
                            : `Die Checkliste wurde von Officer ${officer.firstName} ${officer.lastName} sorgfältig und in vollem Umfang durchgeführt. Alle vorgesehenen Punkte konnten erfolgreich überprüft und abgeschlossen werden. Damit ist die Checkliste ordnungsgemäß und ohne Einschränkungen beendet.`
                        }
                    </p>
                </>
            )}
             <div className="flex items-center gap-4 mt-6">
                {isViewingCompleted ? (
                    <button onClick={() => setIsViewingCompleted(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors">
                        Zurück zur Übersicht
                    </button>
                ) : (
                    <button onClick={() => setIsViewingCompleted(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors">
                        Checkliste ansehen
                    </button>
                )}

                {canUndoCompletion && (
                     <button 
                        onClick={() => onUndoCompletion(officer.id)} 
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md text-sm font-medium transition-colors"
                    >
                        Abschluss rückgängig machen
                    </button>
                )}
            </div>
        </div>
    );
    
    const renderActiveView = () => (
        <>
            <div className="flex-1 flex flex-col relative">
                {(isLockedForCurrentUser || !isChecklistAssigned) && (
                     <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-lg z-10 flex flex-col items-center justify-center text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="text-lg font-bold text-gray-200">{isLockedForCurrentUser ? 'Checkliste gesperrt' : 'Checkliste nicht zugewiesen'}</h3>
                        <p className="text-gray-400 max-w-sm">
                            {isLockedForCurrentUser 
                                ? `Diese Checkliste ist bereits Officer ${checklist?.assignedTo} zugewiesen und kann nur von dieser Person, der FTO-Leitung oder einem Admin bearbeitet werden.`
                                : 'Bitte weisen Sie sich zuerst einem Officer zu, um die Checkliste zu bearbeiten.'
                            }
                        </p>
                        {canRequestTakeover && (
                             <button
                                onClick={() => onRequestAssignmentTakeover(officer)}
                                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors"
                            >
                                Anfrage zur Zuweisung senden
                            </button>
                        )}
                    </div>
                )}
                {isEditing ? (
                    <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-full bg-slate-800 border border-slate-700 rounded-md p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                ) : (
                    <ChecklistRenderer content={currentContent} onCheckboxToggle={handleCheckboxToggle} isReadOnly={isLockedForCurrentUser || !isChecklistAssigned} />
                )}
            </div>

            {canViewNotes && (
                <div className="w-1/3 flex flex-col gap-2">
                    <h3 className="text-base font-semibold text-blue-400">FTO Notizen (geteilt)</h3>
                     <div className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm overflow-y-auto whitespace-pre-wrap">
                        {checklist?.notes || <span className="text-gray-500">Noch keine Notizen vorhanden.</span>}
                    </div>
                    <textarea
                        value={newNoteText}
                        onChange={e => setNewNoteText(e.target.value)}
                        placeholder="Neue Notiz hinzufügen..."
                        className="w-full h-24 bg-slate-800 border border-slate-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        disabled={!checklist?.assignedTo}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleAddNote}
                            disabled={!checklist?.assignedTo || !newNoteText.trim()}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-medium transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
                        >
                            Notiz hinzufügen
                        </button>
                    </div>
                </div>
            )}
        </>
    );

    const renderAssignButton = () => {
        if (isLockedForCurrentUser) {
            return <div className="px-3 py-1.5 text-xs font-semibold rounded-md text-gray-400 bg-slate-700">Zugewiesen an: {checklist.assignedTo}</div>;
        }
        if (isAssignedToCurrentUser || (isLeitungOrAdmin && isChecklistAssigned)) {
            return <button onClick={() => onUnassign(officer.id)} className="px-3 py-1.5 text-xs font-semibold rounded-md text-yellow-300 bg-yellow-600/30 hover:bg-yellow-600/50 transition-colors">Zuweisung aufheben</button>;
        }
        if (!isChecklistAssigned) {
            return <button onClick={() => onAssign(officer.id)} className="px-3 py-1.5 text-xs font-semibold rounded-md text-green-300 bg-green-600/30 hover:bg-green-600/50 transition-colors">Sich selbst zuweisen</button>;
        }
        return null;
    };


    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-6xl h-[90%] rounded-xl shadow-2xl border border-slate-700 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-blue-400 truncate pr-4">
                           Checkliste für: {`${officer.firstName} ${officer.lastName}`}
                        </h2>
                       {!isCompletedAndAcknowledged && (
                         <>
                            <div className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${progress.percentage === 100 ? 'bg-green-600/30 text-green-300' : 'bg-slate-700 text-gray-300'}`}>
                                <span>{progressText}</span>
                                <div className="w-16 bg-slate-600 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full transition-all duration-500 ${getProgressColor()}`} style={{ width: `${progress.percentage}%` }}></div>
                                </div>
                            </div>
                            {isChecklistAssigned && (
                                <div className="flex items-center gap-2">
                                    <label className="switch" title={!canForceComplete ? "Nur der zugewiesene FTO kann dies tun." : "Abschluss erzwingen"}>
                                        <input type="checkbox" checked={!!checklist?.isForceCompleted} onChange={() => onToggleForceCompleteRequest(officer.id)} disabled={!canForceComplete} />
                                        <span className="slider"></span>
                                    </label>
                                    <span className="text-xs font-medium text-gray-400">Abschluss erzwingen</span>
                                </div>
                            )}
                         </>
                       )}
                    </div>
                    <div className="flex items-center gap-2">
                         {!isCompletedAndAcknowledged && (
                            <>
                                {renderAssignButton()}
                                
                                {canEditTemplate && !isEditing && checklist?.assignedTo && (
                                    <button onClick={handleEnterEditMode} className="p-2 rounded-full hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 transition-colors" title="Checkliste bearbeiten">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                            </>
                         )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
                
                {isCompletedAndAcknowledged ? renderCompletedView() : (
                    <div className="p-6 flex-1 flex overflow-hidden gap-6">
                        {renderActiveView()}
                    </div>
                )}


                {isEditing && (
                    <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors">Abbrechen</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors">Speichern</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficerChecklistModal;