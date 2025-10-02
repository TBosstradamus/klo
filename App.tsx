

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Officer, Vehicle, Gender, DragData, DragType, VehicleStatus, VehicleCategory, HeaderRole, Rank, Sanction, SanctionType, AccessCredentials, Module, Document, OfficerChecklist, ITLog, ITLogEventType, LogCategory, DepartmentRole, CheckupItem, MailboxMessage, HomepageElement, ChecklistMailboxMessage, RANKS, Email, EmailAttachment, License, EmailLabel } from './types';
import OfficerSidebar from './components/OfficerSidebar';
import VehicleGrid from './components/VehicleGrid';
import Header from './components/Header';
import NavigationSidebar from './components/NavigationSidebar';
import FleetManagementModal from './components/FleetManagementModal';
import ConfirmationModal from './components/ConfirmationModal';
import PlaceholderPage from './components/PlaceholderPage';
import HRPage from './components/HRPage';
import AddOfficerModal from './components/AddOfficerModal';
import OfficerManagementModal from './components/OfficerManagementModal';
import OfficerDetailModal from './components/OfficerDetailModal';
import UprankDerankPage from './components/UprankDerankPage';
import SanctionsPage from './components/SanctionsPage';
import AddSanctionModal from './components/AddSanctionModal';
import SanctionDetailModal from './components/SanctionDetailModal';
import CredentialsManagementModal from './components/CredentialsManagementModal';
import GeneratedCredentialsModal from './components/GeneratedCredentialsModal';
import TerminateOfficerModal from './components/TerminateOfficerModal';
import SettingsPage from './components/SettingsPage';
import SettingsLogDetailModal from './components/SettingsLogDetailModal';
import HRDocumentsPage from './components/HRDocumentsPage';
import DocumentModal from './components/DocumentModal';
import AddHRDocumentModal from './components/AddHRDocumentModal';
import TrainingModulesPage from './components/TrainingModulesPage';
import ModuleModal from './components/ModuleModal';
import AddModuleModal from './components/AddModuleModal';
import ChecklistPage from './components/ChecklistPage';
import OfficerChecklistModal from './components/OfficerChecklistModal';
import ITLogsPage from './components/ITLogsPage';
import AdminPage from './components/AdminPage';
import AssignRoleModal from './components/AssignRoleModal';
import FuhrparkPage from './components/FuhrparkPage';
import VehicleEditModal from './components/VehicleEditModal';
import HomepageEditModal from './components/HomepageEditModal';
import ChecklistTemplateModal from './components/ChecklistTemplateModal';
import AddVehicleModal from './components/AddVehicleModal';
import ServiceDocumentsPage from './components/ServiceDocumentsPage';
import LoginModal from './components/LoginModal';
import MailboxPage from './components/MailboxPage';
import ComposeEmailModal from './components/ComposeEmailModal';
import TeamModal from './components/TeamModal';
import PopoutViewerModal from './components/PopoutViewerModal';
import CallsignListModal from './components/CallsignListModal';
import Confetti from './components/Confetti';

// This type definition is used across multiple components but is missing from types.ts.
export type Page = 'lspd' | 'mein_dienst' | 'dispatch' | 'training_modules' | 'service_documents' | 'hr' | 'checklist' | 'fuhrpark' | 'admin' | 'it_logs' | 'hr_documents' | 'settings' | 'uprank_derank' | 'sanctions' | 'mailbox';

// --- MEIN DIENST PAGE COMPONENT ---

const formatDuration = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds < 0) return '0 Std. 0 Min.';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours} Std. ${minutes} Min.`;
};

const formatRunningTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

interface MeinDienstPageProps {
  currentUser: Officer;
  clockInTime: number | null;
  onClockIn: () => void;
  onClockOut: () => void;
  checklist: OfficerChecklist | undefined;
  calculateChecklistProgress: (checklist: OfficerChecklist | undefined) => { completed: number; total: number; percentage: number };
  onUprankRequest: () => void;
}

const InfoWidget: React.FC<{
    officer: Officer;
    checklist: OfficerChecklist | undefined;
    calculateChecklistProgress: (checklist: OfficerChecklist | undefined) => { completed: number; total: number; percentage: number };
}> = ({ officer, checklist, calculateChecklistProgress }) => {
    const progress = calculateChecklistProgress(checklist);
    const getProgressColor = () => {
        if (progress.percentage === 100) return 'bg-green-500';
        if (progress.percentage > 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 col-span-1 md:col-span-2">
        <h3 className="text-lg font-bold text-blue-400 mb-4">Personalakte</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-400">Name:</span> <p className="font-semibold">{`${officer.firstName} ${officer.lastName}`}</p></div>
            <div><span className="text-slate-400">Dienstnummer:</span> <p className="font-semibold">{officer.badgeNumber}</p></div>
            <div><span className="text-slate-400">Rang:</span> <p className="font-semibold">{officer.rank}</p></div>
            <div><span className="text-slate-400">Telefon:</span> <p className="font-semibold">{officer.phoneNumber}</p></div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700/50">
            <h3 className="text-lg font-bold text-blue-400 mb-4">Checklistenfortschritt</h3>
            <div className="flex justify-between items-center text-sm text-gray-400 mb-1">
                <span>Fortschritt</span>
                <span>{progress.completed} / {progress.total}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor()}`} 
                    style={{ width: `${progress.percentage}%` }}
                ></div>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">{checklist?.isForceCompleted ? "Abschluss wurde erzwungen" : " "}</p>
        </div>
    </div>
    );
};


const TimeClockWidget: React.FC<{
    isClockedIn: boolean;
    onClockIn: () => void;
    onClockOut: () => void;
    clockInTime: number | null;
    totalHours: number;
}> = ({ isClockedIn, onClockIn, onClockOut, clockInTime, totalHours }) => {
    const [runningTime, setRunningTime] = useState(0);

    useEffect(() => {
        let interval: number | null = null;
        if (isClockedIn && clockInTime) {
            setRunningTime(Date.now() - clockInTime); // Initial set
            interval = window.setInterval(() => {
                setRunningTime(Date.now() - clockInTime);
            }, 1000);
        } else {
            setRunningTime(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isClockedIn, clockInTime]);

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center justify-center col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-blue-400 mb-2">Stempeluhr</h3>
            <div className="text-center mb-4">
                <p className="text-slate-400 text-sm">Laufende Zeit</p>
                <p className="text-4xl font-mono font-bold">{formatRunningTime(runningTime)}</p>
            </div>
            <button
                onClick={isClockedIn ? onClockOut : onClockIn}
                className={`w-full max-w-xs px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg
                    ${isClockedIn 
                        ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30' 
                        : 'bg-green-600 hover:bg-green-500 shadow-green-500/30'
                    }`}
            >
                {isClockedIn ? 'Ausstempeln' : 'Einstempeln'}
            </button>
            <div className="text-center mt-4">
                <p className="text-slate-400 text-sm">Gesamtstunden</p>
                <p className="text-xl font-semibold">{formatDuration(totalHours)}</p>
            </div>
            <div className="text-center text-xs text-slate-500 mt-4 max-w-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400 inline-block mb-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p>
                    Die Stempeluhr wird fortlaufend überwacht. Manipulationen, Sabotage oder das Umgehen der Zeiterfassung werden arbeitsrechtlich verfolgt und können Sanktionen einschließlich fristloser Kündigung zur Folge haben.
                </p>
            </div>
        </div>
    );
};

const LicensesWidget: React.FC<{ licenses: License[] }> = ({ licenses }) => {
    const getStatus = (expiresAt: Date): { text: string; color: string; icon: React.ReactNode; } => {
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        if (expiresAt < now) {
            return { 
                text: 'Abgelaufen', 
                color: 'text-red-400', 
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            };
        }
        if (expiresAt < sevenDaysFromNow) {
            return { 
                text: `Läuft am ${expiresAt.toLocaleDateString()} ab`,
                color: 'text-orange-400', 
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            };
        }
        return { 
            text: `Gültig bis ${expiresAt.toLocaleDateString()}`,
            color: 'text-green-400',
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        };
    };

    return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 md:col-span-2">
        <h3 className="text-lg font-bold text-blue-400 mb-4">Lizenzen</h3>
        <ul className="space-y-3">
            {licenses.map((license) => {
                const status = getStatus(license.expiresAt);
                return (
                    <li key={license.id} className="text-sm">
                        <div className="flex items-center">
                            {status.icon}
                            <span className="font-semibold">{license.name}</span>
                        </div>
                        <div className={`pl-6 text-xs ${status.color}`}>
                            {status.text}
                        </div>
                         <div className="pl-6 text-xs text-slate-500">
                            Ausgestellt von: {license.issuedBy}
                        </div>
                    </li>
                )
            })}
        </ul>
    </div>
    );
};

const UprankWidget: React.FC<{ onRequestUprank: () => void }> = ({ onRequestUprank }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 col-span-1 md:col-span-2 lg:col-span-2 flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-blue-400 mb-4">Karriere</h3>
        <p className="text-sm text-center text-slate-400 mb-4">
            Sind Sie bereit für den nächsten Schritt in Ihrer Karriere? Beantragen Sie jetzt einen Uprank.
        </p>
        <button
            onClick={onRequestUprank}
            className="w-full max-w-xs px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg bg-blue-600 hover:bg-blue-500 shadow-blue-500/30"
        >
            Uprank anfragen
        </button>
    </div>
);


const MeinDienstPage: React.FC<MeinDienstPageProps> = ({ 
    currentUser, 
    clockInTime, 
    onClockIn, 
    onClockOut,
    checklist,
    calculateChecklistProgress,
    onUprankRequest
}) => {
  return (
    <div className="h-full bg-slate-900 p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-slate-100">Mein Dienst</h1>
        <p className="text-slate-400 mt-1">Ihre persönliche Übersichtsseite für den Dienst.</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <TimeClockWidget
              isClockedIn={!!clockInTime}
              onClockIn={onClockIn}
              onClockOut={onClockOut}
              clockInTime={clockInTime}
              totalHours={currentUser.totalHours}
          />
          <InfoWidget 
              officer={currentUser}
              checklist={checklist}
              calculateChecklistProgress={calculateChecklistProgress}
          />
          <LicensesWidget licenses={currentUser.licenses} />
          <UprankWidget onRequestUprank={onUprankRequest} />
      </main>
    </div>
  );
};


// --- INITIAL STATE & DATA MODEL ---

const createVehicle = (id: string, name: string, category: VehicleCategory, capacity: number, licensePlate: string, mileage: number): Vehicle => ({
  id, name, category, capacity, licensePlate, mileage,
  seats: Array(capacity).fill(null),
  status: null, funkChannel: null, callsign: null, lastMileage: 0,
  checkupList: [
    { id: 'chk1', text: 'Reifendruck geprüft', isChecked: true },
    { id: 'chk2', text: 'Ölstand kontrolliert', isChecked: false },
    { id: 'chk3', text: 'Bremsflüssigkeit geprüft', isChecked: true },
    { id: 'chk4', text: 'Beleuchtung funktionsfähig', isChecked: false },
  ],
  lastCheckup: null, nextCheckup: null,
});

