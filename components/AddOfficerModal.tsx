import React, { useState, useEffect } from 'react';
import { Officer, Gender, Rank, RANKS } from '../types';

const OfficerForm: React.FC<{
  onSave: (officerData: Omit<Officer, 'id' | 'departmentRoles' | 'totalHours' | 'licenses'>) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const [badgeNumber, setBadgeNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.Male);
  const [rank, setRank] = useState<Rank>(RANKS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim() && badgeNumber.trim()) {
      const officerData = {
        badgeNumber,
        firstName,
        lastName,
        phoneNumber,
        gender,
        rank,
      };
      onSave(officerData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-800 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="add-badge-number" className="block text-sm font-medium mb-1">Badge Nummer</label>
          <input id="add-badge-number" type="text" value={badgeNumber} onChange={(e) => setBadgeNumber(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div>
           <label htmlFor="add-phone-number" className="block text-sm font-medium mb-1">Telefonnummer</label>
           <input id="add-phone-number" type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div>
          <label htmlFor="add-first-name" className="block text-sm font-medium mb-1">Vorname</label>
          <input id="add-first-name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div>
          <label htmlFor="add-last-name" className="block text-sm font-medium mb-1">Nachname</label>
          <input id="add-last-name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        <div className="md:col-span-2">
            <label htmlFor="add-rank" className="block text-sm font-medium mb-1">Rang</label>
            <select id="add-rank" value={rank} onChange={(e) => setRank(e.target.value as Rank)} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
        </div>
        <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Geschlecht</label>
            <div className="flex gap-4">
                <label className="flex items-center">
                    <input type="radio" name="add-gender" value={Gender.Male} checked={gender === Gender.Male} onChange={() => setGender(Gender.Male)} className="form-radio text-blue-500 bg-slate-700 border-slate-600 focus:ring-blue-500"/>
                    <span className="ml-2">Männlich 👮🏻‍♂️</span>
                </label>
                <label className="flex items-center">
                    <input type="radio" name="add-gender" value={Gender.Female} checked={gender === Gender.Female} onChange={() => setGender(Gender.Female)} className="form-radio text-pink-500 bg-slate-700 border-slate-600 focus:ring-pink-500"/>
                    <span className="ml-2">Weiblich 👮🏻‍♀️</span>
                </label>
            </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-medium">Abbrechen</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium">Speichern</button>
      </div>
    </form>
  );
};

const AddOfficerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (officerData: Omit<Officer, 'id' | 'departmentRoles' | 'totalHours' | 'licenses'>) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    if (!isOpen) return null;
    
    const handleSave = (officerData: Omit<Officer, 'id' | 'departmentRoles' | 'totalHours' | 'licenses'>) => {
        onAdd(officerData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 w-full max-w-2xl rounded-xl shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-blue-400">Neuen Officer anlegen</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-colors" title="Schließen">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <div className="p-4">
                    <OfficerForm onSave={handleSave} onCancel={onClose} />
                </div>
            </div>
        </div>
    );
};

export default AddOfficerModal;