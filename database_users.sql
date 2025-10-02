-- Tabelle für Benutzer/Officers mit Login, Rollen und Passwort-Hash
CREATE TABLE IF NOT EXISTS officers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rank VARCHAR(64) NOT NULL,
    department_roles VARCHAR(255) DEFAULT '', -- Kommagetrennte Rollen
    first_name VARCHAR(64),
    last_name VARCHAR(64),
    badge_number VARCHAR(32),
    phone_number VARCHAR(32),
    gender VARCHAR(16),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Beispiel-Admin-User (Passwort: admin)
INSERT INTO officers (username, password_hash, rank, department_roles, first_name, last_name, badge_number, gender)
VALUES (
  'admin',
  '$2y$10$wH6QnQwQnQwQnQwQnQwQnOQwQnQwQnQwQnQwQnQwQnQwQnQwQnQ', -- bitte mit password_hash('admin', PASSWORD_DEFAULT) ersetzen
  'Chief of Police',
  'Admin',
  'Max',
  'Mustermann',
  '0001',
  'male'
) ON DUPLICATE KEY UPDATE username=username;
