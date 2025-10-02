import React from 'react';
import { Page } from '../App';

interface AdminPageProps {
  onOpenOfficerModal: () => void;
  onOpenHomepageEditModal: () => void;
  onNavigate: (page: Page) => void;
}

const DashboardCard: React.FC<{ title: string; onClick?: () => void }> = ({ title, onClick }) => {
  const isActionable = !!onClick;
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

const AdminPage: React.FC<AdminPageProps> = ({ onOpenOfficerModal, onOpenHomepageEditModal, onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-800 p-8 text-center">
      <h1 className="text-4xl font-bold text-blue-400 mb-12">Admin Bereich</h1>
      <div className="w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Officer verwalten" onClick={onOpenOfficerModal} />
          <DashboardCard title="Homepage bearbeiten" onClick={onOpenHomepageEditModal} />
          <DashboardCard title="IT-Protokolle ansehen" onClick={() => onNavigate('it_logs')} />
          <DashboardCard title="Fuhrpark verwalten" onClick={() => onNavigate('fuhrpark')} />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;