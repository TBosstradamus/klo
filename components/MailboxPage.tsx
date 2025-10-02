import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Officer, Email, EmailLabel, EMAIL_LABELS, RANKS } from '../types';

interface MailboxPageProps {
  currentUser: Officer;
  emails: Email[];
  officers: Officer[];
  onOpenCompose: () => void;
  onMarkAsRead: (emailId: string) => void;
  onDelete: (emailId: string) => void;
  onToggleStar: (emailId: string) => void;
  onOpenDraft: (email: Email) => void;
  onSetLabel: (emailId: string, label: EmailLabel | null) => void;
}

const officerMap = new Map<string, Officer>();

const EmailListItem: React.FC<{
  email: Email;
  onSelect: () => void;
  onToggleStar: (e: React.MouseEvent) => void;
  isSelected: boolean;
  currentUser: Officer;
  type: 'inbox' | 'sent' | 'starred' | 'drafts' | EmailLabel;
}> = ({ email, onSelect, onToggleStar, isSelected, currentUser, type }) => {
  const isRead = email.readBy.includes(currentUser.id);
  const isStarred = email.starredBy.includes(currentUser.id);
  const sender = officerMap.get(email.senderId);

  const getDisplayName = () => {
    const recipients = email.recipientIds.map(id => officerMap.get(id)).filter(Boolean) as Officer[];
    if (type === 'sent' || type === 'drafts') {
        if (recipients.length > 1) {
            return `${recipients[0].firstName} ${recipients[0].lastName} +${recipients.length - 1}`;
        }
        if (recipients.length === 1) {
            return `${recipients[0].firstName} ${recipients[0].lastName}`;
        }
        return <span className="text-red-400">Entwurf</span>;
    }
    return sender ? `${sender.firstName} ${sender.lastName}` : 'Unbekannter Absender';
  };
  
  const subjectDisplay = email.subject || <span className="italic text-slate-500">(Kein Betreff)</span>;
  const labelColor = email.label ? EMAIL_LABELS[email.label] : null;

  return (
    <li
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 flex gap-3 items-start ${
        isSelected
          ? 'bg-blue-600/30 border-blue-500'
          : `border-transparent hover:bg-slate-700/50 ${!isRead && type === 'inbox' ? 'bg-slate-700' : 'bg-slate-800'}`
      }`}
    >
      <div className="flex flex-col items-center gap-2 pt-1">
        <button onClick={onToggleStar} title={isStarred ? "Markierung aufheben" : "Markieren"} className="text-slate-500 hover:text-orange-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isStarred ? 'text-orange-400' : ''}`} viewBox="0 0 20 20" fill={isStarred ? "currentColor" : "none"} stroke="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
        {!isRead && type === 'inbox' && <div className="w-2 h-2 bg-blue-500 rounded-full" title="Ungelesen"></div>}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2 truncate">
            {labelColor && <div className={`w-2.5 h-2.5 rounded-full bg-${labelColor}-500`} title={email.label}></div>}
            <p className={`truncate font-semibold ${!isRead && type === 'inbox' ? 'text-white' : 'text-slate-300'}`}>
              {getDisplayName()}
            </p>
          </div>
          <time className="text-xs text-slate-500 flex-shrink-0 ml-2">
            {new Date(email.timestamp).toLocaleDateString('de-DE')}
          </time>
        </div>
        <p className={`truncate text-sm ${!isRead && type === 'inbox' ? 'text-blue-300 font-medium' : 'text-slate-400'}`}>
          {subjectDisplay}
        </p>
        <p className="truncate text-xs text-slate-500 mt-1">
          {email.body.substring(0, 80)}
        </p>
      </div>
    </li>
  );
};

