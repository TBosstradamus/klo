import React, { useState, useEffect } from 'react';
import FormattingHelp from './FormattingHelp';

interface ChecklistTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: string;
  onSave: (newTemplate: string) => void;
}

const ChecklistTemplateModal: React.FC<ChecklistTemplateModalProps> = ({ isOpen, onClose, template, onSave }) => {
  const [content, setContent] = useState(template);

  useEffect(() => {
    if (isOpen) {
      setContent(template);
    }
  }, [isOpen, template]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(content);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-slate-900 w-full max-w-5xl h-[70vh] rounded-xl shadow-2xl border border-slate-700 p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-blue-400 mb-4 flex-shrink-0">Checklisten-Vorlage bearbeiten</h2>
        <div className="flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <label htmlFor="checklist-template-content" className="block text-sm font-medium mb-1">
              Vorlageninhalt
            </label>
            <textarea
              id="checklist-template-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 bg-slate-800 border border-slate-700 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Inhalt hier einfügen... #Überschrift# für Titel, Text für Aufgaben."
            />
          </div>
          <div className="flex-shrink-0">
            <FormattingHelp />
          </div>
        </div>
         <div className="flex justify-end gap-2 mt-6 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium transition-colors">
            Abbrechen
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors">
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistTemplateModal;
