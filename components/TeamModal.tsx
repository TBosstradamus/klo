import React from 'react';
import { Officer, Rank } from '../types';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  officers: Officer[];
}

const TeamCard: React.FC<{ officer: Officer, isHR?: boolean }> = ({ officer, isHR = false }) => (
  <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-colors">
    <span className="text-5xl">{officer.gender === 'male' ? '👮🏻‍♂️' : '👮🏻‍♀️'}</span>
    <div>
      <p className="font-bold text-lg text-slate-100">{`${officer.firstName} ${officer.lastName}`}</p>
      <p className="text-sm text-blue-400 font-semibold">{isHR ? 'Personalabteilung' : officer.rank}</p>
    </div>
  </div>
);

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, officers }) => {
  if (!isOpen) return null;

  const commandRanks: Rank[] = ['Chief of Police', 'Assistant Chief of Police', 'Deputy Chief of Police'];
  
  const commandStaff = officers
    .filter(o => commandRanks.includes(o.rank))
    .sort((a, b) => commandRanks.indexOf(a.rank) - commandRanks.indexOf(b.rank));

  const hrStaff = officers.filter(o => o.departmentRoles.includes('Personalabteilung'));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-gray-900 w-11/12 max-w-5xl h-auto max-h-[80vh] rounded-2xl shadow-2xl border border-gray-800 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-100">Unser Team</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Schließen">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-8 flex-1 overflow-y-auto space-y-10">
          <section>
            <h3 className="text-xl font-bold text-blue-400 mb-4 border-b-2 border-blue-500/30 pb-2">Command Staff</h3>
            {commandStaff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {commandStaff.map(officer => <TeamCard key={officer.id} officer={officer} />)}
                </div>
            ) : (
                <p className="text-slate-500">Command Staff information is currently unavailable.</p>
            )}
          </section>
          <section>
            <h3 className="text-xl font-bold text-blue-400 mb-4 border-b-2 border-blue-500/30 pb-2">Personalabteilung (HR)</h3>
             {hrStaff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hrStaff.map(officer => <TeamCard key={officer.id} officer={officer} isHR={true} />)}
                </div>
             ) : (
                <p className="text-slate-500">HR information is currently unavailable.</p>
             )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default TeamModal;