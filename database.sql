-- Datenbankschema für KLO Webanwendung

CREATE TABLE officers (
  id VARCHAR(36) PRIMARY KEY,
  badge_number VARCHAR(32) NOT NULL,
  first_name VARCHAR(64) NOT NULL,
  last_name VARCHAR(64) NOT NULL,
  phone_number VARCHAR(32),
  gender ENUM('male','female') NOT NULL,
  rank VARCHAR(32) NOT NULL
);

CREATE TABLE vehicles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  category VARCHAR(32) NOT NULL,
  capacity INT NOT NULL,
  license_plate VARCHAR(32) NOT NULL,
  mileage INT NOT NULL
);

CREATE TABLE sanctions (
  id VARCHAR(36) PRIMARY KEY,
  officer_id VARCHAR(36) NOT NULL,
  sanction_type VARCHAR(64) NOT NULL,
  issued_by VARCHAR(64) NOT NULL,
  timestamp DATETIME NOT NULL,
  FOREIGN KEY (officer_id) REFERENCES officers(id)
);

CREATE TABLE licenses (
  id VARCHAR(36) PRIMARY KEY,
  officer_id VARCHAR(36) NOT NULL,
  name VARCHAR(64) NOT NULL,
  issued_by VARCHAR(64),
  expires_at DATE,
  FOREIGN KEY (officer_id) REFERENCES officers(id)
);

CREATE TABLE modules (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description TEXT
);

CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(128) NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL
);

CREATE TABLE itlogs (
  id VARCHAR(36) PRIMARY KEY,
  event_type VARCHAR(64) NOT NULL,
  officer_id VARCHAR(36) NOT NULL,
  description TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (officer_id) REFERENCES officers(id)
);