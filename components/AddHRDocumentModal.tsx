import React, { useState, useEffect } from 'react';
import FormattingHelp from './FormattingHelp';

interface AddHRDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, content: string) => void;
}

const AddHRDocumentModal: React.FC<AddHRDocumentModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setContent('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), content);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-900 w-full max-w-5xl h-[70vh] rounded-xl shadow-2xl border border-slate-700 p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4 flex-shrink-0">Neues Dokument erstellen</h2>
        <form onSubmit={handleSubmit} className="flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label htmlFor="doc-title" className="block text-sm font-medium mb-1">
                Dokumenten-Titel
              </label>
              <input
                id="doc-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label htmlFor="doc-content" className="block text-sm font-medium mb-1">
                Inhalt
              </label>
              <textarea
                id="doc-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-1 bg-slate-800 border border-slate-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Inhalt hier einfügen..."
              />
            </div>
          </div>
          <div className="flex-shrink-0">
            <FormattingHelp />
          </div>
        </form>
         <div className="flex justify-end gap-2 mt-6 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors">
            Abbrechen
          </button>
          <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md text-sm font-medium transition-colors">
            Erstellen
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHRDocumentModal;