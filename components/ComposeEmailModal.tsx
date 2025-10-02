import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Officer, EmailAttachment, DepartmentRole, DEPARTMENT_ROLES, RANKS, Email, EmailLabel, EMAIL_LABELS } from '../types';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Officer;
  officers: Officer[];
  onSend: (data: { recipients: Officer[]; cc: Officer[]; subject: string; body: string; attachments: EmailAttachment[], label?: EmailLabel }, draftId?: string | null) => void;
  draftToEdit?: Email | null;
  onSaveDraft: (draftData: Partial<Email>) => Promise<Email>;
  onDeleteDraft: (emailId: string) => void;
}

const RecipientInput: React.FC<{
    label: string;
    placeholder: string;
    allOfficers: Officer[];
    selected: Officer[];
    onSelect: (officer: Officer) => void;
    onRemove: (officerId: string) => void;
    value: string;
    onChange: (value: string) => void;
}> = ({ label, placeholder, allOfficers, selected, onSelect, onRemove, value, onChange }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredOfficers = useMemo(() => {
        if (!value) return [];
        const selectedIds = new Set(selected.map(o => o.id));
        const lowercasedTerm = value.toLowerCase();
        return allOfficers.filter(o =>
            !selectedIds.has(o.id) &&
            (`${o.firstName} ${o.lastName}`.toLowerCase().includes(lowercasedTerm) ||
             o.badgeNumber.includes(value))
        ).slice(0, 5);
    }, [value, allOfficers, selected]);
    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setShowSuggestions(false);
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, [wrapperRef]);

    return (
        <div ref={wrapperRef}>
            <label className="block text-sm font-medium text-slate-400">{label}</label>
            <div className="mt-1 flex flex-wrap items-center gap-2 p-2 bg-slate-800 border border-slate-700 rounded-lg">
                {selected.map(officer => (
                    <div key={officer.id} className="flex items-center gap-1.5 bg-blue-600/50 text-blue-200 text-sm px-2 py-1 rounded-full">
                        <span>{`${officer.firstName} ${officer.lastName}`}</span>
                        <button onClick={() => onRemove(officer.id)} className="text-blue-200 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ))}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={placeholder}
                        className="w-full min-w-[150px] bg-transparent focus:outline-none text-sm"
                    />
                    {showSuggestions && filteredOfficers.length > 0 && (
                        <ul className="absolute z-10 w-full bg-slate-700 border border-slate-600 mt-2 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredOfficers.map(o => (
                                <li key={o.id} onClick={() => { onSelect(o); onChange(''); setShowSuggestions(false); }} className="px-3 py-2 hover:bg-blue-500/20 cursor-pointer text-sm">
                                    {`${o.firstName} ${o.lastName}`} <span className="text-xs text-slate-400">(#{o.badgeNumber})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({ isOpen, onClose, currentUser, officers, onSend, draftToEdit, onSaveDraft, onDeleteDraft }) => {
    const [recipients, setRecipients] = useState<Officer[]>([]);
    const [recipientSearch, setRecipientSearch] = useState('');
    const [cc, setCc] = useState<Officer[]>([]);
    const [ccSearch, setCcSearch] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [label, setLabel] = useState<EmailLabel | undefined>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const otherOfficers = useMemo(() => officers.filter(o => o.id !== currentUser.id), [officers, currentUser.id]);
    
    const sergeantRankIndex = RANKS.indexOf('Sergeant');
    const canLabel = sergeantRankIndex !== -1 && RANKS.indexOf(currentUser.rank) >= sergeantRankIndex;
    
    const isSergeantOrHigher = useMemo(() => {
        const sergeantIndex = RANKS.indexOf('Sergeant');
        if (sergeantIndex === -1) return false;
        const currentUserRankIndex = RANKS.indexOf(currentUser.rank);
        return currentUserRankIndex >= sergeantIndex || currentUser.departmentRoles.includes('Leitung Personalabteilung');
    }, [currentUser.rank, currentUser.departmentRoles]);

    useEffect(() => {
        if (ccSearch.toLowerCase().includes('@lspd')) {
            const existingRecipientIds = new Set(recipients.map(o => o.id));
            const existingCcIds = new Set(cc.map(o => o.id));
            const lspdMembers = officers.filter(o => 
                o.departmentRoles.includes('LSPD') &&
                !existingRecipientIds.has(o.id) &&
                !existingCcIds.has(o.id) &&
                 o.id !== currentUser.id
            );
            
            setCc(prev => [...prev, ...lspdMembers]);
            setCcSearch(prev => prev.toLowerCase().replace('@lspd', '').trim());
        }
    }, [ccSearch, officers, recipients, cc, currentUser.id]);

    useEffect(() => {
        if (isOpen) {
            if (draftToEdit) {
                setRecipients(draftToEdit.recipientIds.map(id => officers.find(o => o.id === id)).filter((o): o is Officer => !!o));
                setCc(draftToEdit.ccIds.map(id => officers.find(o => o.id === id)).filter((o): o is Officer => !!o));
                setSubject(draftToEdit.subject);
                setBody(draftToEdit.body);
                setAttachments(draftToEdit.attachments);
                setDraftId(draftToEdit.id);
                setLabel(draftToEdit.label);
            } else {
                setRecipients([]);
                setCc([]);
                setRecipientSearch('');
                setCcSearch('');
                setSubject('');
                setBody('');
                setAttachments([]);
                setDraftId(null);
                setLabel(undefined);
            }
        }
    }, [isOpen, draftToEdit, officers]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            files.forEach((file: File) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newAttachment: EmailAttachment = {
                        fileName: file.name,
                        dataUrl: event.target?.result as string,
                    };
                    setAttachments(prev => [...prev, newAttachment]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveAttachment = (fileName: string) => {
        setAttachments(prev => prev.filter(att => att.fileName !== fileName));
    };

    const handleSend = () => {
        if (recipients.length > 0) {
            onSend({ recipients, cc, subject, body, attachments, label }, draftId);
        }
    };
    
    const handleAddDepartment = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const department = e.target.value as DepartmentRole;
        if (!department) return;

        const departmentMembers = officers.filter(o => o.departmentRoles.includes(department));
        
        setRecipients(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newRecipients = departmentMembers.filter(m => !existingIds.has(m.id));
            return [...prev, ...newRecipients];
        });

        e.target.value = ''; // Reset dropdown
    };

    const handleClose = async () => {
        const isEssentiallyEmpty = !subject.trim() && !body.trim() && recipients.length === 0 && cc.length === 0 && attachments.length === 0 && !label;

        if (isEssentiallyEmpty) {
            if (draftId) {
                onDeleteDraft(draftId);
            }
        } else {
            const draftData: Partial<Email> = {
                id: draftId || undefined,
                recipientIds: recipients.map(o => o.id),
                ccIds: cc.map(o => o.id),
                subject,
                body,
                attachments,
                status: 'draft',
                label,
            };
            await onSaveDraft(draftData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity" onClick={handleClose}>
            <div className="bg-slate-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl border border-gray-800 flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
                    <h2 className="text-xl font-bold text-blue-400">Neue E-Mail</h2>
                    <button onClick={handleClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Schließen">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <main className="p-4 flex-1 flex flex-col gap-4 overflow-hidden">
                    {isSergeantOrHigher && (
                        <div className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg border border-slate-700">
                            <span className="text-sm font-semibold text-slate-400">Schnellauswahl (An):</span>
                            <select 
                                onChange={handleAddDepartment}
                                className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="">Abteilung auswählen...</option>
                                {DEPARTMENT_ROLES.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <RecipientInput
                        label="An:"
                        placeholder="Empfänger hinzufügen..."
                        allOfficers={otherOfficers}
                        selected={recipients}
                        onSelect={(o) => setRecipients(prev => [...prev, o])}
                        onRemove={(id) => setRecipients(prev => prev.filter(o => o.id !== id))}
                        value={recipientSearch}
                        onChange={setRecipientSearch}
                    />
                    <RecipientInput
                        label="CC:"
                        placeholder="CC hinzufügen oder @LSPD eingeben..."
                        allOfficers={otherOfficers}
                        selected={cc}
                        onSelect={(o) => setCc(prev => [...prev, o])}
                        onRemove={(id) => setCc(prev => prev.filter(o => o.id !== id))}
                        value={ccSearch}
                        onChange={setCcSearch}
                    />
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Betreff"
                            className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {canLabel && (
                            <select value={label || ''} onChange={e => setLabel(e.target.value as EmailLabel || undefined)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Kein Label</option>
                                {(Object.keys(EMAIL_LABELS) as EmailLabel[]).map(lbl => (
                                    <option key={lbl} value={lbl}>{lbl}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="Ihre Nachricht..."
                        className="w-full flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-2 border border-slate-700 rounded-lg">
                            {attachments.map(att => (
                                <div key={att.fileName} className="relative w-20 h-20 rounded-md overflow-hidden">
                                    <img src={att.dataUrl} alt={att.fileName} className="w-full h-full object-cover" />
                                    <button onClick={() => handleRemoveAttachment(att.fileName)} className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full hover:bg-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                <footer className="flex justify-between items-center p-4 border-t border-slate-800 flex-shrink-0">
                    <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-full text-slate-400 hover:bg-slate-700 transition-colors"
                        title="Dateien anhängen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={recipients.length === 0}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
                    >
                        Senden
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ComposeEmailModal;