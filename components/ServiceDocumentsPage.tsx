import React, { useMemo } from 'react';
import { Document, Officer, RANKS } from '../types';

interface ServiceDocumentsPageProps {
  documents: Document[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenDocument: (document: Document) => void;
  onOpenAddDocument: () => void;
  currentUser: Officer;
}

const DocumentCard: React.FC<{ document: Document; onOpen: () => void; }> = ({ document, onOpen }) => {
    return (
        <div 
            onClick={onOpen}
            className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 flex flex-col justify-center h-24 cursor-pointer hover:border-blue-500 hover:bg-slate-700/50 transition-all duration-200"
        >
            <h3 className="text-lg font-bold text-blue-400 text-center truncate">{document.title}</h3>
        </div>
    );
};

const ServiceDocumentsPage: React.FC<ServiceDocumentsPageProps> = ({ documents, searchTerm, setSearchTerm, onOpenDocument, onOpenAddDocument, currentUser }) => {

    const commanderIndex = RANKS.indexOf('Commander');
    const currentUserRankIndex = RANKS.indexOf(currentUser.rank);
    const isHighRank = commanderIndex !== -1 && currentUserRankIndex >= commanderIndex;

    const canCreateDocuments = useMemo(() => 
        currentUser.departmentRoles.includes('Admin') || isHighRank || currentUser.departmentRoles.includes('Leitung Personalabteilung'),
    [currentUser, isHighRank]);

    const filteredDocuments = useMemo(() => {
        if (!searchTerm) return documents;
        const lowercasedTerm = searchTerm.toLowerCase();
        return documents.filter(doc => 
            doc.title.toLowerCase().includes(lowercasedTerm) || 
            doc.content.toLowerCase().includes(lowercasedTerm)
        );
    }, [documents, searchTerm]);

    return (
    <div className="relative flex flex-col h-full bg-slate-800 p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-4xl font-bold text-blue-400">Dienstdokumente</h1>
        {canCreateDocuments && (
          <button
            onClick={onOpenAddDocument}
            className="px-4 py-2 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-500 transition-colors"
          >
            Dokument erstellen
          </button>
        )}
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Dokumente nach Titel oder Inhalt suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
        />
      </div>
      <div className="flex-1 overflow-y-auto bg-slate-900 rounded-xl border border-slate-700 p-6">
         {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map(doc => (
                    <DocumentCard key={doc.id} document={doc} onOpen={() => onOpenDocument(doc)} />
                ))}
            </div>
         ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Keine Dokumente gefunden. Erstellen Sie ein neues!</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default ServiceDocumentsPage;