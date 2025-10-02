-- Tabelle für Checklisten (1:1 zu React-Logik, inkl. Fortschritt, Items als JSON)
CREATE TABLE IF NOT EXISTS officer_checklists (
    id VARCHAR(36) PRIMARY KEY,
    officer_id VARCHAR(36) NOT NULL,
    items TEXT NOT NULL, -- JSON-Array der Items [{text, checked}]
    is_completed TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (officer_id) REFERENCES officers(id)
);