const getInitialState = () => {
    const farFuture = new Date(); farFuture.setFullYear(farFuture.getFullYear() + 10);
    const soonLicenseExpires = new Date(); soonLicenseExpires.setDate(soonLicenseExpires.getDate() + 15);
    const initialOfficers: Officer[] = [
        { id: 'o1', badgeNumber: '723', firstName: 'John', lastName: 'Doe', phoneNumber: '555-1234', gender: Gender.Male, rank: 'Sr. Sergeant', departmentRoles: ['Personalabteilung', 'Leitung Personalabteilung', 'Admin', 'Leitung Field Training Officer', 'LSPD'], totalHours: 72360, licenses: [{id: 'l1-o1', name: 'Führerschein Klasse B', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}, {id: 'l2-o1', name: 'Waffenschein', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}] },
        { id: 'o2', badgeNumber: '845', firstName: 'Jane', lastName: 'Smith', phoneNumber: '555-5678', gender: Gender.Female, rank: 'Sergeant', departmentRoles: ['Field Training Officer', 'LSPD'], totalHours: 142000, licenses: [{id: 'l1-o2', name: 'Führerschein Klasse B', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}, {id: 'l2-o2', name: 'Waffenschein', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}, {id: 'l3-o2', name: 'Erste-Hilfe-Zertifikat', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}, {id: 'l4-o2', name: 'Interne Mitführlizenz für Langwaffen', issuedBy: 'John Doe', issuedAt: new Date(), expiresAt: soonLicenseExpires}] },
        { id: 'o3', badgeNumber: '112', firstName: 'Peter', lastName: 'Jones', phoneNumber: '555-9012', gender: Gender.Male, rank: 'Detective', departmentRoles: ['LSPD'], totalHours: 250000, licenses: [{id: 'l1-o3', name: 'Führerschein Klasse B', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}, {id: 'l2-o3', name: 'Waffenschein', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}] },
        { id: 'o4', badgeNumber: '456', firstName: 'Mary', lastName: 'Williams', phoneNumber: '555-3456', gender: Gender.Female, rank: 'Police Officer III', departmentRoles: ['Fuhrparkmanager', 'LSPD'], totalHours: 98500, licenses: [{id: 'l1-o4', name: 'Führerschein Klasse B', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}, {id: 'l2-o4', name: 'Waffenschein', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}] },
        { id: 'o5', badgeNumber: '789', firstName: 'David', lastName: 'Brown', phoneNumber: '555-7890', gender: Gender.Male, rank: 'Lieutenant', departmentRoles: ['LSPD'], totalHours: 360000, licenses: [{id: 'l1-o5', name: 'Führerschein Klasse B', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}, {id: 'l2-o5', name: 'Waffenschein', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}, {id: 'l3-o5', name: 'Pilotenschein Klasse A', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}] },
        { id: 'o6', badgeNumber: '101', firstName: 'Susan', lastName: 'Miller', phoneNumber: '555-2345', gender: Gender.Female, rank: 'Captain', departmentRoles: ['LSPD'], totalHours: 480000, licenses: [{id: 'l1-o6', name: 'Führerschein Klasse B', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}, {id: 'l2-o6', name: 'Waffenschein', issuedBy: 'System', issuedAt: new Date(2020,1,1), expiresAt: farFuture}] },
    ];

    const initialCredentials: AccessCredentials[] = [
      { id: 'cred-o1', officerId: 'o1', username: 'john.doe', password: 'password', createdAt: new Date() },
      { id: 'cred-o2', officerId: 'o2', username: 'jane.smith', password: 'password', createdAt: new Date() },
      { id: 'cred-o3', officerId: 'o3', username: 'peter.jones', password: 'password', createdAt: new Date() },
      { id: 'cred-o4', officerId: 'o4', username: 'mary.williams', password: 'password', createdAt: new Date() },
      { id: 'cred-o5', officerId: 'o5', username: 'david.brown', password: 'password', createdAt: new Date() },
      { id: 'cred-o6', officerId: 'o6', username: 'susan.miller', password: 'password', createdAt: new Date() },
    ];

    const today = new Date();
    const overdueDate = new Date(); overdueDate.setDate(today.getDate() - 1);
    const soonDate = new Date(); soonDate.setDate(today.getDate() + 1);
    const futureDate = new Date(); futureDate.setDate(today.getDate() + 7);
    const justCheckedDate = new Date(); justCheckedDate.setDate(today.getDate() - 5);

    const initialMasterFleet: Vehicle[] = [
        createVehicle('v1', 'Scout 1', 'SUV Scout', 4, 'LS 12345', 54321),
        createVehicle('v2', 'Scout 2', 'SUV Scout', 4, 'LS 67890', 12345),
        createVehicle('v3', 'Buffalo 1', 'Buffalo', 4, 'LS 54321', 98765),
        createVehicle('v4', 'Cruiser 1', 'Cruiser', 2, 'LS 98765', 34567),
        createVehicle('v5', 'Cruiser 2', 'Cruiser', 2, 'LS 24680', 87654),
        createVehicle('v6', 'Interceptor 1', 'Interceptor', 2, 'LS 13579', 23456),
        createVehicle('v7', 'Interceptor 2', 'Interceptor', 2, 'LS 11223', 65432),
    ];
    initialMasterFleet[0].nextCheckup = overdueDate; initialMasterFleet[0].lastCheckup = justCheckedDate;
    initialMasterFleet[1].nextCheckup = soonDate; initialMasterFleet[1].lastCheckup = justCheckedDate;
    initialMasterFleet[2].nextCheckup = futureDate; initialMasterFleet[2].lastCheckup = justCheckedDate;
    initialMasterFleet.forEach(v => { v.lastMileage = v.mileage - Math.floor(Math.random() * 2000 + 500) });

    const initialEmails: Email[] = [
        {
            id: 'email1',
            senderId: 'o2', // Jane Smith
            recipientIds: ['o1'], // John Doe
            ccIds: ['o6'], // Susan Miller
            subject: 'Wöchentliches Briefing',
            body: 'Hallo John,\n\ndenk bitte an das wöchentliche Briefing morgen um 09:00 Uhr.\n\nGruß,\nJane',
            attachments: [],
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            readBy: [],
            isDeletedFor: [],
            starredBy: [],
            status: 'sent',
            label: undefined,
        },
        {
            id: 'email2',
            senderId: 'o1', // John Doe
            recipientIds: ['o2'], // Jane Smith
            ccIds: [],
            subject: 'Re: Wöchentliches Briefing',
            body: 'Hallo Jane,\n\ndanke für die Erinnerung. Ich werde da sein.\n\nGruß,\nJohn',
            attachments: [],
            timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
            readBy: ['o2'],
            isDeletedFor: [],
            starredBy: [],
            status: 'sent',
            label: undefined,
        }
    ];

    return {
        officers: initialOfficers,
        masterFleet: initialMasterFleet,
        vehicles: [
            {
                ...initialMasterFleet.find(v => v.id === 'v4')!,
                seats: [initialOfficers.find(o => o.id === 'o3')!, initialOfficers.find(o => o.id === 'o4')!],
                status: 1 as VehicleStatus, funkChannel: 'Funk 1.1', callsign: 'SG',
            }
        ],
        headerRoles: {
            dispatch: initialOfficers[0], 'co-dispatch': null, air1: null, air2: null,
        } as Record<HeaderRole, Officer | null>,
        currentUser: null,
        sanctions: [] as Sanction[],
        itLogs: [] as ITLog[],
        accessCredentials: initialCredentials,
        documents: [] as Document[],
        modules: [] as Module[],
        officerChecklists: {} as Record<string, OfficerChecklist>,
        mailboxMessages: [] as MailboxMessage[],
        checklistMailbox: [] as ChecklistMailboxMessage[],
        homepageContent: [
            { id: 'hp2', type: 'text', content: 'Dies ist die offizielle Startseite des Los Santos Police Department. Hier finden Sie wichtige Informationen und Ankündigungen.\n- #Wichtig(rot)#: Alle Einheiten müssen sich vor Dienstbeginn ausrüsten.\n- #Info(blau)#: Die wöchentliche Besprechung findet jeden Sonntag statt.', x: 50, y: 80, isLocked: false },
            { 
              id: 'hp3', 
              type: 'button', 
              content: 'Regelwerk öffnen', 
              x: 50, 
              y: 220, 
              isLocked: false, 
              action: 'openPopout',
              popoutSize: 'medium',
              popoutContent: [
                { id: 'pop1', type: 'heading', content: 'LSPD Regelwerk', x: 20, y: 20, isLocked: true },
                { id: 'pop2', type: 'text', content: '1. #Allgemeine Regeln#\n- Jeder Officer hat sich an die Gesetze zu halten.\n- Respektvoller Umgang ist Pflicht.\n\n2. #Dienstvorschriften#\n- Die Dienstuniform ist stets zu tragen.\n- Das Tragen einer Waffe ist nur im Dienst gestattet.', x: 20, y: 100, isLocked: true }
              ] 
            },
            { id: 'hp-team-btn', type: 'button', content: 'Unser Team', x: 50, y: 280, isLocked: false, action: 'openTeamModal' },
        ] as HomepageElement[],
        publicHomepageContent: [
            { id: 'php1', type: 'heading', content: 'Los Santos Police Department', x: 50, y: 20, isLocked: true },
            { id: 'php2', type: 'text', content: 'Willkommen auf der offiziellen Seite des LSPD.\n\n#Info(blau)#: Unser Ziel ist es, die Bürger von Los Santos zu schützen und ihnen zu dienen. Hier finden Sie aktuelle Informationen zu unserer Arbeit, Pressemitteilungen und wie Sie mit uns in Kontakt treten können.', x: 50, y: 100, isLocked: true },
            { id: 'php3', type: 'text', content: '#Aktuelle Meldungen#\n- #Wichtig(rot)#: Straßensperrung am Del Perro Freeway aufgrund von Bauarbeiten. Bitte umfahren Sie das Gebiet weiträumig.\n- Die Bewerbungsphase für neue Rekruten ist nun geöffnet. Besuchen Sie unseren Karrierebereich für mehr Informationen.', x: 50, y: 250, isLocked: true },
            { id: 'php-team-btn-public', type: 'button', content: 'Unser Team', x: 50, y: 450, isLocked: false, action: 'openTeamModal' }
        ] as HomepageElement[],
        checklistTemplate: `# Allgemeine Checkliste #\n- Ausrüstung geprüft\n- Fahrzeug-Check durchgeführt\n- Status im Funk gemeldet\n# Verhalten im Dienst #\n- Respektvoller Umgang mit Bürgern\n- Einhaltung der StVO\n# Nach dem Dienst #\n- Bericht geschrieben\n- Ausrüstung abgegeben`,
        emails: initialEmails,
        funkChannels: [
          { name: 'PD', start: 1, end: 3 },
          { name: 'FIB', start: 4, end: 5 },
          { name: 'USMS', start: 6, end: 7 },
          { name: 'LSMD', start: 8, end: 10 },
          { name: 'DOJ', start: 11, end: 12 },
        ],
        callsignData: {
          general: [
              { code: '10-01', meaning: 'Dienst Antritt' },
              { code: '10-02', meaning: 'Dienst Austritt' },
              { code: '10-03', meaning: 'Funkcheck' },
              { code: '10-04', meaning: 'Information verstanden' },
              { code: '10-09', meaning: 'Funkspruch' },
              { code: '10-15', meaning: 'Verdächtiger in Gewahrsam' },
              { code: '10-17', meaning: 'Rückkehr zum Department mit TV' },
              { code: '10-19', meaning: 'Rückkehr' },
              { code: '10-20', meaning: 'Aktuelle Position' },
              { code: '10-22', meaning: 'Abholung benötigt' },
              { code: '10-28', meaning: 'Aktueller Status' },
              { code: '10-33', meaning: 'Verunfallt' },
              { code: '10-60', meaning: 'Aktive Verkehrskontrolle' },
              { code: '10-78', meaning: 'Dringend Verstärkung benötigt' },
              { code: '10-79', meaning: 'Request Air Support' },
              { code: '10-80', meaning: 'Aktive Verfolgungsjagd' },
              { code: '10-90', meaning: 'Officer in Bedrängnis' },
              { code: '11-99', meaning: 'Officer unter starkem Beschuss (äußerster Notfall)' },
              { code: 'Shots fired', meaning: 'Schüsse abgegeben oder gefallen' },
              { code: 'Security Check', meaning: 'Frage von Duspatch ob alles in Ordnung ist' },
          ],
          status: [
              { code: 'Code 0', meaning: 'Gamecrash / Kopfschmerzen' },
              { code: 'Code 1', meaning: 'Einsatzbereit / Streifenfahrt' },
              { code: 'Code 2', meaning: 'Anfahrt des Dispatches ohne Sonderrechte' },
              { code: 'Code 3', meaning: 'Anfahrt des Dispatches mit Sonderrechte' },
              { code: 'Code 4', meaning: 'Keine weiteren Einheiten benötigt / Einsatz beendet' },
              { code: 'Code 5', meaning: 'Stand-By' },
              { code: 'Code 6', meaning: 'Pause' },
          ],
          unit: [
              { code: 'Sam', meaning: 'Einzelstreife' },
              { code: 'Adam', meaning: 'Doppeltstreife' },
              { code: 'Paul', meaning: 'Sergent Streife' },
              { code: 'Metro', meaning: 'SWAT Streife' },
              { code: 'Air', meaning: 'Overwatch' },
              { code: 'David', meaning: 'Detective Streife' },
              { code: 'Motor', meaning: 'Motorradeinheit' },
              { code: 'Tom', meaning: 'Traffic Division' },
          ],
        },
        timeClockState: {} as Record<string, { clockInTime: number | null }>,
    };
};

type AppState = ReturnType<typeof getInitialState>;

// --- STATE PERSISTENCE & REAL-TIME SIMULATION ---

const OLD_APP_STATE_KEY = 'lspdAppState';
const APP_DATA_KEY = 'lspd_dispatch_data';
const TIMECLOCK_DATA_KEY = 'lspd_timeclock_data'; // Kept for migration


const rehydrateState = (stateToProcess: AppState): AppState => {
    // Rehydration logic for the loaded state
    stateToProcess.masterFleet?.forEach((v: Vehicle) => {
        if (v.lastCheckup) v.lastCheckup = new Date(v.lastCheckup);
        if (v.nextCheckup) v.nextCheckup = new Date(v.nextCheckup);
    });
    stateToProcess.sanctions?.forEach((s: Sanction) => s.timestamp = new Date(s.timestamp));
    stateToProcess.itLogs?.forEach((l: ITLog) => l.timestamp = new Date(l.timestamp));
    stateToProcess.accessCredentials?.forEach((c: AccessCredentials) => c.createdAt = new Date(c.createdAt));
    stateToProcess.mailboxMessages?.forEach((m: MailboxMessage) => m.timestamp = new Date(m.timestamp));
    stateToProcess.checklistMailbox?.forEach((m: ChecklistMailboxMessage) => m.timestamp = new Date(m.timestamp));
    if (stateToProcess.emails) {
        stateToProcess.emails.forEach((e: Email) => {
            e.timestamp = new Date(e.timestamp);
            if (!e.starredBy) e.starredBy = [];
            if (!e.status) e.status = 'sent';
            if (!e.label) e.label = undefined;
        });
    }

    if (stateToProcess.officers) {
        stateToProcess.officers.forEach((officer: Officer) => {
            officer.licenses = (officer.licenses || []).map((lic: any) => {
              if (typeof lic === 'string') {
                return {
                  id: `migrated-${Math.random()}`,
                  name: lic,
                  issuedBy: 'System (migrated)',
                  issuedAt: new Date(2020, 0, 1),
                  expiresAt: new Date(2030, 0, 1)
                };
              }
              return { ...lic, issuedAt: new Date(lic.issuedAt), expiresAt: new Date(lic.expiresAt) };
            });
        });
    }
    return stateToProcess;
};


const loadState = (): AppState => {
    try {
        let stateToProcess: AppState | null = null;
        
        const dataContainerStr = localStorage.getItem(APP_DATA_KEY);
        if (dataContainerStr) {
            const dataContainer = JSON.parse(dataContainerStr);
            stateToProcess = dataContainer.appState;
        } else {
            const oldStateStr = localStorage.getItem(OLD_APP_STATE_KEY);
            if (oldStateStr) {
                console.log("Migrating application state to new, structured format.");
                stateToProcess = JSON.parse(oldStateStr);
                localStorage.removeItem(OLD_APP_STATE_KEY);
            }
        }
        
        if (stateToProcess === null) {
            return getInitialState();
        }

        // Migration for separate timeClockState
        if (!stateToProcess.timeClockState) {
            const timeClockDataStr = localStorage.getItem(TIMECLOCK_DATA_KEY);
            stateToProcess.timeClockState = timeClockDataStr ? JSON.parse(timeClockDataStr) : {};
            localStorage.removeItem(TIMECLOCK_DATA_KEY);
        }

        const rehydratedState = rehydrateState(stateToProcess);
        
        const initialState = getInitialState();

        // Restore logged in user from session storage
        const loggedInOfficerId = sessionStorage.getItem('loggedInOfficerId');
        let currentUser: Officer | null = null;
        if (loggedInOfficerId && rehydratedState.officers) {
            currentUser = rehydratedState.officers.find((o: Officer) => o.id === loggedInOfficerId) || null;
        }

        return { ...initialState, ...rehydratedState, currentUser };

    } catch (err) {
        console.error("Could not load state from local storage", err);
        return getInitialState();
    }
};

const SaveStatusIndicator: React.FC<{ status: 'idle' | 'unsaved' | 'saving' | 'saved' }> = ({ status }) => {
    const getStatusContent = () => {
        switch (status) {
            case 'saved':
                return {
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    ),
                    text: 'Live synchronisiert',
                    color: 'text-green-300'
                };
            case 'idle':
            case 'unsaved':
            case 'saving':
            default:
                return null;
        }
    };

    const content = getStatusContent();
    const isVisible = status === 'saved';

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
             {content && (
                <div className={`flex items-center gap-2 px-3 py-1.5 bg-gray-950/70 backdrop-blur-sm border border-gray-700 rounded-full shadow-lg text-xs font-medium ${content.color}`}>
                    {content.icon}
                    <span>{content.text}</span>
                </div>
            )}
        </div>
    );
};

// Rank check helper function
const srSergeantRankIndex = RANKS.indexOf('Sr. Sergeant');
const isHighRank = (rank: Rank): boolean => {
    if (srSergeantRankIndex === -1) return false;
    return RANKS.indexOf(rank) >= srSergeantRankIndex;
};


// Main App Component
const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>(loadState);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved'>('idle');

    // --- REAL-TIME STATE SYNCHRONIZATION ---
    // This useCallback ensures the update function itself doesn't change on every render.
    const updateAndBroadcastState = useCallback((updater: React.SetStateAction<AppState>) => {
        // Use the functional update form of setState to get the latest state
        setAppState(currentState => {
            const newState = typeof updater === 'function' ? updater(currentState) : updater;
            
            try {
                // The state is broadcast to other tabs/windows via localStorage.
                // In a real application, this would be a call to a backend service (e.g., Firebase, WebSocket).
                // currentUser is NOT saved in the shared state, as each tab can have its own logged-in user.
                const stateToSave = { ...newState, currentUser: null };
                const serializedData = JSON.stringify({ appState: stateToSave });
                localStorage.setItem(APP_DATA_KEY, serializedData);

                // Provide visual feedback for the sync
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);

            } catch (err) {
                console.error("Could not save and broadcast state", err);
            }
            
            return newState;
        });
    }, []);

    // This useEffect sets up the listener for changes from other tabs.
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === APP_DATA_KEY && event.newValue) {
                 // A change happened in another tab. Update this tab's state.
                try {
                    const dataContainer = JSON.parse(event.newValue);
                    let receivedState = dataContainer.appState;
                    
                    if (receivedState) {
                        // Rehydrate the state (e.g., convert date strings back to Date objects)
                        receivedState = rehydrateState(receivedState);
                        
                        // Update the state, but preserve the currentUser of this specific tab
                        setAppState(prevState => ({
                            ...prevState, // keep old state as base
                            ...receivedState, // apply new shared state
                            currentUser: prevState.currentUser, // preserve this tab's user
                        }));
                    }
                } catch (err) {
                    console.error("Error processing state from another tab", err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    const {
        officers, masterFleet, vehicles, headerRoles, currentUser,
        sanctions, itLogs, accessCredentials, documents, modules,
        officerChecklists, mailboxMessages, checklistMailbox, homepageContent, publicHomepageContent, 
        checklistTemplate, emails, funkChannels, callsignData, timeClockState
    } = appState;

    // --- STATE SETTERS (now using the centralized update function) ---
    const setOfficers = (updater: React.SetStateAction<Officer[]>) => updateAndBroadcastState(prev => ({ ...prev, officers: typeof updater === 'function' ? updater(prev.officers) : updater }));
    const setMasterFleet = (updater: React.SetStateAction<Vehicle[]>) => updateAndBroadcastState(prev => ({ ...prev, masterFleet: typeof updater === 'function' ? updater(prev.masterFleet) : updater }));
    const setVehicles = (updater: React.SetStateAction<Vehicle[]>) => updateAndBroadcastState(prev => ({ ...prev, vehicles: typeof updater === 'function' ? updater(prev.vehicles) : updater }));
    const setHeaderRoles = (updater: React.SetStateAction<Record<HeaderRole, Officer | null>>) => updateAndBroadcastState(prev => ({ ...prev, headerRoles: typeof updater === 'function' ? updater(prev.headerRoles) : updater }));
    const setCurrentUser = (user: Officer | null) => setAppState(prev => ({ ...prev, currentUser: user })); // currentUser is local to the tab, not broadcast
    const setSanctions = (updater: React.SetStateAction<Sanction[]>) => updateAndBroadcastState(prev => ({ ...prev, sanctions: typeof updater === 'function' ? updater(prev.sanctions) : updater }));
    const setItLogs = (updater: React.SetStateAction<ITLog[]>) => updateAndBroadcastState(prev => ({ ...prev, itLogs: typeof updater === 'function' ? updater(prev.itLogs) : updater }));
    const setAccessCredentials = (updater: React.SetStateAction<AccessCredentials[]>) => updateAndBroadcastState(prev => ({ ...prev, accessCredentials: typeof updater === 'function' ? updater(prev.accessCredentials) : updater }));
    const setDocuments = (updater: React.SetStateAction<Document[]>) => updateAndBroadcastState(prev => ({ ...prev, documents: typeof updater === 'function' ? updater(prev.documents) : updater }));
    const setModules = (updater: React.SetStateAction<Module[]>) => updateAndBroadcastState(prev => ({ ...prev, modules: typeof updater === 'function' ? updater(prev.modules) : updater }));
    const setOfficerChecklists = (updater: React.SetStateAction<Record<string, OfficerChecklist>>) => updateAndBroadcastState(prev => ({ ...prev, officerChecklists: typeof updater === 'function' ? updater(prev.officerChecklists) : updater }));
    const setMailboxMessages = (updater: React.SetStateAction<MailboxMessage[]>) => updateAndBroadcastState(prev => ({ ...prev, mailboxMessages: typeof updater === 'function' ? updater(prev.mailboxMessages) : updater }));
    const setChecklistMailbox = (updater: React.SetStateAction<ChecklistMailboxMessage[]>) => updateAndBroadcastState(prev => ({ ...prev, checklistMailbox: typeof updater === 'function' ? updater(prev.checklistMailbox) : updater }));
    const setHomepageContent = (updater: React.SetStateAction<HomepageElement[]>) => updateAndBroadcastState(prev => ({ ...prev, homepageContent: typeof updater === 'function' ? updater(prev.homepageContent) : updater }));
    const setPublicHomepageContent = (updater: React.SetStateAction<HomepageElement[]>) => updateAndBroadcastState(prev => ({ ...prev, publicHomepageContent: typeof updater === 'function' ? updater(prev.publicHomepageContent) : updater }));
    const setChecklistTemplate = (updater: React.SetStateAction<string>) => updateAndBroadcastState(prev => ({ ...prev, checklistTemplate: typeof updater === 'function' ? updater(prev.checklistTemplate) : updater }));
    const setEmails = (updater: React.SetStateAction<Email[]>) => updateAndBroadcastState(prev => ({ ...prev, emails: typeof updater === 'function' ? updater(prev.emails) : updater }));
    type FunkChannelType = { name: string; start: number; end: number; };
    const setFunkChannels = (updater: React.SetStateAction<FunkChannelType[]>) => updateAndBroadcastState(prev => ({ ...prev, funkChannels: typeof updater === 'function' ? updater(prev.funkChannels) : updater }));
    type CallsignDataType = { general: { code: string; meaning: string }[]; status: { code: string; meaning: string }[]; unit: { code: string; meaning: string }[]; };
    const setCallsignData = (updater: React.SetStateAction<CallsignDataType>) => updateAndBroadcastState(prev => ({ ...prev, callsignData: typeof updater === 'function' ? updater(prev.callsignData) : updater }));
    const setTimeClockState = (updater: React.SetStateAction<Record<string, { clockInTime: number | null }>>) => updateAndBroadcastState(prev => ({ ...prev, timeClockState: typeof updater === 'function' ? updater(prev.timeClockState) : updater }));


    // Modal Visibility State
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isComposeEmailModalOpen, setIsComposeEmailModalOpen] = useState(false);
    const [draftToEdit, setDraftToEdit] = useState<Email | null>(null);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [popoutToView, setPopoutToView] = useState<{ content: HomepageElement[], size: 'small' | 'medium' | 'large' } | null>(null);
    const [isCallsignListModalOpen, setIsCallsignListModalOpen] = useState(false);
    const [isUprankRequestModalOpen, setIsUprankRequestModalOpen] = useState(false);
    const [isUprankSperreModalOpen, setIsUprankSperreModalOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);


    // --- LOGGING UTILITY ---
    const addLog = useCallback((eventType: ITLogEventType, category: LogCategory, details: string, meta: Record<string, any> = {}) => {
        if (!currentUser) return;
        const newLog: ITLog = {
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            eventType,
            actor: `${currentUser.firstName} ${currentUser.lastName}`,
            details,
            category,
            meta,
        };
        setItLogs(prev => [newLog, ...prev]);
    }, [currentUser, setItLogs]);

    // --- LOGIN LOGIC ---
    const handleLogin = async (username: string, password: string, rememberMe: boolean): Promise<boolean> => {
        const creds = accessCredentials.find(c => c.username.toLowerCase() === username.toLowerCase() && c.password === password);
        if (creds) {
            const officer = officers.find(o => o.id === creds.officerId);
            if (officer) {
                setCurrentUser(officer);
                sessionStorage.setItem('loggedInOfficerId', officer.id);
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', JSON.stringify({ username, password }));
                } else {
                    localStorage.removeItem('rememberedUser');
                }
                setIsLoginModalOpen(false); // Close modal on success
                return true;
            }
        }
        return false;
    };

    const handleLogout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('loggedInOfficerId');
        setActivePage('lspd'); // Reset to public homepage
    };
    
    // --- TIME CLOCK LOGIC ---
    const handleClockIn = useCallback(() => {
        if (!currentUser) return;
        setTimeClockState(prev => ({
            ...prev,
            [currentUser.id]: { clockInTime: Date.now() }
        }));
        addLog('clock_in', 'timeclock', `${currentUser.firstName} ${currentUser.lastName} hat sich eingestempelt.`, {
            officerName: `${currentUser.firstName} ${currentUser.lastName}`
        });
    }, [currentUser, addLog, setTimeClockState]);

    const handleClockOut = useCallback(() => {
        if (!currentUser) return;
        const clockData: { clockInTime: number | null } | undefined = timeClockState[currentUser.id];
        if (clockData && clockData.clockInTime) {
            const sessionDuration = Math.round((Date.now() - clockData.clockInTime) / 1000); // in seconds
            const newTotalHours = currentUser.totalHours + sessionDuration;
            
            updateAndBroadcastState(prev => {
                const newOfficers = prev.officers.map(o => 
                    o.id === currentUser.id 
                    ? { ...o, totalHours: newTotalHours }
                    : o
                );
                const newTimeClockState = {
                    ...prev.timeClockState,
                    [currentUser.id]: { clockInTime: null }
                };
                return { ...prev, officers: newOfficers, timeClockState: newTimeClockState };
            });

            const hours = String(Math.floor(sessionDuration / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((sessionDuration % 3600) / 60)).padStart(2, '0');
            const seconds = String(sessionDuration % 60).padStart(2, '0');
            const formattedDuration = `${hours}:${minutes}:${seconds}`;

            addLog('clock_out', 'timeclock', `${currentUser.firstName} ${currentUser.lastName} hat sich ausgestempelt. Schichtdauer: ${formattedDuration}.`, {
                durationInSeconds: sessionDuration,
                officerName: `${currentUser.firstName} ${currentUser.lastName}`,
                newTotalHours: newTotalHours,
            });
        }
    }, [currentUser, timeClockState, addLog, updateAndBroadcastState]);

    // --- UPRANK REQUEST LOGIC ---
    const handleConfirmUprankRequest = useCallback(() => {
        if (!currentUser) return;

        const hrOfficers = officers.filter(o => o.departmentRoles.includes('Personalabteilung'));
        if (hrOfficers.length === 0) {
            console.error("No HR officers found to send email to.");
            return;
        }
        
        const hrLead = officers.find(o => o.departmentRoles.includes('Leitung Personalabteilung')) || hrOfficers[0];

        const newEmail: Email = {
            id: `email-uprank-${currentUser.id}-${Date.now()}`,
            senderId: hrLead.id,
            recipientIds: hrOfficers.map(o => o.id),
            ccIds: [],
            subject: "Uprank Sperre",
            body: `Sehr geehrte Personalabteilung,\n\nder Officer ${currentUser.firstName} ${currentUser.lastName} (#${currentUser.badgeNumber}, Rang: ${currentUser.rank}) hat soeben eine Upranksperre für 7 Tage erhalten.\n\nDies ist eine automatische Benachrichtigung.\n\nMit freundlichen Grüßen,\nLSPD System`,
            attachments: [],
            timestamp: new Date(),
            readBy: [],
            isDeletedFor: [],
            starredBy: [],
            status: 'sent',
        };
        
        setEmails(prev => [newEmail, ...prev]);

        setIsUprankRequestModalOpen(false);
        setIsUprankSperreModalOpen(true);
        setShowConfetti(true);

        addLog('officer_updated', 'hr', `Officer ${currentUser.firstName} ${currentUser.lastName} requested an uprank and received a 7-day block.`);

    }, [currentUser, officers, setEmails, addLog]);

    const handleAcceptSperre = useCallback(() => {
        setIsUprankSperreModalOpen(false);
        setTimeout(() => setShowConfetti(false), 5000); 
    }, []);


    // Navigation and Layout State
    const [activePage, setActivePage] = useState<Page>('lspd');

    // Search and Filter State
    const [officerSearchTerm, setOfficerSearchTerm] = useState('');
    const [moduleSearchTerm, setModuleSearchTerm] = useState('');
    const [checklistSearchTerm, setChecklistSearchTerm] = useState('');
    const [serviceDocumentSearchTerm, setServiceDocumentSearchTerm] = useState('');

    // Modal Visibility State
    const [isFleetModalOpen, setIsFleetModalOpen] = useState(false);
    const [clearVehicleConfirmation, setClearVehicleConfirmation] = useState<Vehicle | null>(null);
    const [clearHeaderConfirmation, setClearHeaderConfirmation] = useState<HeaderRole | null>(null);
    const [isAddOfficerModalOpen, setIsAddOfficerModalOpen] = useState(false);
    const [isOfficerListModalOpen, setIsOfficerListModalOpen] = useState(false);
    const [officerToDetail, setOfficerToDetail] = useState<Officer | null>(null);
    const [officerToDelete, setOfficerToDelete] = useState<Officer | null>(null);
    const [isAddSanctionModalOpen, setIsAddSanctionModalOpen] = useState(false);
    const [sanctionToDetail, setSanctionToDetail] = useState<Sanction | null>(null);
    const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
    const [generatedCredentials, setGeneratedCredentials] = useState<{username: string, password: string} | null>(null);
    const [isTerminateOfficerModalOpen, setIsTerminateOfficerModalOpen] = useState(false);
    const [logToDetail, setLogToDetail] = useState<ITLog | null>(null);
    const [documentToView, setDocumentToView] = useState<Document | null>(null);
    const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
    const [moduleToView, setModuleToView] = useState<Module | null>(null);
    const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
    const [officerForChecklist, setOfficerForChecklist] = useState<Officer | null>(null);
    const [officerToAssignRole, setOfficerToAssignRole] = useState<Officer | null>(null);
    const [vehicleToEdit, setVehicleToEdit] = useState<Vehicle | null>(null);
    const [isHomepageEditModalOpen, setIsHomepageEditModalOpen] = useState(false);
    const [isChecklistTemplateModalOpen, setIsChecklistTemplateModalOpen] = useState(false);
    const [forceCompleteConfirmation, setForceCompleteConfirmation] = useState<{ officerId: string; step: 1 | 2 } | null>(null);
    const [checklistCompletionNotice, setChecklistCompletionNotice] = useState<{ officer: Officer; type: 'completed' | 'force_completed' } | null>(null);
    const [newOfficerConfirmation, setNewOfficerConfirmation] = useState<Officer | null>(null);
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false);
    const [assignmentRequestConfirmation, setAssignmentRequestConfirmation] = useState<Officer | null>(null);
    
    // Global Alert State
    const [globalShotsFiredAlert, setGlobalShotsFiredAlert] = useState<{ vehicleId: string, vehicleName: string, funkChannel: string, occupants: string[] } | null>(null);
    const [isAlertDismissed, setIsAlertDismissed] = useState(false);
    const [isIgnoreConfirm, setIsIgnoreConfirm] = useState(false);
    const ignoreConfirmTimeoutRef = useRef<number | null>(null);


    // Pinning State
    const [isPinningMode, setIsPinningMode] = useState(false);
    const [pinnedVehicleIds, setPinnedVehicleIds] = useState<Set<string>>(new Set());
    
    // --- GLOBAL ALERT ---
    useEffect(() => {
        if (globalShotsFiredAlert) {
            const timer = setTimeout(() => {
                setGlobalShotsFiredAlert(null);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [globalShotsFiredAlert]);

    const handleIgnoreAlert = () => {
        if (ignoreConfirmTimeoutRef.current) {
            clearTimeout(ignoreConfirmTimeoutRef.current);
        }

        if (isIgnoreConfirm) {
            setIsAlertDismissed(true);
            setIsIgnoreConfirm(false);
        } else {
            setIsIgnoreConfirm(true);
            ignoreConfirmTimeoutRef.current = window.setTimeout(() => {
                setIsIgnoreConfirm(false);
            }, 3000);
        }
    };

    const calculateChecklistProgress = useCallback((checklist: OfficerChecklist | undefined) => {
        if (!checklist) return { completed: 0, total: 0, percentage: 0 };
        if (checklist.isForceCompleted) {
            const lines = (checklist.content || '').split('\n');
            const total = lines.filter(line => line.trim() !== '' && !line.trim().startsWith('#')).length;
            return { completed: total, total: total > 0 ? total : 1, percentage: 100 };
        }
        const content = checklist.content;
        if (!content) return { completed: 0, total: 0, percentage: 0 };
        const lines = content.split('\n');
        const relevantLines = lines.filter(line => line.trim() !== '' && !line.trim().startsWith('#'));
        const total = relevantLines.length;
        const completed = relevantLines.filter(line => line.trim().startsWith('[x]')).length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;
        return { completed, total, percentage };
    }, []);

    // --- LICENSE EXPIRATION NOTIFICATIONS ---
    useEffect(() => {
        const checkLicenseExpirations = () => {
            const hrOfficers = officers.filter(o => o.departmentRoles.includes('Personalabteilung'));
            if (hrOfficers.length === 0) return;
    
            const senderId = hrOfficers[0].id;
            const newEmails: Email[] = [];
    
            officers.forEach(officer => {
                officer.licenses.forEach(license => {
                    const now = new Date();
                    const sevenDaysFromNow = new Date();
                    sevenDaysFromNow.setDate(now.getDate() + 7);
                    const expiresAt = new Date(license.expiresAt);
    
                    if (expiresAt > now && expiresAt < sevenDaysFromNow) {
                        const notificationSubject = `Automatische Benachrichtigung: Lizenzablauf - ${license.name}`;
                        const alreadyNotified = emails.some(email =>
                            email.subject === notificationSubject && email.recipientIds.includes(officer.id)
                        );
    
                        if (!alreadyNotified) {
                            newEmails.push({
                                id: `email-license-expiry-${license.id}-${Date.now()}`,
                                senderId: senderId,
                                recipientIds: [officer.id],
                                ccIds: hrOfficers.map(o => o.id).filter(id => id !== officer.id),
                                subject: notificationSubject,
                                body: `Sehr geehrte/r ${officer.firstName} ${officer.lastName},\n\nIhre Lizenz "${license.name}" läuft am ${expiresAt.toLocaleDateString('de-DE')} ab.\n\nBitte wenden Sie sich an einen Vorgesetzten mit dem Rang Captain oder höher, um eine Verlängerung zu beantragen.\n\nMit freundlichen Grüßen,\nPersonalabteilung LSPD`,
                                attachments: [],
                                timestamp: new Date(),
                                readBy: [],
                                isDeletedFor: [],
                                starredBy: [],
                                status: 'sent',
                            });
                        }
                    }
                });
            });
    
            if (newEmails.length > 0) {
                setEmails(prevEmails => [...newEmails, ...prevEmails]);
            }
        };
    
        // Run once on initial load after a short delay to ensure state is settled
        const timeoutId = setTimeout(checkLicenseExpirations, 2000);
        return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once

    // --- MAILBOX ---
    useEffect(() => {
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(new Date().getDate() + 2);
        twoDaysFromNow.setHours(0,0,0,0);
        
        const today = new Date();
        today.setHours(0,0,0,0);

        const newMessages: MailboxMessage[] = [];

        masterFleet.forEach(vehicle => {
            if (vehicle.nextCheckup) {
                const checkupDate = new Date(vehicle.nextCheckup);
                checkupDate.setHours(0,0,0,0);

                if (checkupDate <= twoDaysFromNow) {
                    const messageExists = mailboxMessages.some(m => m.vehicleName === vehicle.name);
                    if (!messageExists) {
                        const messageText = checkupDate < today
                            ? `Der Checkup für ${vehicle.name} ist überfällig!`
                            : `Der Checkup für ${vehicle.name} ist in Kürze fällig.`;
                        
                        newMessages.push({
                            id: `msg-${vehicle.id}-${Date.now()}`,
                            vehicleName: vehicle.name,
                            message: messageText,
                            timestamp: new Date(),
                            isRead: false,
                        });
                    }
                }
            }
        });

        if (newMessages.length > 0) {
            setMailboxMessages(prev => [...prev, ...newMessages].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [masterFleet]);
    
    const handleMarkMessageAsRead = (messageId: string) => {
        setMailboxMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
    };
    
    const handleDeleteMessage = (messageId: string) => {
        setMailboxMessages(prev => prev.filter(m => m.id !== messageId));
    };

    const handleMarkChecklistMessageAsRead = (messageId: string) => {
        setChecklistMailbox(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
    };
    
    const handleDeleteChecklistMessage = (messageId: string) => {
        setChecklistMailbox(prev => prev.filter(m => m.id !== messageId));
    };

    // --- EMAIL HANDLERS ---
    const handleSendEmail = useCallback((data: { recipients: Officer[]; cc: Officer[]; subject: string; body: string; attachments: EmailAttachment[], label?: EmailLabel }, draftId?: string | null) => {
        if (!currentUser) return;

        if (draftId) {
            setEmails(prev => prev.map(e => {
                if (e.id === draftId) {
                    return {
                        ...e,
                        recipientIds: data.recipients.map(o => o.id),
                        ccIds: data.cc.map(o => o.id),
                        subject: data.subject,
                        body: data.body,
                        attachments: data.attachments,
                        timestamp: new Date(),
                        status: 'sent',
                        label: data.label,
                    };
                }
                return e;
            }));
        } else {
            const newEmail: Email = {
                id: `email-${Date.now()}-${Math.random()}`,
                senderId: currentUser.id,
                recipientIds: data.recipients.map(o => o.id),
                ccIds: data.cc.map(o => o.id),
                subject: data.subject,
                body: data.body,
                attachments: data.attachments,
                timestamp: new Date(),
                readBy: [],
                isDeletedFor: [],
                starredBy: [],
                status: 'sent',
                label: data.label,
            };
            setEmails(prev => [newEmail, ...prev]);
        }

        addLog('email_sent', 'officer', `Sent email with subject "${data.subject}" to ${data.recipients.length} recipients.`);
        setIsComposeEmailModalOpen(false);
    }, [currentUser, setEmails, addLog]);

    const handleSaveDraft = useCallback(async (draftData: Partial<Email>): Promise<Email> => {
        if (!currentUser) {
            throw new Error("No current user");
        }
    
        if (draftData.id) {
            // Update existing draft
            let updatedDraft: Email | undefined;
            setEmails(prev => prev.map(e => {
                if (e.id === draftData.id) {
                    updatedDraft = { ...e, ...draftData, timestamp: new Date() };
                    return updatedDraft;
                }
                return e;
            }));
            return updatedDraft!;
        } else {
            // Create new draft
            const newDraft: Email = {
                id: `email-${Date.now()}-${Math.random()}`,
                senderId: currentUser.id,
                recipientIds: draftData.recipientIds || [],
                ccIds: draftData.ccIds || [],
                subject: draftData.subject || '',
                body: draftData.body || '',
                attachments: draftData.attachments || [],
                timestamp: new Date(),
                readBy: [],
                isDeletedFor: [],
                starredBy: [],
                status: 'draft',
                label: draftData.label
            };
            setEmails(prev => [newDraft, ...prev]);
            return newDraft;
        }
    }, [currentUser, setEmails]);

    const handleDeleteDraft = useCallback((emailId: string) => {
        setEmails(prev => prev.filter(email => email.id !== emailId));
    }, [setEmails]);


    const handleMarkEmailAsRead = useCallback((emailId: string) => {
        if (!currentUser) return;
        setEmails(prev => prev.map(email => {
            if (email.id === emailId && !email.readBy.includes(currentUser.id)) {
                return { ...email, readBy: [...email.readBy, currentUser.id] };
            }
            return email;
        }));
    }, [currentUser, setEmails]);

    const handleDeleteEmail = useCallback((emailId: string) => {
        if (!currentUser) return;
        setEmails(prev => prev.map(email => {
            if (email.id === emailId && !email.isDeletedFor.includes(currentUser.id)) {
                return { ...email, isDeletedFor: [...email.isDeletedFor, currentUser.id] };
            }
            return email;
        }));
    }, [currentUser, setEmails]);

    const handleToggleStarEmail = useCallback((emailId: string) => {
        if (!currentUser) return;
        setEmails(prev => prev.map(email => {
            if (email.id === emailId) {
                const isStarred = email.starredBy.includes(currentUser.id);
                const newStarredBy = isStarred
                    ? email.starredBy.filter(id => id !== currentUser.id)
                    : [...email.starredBy, currentUser.id];
                return { ...email, starredBy: newStarredBy };
            }
            return email;
        }));
    }, [currentUser, setEmails]);

    const handleSetEmailLabel = useCallback((emailId: string, label: EmailLabel | null) => {
        if (!currentUser) return;
        setEmails(prev => prev.map(email => {
            if (email.id === emailId) {
                return { ...email, label: label === null ? undefined : label };
            }
            return email;
        }));
    }, [currentUser, setEmails]);

    // --- DRAG & DROP LOGIC ---
    const removeOfficerFromCurrentPosition = useCallback((officerId: string, options: { clearVehicles?: boolean, clearHeader?: boolean } = {}) => {
        const { clearVehicles = true, clearHeader = true } = options;

        updateAndBroadcastState(prev => {
            let newVehicles = prev.vehicles;
            if (clearVehicles) {
                newVehicles = prev.vehicles.map(v => ({
                    ...v,
                    seats: v.seats.map(s => (s?.id === officerId ? null : s)),
                }));
            }

            let newHeaderRoles = prev.headerRoles;
            if (clearHeader) {
                newHeaderRoles = { ...prev.headerRoles };
                (Object.keys(newHeaderRoles) as HeaderRole[]).forEach(role => {
                    if (newHeaderRoles[role]?.id === officerId) {
                        newHeaderRoles[role] = null;
                    }
                });
            }
            return { ...prev, vehicles: newVehicles, headerRoles: newHeaderRoles };
        });
    }, [updateAndBroadcastState]);


    const handleDropOnVehicle = useCallback((vehicleId: string, seatIndex: number, data: DragData) => {
        const targetVehicle = vehicles.find(v => v.id === vehicleId);
        if (!targetVehicle) return;

        const officerRank = data.officer.rank;
        const highRankOfficer = isHighRank(officerRank);

        // A high-rank officer is only removed from other vehicles, not header roles.
        // A low-rank officer is removed from everywhere.
        removeOfficerFromCurrentPosition(data.officer.id, { clearVehicles: true, clearHeader: !highRankOfficer });

        setVehicles(prev =>
            prev.map(v => {
                if (v.id === vehicleId) {
                    const newSeats = [...v.seats];
                    newSeats[seatIndex] = data.officer;
                    return { ...v, seats: newSeats };
                }
                return v;
            })
        );
        addLog('officer_assigned_vehicle', 'dispatch', `Assigned ${data.officer.firstName} ${data.officer.lastName} to vehicle ${targetVehicle.name}, seat ${seatIndex + 1}.`, {
            officerName: `${data.officer.firstName} ${data.officer.lastName}`,
            vehicleName: targetVehicle.name,
            seatIndex: seatIndex + 1,
        });
    }, [removeOfficerFromCurrentPosition, addLog, vehicles, setVehicles]);

    const handleOfficerDragStartFromVehicle = useCallback((officer: Officer, vehicleId: string, seatIndex: number): string => {
        const dragData: DragData = { type: DragType.OfficerFromVehicle, officer, source: { vehicleId, seatIndex } };
        return JSON.stringify(dragData);
    }, []);

    const handleDropOnHeader = useCallback((dragData: DragData, role: HeaderRole) => {
        const officerRank = dragData.officer.rank;
        const highRankOfficer = isHighRank(officerRank);

        // A high-rank officer is only removed from other header roles, not from vehicles.
        // A low-rank officer is removed from everywhere.
        removeOfficerFromCurrentPosition(dragData.officer.id, { clearVehicles: !highRankOfficer, clearHeader: true });

        setHeaderRoles(prev => ({ ...prev, [role]: dragData.officer }));
        addLog('officer_assigned_header', 'dispatch', `Assigned ${dragData.officer.firstName} ${dragData.officer.lastName} to header role ${role}.`, {
            officerName: `${dragData.officer.firstName} ${dragData.officer.lastName}`,
            role,
        });
    }, [removeOfficerFromCurrentPosition, addLog, setHeaderRoles]);

    const handleHeaderDragStart = useCallback((officer: Officer, role: HeaderRole): string => {
        const dragData: DragData = { type: DragType.OfficerFromHeader, officer, source: { headerRole: role } };
        return JSON.stringify(dragData);
    }, []);

    const handleDropOnSidebar = useCallback((data: DragData) => {
        const vehicleName = data.source?.vehicleId ? vehicles.find(v => v.id === data.source?.vehicleId)?.name : '';
        const sourceText = vehicleName ? `vehicle ${vehicleName}` : `header role ${data.source?.headerRole}`;
        
        // Dropping on sidebar always removes from all assignments.
        removeOfficerFromCurrentPosition(data.officer.id, { clearVehicles: true, clearHeader: true });

        addLog('officer_removed_vehicle', 'dispatch', `Removed ${data.officer.firstName} ${data.officer.lastName} from ${sourceText}.`, {
            officerName: `${data.officer.firstName} ${data.officer.lastName}`,
            source: vehicleName ? 'vehicle' : 'header',
            sourceName: vehicleName || data.source?.headerRole,
        });
    }, [removeOfficerFromCurrentPosition, addLog, vehicles]);


    // --- VEHICLE & HEADER CONTROLS ---
    const handleSetStatus = useCallback((vehicleId: string, status: VehicleStatus) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;

        if (globalShotsFiredAlert && globalShotsFiredAlert.vehicleId === vehicleId && status !== 7) {
            setGlobalShotsFiredAlert(null);
        }

        const vehicleName = vehicle.name || 'unknown vehicle';
        const funkChannel = vehicle.funkChannel || 'N/A';
        
        if (status === 7 && vehicle.seats.some(s => s !== null)) {
            const occupants = vehicle.seats
                .filter((s): s is Officer => s !== null)
                .map(o => `${o.firstName} ${o.lastName}`);
            setGlobalShotsFiredAlert({ vehicleId, vehicleName, funkChannel, occupants });
            setIsAlertDismissed(false);
        }
        setVehicles(prev => prev.map(v => (v.id === vehicleId ? { ...v, status } : v)));
        addLog('vehicle_status_updated', 'dispatch', `Updated status for vehicle ${vehicleName} to ${status}.`, {
            vehicleName,
            status,
        });
    }, [addLog, vehicles, setVehicles, globalShotsFiredAlert]);

    const handleSetFunkChannel = useCallback((vehicleId: string, channel: string) => {
        const vehicleName = vehicles.find(v=>v.id===vehicleId)?.name || 'unknown vehicle';
        setVehicles(prev => prev.map(v => (v.id === vehicleId ? { ...v, funkChannel: channel } : v)));
        addLog('vehicle_funk_updated', 'dispatch', `Updated funk for vehicle ${vehicleName} to ${channel}.`);
    }, [addLog, vehicles, setVehicles]);

    const handleSetCallsign = useCallback((vehicleId: string, callsign: string) => {
        const vehicleName = vehicles.find(v=>v.id===vehicleId)?.name || 'unknown vehicle';
        setVehicles(prev => prev.map(v => (v.id === vehicleId ? { ...v, callsign } : v)));
        addLog('vehicle_callsign_updated', 'dispatch', `Updated callsign for vehicle ${vehicleName} to ${callsign}.`);
    }, [addLog, vehicles, setVehicles]);

    const handleConfirmClearVehicle = useCallback(() => {
        if (clearVehicleConfirmation) {
            setVehicles(prev => prev.map(v => v.id === clearVehicleConfirmation.id ? { ...v, seats: Array(v.capacity).fill(null) } : v));
            addLog('vehicle_cleared', 'dispatch', `Cleared all officers from vehicle ${clearVehicleConfirmation.name}.`, {
                vehicleName: clearVehicleConfirmation.name,
            });
        }
        setClearVehicleConfirmation(null);
    }, [clearVehicleConfirmation, addLog, setVehicles]);

    const handleConfirmClearHeader = useCallback(() => {
        if (clearHeaderConfirmation) {
            setHeaderRoles(prev => ({ ...prev, [clearHeaderConfirmation]: null }));
            addLog('header_cleared', 'dispatch', `Cleared header role ${clearHeaderConfirmation}.`, {
                role: clearHeaderConfirmation,
            });
        }
        setClearHeaderConfirmation(null);
    }, [clearHeaderConfirmation, addLog, setHeaderRoles]);

    // --- FLEET MANAGEMENT ---
    const handleAddToGrid = useCallback((vehicle: Vehicle) => {
        if (!vehicles.some(v => v.id === vehicle.id)) {
            const newVehicle = {
                ...vehicle,
                seats: Array(vehicle.capacity).fill(null),
                status: 1 as VehicleStatus,
                funkChannel: 'Funk 1',
                callsign: 'Stand-By',
            };
            setVehicles(prev => [...prev, newVehicle]);
        }
    }, [vehicles, setVehicles]);
    
    const handleRemoveFromGrid = useCallback((vehicleId: string) => {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        setPinnedVehicleIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(vehicleId);
            return newSet;
        });
    }, [setVehicles]);

    const handleSaveVehicleEdit = (updatedVehicleData: Vehicle) => {
        const originalVehicle = masterFleet.find(v => v.id === updatedVehicleData.id);
        let finalVehicle = { ...updatedVehicleData };
    
        if (originalVehicle && originalVehicle.mileage !== updatedVehicleData.mileage) {
            finalVehicle.lastMileage = originalVehicle.mileage;
        }
    
        setMasterFleet(prev => prev.map(v => v.id === finalVehicle.id ? finalVehicle : v));
        setVehicles(prev => prev.map(v => v.id === finalVehicle.id ? { ...v, ...finalVehicle } : v));
        setVehicleToEdit(null);
    };

    const handleAddVehicle = (vehicleData: { name: string, category: VehicleCategory, capacity: number, licensePlate: string, mileage: number }) => {
        const newVehicle: Vehicle = {
            id: `v-${Date.now()}`,
            name: vehicleData.name,
            category: vehicleData.category,
            capacity: vehicleData.capacity,
            licensePlate: vehicleData.licensePlate,
            mileage: vehicleData.mileage,
            seats: Array(vehicleData.capacity).fill(null),
            status: null,
            funkChannel: null,
            callsign: null,
            lastMileage: 0,
            checkupList: [],
            lastCheckup: null,
            nextCheckup: null,
        };
        setMasterFleet(prev => [...prev, newVehicle]);
        addLog('vehicle_created', 'dispatch', `Created new vehicle: ${newVehicle.name} (${newVehicle.licensePlate}).`);
        setIsAddVehicleModalOpen(false);
    };

    // --- PINNING LOGIC ---
    const handleTogglePinVehicle = useCallback((vehicleId: string) => {
        setPinnedVehicleIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(vehicleId)) newSet.delete(vehicleId);
            else newSet.add(vehicleId);
            return newSet;
        });
    }, []);

    // --- DATA COMPUTATION (MEMOS) ---
    const availableOfficers = useMemo(() => {
        const officersInVehicle = new Set(vehicles.flatMap(v => v.seats.map(s => s?.id)).filter(Boolean));
        const officersInHeader = new Set(Object.values(headerRoles).map(o => o?.id).filter(Boolean));

        return officers.filter(o => {
            const highRankOfficer = isHighRank(o.rank);
            const inVehicle = officersInVehicle.has(o.id);
            const inHeader = officersInHeader.has(o.id);

            if (highRankOfficer) {
                // High rank officers are available if they are not in BOTH a vehicle AND a header role.
                return !(inVehicle && inHeader);
            } else {
                // Low rank officers are available if they are in NEITHER.
                return !inVehicle && !inHeader;
            }
        });
    }, [officers, vehicles, headerRoles]);

    const totalOfficersCount = officers.length;

    const clockedInOfficersCount = useMemo(() => {
        // FIX: The type of `status` can be `unknown` after rehydrating state from localStorage, causing a crash when accessing properties.
        // Cast to `any` to allow access to `clockInTime`. The preceding `status` check ensures it's not null/undefined.
        return Object.values(timeClockState).filter(status => status && (status as any).clockInTime !== null).length;
    }, [timeClockState]);

    const shotsFiredVehicles = useMemo(() => 
        vehicles.filter(v => v.status === 7 && v.seats.some(s => s !== null)), 
        [vehicles]
    );

    const filteredOfficers = useMemo(() => {
        if (!officerSearchTerm) return availableOfficers;
        const lowercasedTerm = officerSearchTerm.toLowerCase();
        return availableOfficers.filter(o =>
            `${o.firstName} ${o.lastName}`.toLowerCase().includes(lowercasedTerm) ||
            o.badgeNumber.includes(officerSearchTerm)
        );
    }, [officerSearchTerm, availableOfficers]);
    
    const unreadEmailCount = useMemo(() => {
        if (!currentUser) return 0;
        return emails.filter(email =>
            (email.recipientIds.includes(currentUser.id) || email.ccIds.includes(currentUser.id)) &&
            !email.readBy.includes(currentUser.id) &&
            !email.isDeletedFor.includes(currentUser.id) &&
            email.status === 'sent'
        ).length;
    }, [emails, currentUser]);

    // --- PAGE-SPECIFIC HANDLERS ---
    
    // HR Handlers
    const handleAddOfficer = (officerData: Omit<Officer, 'id' | 'departmentRoles' | 'totalHours' | 'licenses'>) => {
        const farFuture = new Date(); farFuture.setFullYear(farFuture.getFullYear() + 10);
        const newOfficer: Officer = {
            ...officerData,
            id: `o-${Date.now()}`,
            departmentRoles: [],
            totalHours: 0,
            licenses: [
                { id: `l-default-${Date.now()}-1`, name: 'Führerschein Klasse B', issuedBy: 'System', issuedAt: new Date(), expiresAt: farFuture },
                { id: `l-default-${Date.now()}-2`, name: 'Waffenschein', issuedBy: 'System', issuedAt: new Date(), expiresAt: farFuture },
            ],
        };
        setOfficers(prev => [...prev, newOfficer]);
        addLog('officer_created', 'hr', `Created new officer: ${newOfficer.firstName} ${newOfficer.lastName} (#${newOfficer.badgeNumber}).`, { officerName: `${newOfficer.firstName} ${newOfficer.lastName}` });
        setIsAddOfficerModalOpen(false);
        setNewOfficerConfirmation(newOfficer);
    };

    const handleUpdateOfficer = (updatedOfficer: Officer) => {
        setOfficers(prev => prev.map(o => o.id === updatedOfficer.id ? updatedOfficer : o));
        if(currentUser?.id === updatedOfficer.id) {
            setCurrentUser(updatedOfficer);
        }
        setOfficerToDetail(updatedOfficer); // Keep modal open with updated data
        addLog('officer_updated', 'hr', `Updated details for officer: ${updatedOfficer.firstName} ${updatedOfficer.lastName}.`);
    };

    const handleRequestDeleteOfficer = (officer: Officer) => {
        setOfficerToDetail(null);
        setOfficerToDelete(officer);
    };

    const handleConfirmDeleteOfficer = () => {
        if (officerToDelete) {
            setOfficers(prev => prev.filter((o: Officer) => o.id !== officerToDelete.id));
            addLog('officer_terminated', 'hr', `Terminated officer (hard delete): ${officerToDelete.firstName} ${officerToDelete.lastName}.`);
        }
        setOfficerToDelete(null);
    };
    
    const handleAddSanction = (officer: Officer, sanctionType: SanctionType, reason: string) => {
        if (!currentUser) return;
        const newSanction: Sanction = {
            id: `sanc-${Date.now()}`,
            officer,
            sanctionType,
            reason,
            issuedBy: `${currentUser.firstName} ${currentUser.lastName}`,
            timestamp: new Date(),
        };
        setSanctions(prev => [newSanction, ...prev]);
        addLog('sanction_issued', 'hr', `Issued sanction (${sanctionType}) to ${officer.firstName} ${officer.lastName}.`);
        setIsAddSanctionModalOpen(false);
    };

    const handleCreateCredentials = (officer: Officer) => {
        const username = `${officer.firstName.toLowerCase()}.${officer.lastName.toLowerCase()}`;
        const password = Math.random().toString(36).slice(-8);
        const newCreds: AccessCredentials = {
            id: `cred-${officer.id}`,
            officerId: officer.id,
            username,
            password,
            createdAt: new Date(),
        };
        setAccessCredentials(prev => [...prev, newCreds]);
        setGeneratedCredentials({ username, password });
        addLog('credential_created', 'hr', `Created credentials for ${officer.firstName} ${officer.lastName}.`);
    };

    const handleRegeneratePassword = (credential: AccessCredentials) => {
        const password = Math.random().toString(36).slice(-8);
        setAccessCredentials(prev => prev.map(c => c.id === credential.id ? { ...c, password } : c));
        setGeneratedCredentials({ username: credential.username, password });
        addLog('password_regenerated', 'hr', `Regenerated password for ${credential.username}.`);
    };

    const handleDeleteCredential = (credential: AccessCredentials) => {
        setAccessCredentials(prev => prev.filter(c => c.id !== credential.id));
        addLog('credential_deleted', 'hr', `Deleted credentials for ${credential.username}.`);
    };

    const handleTerminateOfficer = (officer: Officer) => {
        setOfficers(prev => prev.filter(o => o.id !== officer.id));
        setAccessCredentials(prev => prev.filter(c => c.officerId !== officer.id));
        removeOfficerFromCurrentPosition(officer.id);
        addLog('officer_terminated', 'hr', `Terminated officer: ${officer.firstName} ${officer.lastName}.`, { officerName: `${officer.firstName} ${officer.lastName}` });
        setIsTerminateOfficerModalOpen(false);
    };

    const handleSaveRoles = (officerId: string, roles: DepartmentRole[]) => {
        setOfficers(prev => prev.map(o => o.id === officerId ? { ...o, departmentRoles: roles } : o));
        addLog('officer_role_updated', 'hr', `Updated department roles for officer ID ${officerId}.`);
        setOfficerToAssignRole(null);
    };

    const handleAddDocument = (title: string, content: string) => {
        const newDoc: Document = { id: `doc-${Date.now()}`, title, content };
        setDocuments(prev => [newDoc, ...prev]);
        setIsAddDocumentModalOpen(false);
    };
    const handleUpdateDocument = (doc: Document) => {
        setDocuments(prev => prev.map(d => d.id === doc.id ? doc : d));
    };
    const handleConfirmDeleteDocument = () => {
        if (documentToDelete) {
            setDocuments(prev => prev.filter(d => d.id !== documentToDelete.id));
        }
        setDocumentToDelete(null);
        setDocumentToView(null);
    };

    const handleAddModule = (title: string, content: string) => {
        const newModule: Module = { id: `mod-${Date.now()}`, title, content };
        setModules(prev => [newModule, ...prev]);
        setIsAddModuleModalOpen(false);
    };
    const handleUpdateModule = (mod: Module) => {
        setModules(prev => prev.map(d => d.id === mod.id ? mod : d));
    };
    const handleConfirmDeleteModule = () => {
        if (moduleToDelete) {
            setModules(prev => prev.filter(m => m.id !== moduleToDelete.id));
        }
        setModuleToDelete(null);
        setModuleToView(null);
    };

    const handleLogModuleView = (moduleTitle: string, durationInSeconds: number, isCompleted: boolean) => {
        addLog(
            'module_viewed',
            'officer',
            `Viewed module "${moduleTitle}". Duration: ${durationInSeconds}s. Completed: ${isCompleted ? 'Yes' : 'No'}.`,
            { moduleTitle, durationInSeconds, isCompleted }
        );
    };

    const handleAcknowledgeChecklistCompletion = (officerId: string) => {
        setOfficerChecklists(prev => ({
            ...prev,
            [officerId]: {
                ...prev[officerId],
                completionAcknowledged: true,
            }
        }));
        setChecklistCompletionNotice(null);
    };

    const handleUpdateChecklistContent = (officerId: string, content: string) => {
        const officer = officers.find(o => o.id === officerId);
        if (!officer) return;
    
        const oldChecklist = officerChecklists[officerId];
        const oldProgress = calculateChecklistProgress(oldChecklist);
    
        const newChecklist = {
            ...(oldChecklist || { content: '', assignedTo: null }),
            content
        };
    
        const newProgress = calculateChecklistProgress(newChecklist);
        
        let finalChecklist = { ...newChecklist };
    
        if (oldProgress.percentage < 100 && newProgress.percentage === 100) {
            const newMessage: ChecklistMailboxMessage = {
                id: `mail-${officerId}-${Date.now()}`,
                officerName: `${officer.firstName} ${officer.lastName}`,
                message: `Die Checkliste wurde abgeschlossen.`,
                timestamp: new Date(),
                isRead: false,
                type: 'completed'
            };
            setChecklistMailbox(prev => [newMessage, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setChecklistCompletionNotice({ officer, type: 'completed' });
            finalChecklist = { ...finalChecklist, completionAcknowledged: false };
        }
    
        setOfficerChecklists(prev => ({
            ...prev,
            [officerId]: finalChecklist
        }));
    
        addLog('checklist_item_updated', 'trainer', `Updated checklist for ${officer.firstName} ${officer.lastName}.`);
    };

    const handleUpdateChecklistNotes = (officerId: string, notes: string) => {
        const officer = officers.find(o => o.id === officerId);
        setOfficerChecklists(prev => {
            const existingChecklist = prev[officerId] || { content: '', assignedTo: null };
            return {
                ...prev,
                [officerId]: { ...existingChecklist, notes }
            };
        });
        addLog('checklist_item_updated', 'trainer', `Updated FTO notes for ${officer?.firstName} ${officer?.lastName}.`);
    };

    const executeToggleForceComplete = (officerId: string) => {
        const officer = officers.find(o => o.id === officerId);
        if (!officer) return;
    
        const isNowCompleted = !officerChecklists[officerId]?.isForceCompleted;
    
        if (isNowCompleted) {
            const newMessage: ChecklistMailboxMessage = {
                id: `mail-force-${officerId}-${Date.now()}`,
                officerName: `${officer.firstName} ${officer.lastName}`,
                message: `Der Abschluss der Checkliste wurde erzwungen.`,
                timestamp: new Date(),
                isRead: false,
                type: 'force_completed'
            };
            setChecklistMailbox(prev => [newMessage, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setChecklistCompletionNotice({ officer, type: 'force_completed' });
        }
    
        setOfficerChecklists(prev => {
            const existingChecklist = prev[officerId] || { content: '', assignedTo: null };
            return {
                ...prev,
                [officerId]: { 
                    ...existingChecklist, 
                    isForceCompleted: isNowCompleted,
                    completionAcknowledged: isNowCompleted ? false : existingChecklist.completionAcknowledged,
                }
            };
        });
        
        addLog('checklist_item_updated', 'trainer', `Manually ${isNowCompleted ? 'completed' : 're-opened'} checklist for ${officer?.firstName} ${officer?.lastName}.`);
    };

    const handleToggleForceCompleteRequest = (officerId: string) => {
        const isCurrentlyCompleted = !!officerChecklists[officerId]?.isForceCompleted;
        if (isCurrentlyCompleted) {
            executeToggleForceComplete(officerId);
        } else {
            setForceCompleteConfirmation({ officerId, step: 1 });
        }
    };

    const handleConfirmForceComplete = () => {
        if (!forceCompleteConfirmation) return;
        if (forceCompleteConfirmation.step === 1) {
            setForceCompleteConfirmation(prev => prev ? { ...prev, step: 2 } : null);
        } else {
            executeToggleForceComplete(forceCompleteConfirmation.officerId);
            setForceCompleteConfirmation(null);
        }
    };

    const handleCancelForceComplete = () => {
        setForceCompleteConfirmation(null);
    };
    
    const handleUndoChecklistCompletion = (officerId: string) => {
        const officer = officers.find((o: Officer) => o.id === officerId);
        setOfficerChecklists(prev => {
            if (!prev[officerId]) return prev;
            
            return {
                ...prev,
                [officerId]: {
                    ...prev[officerId],
                    isForceCompleted: false,
                    completionAcknowledged: false,
                }
            };
        });
        addLog('checklist_item_updated', 'trainer', `Re-opened completed checklist for ${officer?.firstName} ${officer?.lastName}.`);
    };

    const handleAssignChecklist = (officerId: string) => {
        if (!currentUser) return;
        const officer = officers.find(o => o.id === officerId);
        setOfficerChecklists(prev => {
            const existingContent = prev[officerId]?.content || checklistTemplate || `# Checkliste für ${officer?.firstName} #`;
            return {
                ...prev,
                [officerId]: {
                    ...prev[officerId],
                    content: existingContent,
                    assignedTo: `${currentUser.firstName} ${currentUser.lastName}`
                }
            };
        });
        addLog('checklist_assigned', 'trainer', `Assigned checklist for ${officer?.firstName} ${officer?.lastName} to self.`);
    };

    const handleUnassignChecklist = (officerId: string) => {
        const officer = officers.find(o => o.id === officerId);
        setOfficerChecklists(prev => {
            const existingChecklist = prev[officerId] || { content: '', assignedTo: null };
            return {
                ...prev,
                [officerId]: { ...existingChecklist, assignedTo: null }
            };
        });
        addLog('checklist_unassigned', 'trainer', `Unassigned checklist for ${officer?.firstName} ${officer?.lastName}.`);
    };

    const handleSaveHomepage = (newContent: HomepageElement[], type: 'officer' | 'public') => {
        if (type === 'officer') {
            setHomepageContent(newContent);
        } else {
            setPublicHomepageContent(newContent);
        }
        setIsHomepageEditModalOpen(false);
    };
    
    const handleSaveChecklistTemplate = (newTemplate: string) => {
        setChecklistTemplate(newTemplate);
        setIsChecklistTemplateModalOpen(false);
    };

    const handleRequestAssignmentTakeover = (officer: Officer) => {
        setAssignmentRequestConfirmation(officer);
    };

    const handleConfirmAssignmentTakeover = () => {
        if (!assignmentRequestConfirmation || !currentUser) return;
        const officer = assignmentRequestConfirmation;
        const originalFTO = officerChecklists[officer.id]?.assignedTo;
        const requestingFTO = currentUser;

        const newMessage: ChecklistMailboxMessage = {
            id: `mail-req-${officer.id}-${Date.now()}`,
            officerName: `${officer.firstName} ${officer.lastName}`,
            message: `Anfrage zur Übernahme von ${requestingFTO.firstName} ${requestingFTO.lastName}.`,
            timestamp: new Date(),
            isRead: false,
            type: 'assignment_request',
            officerId: officer.id,
            requestingFTOId: requestingFTO.id,
            requestingFTOName: `${requestingFTO.firstName} ${requestingFTO.lastName}`,
            originalFTO: originalFTO || 'Niemand',
        };

        setChecklistMailbox(prev => [newMessage, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        addLog('checklist_takeover_requested', 'trainer', `Requested takeover for ${officer.firstName} ${officer.lastName}'s checklist from ${originalFTO}.`);
        setAssignmentRequestConfirmation(null);
    };

    const handleApproveAssignmentTakeover = (messageId: string) => {
        const requestMessage = checklistMailbox.find(m => m.id === messageId);
        if (!requestMessage || !requestMessage.officerId || !requestMessage.requestingFTOName) return;
        
        const officerName = requestMessage.officerName;

        // Update checklist assignment
        setOfficerChecklists(prev => ({
            ...prev,
            [requestMessage.officerId!]: {
                ...prev[requestMessage.officerId!],
                assignedTo: requestMessage.requestingFTOName!,
            }
        }));

        // Notify requester
        const approvalMessage: ChecklistMailboxMessage = {
            id: `mail-approve-${requestMessage.officerId}-${Date.now()}`,
            officerName,
            message: `Ihre Anfrage zur Übernahme wurde genehmigt.`,
            timestamp: new Date(),
            isRead: false,
            type: 'assignment_approved',
            officerId: requestMessage.officerId,
        };

        // Remove old request and add new notification
        setChecklistMailbox(prev => 
            [...prev.filter(m => m.id !== messageId), approvalMessage]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        );

        addLog('checklist_takeover_approved', 'trainer', `Approved takeover for ${officerName}'s checklist. New FTO: ${requestMessage.requestingFTOName}.`);
    };

    const handleDenyAssignmentTakeover = (messageId: string) => {
        const requestMessage = checklistMailbox.find(m => m.id === messageId);
        if (!requestMessage || !requestMessage.officerId) return;

        const officerName = requestMessage.officerName;

        // Notify requester of denial
        const denialMessage: ChecklistMailboxMessage = {
            id: `mail-deny-${requestMessage.officerId}-${Date.now()}`,
            officerName,
            message: `Ihre Anfrage zur Übernahme wurde abgelehnt.`,
            timestamp: new Date(),
            isRead: false,
            type: 'assignment_denied',
            officerId: requestMessage.officerId,
        };

        // Remove old request and add new notification
        setChecklistMailbox(prev => 
            [...prev.filter(m => m.id !== messageId), denialMessage]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        );
        
        addLog('checklist_takeover_denied', 'trainer', `Denied takeover request for ${officerName}'s checklist.`);
    };

    // --- RENDER LOGIC ---
    const renderPage = () => {
        if (!currentUser) {
            return <PlaceholderPage title="Los Santos Police Department" content={publicHomepageContent} onOpenLoginModal={() => setIsLoginModalOpen(true)} onOpenTeamModal={() => setIsTeamModalOpen(true)} onOpenPopout={setPopoutToView} />;
        }
        switch(activePage) {
            case 'lspd':
                return <PlaceholderPage title="Los Santos Police Department" content={homepageContent} currentUser={currentUser} onLogout={handleLogout} onOpenTeamModal={() => setIsTeamModalOpen(true)} onOpenPopout={setPopoutToView} />;
            case 'mein_dienst':
                return <MeinDienstPage 
                    currentUser={currentUser}
// FIX: The type of `timeClockState` values can be `unknown` after rehydrating state from localStorage.
// Cast to `any` to allow access to `clockInTime`.
                    clockInTime={(timeClockState[currentUser.id] as any)?.clockInTime || null}
                    onClockIn={handleClockIn}
                    onClockOut={handleClockOut}
                    checklist={officerChecklists[currentUser.id]}
                    calculateChecklistProgress={calculateChecklistProgress}
                    onUprankRequest={() => setIsUprankRequestModalOpen(true)}
                />;
            case 'dispatch':
                return (
                    <div className="flex flex-col h-full bg-gray-950 text-white">
                        <Header onOpenFleetModal={() => setIsFleetModalOpen(true)} headerRoles={headerRoles} onDropOnHeader={handleDropOnHeader} onHeaderDragStart={handleHeaderDragStart} onRequestClearHeader={setClearHeaderConfirmation} currentUser={currentUser} isPinningMode={isPinningMode} onTogglePinningMode={() => setIsPinningMode(p => !p)} />
                        <main className="flex-1 flex overflow-hidden">
                            <div style={{ width: `250px` }} className="flex-shrink-0 h-full">
                                <OfficerSidebar
                                    officers={filteredOfficers}
                                    searchTerm={officerSearchTerm}
                                    setSearchTerm={setOfficerSearchTerm}
                                    onDrop={handleDropOnSidebar}
                                    shotsFiredVehicles={shotsFiredVehicles}
                                    availableOfficersCount={clockedInOfficersCount}
                                    totalOfficersCount={totalOfficersCount}
                                    onOpenCallsignListModal={() => setIsCallsignListModalOpen(true)}
                                    funkChannels={funkChannels}
                                    onUpdateFunkChannels={setFunkChannels}
                                    currentUser={currentUser}
                                />
                            </div>
                            <div className="flex-1 h-full">
                                <VehicleGrid
                                    vehicles={vehicles}
                                    onDropOnVehicle={handleDropOnVehicle}
                                    onOfficerDragStart={handleOfficerDragStartFromVehicle}
                                    onSetStatus={handleSetStatus}
                                    onClearRequest={setClearVehicleConfirmation}
                                    onSetFunkChannel={handleSetFunkChannel}
                                    onSetCallsign={handleSetCallsign}
                                    isPinningMode={isPinningMode}
                                    onTogglePinVehicle={handleTogglePinVehicle}
                                    pinnedVehicleIds={pinnedVehicleIds}
                                    currentUser={currentUser}
                                    headerRoles={headerRoles}
                                />
                            </div>
                        </main>
                    </div>
                );
            case 'mailbox':
                return <MailboxPage 
                    currentUser={currentUser}
                    emails={emails}
                    officers={officers}
                    onOpenCompose={() => { setDraftToEdit(null); setIsComposeEmailModalOpen(true); }}
                    onMarkAsRead={handleMarkEmailAsRead}
                    onDelete={handleDeleteEmail}
                    onToggleStar={handleToggleStarEmail}
                    onOpenDraft={(email) => { setDraftToEdit(email); setIsComposeEmailModalOpen(true); }}
                    onSetLabel={handleSetEmailLabel}
                />;
            case 'hr':
                return <HRPage onOpenAddOfficer={() => setIsAddOfficerModalOpen(true)} onOpenOfficerList={() => setIsOfficerListModalOpen(true)} onNavigate={setActivePage} onOpenCredentialsModal={() => setIsCredentialsModalOpen(true)} onOpenTerminateOfficerModal={() => setIsTerminateOfficerModalOpen(true)} currentUser={currentUser} />;
            case 'uprank_derank':
                const uprankLogs = itLogs.filter(l => l.eventType === 'officer_role_updated' || l.eventType === 'officer_updated');
                return <UprankDerankPage logs={uprankLogs} onBack={() => setActivePage('hr')} />;
            case 'sanctions':
                return <SanctionsPage sanctions={sanctions} onBack={() => setActivePage('hr')} onAddSanction={() => setIsAddSanctionModalOpen(true)} onViewSanction={setSanctionToDetail} />;
            case 'settings':
                const settingsLogs = itLogs.filter(l => l.eventType === 'officer_created' || l.eventType === 'officer_terminated');
                return <SettingsPage logs={settingsLogs} onBack={() => setActivePage('hr')} onViewLog={setLogToDetail} />;
            case 'hr_documents':
                return <HRDocumentsPage documents={documents} onBack={() => setActivePage('hr')} onOpenDocument={setDocumentToView} onOpenAddDocument={() => setIsAddDocumentModalOpen(true)} onRequestDelete={setDocumentToDelete} />;
            case 'training_modules':
                return <TrainingModulesPage modules={modules} searchTerm={moduleSearchTerm} setSearchTerm={setModuleSearchTerm} onOpenModule={setModuleToView} onOpenAddModule={() => setIsAddModuleModalOpen(true)} currentUser={currentUser} />;
            case 'service_documents':
                return <ServiceDocumentsPage
                    documents={documents}
                    searchTerm={serviceDocumentSearchTerm}
                    setSearchTerm={setServiceDocumentSearchTerm}
                    onOpenDocument={setDocumentToView}
                    onOpenAddDocument={() => setIsAddDocumentModalOpen(true)}
                    currentUser={currentUser}
                />;
            case 'checklist':
                return <ChecklistPage 
                            officers={officers} 
                            searchTerm={checklistSearchTerm} 
                            setSearchTerm={setChecklistSearchTerm} 
                            onOpenOfficerChecklist={setOfficerForChecklist} 
                            officerChecklists={officerChecklists} 
                            currentUser={currentUser} 
                            onOpenTemplateModal={() => setIsChecklistTemplateModalOpen(true)}
                            checklistMailbox={checklistMailbox}
                            onMarkChecklistMessageAsRead={handleMarkChecklistMessageAsRead}
                            onDeleteChecklistMessage={handleDeleteChecklistMessage} 
                            calculateChecklistProgress={calculateChecklistProgress}
                            onApproveAssignmentTakeover={handleApproveAssignmentTakeover}
                            onDenyAssignmentTakeover={handleDenyAssignmentTakeover}
                        />;
            case 'admin':
                return <AdminPage 
                    onOpenOfficerModal={() => setIsOfficerListModalOpen(true)} 
                    onOpenHomepageEditModal={() => setIsHomepageEditModalOpen(true)}
                    onNavigate={setActivePage}
                />;
            case 'it_logs':
                return <ITLogsPage logs={itLogs} currentUser={currentUser} />;
            case 'fuhrpark':
                return <FuhrparkPage 
                    vehicles={masterFleet} 
                    onEditVehicle={setVehicleToEdit} 
                    mailboxMessages={mailboxMessages} 
                    onMarkAsRead={handleMarkMessageAsRead} 
                    onDeleteMessage={handleDeleteMessage} 
                    currentUser={currentUser}
                    onOpenAddVehicleModal={() => setIsAddVehicleModalOpen(true)}
                />;
            default:
                return <PlaceholderPage title={activePage} content={[]} />;
        }
    };

    return (
        <div className="h-screen w-screen flex text-gray-200">
            {showConfetti && <Confetti />}
            {currentUser && <NavigationSidebar activePage={activePage} onNavigate={setActivePage} currentUser={currentUser} unreadEmailCount={unreadEmailCount} />}
            <div className="flex-1 h-full">
                {renderPage()}
            </div>
            
            {currentUser && globalShotsFiredAlert && !isAlertDismissed && currentUser.id !== headerRoles.dispatch?.id && currentUser.id !== headerRoles['co-dispatch']?.id && (
                <div className="fixed inset-0 bg-red-600 z-[100] flex flex-col items-center justify-center animate-fade-in-out p-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-2 animate-pulse-white-glow">
                        {globalShotsFiredAlert.funkChannel}
                    </h2>
                    <h1 className="text-9xl font-extrabold tracking-widest text-white animate-pulse-white-glow">
                        SHOTS FIRED
                    </h1>
                    <p className="mt-4 text-5xl font-bold text-white animate-pulse-white-glow">
                        {globalShotsFiredAlert.vehicleName}
                    </p>
                    <p className="mt-2 text-2xl text-white">
                        {globalShotsFiredAlert.occupants.join(', ')}
                    </p>
                    <div className="absolute bottom-10">
                        <button
                            onClick={handleIgnoreAlert}
                            className={`px-6 py-3 rounded-lg text-lg font-semibold text-white transition-all duration-300
                                ${isIgnoreConfirm
                                    ? 'bg-yellow-500 hover:bg-yellow-400'
                                    : 'bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/20'
                                }
                            `}
                        >
                            {isIgnoreConfirm ? 'Bestätigen' : 'Ignorieren'}
                        </button>
                    </div>
                </div>
            )}

            {/* --- MODALS --- */}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
            <TeamModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} officers={officers} />
            <PopoutViewerModal 
                isOpen={!!popoutToView}
                onClose={() => setPopoutToView(null)}
                content={popoutToView?.content || []}
                size={popoutToView?.size || 'medium'}
            />
            <FleetManagementModal isOpen={isFleetModalOpen} onClose={() => setIsFleetModalOpen(false)} vehicles={masterFleet} activeVehicleIds={new Set(vehicles.map(v => v.id))} onAddToGrid={handleAddToGrid} onRemoveFromGrid={handleRemoveFromGrid} />
            <ConfirmationModal isOpen={!!clearVehicleConfirmation} title="Streife auflösen?" onConfirm={handleConfirmClearVehicle} onCancel={() => setClearVehicleConfirmation(null)}>
                Mötest du wirklich alle Officer aus der Streife "{clearVehicleConfirmation?.name}" entfernen?
            </ConfirmationModal>
            <ConfirmationModal isOpen={!!clearHeaderConfirmation} title="Position auflösen?" onConfirm={handleConfirmClearHeader} onCancel={() => setClearHeaderConfirmation(null)}>
                Mötest du wirklich die Position "{clearHeaderConfirmation}" auflösen?
            </ConfirmationModal>
            <AddOfficerModal isOpen={isAddOfficerModalOpen} onClose={() => setIsAddOfficerModalOpen(false)} onAdd={handleAddOfficer} />
            {currentUser && <OfficerManagementModal isOpen={isOfficerListModalOpen} onClose={() => setIsOfficerListModalOpen(false)} officers={officers} onOpenDetail={setOfficerToDetail} isAdminView={currentUser.departmentRoles.includes('Admin')} onOpenAssignRoles={setOfficerToAssignRole} />}
            {currentUser && <OfficerDetailModal isOpen={!!officerToDetail} onClose={() => setOfficerToDetail(null)} officer={officerToDetail} onUpdate={handleUpdateOfficer} onRequestDelete={handleRequestDeleteOfficer} currentUser={currentUser} />}
            <ConfirmationModal isOpen={!!officerToDelete} title="Officer entfernen?" confirmText="Entfernen" confirmColor='red' onConfirm={handleConfirmDeleteOfficer} onCancel={() => setOfficerToDelete(null)}>
                Mötest du wirklich {officerToDelete?.firstName} {officerToDelete?.lastName} dauerhaft entfernen? Dies kann nicht rückgängig gemacht werden.
            </ConfirmationModal>
            <AddSanctionModal isOpen={isAddSanctionModalOpen} onClose={() => setIsAddSanctionModalOpen(false)} officers={officers} onAdd={handleAddSanction} />
            <SanctionDetailModal isOpen={!!sanctionToDetail} onClose={() => setSanctionToDetail(null)} sanction={sanctionToDetail} />
            <CredentialsManagementModal isOpen={isCredentialsModalOpen} onClose={() => setIsCredentialsModalOpen(false)} officers={officers} credentials={accessCredentials} onCreate={handleCreateCredentials} onRegenerate={handleRegeneratePassword} onDelete={handleDeleteCredential} />
            <GeneratedCredentialsModal isOpen={!!generatedCredentials} onClose={() => setGeneratedCredentials(null)} credentials={generatedCredentials} />
            <TerminateOfficerModal isOpen={isTerminateOfficerModalOpen} onClose={() => setIsTerminateOfficerModalOpen(false)} officers={officers} onTerminate={handleTerminateOfficer} />
            <SettingsLogDetailModal isOpen={!!logToDetail} onClose={() => setLogToDetail(null)} log={logToDetail} />
            <DocumentModal isOpen={!!documentToView} onClose={() => setDocumentToView(null)} document={documentToView} onUpdate={handleUpdateDocument} onRequestDelete={setDocumentToDelete} />
            <AddHRDocumentModal isOpen={isAddDocumentModalOpen} onClose={() => setIsAddDocumentModalOpen(false)} onAdd={handleAddDocument} />
            <ConfirmationModal isOpen={!!documentToDelete} title="Dokument löschen?" confirmText='Löschen' confirmColor='red' onConfirm={handleConfirmDeleteDocument} onCancel={() => setDocumentToDelete(null)}>
                Mötest du das Dokument "{documentToDelete?.title}" wirklich löschen?
            </ConfirmationModal>
            {currentUser && <ModuleModal isOpen={!!moduleToView} onClose={() => setModuleToView(null)} module={moduleToView} searchTerm={moduleSearchTerm} onUpdate={handleUpdateModule} onRequestDelete={setModuleToDelete} currentUser={currentUser} onLogView={handleLogModuleView} />}
            <AddModuleModal isOpen={isAddModuleModalOpen} onClose={() => setIsAddModuleModalOpen(false)} onAdd={handleAddModule} />
            <ConfirmationModal isOpen={!!moduleToDelete} title="Modul löschen?" confirmText='Löschen' confirmColor='red' onConfirm={handleConfirmDeleteModule} onCancel={() => setModuleToDelete(null)}>
                Mötest du das Modul "{moduleToDelete?.title}" wirklich löschen?
            </ConfirmationModal>
            {currentUser && <OfficerChecklistModal 
                isOpen={!!officerForChecklist} 
                onClose={() => setOfficerForChecklist(null)} 
                officer={officerForChecklist} 
                checklist={officerForChecklist ? officerChecklists[officerForChecklist.id] : undefined} 
                onUpdateContent={handleUpdateChecklistContent} 
                onAssign={handleAssignChecklist} 
                onUnassign={handleUnassignChecklist} 
                checklistTemplate={checklistTemplate} 
                currentUser={currentUser}
                onUpdateNotes={handleUpdateChecklistNotes}
                onToggleForceCompleteRequest={handleToggleForceCompleteRequest}
                onUndoCompletion={handleUndoChecklistCompletion}
                onRequestAssignmentTakeover={handleRequestAssignmentTakeover}
             />}
            <AssignRoleModal isOpen={!!officerToAssignRole} onClose={() => setOfficerToAssignRole(null)} officer={officerToAssignRole} onSave={handleSaveRoles} />
            <VehicleEditModal isOpen={!!vehicleToEdit} onClose={() => setVehicleToEdit(null)} vehicle={vehicleToEdit} onSave={handleSaveVehicleEdit} />
            <HomepageEditModal 
                isOpen={isHomepageEditModalOpen} 
                onClose={() => setIsHomepageEditModalOpen(false)} 
                officerContent={homepageContent}
                publicContent={publicHomepageContent}
                onSave={handleSaveHomepage} 
            />
            <ChecklistTemplateModal isOpen={isChecklistTemplateModalOpen} onClose={() => setIsChecklistTemplateModalOpen(false)} onSave={handleSaveChecklistTemplate} template={checklistTemplate} />
            <AddVehicleModal isOpen={isAddVehicleModalOpen} onClose={() => setIsAddVehicleModalOpen(false)} onAdd={handleAddVehicle} />
            {currentUser && <ComposeEmailModal
                isOpen={isComposeEmailModalOpen}
                onClose={() => setIsComposeEmailModalOpen(false)}
                currentUser={currentUser}
                officers={officers}
                onSend={handleSendEmail}
                draftToEdit={draftToEdit}
                onSaveDraft={handleSaveDraft}
                onDeleteDraft={handleDeleteDraft}
            />}


            <ConfirmationModal
              isOpen={forceCompleteConfirmation?.step === 1}
              title="Abschluss erzwingen?"
              onConfirm={handleConfirmForceComplete}
              onCancel={handleCancelForceComplete}
              confirmText="Ja, fortfahren"
              cancelText="Abbrechen"
            >
              Sind Sie sicher? Die Leitung wird über diese Entscheidung benachrichtigt.
            </ConfirmationModal>
            <ConfirmationModal
              isOpen={forceCompleteConfirmation?.step === 2}
              title="Endgültige Bestätigung"
              onConfirm={handleConfirmForceComplete}
              onCancel={handleCancelForceComplete}
              confirmText="Abschluss jetzt erzwingen"
              cancelText="Abbrechen"
              confirmColor="red"
            >
              Diese Aktion wird protokolliert und kann nicht rückgängig gemacht werden.
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={!!checklistCompletionNotice}
                title={checklistCompletionNotice?.type === 'completed' ? "Checkliste abgeschlossen!" : "Abschluss erzwungen!"}
                onConfirm={() => checklistCompletionNotice && handleAcknowledgeChecklistCompletion(checklistCompletionNotice.officer.id)}
                onCancel={() => checklistCompletionNotice && handleAcknowledgeChecklistCompletion(checklistCompletionNotice.officer.id)}
                confirmText="Bestätigen"
                cancelText=""
            >
                Die Checkliste für {checklistCompletionNotice?.officer.firstName} {checklistCompletionNotice?.officer.lastName} wurde erfolgreich beendet.
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={!!newOfficerConfirmation}
                title="Erfolgreich angelegt"
                onConfirm={() => setNewOfficerConfirmation(null)}
                onCancel={() => setNewOfficerConfirmation(null)}
                confirmText="OK"
                cancelText=""
            >
                Officer {newOfficerConfirmation?.firstName} {newOfficerConfirmation?.lastName} wurde erfolgreich angelegt und gespeichert.
            </ConfirmationModal>

            <ConfirmationModal
              isOpen={!!assignmentRequestConfirmation}
              title="Anfrage zur Zuweisung senden?"
              onConfirm={handleConfirmAssignmentTakeover}
              onCancel={() => setAssignmentRequestConfirmation(null)}
              confirmText="Anfrage senden"
            >
              Möchten Sie wirklich eine Anfrage zur Übernahme der Checkliste für {assignmentRequestConfirmation?.firstName} {assignmentRequestConfirmation?.lastName} senden? Die FTO Leitung wird benachrichtigt.
            </ConfirmationModal>
            
            <ConfirmationModal
                isOpen={isUprankRequestModalOpen}
                title="Uprank anfragen"
                onConfirm={handleConfirmUprankRequest}
                onCancel={() => setIsUprankRequestModalOpen(false)}
                confirmText="Ja"
                cancelText="Nein"
                confirmColor="green"
                cancelColor="red"
            >
                Möchten Sie jetzt einen Uprank bei Ihrem Vorgesetzten beantragen?
            </ConfirmationModal>

            {isUprankSperreModalOpen && (
                 <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 transition-opacity duration-300">
                     <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-gray-800 p-8 text-center" onClick={(e) => e.stopPropagation()}>
                         <h3 className="text-xl font-bold mb-2 text-slate-100">Herzlichen Glückwunsch!</h3>
                         <div className="text-slate-400 mb-8">
                             Sie haben eine Upranksperre für 7 Tage erhalten. Die Personalabteilung wurde automatisch informiert.
                         </div>
                         <div className="flex flex-col gap-3">
                             <button
                                 onClick={handleAcceptSperre}
                                 className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
                             >
                                 Sperre Annehmen
                             </button>
                             <button
                                 disabled
                                 className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors bg-red-800 cursor-not-allowed opacity-50"
                             >
                                 Sperre Ablehnen
                             </button>
                         </div>
                     </div>
                 </div>
            )}
            
            {currentUser && <CallsignListModal 
                isOpen={isCallsignListModalOpen} 
                onClose={() => setIsCallsignListModalOpen(false)} 
                callsignData={callsignData}
                onUpdateCallsignData={setCallsignData}
                currentUser={currentUser}
            />}
            <SaveStatusIndicator status={saveStatus} />
        </div>
    );
};

export default App;