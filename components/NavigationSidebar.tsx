import React from 'react';
import { Page } from '../App';
import { Officer, RANKS } from '../types';

interface NavigationSidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  currentUser: Officer;
  unreadEmailCount: number;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  page: Page;
  isActive: boolean;
  onClick: (page: Page) => void;
  notificationCount?: number;
}> = ({ label, icon, page, isActive, onClick, notificationCount }) => {
  const baseClasses = "w-full flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50";
  const activeClasses = "bg-slate-700 text-slate-50";
  const inactiveClasses = "text-slate-400 hover:bg-slate-800 hover:text-slate-200";

  return (
    <li>
      <button
        onClick={() => onClick(page)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        title={label}
        aria-current={isActive ? 'page' : undefined}
      >
        <div className="relative h-6 w-6 mb-1">
          {icon}
          {notificationCount > 0 && (
             <span className="absolute -top-1 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white ring-2 ring-gray-900">
              {notificationCount}
            </span>
          )}
        </div>
        <span className="text-xs font-medium">{label}</span>
      </button>
    </li>
  );
};

const ICONS: Record<Page, React.ReactNode> = {
    lspd: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>,
    mein_dienst: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    mailbox: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
    dispatch: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>,
    training_modules: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    service_documents: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    hr: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    checklist: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    fuhrpark: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v.958m12 0c0 2.278-1.091 4.418-2.868 5.758a12.41 12.41 0 01-2.658 1.482 12.088 12.088 0 01-3.658 0A12.41 12.41 0 016.632 12.42a48.554 48.554 0 010-3.658c.955-1.025 2.34-1.833 3.658-2.292m8.25 2.292V7.125A2.25 2.25 0 0018.75 4.875h-13.5A2.25 2.25 0 003 7.125v1.5" /></svg>,
    admin: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>,
    it_logs: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>,
    hr_documents: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.481.398.59.11.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37.49l1.217.456c.355.133.75.072 1.075-.124.073-.044.146-.087.22-.127.332-.183.582.495-.645-.87l.213-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    uprank_derank: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>,
    sanctions: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.153.24c-1.036 0-2.063-.254-2.986-.751l-2.67-1.335M3.75 4.97c-1.01.143-2.01.317-3 .52m3-.52L1.13 15.696c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.153.24c1.036 0 2.063-.254 2.986-.751l2.67-1.335" /></svg>,
} as const;


const NavigationSidebar: React.FC<NavigationSidebarProps> = ({ activePage, onNavigate, currentUser, unreadEmailCount }) => {
  const lieutenantIndex = RANKS.indexOf('Lieutenant');
  const currentUserRankIndex = RANKS.indexOf(currentUser.rank);
  const isHighRank = lieutenantIndex !== -1 && currentUserRankIndex >= lieutenantIndex;

  const hasAdminAccess = currentUser.departmentRoles.includes('Admin');
  const hasHRAccess = currentUser.departmentRoles.includes('Personalabteilung') || currentUser.departmentRoles.includes('Leitung Personalabteilung') || hasAdminAccess || isHighRank;
  const hasFTOAccess = currentUser.departmentRoles.includes('Field Training Officer') || currentUser.departmentRoles.includes('Leitung Field Training Officer') || hasAdminAccess || isHighRank;
  const hasFleetAccess = currentUser.departmentRoles.includes('Fuhrparkmanager') || hasAdminAccess || isHighRank;
  
  return (
    <aside className="w-24 bg-gray-900 p-3 flex flex-col items-center border-r border-gray-800 z-20">
      
      <nav className="h-full flex flex-col">
        <ul className="space-y-2">
          <NavItem label="Home" icon={ICONS.lspd} page="lspd" isActive={activePage === 'lspd'} onClick={onNavigate} />
          <NavItem label="Mein Dienst" icon={ICONS.mein_dienst} page="mein_dienst" isActive={activePage === 'mein_dienst'} onClick={onNavigate} />
          <NavItem label="Dispatch" icon={ICONS.dispatch} page="dispatch" isActive={activePage === 'dispatch'} onClick={onNavigate} />
          <NavItem label="E-Mail" icon={ICONS.mailbox} page="mailbox" isActive={activePage === 'mailbox'} onClick={onNavigate} notificationCount={unreadEmailCount} />
          <NavItem label="Module" icon={ICONS.training_modules} page="training_modules" isActive={activePage === 'training_modules'} onClick={onNavigate} />
          <NavItem label="Dokumente" icon={ICONS.service_documents} page="service_documents" isActive={activePage === 'service_documents'} onClick={onNavigate} />
          {hasHRAccess && <NavItem label="HR" icon={ICONS.hr} page="hr" isActive={activePage === 'hr'} onClick={onNavigate} />}
          {hasFTOAccess && <NavItem label="Checkliste" icon={ICONS.checklist} page="checklist" isActive={activePage === 'checklist'} onClick={onNavigate} />}
          {hasFleetAccess && <NavItem label="Fuhrpark" icon={ICONS.fuhrpark} page="fuhrpark" isActive={activePage === 'fuhrpark'} onClick={onNavigate} />}
        </ul>
        <div className="flex-1" />
        <ul className="space-y-2">
            {hasAdminAccess && <NavItem label="Admin" icon={ICONS.admin} page="admin" isActive={activePage === 'admin'} onClick={onNavigate} />}
            {(hasAdminAccess || isHighRank) && <NavItem label="IT Logs" icon={ICONS.it_logs} page="it_logs" isActive={activePage === 'it_logs'} onClick={onNavigate} />}
        </ul>
      </nav>
    </aside>
  );
};

export default NavigationSidebar;