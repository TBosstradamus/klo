import React from 'react';
import { Page } from '../App';
import { Officer, RANKS } from '../types';
import SupervisoryAccessWarning from './SupervisoryAccessWarning';

interface HRPageProps {
  onOpenAddOfficer: () => void;
  onOpenOfficerList: () => void;
  onNavigate: (page: Page) => void;
  onOpenCredentialsModal: () => void;
  onOpenTerminateOfficerModal: () => void;
  currentUser: Officer;
}

const DashboardCard: React.FC<{ title: string; onClick?: () => void; disabled?: boolean; }> = ({ title, onClick, disabled = false }) => {
  const isActionable = !!onClick && !disabled;
  return (
    <button
      onClick={onClick}
      disabled={!isActionable}
      className={`p-6 rounded-xl text-center transition-all duration-200 border
        ${isActionable 
          ? 'bg-slate-700/50 border-slate-600 hover:bg-blue-500/20 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer' 
          : 'bg-slate-800/30 border-slate-700 text-gray-500 cursor-not-allowed'
        }`}
    >
      <span className="text-lg font-semibold">{title}</span>
    </button>
  );
};

const HRPage: React.FC<HRPageProps> = ({ onOpenAddOfficer, onOpenOfficerList, onNavigate, onOpenCredentialsModal, onOpenTerminateOfficerModal, currentUser }) => {
  const lieutenantIndex = RANKS.indexOf('Lieutenant');
  const currentUserRankIndex = RANKS.indexOf(currentUser.rank);
  const isHighRank = lieutenantIndex !== -1 && currentUserRankIndex >= lieutenantIndex;

  const hasHRAccess = currentUser.departmentRoles.includes('Personalabteilung') || currentUser.departmentRoles.includes('Leitung Personalabteilung') || currentUser.departmentRoles.includes('Admin');
  const showWarningAndDisable = isHighRank && !hasHRAccess;

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-slate-800 p-8 text-center">
      {showWarningAndDisable && <SupervisoryAccessWarning />}
      <h1 className="text-4xl font-bold text-blue-400 mb-12">Personalabteilung</h1>
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Officer" onClick={onOpenOfficerList} />
          <DashboardCard title="Dokumente" onClick={() => onNavigate('hr_documents')} />
          <DashboardCard title="Einstellungen" onClick={() => onNavigate('settings')} />
          <DashboardCard title="Uprank & Derank" onClick={() => onNavigate('uprank_derank')} />
          <DashboardCard title="Sanktionen" onClick={() => onNavigate('sanctions')} />
          <DashboardCard title="Zugangsdaten" onClick={onOpenCredentialsModal} />
          <DashboardCard title="Neue Officer anlegen" onClick={onOpenAddOfficer} />
        </div>
        <div className="mt-12 border-t border-slate-700/50 pt-8 flex justify-center">
            <button
                onClick={onOpenTerminateOfficerModal}
                className="px-8 py-3 text-base font-semibold text-white bg-red-700 rounded-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500 disabled:bg-slate-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
                Officer Kündigen
            </button>
        </div>
      </div>
    </div>
  );
};

export default HRPage;