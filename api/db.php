<?php

// zentrale db.php für alle API-Module
header('Content-Type: application/json; charset=utf-8');
$host = 'localhost';
$db   = 'klo';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB-Verbindung fehlgeschlagen: ' . $e->getMessage()]);
    exit;
}

// Hilfsfunktion für sichere SQL-Statements
function db_query($sql, $params = []) {
    global $pdo;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    if (stripos($sql, 'select') === 0) {
        return $stmt->fetchAll();
    } else {
        return $stmt->rowCount();
    }
}

// Dispatcher für verschiedene Module/Aktionen
$action = $_GET['action'] ?? '';
$module = $_GET['module'] ?? '';

switch ($module) {
    case 'officers':
        if ($action === 'list') {
            echo json_encode(db_query('SELECT * FROM officers'));
        } elseif ($action === 'roles' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            $roles = isset($input['roles']) ? implode(',', $input['roles']) : '';
            $id = $_GET['id'] ?? '';
            db_query('UPDATE officers SET department_roles=? WHERE id=?', [$roles, $id]);
            echo json_encode(['success' => true]);
        }
        // ...weitere Officer-Aktionen
        break;
    // ...weitere Module
    default:
        echo json_encode(['error' => 'Unbekanntes Modul']);
}