const LabelDropdown: React.FC<{
  onSetLabel: (label: EmailLabel | null) => void;
  currentLabel?: EmailLabel;
}> = ({ onSetLabel, currentLabel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

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
            <button onClick={() => setIsOpen(!isOpen)} title="Label ändern" className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a1 1 0 011-1h5a.997.997 0 01.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20">
                    <ul className="p-1">
                        {(Object.keys(EMAIL_LABELS) as EmailLabel[]).map(label => {
                            const color = EMAIL_LABELS[label];
                            return (
                                <li key={label}>
                                    <button onClick={() => { onSetLabel(label); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-slate-700">
                                        <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500`}></div>
                                        <span>{label}</span>
                                    </button>
                                </li>
                            );
                        })}
                        <li className="border-t border-slate-700 my-1"></li>
                        <li>
                            <button onClick={() => { onSetLabel(null); setIsOpen(false); }} className="w-full px-3 py-2 rounded text-sm text-slate-400 hover:bg-slate-700">
                                Label entfernen
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};


const MailboxPage: React.FC<MailboxPageProps> = ({
  currentUser,
  emails,
  officers,
  onOpenCompose,
  onMarkAsRead,
  onDelete,
  onToggleStar,
  onOpenDraft,
  onSetLabel,
}) => {
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent' | 'starred' | 'drafts' | EmailLabel>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  officers.forEach(o => officerMap.set(o.id, o));

  const sergeantRankIndex = RANKS.indexOf('Sergeant');
  const canLabel = sergeantRankIndex !== -1 && RANKS.indexOf(currentUser.rank) >= sergeantRankIndex;

  const inboxEmails = useMemo(() =>
    emails.filter(email =>
        (email.recipientIds.includes(currentUser.id) || email.ccIds.includes(currentUser.id)) &&
        !email.isDeletedFor.includes(currentUser.id) && email.status === 'sent'
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [emails, currentUser.id]
  );

  const sentEmails = useMemo(() =>
    emails.filter(email =>
        email.senderId === currentUser.id &&
        !email.isDeletedFor.includes(currentUser.id) && email.status === 'sent'
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [emails, currentUser.id]
  );
  
  const starredEmails = useMemo(() =>
    emails.filter(email =>
        email.starredBy.includes(currentUser.id) &&
        !email.isDeletedFor.includes(currentUser.id)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [emails, currentUser.id]
  );

  const draftEmails = useMemo(() =>
    emails.filter(email =>
        email.status === 'draft' &&
        email.senderId === currentUser.id &&
        !email.isDeletedFor.includes(currentUser.id)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [emails, currentUser.id]
  );

  const labeledEmails = useMemo(() => (
    (Object.keys(EMAIL_LABELS) as EmailLabel[]).reduce((acc, label) => {
        acc[label] = emails.filter(email =>
            email.label === label &&
            !email.isDeletedFor.includes(currentUser.id) &&
            (email.recipientIds.includes(currentUser.id) || email.ccIds.includes(currentUser.id) || email.senderId === currentUser.id)
        ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return acc;
    }, {} as Record<EmailLabel, Email[]>)
  ), [emails, currentUser.id]);

  const selectedEmail = useMemo(() =>
    emails.find(e => e.id === selectedEmailId),
    [emails, selectedEmailId]
  );

  const handleSelectEmail = (email: Email) => {
    if (activeFolder === 'drafts') {
        onOpenDraft(email);
    } else {
        setSelectedEmailId(email.id);
        onMarkAsRead(email.id);
    }
  };
  
  const handleDeleteSelectedEmail = () => {
    if (selectedEmailId) {
        onDelete(selectedEmailId);
        setSelectedEmailId(null);
    }
  };
  
  const handleToggleStarSelectedEmail = () => {
      if (selectedEmailId) {
          onToggleStar(selectedEmailId);
      }
  };

  const handleSetLabelForSelectedEmail = (label: EmailLabel | null) => {
    if (selectedEmailId) {
        onSetLabel(selectedEmailId, label);
    }
  };

  const emailLists = {
      inbox: inboxEmails,
      sent: sentEmails,
      starred: starredEmails,
      drafts: draftEmails,
      ...labeledEmails,
  };

  const currentEmailList = emailLists[activeFolder];
  const unreadCount = useMemo(() => inboxEmails.filter(e => !e.readBy.includes(currentUser.id)).length, [inboxEmails, currentUser.id]);

  const folderItems = [
    { id: 'inbox', label: 'Posteingang', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-8-4-8 4" /></svg>, count: unreadCount },
    { id: 'starred', label: 'Markiert', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>, count: starredEmails.length },
    { id: 'drafts', label: 'Entwürfe', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>, count: draftEmails.length },
    { id: 'sent', label: 'Gesendet', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>, count: sentEmails.length },
  ] as const;


  return (
    <div className="h-screen w-full flex text-slate-300 bg-slate-900">
      <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
        <button onClick={onOpenCompose} className="w-full mb-6 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
          Neue E-Mail
        </button>
        <nav>
          <ul className="space-y-1">
            {folderItems.map(item => (
              <li key={item.id}>
                <button onClick={() => { setActiveFolder(item.id); setSelectedEmailId(null); }} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex justify-between items-center transition-colors gap-3 ${activeFolder === item.id ? 'bg-blue-600/30 text-white' : 'hover:bg-slate-800'}`}>
                  <div className="flex items-center gap-3">{item.icon}<span>{item.label}</span></div>
                  {item.count > 0 && <span className={`px-2 py-0.5 text-xs rounded-full ${activeFolder === item.id ? 'bg-blue-500/50 text-white' : 'bg-slate-700'}`}>{item.count}</span>}
                </button>
              </li>
            ))}
             <li className="pt-2 mt-2 border-t border-slate-800"><p className="px-3 text-xs font-semibold text-slate-500 uppercase">Labels</p></li>
            {(Object.keys(EMAIL_LABELS) as EmailLabel[]).map(label => {
                const color = EMAIL_LABELS[label];
                const count = labeledEmails[label].length;
                return (
                    <li key={label}>
                        <button onClick={() => { setActiveFolder(label); setSelectedEmailId(null); }} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex justify-between items-center transition-colors gap-3 ${activeFolder === label ? 'bg-blue-600/30 text-white' : 'hover:bg-slate-800'}`}>
                            <div className="flex items-center gap-3"><div className={`w-2.5 h-2.5 rounded-full bg-${color}-500`}></div><span>{label}</span></div>
                            {count > 0 && <span className={`px-2 py-0.5 text-xs rounded-full ${activeFolder === label ? 'bg-blue-500/50 text-white' : 'bg-slate-700'}`}>{count}</span>}
                        </button>
                    </li>
                );
            })}
          </ul>
        </nav>
      </aside>

      <section className="w-96 flex-shrink-0 bg-slate-800/50 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800"><h2 className="text-xl font-bold">{folderItems.find(f => f.id === activeFolder)?.label || activeFolder}</h2></div>
        <ul className="flex-1 overflow-y-auto p-2 space-y-1">
          {currentEmailList.map(email => (
            <EmailListItem key={email.id} email={email} onSelect={() => handleSelectEmail(email)} onToggleStar={(e) => { e.stopPropagation(); onToggleStar(email.id); }} isSelected={selectedEmailId === email.id} currentUser={currentUser} type={activeFolder} />
          ))}
          {currentEmailList.length === 0 && <div className="text-center text-slate-500 pt-10">Keine E-Mails hier.</div>}
        </ul>
      </section>

      <main className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            <div className="p-4 border-b border-gray-800 flex-shrink-0">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {selectedEmail.label && <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${EMAIL_LABELS[selectedEmail.label]}-500/20 text-${EMAIL_LABELS[selectedEmail.label]}-300`}>{selectedEmail.label}</span>}
                    <h3 className="text-2xl font-bold text-slate-100">{selectedEmail.subject || "(Kein Betreff)"}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{new Date(selectedEmail.timestamp).toLocaleString('de-DE')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {canLabel && <LabelDropdown onSetLabel={handleSetLabelForSelectedEmail} currentLabel={selectedEmail.label} />}
                  <button onClick={handleToggleStarSelectedEmail} title={selectedEmail.starredBy.includes(currentUser.id) ? "Markierung aufheben" : "Markieren"} className="p-2 text-slate-400 hover:text-orange-400 rounded-full hover:bg-slate-700/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${selectedEmail.starredBy.includes(currentUser.id) ? 'text-orange-400' : ''}`} viewBox="0 0 20 20" fill={selectedEmail.starredBy.includes(currentUser.id) ? "currentColor" : "none"} stroke="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </button>
                  <button onClick={handleDeleteSelectedEmail} title="Löschen" className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
              <div className="mt-4 text-sm space-y-1">
                <p><span className="font-semibold text-slate-500 w-12 inline-block">Von:</span> {officerMap.get(selectedEmail.senderId)?.firstName} {officerMap.get(selectedEmail.senderId)?.lastName}</p>
                <p><span className="font-semibold text-slate-500 w-12 inline-block">An:</span> {selectedEmail.recipientIds.map(id => officerMap.get(id)?.firstName + ' ' + officerMap.get(id)?.lastName).join(', ')}</p>
                {selectedEmail.ccIds.length > 0 && <p><span className="font-semibold text-slate-500 w-12 inline-block">CC:</span> {selectedEmail.ccIds.map(id => officerMap.get(id)?.firstName + ' ' + officerMap.get(id)?.lastName).join(', ')}</p>}
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="whitespace-pre-wrap leading-relaxed">{selectedEmail.body}</p>
              {selectedEmail.attachments.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-800">
                  <h4 className="font-semibold mb-2">Anhänge</h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedEmail.attachments.map((att, index) => (
                      <a key={index} href={att.dataUrl} target="_blank" rel="noopener noreferrer" className="block w-32 h-32 rounded-lg overflow-hidden border-2 border-slate-700 hover:border-blue-500 transition-colors">
                        <img src={att.dataUrl} alt={att.fileName} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <p className="mt-4 text-lg">Wählen Sie eine E-Mail aus, um sie zu lesen</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MailboxPage;
