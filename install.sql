-- Komplettes Installationsskript für KLO (inkl. Testdaten und Admin-User)

-- Tabellen löschen, falls vorhanden
DROP TABLE IF EXISTS itlogs, documents, modules, licenses, sanctions, vehicles, officer_checklists, officers;

-- Officers (inkl. Login, Rollen)
CREATE TABLE officers (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rank VARCHAR(64) NOT NULL,
  department_roles VARCHAR(255) DEFAULT '',
  first_name VARCHAR(64),
  last_name VARCHAR(64),
  badge_number VARCHAR(32),
  phone_number VARCHAR(32),
  gender VARCHAR(16),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin-User (Passwort: admin)
INSERT INTO officers (id, username, password_hash, rank, department_roles, first_name, last_name, badge_number, gender)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  '$2y$10$wH6QnQwQnQwQnQwQnQwQnOQwQnQwQnQwQnQwQnQwQnQwQnQwQnQ',
  'Chief of Police',
  'Admin,Personalabteilung,IT-Manager,Leitung Field Training Officer',
  'Max',
  'Mustermann',
  '0001',
  'male'
);

-- Fahrzeuge
CREATE TABLE vehicles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  category VARCHAR(32) NOT NULL,
  capacity INT NOT NULL,
  license_plate VARCHAR(32) NOT NULL,
  mileage INT NOT NULL
);
INSERT INTO vehicles VALUES
('veh-1','Scout','SUV Scout',4,'LSPD-1001',12000),
('veh-2','Buffalo','Buffalo',4,'LSPD-1002',8000);

-- Sanktionen
CREATE TABLE sanctions (
  id VARCHAR(36) PRIMARY KEY,
  officer_id VARCHAR(36) NOT NULL,
  sanction_type VARCHAR(64) NOT NULL,
  issued_by VARCHAR(64) NOT NULL,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (officer_id) REFERENCES officers(id)
);
INSERT INTO sanctions VALUES
('san-1','00000000-0000-0000-0000-000000000001','Verwarnung','Max Mustermann','2025-10-01 10:00:00');

-- Lizenzen
CREATE TABLE licenses (
  id VARCHAR(36) PRIMARY KEY,
  officer_id VARCHAR(36) NOT NULL,
  name VARCHAR(64) NOT NULL,
  issued_by VARCHAR(64),
  expires_at DATE,
  FOREIGN KEY (officer_id) REFERENCES officers(id)
);
INSERT INTO licenses VALUES
('lic-1','00000000-0000-0000-0000-000000000001','Führerschein Klasse B','Max Mustermann','2026-01-01');

-- Module
CREATE TABLE modules (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description TEXT
);
INSERT INTO modules VALUES
('mod-1','Funk','Funkbedienung und Funkdisziplin'),
('mod-2','Streifenfahrt','Ablauf und Verhalten bei Streifenfahrten');

-- Dokumente
CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL
);
INSERT INTO documents VALUES
('doc-1','Dienstanweisung 1','Inhalt der Dienstanweisung 1','2025-10-01 09:00:00');

-- IT-Logs
CREATE TABLE itlogs (
  id VARCHAR(36) PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  officer_id VARCHAR(36) NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (officer_id) REFERENCES officers(id)
);
INSERT INTO itlogs VALUES
('log-1','officer_role_updated','00000000-0000-0000-0000-000000000001','Rang geändert von Sergeant auf Chief of Police durch Max Mustermann','2025-10-01 11:00:00');

-- Checklisten
CREATE TABLE officer_checklists (
  id VARCHAR(36) PRIMARY KEY,
  officer_id VARCHAR(36) NOT NULL,
  items TEXT NOT NULL,
  is_completed TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (officer_id) REFERENCES officers(id)
);
INSERT INTO officer_checklists VALUES
('chk-1','00000000-0000-0000-0000-000000000001','[{"text":"Ausrüstung geprüft","checked":true},{"text":"Fahrzeug gecheckt","checked":false}]',0,'2025-10-01 08:00:00','2025-10-01 08:00:00');
