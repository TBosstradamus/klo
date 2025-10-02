import React, { useState, useEffect } from 'react';
import { Officer } from '../types';

interface CallsignListModalProps {
  isOpen: boolean;
  onClose: () => void;
  callsignData: {
    general: { code: string; meaning: string }[];
    status: { code: string; meaning: string }[];
    unit: { code: string; meaning: string }[];
  };
  onUpdateCallsignData: (data: CallsignListModalProps['callsignData']) => void;
  currentUser: Officer;
}

const EditableCodeList: React.FC<{
  title: string;
  data: { code: string; meaning: string }[];
  isAdmin: boolean;
  onSave: (newData: { code: string; meaning: string }[]) => void;
}> = ({ title, data, isAdmin, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(data);

  useEffect(() => {
    setEditedData(data);
  }, [data]);

  const handleEditChange = (index: number, field: 'code' | 'meaning', value: string) => {
    const newData = [...editedData];
    newData[index] = { ...newData[index], [field]: value };
    setEditedData(newData);
  };
  
  const handleSave = () => {
    onSave(editedData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedData(data);
    setIsEditing(false);
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-3 border-b border-slate-700 pb-2">
        <h3 className="text-lg font-semibold text-blue-400">{title}</h3>
        {isAdmin && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="px-2 py-1 text-xs font-semibold rounded-md text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">
            Bearbeiten
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2 text-sm">
          {editedData.map(({ code, meaning }, index) => (
            <div key={index} className="grid grid-cols-[120px_1fr] gap-x-4 items-center">
              <input 
                type="text" 
                value={code}
                onChange={(e) => handleEditChange(index, 'code', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <input 
                type="text" 
                value={meaning}
                onChange={(e) => handleEditChange(index, 'meaning', e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={handleCancel} className="px-3 py-1 text-xs font-semibold rounded-md text-slate-300 bg-slate-600 hover:bg-slate-500">Abbrechen</button>
            <button onClick={handleSave} className="px-3 py-1 text-xs font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-500">Speichern</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
          {data.map(({ code, meaning }) => (
            <React.Fragment key={code}>
              <div className="font-mono font-bold text-blue-400 text-right">{code}</div>
              <div className="text-slate-300">{meaning}</div>
            </React.Fragment>
          ))}
        </div>
      )}
    </section>
  );
};

const CallsignListModal: React.FC<CallsignListModalProps> = ({ isOpen, onClose, callsignData, onUpdateCallsignData, currentUser }) => {
  if (!isOpen) return null;

  const isAdmin = currentUser.departmentRoles.includes('Admin');

  const handleSaveSection = (section: 'general' | 'status' | 'unit', newData: { code: string; meaning: string }[]) => {
    onUpdateCallsignData({
        ...callsignData,
        [section]: newData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-900 w-auto rounded-2xl shadow-2xl border border-gray-800 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-100">Callsign-Liste</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Schließen">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <EditableCodeList
                title="Allgemeine Codes"
                data={callsignData.general}
                isAdmin={isAdmin}
                onSave={(newData) => handleSaveSection('general', newData)}
            />
            <div className="space-y-8">
                <EditableCodeList
                    title="Status Codes"
                    data={callsignData.status}
                    isAdmin={isAdmin}
                    onSave={(newData) => handleSaveSection('status', newData)}
                />
                <EditableCodeList
                    title="Einheiten-Callsigns"
                    data={callsignData.unit}
                    isAdmin={isAdmin}
                    onSave={(newData) => handleSaveSection('unit', newData)}
                />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CallsignListModal;