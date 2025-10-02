import React, { useState, useEffect } from 'react';
import { Officer, Gender, Rank, RANKS, License, AvailableLicense, AVAILABLE_LICENSES } from '../types';

interface OfficerDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    officer: Officer | null;
    onUpdate: (officer: Officer) => void;
    onRequestDelete: (officer: Officer) => void;
    currentUser: Officer;
}

const OfficerForm: React.FC<{
  officer: Officer;
  onSave: (officerData: Officer) => void;
  onCancel: () => void;
  onRequestDelete: (officer: Officer) => void;
  currentUser: Officer;
}> = ({ officer, onSave, onCancel, onRequestDelete, currentUser }) => {
  const [badgeNumber, setBadgeNumber] = useState(officer.badgeNumber);
  const [firstName, setFirstName] = useState(officer.firstName);
  const [lastName, setLastName] = useState(officer.lastName);
  const [phoneNumber, setPhoneNumber] = useState(officer.phoneNumber);
  const [gender, setGender] = useState<Gender>(officer.gender);
  const [rank, setRank] = useState<Rank>(officer.rank);
  const [licenses, setLicenses] = useState<License[]>(officer.licenses || []);
  const [newLicenseName, setNewLicenseName] = useState<AvailableLicense>(AVAILABLE_LICENSES[0]);

  const captainRankIndex = RANKS.indexOf('Captain');
  const isCaptainOrHigher = currentUser.rank ? RANKS.indexOf(currentUser.rank) >= captainRankIndex : false;
  const isHR = currentUser.departmentRoles.includes('Personalabteilung') || currentUser.departmentRoles.includes('Leitung Personalabteilung');
  const canIssueLangwaffenlizenz = isCaptainOrHigher || isHR;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim() && badgeNumber.trim()) {
      onSave({
        ...officer,
        badgeNumber,
        firstName,
        lastName,
        phoneNumber,
        gender,
        rank,
        licenses,
      });
    }
  };
  
  const handleAddLicense = () => {
    const isSpecialLicense = newLicenseName === 'Interne Mitführlizenz für Langwaffen';
    if (isSpecialLicense && !canIssueLangwaffenlizenz) {
        alert('Nur ein Captain oder höher oder ein Mitglied der Personalabteilung kann diese Lizenz ausstellen.');
        return;
    }

    const expiresAt = new Date();
    if (isSpecialLicense) {
        expiresAt.setDate(expiresAt.getDate() + 28);
    } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 10);
    }

    const newLicense: License = {
        id: `lic-${Date.now()}`,
        name: newLicenseName,
        issuedBy: `${currentUser.firstName} ${currentUser.lastName}`,
        issuedAt: new Date(),
        expiresAt: expiresAt,
    };
    setLicenses(prev => [...prev, newLicense]);
  };

  const handleRemoveLicense = (licenseId: string) => {
    setLicenses(prev => prev.filter(l => l.id !== licenseId));
  };


  return (
    <div className="p-2 max-h-[70vh] overflow-y-auto">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-badge-number" className="block text-sm font-medium mb-1 text-slate-400">Badge Nummer</label>
            <input id="edit-badge-number" type="text" value={badgeNumber} onChange={(e) => setBadgeNumber(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label htmlFor="edit-phone-number" className="block text-sm font-medium mb-1 text-slate-400">Telefonnummer</label>
            <input id="edit-phone-number" type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label htmlFor="edit-first-name" className="block text-sm font-medium mb-1 text-slate-400">Vorname</label>
            <input id="edit-first-name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label htmlFor="edit-last-name" className="block text-sm font-medium mb-1 text-slate-400">Nachname</label>
            <input id="edit-last-name" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="md:col-span-2">
              <label htmlFor="edit-rank" className="block text-sm font-medium mb-1 text-slate-400">Rang</label>
              <select id="edit-rank" value={rank} onChange={(e) => setRank(e.target.value as Rank)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
          </div>
          <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-slate-400">Geschlecht</label>
              <div className="flex gap-4">
                  <label className="flex items-center">
                      <input type="radio" name="gender" value={Gender.Male} checked={gender === Gender.Male} className="h-4 w-4 text-blue-500 bg-slate-700 border-slate-600 focus:ring-blue-500"/>
                      <span className="ml-2 text-slate-300">Männlich 👮🏻‍♂️</span>
                  </label>
                  <label className="flex items-center">
                      <input type="radio" name="gender" value={Gender.Female} checked={gender === Gender.Female} className="h-4 w-4 text-pink-500 bg-slate-700 border-slate-600 focus:ring-pink-500"/>
                      <span className="ml-2 text-slate-300">Weiblich 👮🏻‍♀️</span>
                  </label>
              </div>
          </div>
        </div>
        
        <hr className="border-t border-slate-800 my-6" />

        <div>
            <h4 className="text-lg font-semibold mb-3 text-slate-300">Lizenzen verwalten</h4>
            <div className="space-y-2 mb-4">
                {licenses.map(lic => (
                    <div key={lic.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-md text-sm">
                        <span>{lic.name}</span>
                        <button type="button" onClick={() => handleRemoveLicense(lic.id)} className="p-1 rounded-full hover:bg-red-500/20 text-red-400">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <select value={newLicenseName} onChange={e => setNewLicenseName(e.target.value as AvailableLicense)} className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {AVAILABLE_LICENSES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button type="button" onClick={handleAddLicense} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold transition-colors">Hinzufügen</button>
            </div>
            {newLicenseName === 'Interne Mitführlizenz für Langwaffen' && !canIssueLangwaffenlizenz && (
                <p className="text-xs text-red-400 mt-2">Sie müssen Captain oder höher sein oder zur Personalabteilung gehören, um diese Lizenz auszustellen.</p>
            )}
        </div>

        <div className="flex justify-between items-center mt-8">
            <button type="button" onClick={() => onRequestDelete(officer)} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-colors">Entfernen</button>
            <div className="flex gap-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition-colors">Abbrechen</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors">Speichern</button>
            </div>
        </div>
      </form>
    </div>
  );
};

const formatDuration = (totalSeconds: number) => {
    if (!totalSeconds || totalSeconds < 0) return '0 Std. 0 Min.';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours} Std. ${minutes} Min.`;
};

const OfficerDetailView: React.FC<{ officer: Officer }> = ({ officer }) => {
    const DetailItem: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = '' }) => (
        <div className={className}>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="text-lg text-slate-100 font-semibold">{value}</p>
        </div>
    );
    
    const getStatus = (expiresAt: Date): { color: string; } => {
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);
        if (expiresAt < now) return { color: 'bg-red-500' };
        if (expiresAt < sevenDaysFromNow) return { color: 'bg-orange-500' };
        return { color: 'bg-green-500' };
    };

    return (
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-6 pb-6">
                <span className="text-8xl">{officer.gender === 'male' ? '👮🏻‍♂️' : '👮🏻‍♀️'}</span>
                <div>
                    <h3 className="text-4xl font-bold text-slate-100">{`${officer.firstName} ${officer.lastName}`}</h3>
                    <p className="text-xl text-blue-400 font-semibold">{officer.rank}</p>
                </div>
            </div>
            
            <hr className="border-t border-slate-800 my-6" />

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DetailItem label="Badge Nummer" value={officer.badgeNumber} />
                <DetailItem label="Telefonnummer" value={officer.phoneNumber} />
                <DetailItem label="Geschlecht" value={officer.gender === Gender.Male ? 'Männlich' : 'Weiblich'} />
                <DetailItem label="Geleistete Dienststunden" value={formatDuration(officer.totalHours)} />

                {officer.departmentRoles && officer.departmentRoles.length > 0 && (
                    <div className="md:col-span-2">
                        <p className="text-sm text-slate-400">Abteilungsränge</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {officer.departmentRoles.map(role => (
                                <span key={role} className="px-3 py-1.5 text-xs font-semibold text-yellow-200 bg-yellow-600/30 rounded-full">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                 {officer.licenses && officer.licenses.length > 0 && (
                    <div className="md:col-span-2">
                        <p className="text-sm text-slate-400 mb-2">Lizenzen</p>
                        <div className="space-y-2">
                            {officer.licenses.map(lic => (
                                <div key={lic.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${getStatus(lic.expiresAt).color}`}></span>
                                            <span className="font-semibold text-slate-200">{lic.name}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">Gültig bis: {lic.expiresAt.toLocaleDateString('de-DE')}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 pl-4">Ausgestellt von: {lic.issuedBy} am {lic.issuedAt.toLocaleDateString('de-DE')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}
             </div>
        </div>
    );
};

const OfficerDetailModal: React.FC<OfficerDetailModalProps> = ({ isOpen, onClose, officer, onUpdate, onRequestDelete, currentUser }) => {
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen]);

    if (!isOpen || !officer || !currentUser) return null;

    const handleSave = (officerData: Officer) => {
        onUpdate(officerData);
        setIsEditing(false);
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-gray-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-800 flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-bold text-slate-100">Personalakte</h2>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-yellow-400 transition-colors" title="Akte bearbeiten">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Schließen">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </header>

                <main>
                    {isEditing ? (
                        <OfficerForm
                            officer={officer}
                            onSave={handleSave}
                            onCancel={() => setIsEditing(false)}
                            onRequestDelete={onRequestDelete}
                            currentUser={currentUser}
                        />
                    ) : (
                        <OfficerDetailView officer={officer} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default OfficerDetailModal;