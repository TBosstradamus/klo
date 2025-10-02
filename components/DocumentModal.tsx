import React, { useState, useEffect } from 'react';
import { Document } from '../types';

interface DocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
    onUpdate: (document: Document) => void;
    onRequestDelete: (document: Document) => void;
}

const colorMap: { [key: string]: string } = {
  rot: 'text-red-500',
  grün: 'text-green-500',
  blau: 'text-blue-500',
  orange: 'text-orange-500',
  gelb: 'text-yellow-500',
};

const parseFormattedText = (text: string): React.ReactNode => {
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    const regex = /#([^#()]+)\((rot|grün|blau|orange|gelb)\)#|#([^#]+)#|(\w+)\((rot|grün|blau|orange|gelb)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            elements.push(text.substring(lastIndex, match.index));
        }

        if (match[1] && match[2]) { // Case: #word(color)#
            const word = match[1];
            const color = match[2];
            const colorClass = colorMap[color] || '';
            elements.push(<strong key={match.index}><span className={colorClass}>{word}</span></strong>);
        } else if (match[3]) { // Case: #word#
            elements.push(<strong key={match.index}>{match[3]}</strong>);
        } else if (match[4] && match[5]) { // Case: word(color)
            const word = match[4];
            const color = match[5];
            const colorClass = colorMap[color] || '';
            elements.push(<span key={match.index} className={colorClass}>{word}</span>);
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
    }
    
    return <>{elements.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>)}</>;
};

const ContentView: React.FC<{ content: string; }> = ({ content }) => {
    const lines = content.split('\n');

    return (
        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 text-gray-300 leading-relaxed">
            {lines.map((line, index) => {
                if (line.startsWith('- ')) {
                    const itemContent = line.substring(2);
                    return (
                        <div key={index} className="flex items-start pl-4">
                            <span className="mr-2 mt-1 text-blue-400">•</span>
                            <div className="flex-1">{parseFormattedText(itemContent)}</div>
                        </div>
                    );
                }
                if (line.trim() === '') {
                    return <div key={index} className="h-4" />;
                }
                return <p key={index}>{parseFormattedText(line)}</p>;
            })}
        </div>
    );
};

const EditView: React.FC<{ 
    document: Document;
    onSave: (updatedDocument: Document) => void; 
    onCancel: () => void;
    onRequestDelete: (document: Document) => void;
}> = ({ document, onSave, onCancel, onRequestDelete }) => {
    const [title, setTitle] = useState(document.title);
    const [content, setContent] = useState(document.content);

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Titel</label>
                 <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Inhalt</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={15}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex justify-between items-center mt-4">
                <button onClick={() => onRequestDelete(document)} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md text-sm font-medium transition-colors">Löschen</button>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors">Abbrechen</button>
                    <button onClick={() => onSave({ ...document, title, content })} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors">Speichern</button>
                </div>
            </div>
        </div>
    );
};


const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, document, onUpdate, onRequestDelete }) => {
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen]);

    if (!isOpen || !document) return null;
    
    const handleSave = (updatedDocument: Document) => {
        onUpdate(updatedDocument);
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-4xl rounded-xl shadow-2xl border border-slate-700 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-blue-400 truncate pr-4">{isEditing ? "Dokument bearbeiten" : document.title}</h2>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="p-2 rounded-full hover:bg-yellow-500/20 text-yellow-400 hover:text-yellow-300 transition-colors" title="Dokument bearbeiten">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {isEditing ? (
                        <EditView 
                            document={document} 
                            onSave={handleSave} 
                            onCancel={() => setIsEditing(false)} 
                            onRequestDelete={onRequestDelete}
                        />
                    ) : (
                        <ContentView content={document.content} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentModal;