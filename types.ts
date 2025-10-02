export enum Gender {
  Male = 'male',
  Female = 'female',
}

export const RANKS = [
  'Police Officer I',
  'Police Officer II',

  'Police Officer III',
  'Detective',
  'Sergeant',
  'Sr. Sergeant',
  'Lieutenant',
  'Captain',
  'Commander',
  'Deputy Chief of Police',
  'Assistant Chief of Police',
  'Chief of Police',
] as const;

export type Rank = typeof RANKS[number];

export const DEPARTMENT_ROLES = [
  'LSPD',
  'Personalabteilung',
  'Leitung Personalabteilung',
  'Field Training Officer',
  'Leitung Field Training Officer',
  'Fuhrparkmanager',
  'Interne Revision',
  'Internal Affairs',
  'Admin',
] as const;

export type DepartmentRole = typeof DEPARTMENT_ROLES[number];

export interface License {
  id: string;
  name: string;
  issuedBy: string; // Name of issuing officer
  issuedAt: Date;
  expiresAt: Date;
}

export const AVAILABLE_LICENSES = [
  'Führerschein Klasse B',
  'Waffenschein',
  'Erste-Hilfe-Zertifikat',
  'Pilotenschein Klasse A',
  'Interne Mitführlizenz für Langwaffen'
] as const;

export type AvailableLicense = typeof AVAILABLE_LICENSES[number];

export interface Officer {
  id: string;
  badgeNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  gender: Gender;
  rank: Rank;
  departmentRoles: DepartmentRole[];
  totalHours: number; // in seconds
  licenses: License[];
}

export type Seat = Officer | null;

export type VehicleStatus = 0 | 1 | 2 | 3 | 5 | 6 | 7;

export type VehicleCategory = 'SUV Scout' | 'Buffalo' | 'Cruiser' | 'Interceptor';

export const VEHICLE_CATEGORIES: VehicleCategory[] = ['SUV Scout', 'Buffalo', 'Cruiser', 'Interceptor'];

export interface CheckupItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  seats: Seat[];
  capacity: number;
  category: VehicleCategory;
  status: VehicleStatus | null;
  funkChannel: string | null;
  callsign: string | null;
  licensePlate: string;
  mileage: number;
  lastMileage: number;
  checkupList: CheckupItem[];
  lastCheckup: Date | null;
  nextCheckup: Date | null;
}

export enum DragType {
  OfficerFromSidebar = 'OFFICER_FROM_SIDEBAR',
  OfficerFromVehicle = 'OFFICER_FROM_VEHICLE',
  OfficerFromHeader = 'OFFICER_FROM_HEADER',
}

export type HeaderRole = 'dispatch' | 'co-dispatch' | 'air1' | 'air2';

export interface DragData {
  type: DragType;
  officer: Officer;
  source?: {
    vehicleId?: string;
    seatIndex?: number;
    headerRole?: HeaderRole;
  };
}

export const SANCTION_TYPES = [
  'Verwarnung',
  'Suspendierung (24h)',
  'Suspendierung (72h)',
  'Degradierung',
  'Entlassung',
] as const;

export type SanctionType = typeof SANCTION_TYPES[number];

export interface Sanction {
  id: string;
  officer: Officer;
  sanctionType: SanctionType;
  reason: string;
  issuedBy: string; // Placeholder
  timestamp: Date;
}

export interface AccessCredentials {
  id: string;
  officerId: string;
  username: string;
  password?: string;
  createdAt: Date;
}

export type ITLogEventType = 
  // HR
  | 'credential_created' | 'credential_deleted' | 'password_regenerated'
  | 'officer_created' | 'officer_updated' | 'officer_terminated' | 'sanction_issued'
  | 'officer_role_updated'
  // Trainer
  | 'checklist_assigned' | 'checklist_unassigned' | 'checklist_item_updated'
  | 'checklist_takeover_requested' | 'checklist_takeover_approved' | 'checklist_takeover_denied'
  // Officer
  | 'module_viewed' | 'document_viewed'
  // Dispatch
  | 'officer_assigned_vehicle' | 'officer_removed_vehicle'
  | 'officer_assigned_header' | 'officer_removed_header'
  | 'vehicle_status_updated' | 'vehicle_funk_updated' | 'vehicle_callsign_updated'
  | 'vehicle_cleared' | 'header_cleared'
  // Fleet
  | 'vehicle_created'
  // Mailbox
  | 'email_sent'
  // Timeclock
  | 'clock_in' | 'clock_out';

export type LogCategory = 'officer' | 'trainer' | 'hr' | 'dispatch' | 'timeclock';

export interface ITLog {
  id: string;
  timestamp: Date;
  eventType: ITLogEventType;
  actor: string; // Placeholder like 'Dispatcher'
  details: string;
  category: LogCategory;
  // For 'module_viewed': { moduleTitle: string, durationInSeconds: number, isCompleted: boolean }
  meta?: Record<string, any>;
}

export interface Module {
  id: string;
  title: string;
  content: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
}

export interface OfficerChecklist {
  content: string;
  assignedTo: string | null;
  notes?: string;
  isForceCompleted?: boolean;
  completionAcknowledged?: boolean;
}

export interface HomepageElement {
  id: string;
  type: 'heading' | 'text' | 'button' | 'image';
  content: string; // for text types, button label, image alt
  x: number;
  y: number;
  isLocked: boolean;
  dataUrl?: string; // for images
  isBackground?: boolean; // for images
  opacity?: number; // for images, e.g. 100
  width?: number; // for images
  height?: number; // for images
  isCentered?: boolean; // for images
  action?: 'openTeamModal' | 'openPopout';
  popoutContent?: HomepageElement[];
  popoutSize?: 'small' | 'medium' | 'large';
}

export interface MailboxMessage {
  id: string;
  vehicleName: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChecklistMailboxMessage {
  id: string;
  officerName: string; // Name of the officer whose checklist it is
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'completed' | 'force_completed' | 'assignment_request' | 'assignment_approved' | 'assignment_denied';
  officerId?: string; // ID of the officer whose checklist it is
  requestingFTOId?: string; // ID of the FTO making the request
  requestingFTOName?: string; // Name of the FTO making the request
  originalFTO?: string; // Name of the originally assigned FTO
}

export interface EmailAttachment {
  fileName: string;
  dataUrl: string; // base64 encoded image data
}

export const EMAIL_LABELS = {
  'Sofort prüfen': 'red',
  'Warten auf Antwort': 'orange',
  'Abgeschlossen': 'green',
} as const;

export type EmailLabel = keyof typeof EMAIL_LABELS;

export interface Email {
  id: string;
  senderId: string;
  recipientIds: string[];
  ccIds: string[];
  subject: string;
  body: string;
  attachments: EmailAttachment[];
  timestamp: Date;
  readBy: string[]; // Array of officer IDs who have read the email
  isDeletedFor: string[]; // Array of officer IDs who have "deleted" the email
  starredBy: string[]; // Array of officer IDs who have starred the email
  status: 'sent' | 'draft';
  label?: EmailLabel;
}