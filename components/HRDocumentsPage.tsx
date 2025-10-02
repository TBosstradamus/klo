import React from 'react';
import { Document } from '../types';

interface HRDocumentsPageProps {
  documents: Document[];
  onOpenDocument: (doc: Document) => void;
  onBack: () => void;
  onOpenAddDocument: () => void;
  onRequestDelete: (doc: Document) => void;
}

const DocumentItem: React.FC<{ document: Document; onClick: () => void; onDelete: () => void; }> = ({ document, onClick, onDelete }) => {
  return (
    <div
      className="group w-full text-left p-4 rounded-lg bg-slate-700/50 border border-slate-600 hover:bg-blue-500/20 hover:border-blue-500 transition-all duration-200 flex justify-between items-center"
    >
      <button onClick={onClick} className="flex-1 text-left">
        <h3 className="text-lg font-semibold text-gray-200">{document.title}</h3>
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Dokument löschen"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

const HRDocumentsPage: React.FC<HRDocumentsPageProps> = ({ documents, onOpenDocument, onBack, onOpenAddDocument, onRequestDelete }) => {
  return (
    <div className="flex flex-col h-full bg-slate-800 p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-blue-400">Dokumente</h1>
        <div className="flex items-center gap-4">
            <button
                onClick={onOpenAddDocument}
                className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-500 transition-colors"
            >
                Dokument erstellen
            </button>
            <button
                onClick={onBack}
                className="px-4 py-2 text-sm font-semibold rounded-md text-gray-200 bg-slate-700 hover:bg-blue-500 transition-colors"
            >
                Zurück zur Personalabteilung
            </button>
        </div>
      </div>
      <div className="w-full max-w-2xl mx-auto space-y-4">
        {documents.map(doc => (
            <DocumentItem 
                key={doc.id} 
                document={doc} 
                onClick={() => onOpenDocument(doc)} 
                onDelete={() => onRequestDelete(doc)}
            />
        ))}
        {documents.length === 0 && (
            <p className="text-center text-gray-500 mt-8">Keine Dokumente vorhanden. Erstellen Sie ein neues!</p>
        )}
      </div>
    </div>
  );
};

export default HRDocumentsPage;
