session_start();
header('Access-Control-Allow-Origin: https://lspd.bosstradamus.de');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}
<?php
// Output-Buffering und Fehlerausgabe unterdrücken
ob_clean();
ini_set('display_errors', 0);
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
// /api/modules.php
require_once 'db.php';
header('Content-Type: application/json');
session_start();

$user = $_SESSION['user'] ?? null;
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Nicht eingeloggt']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM modules');
        $modules = $stmt->fetchAll();
        echo json_encode($modules);
        break;
    case 'POST':
        // Nur Admin darf Module anlegen
        if (!in_array('Admin', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO modules (id, name, description) VALUES (?, ?, ?)');
        $id = uniqid('mod_', true);
        $stmt->execute([$id, $data['name'], $data['description']]);
        echo json_encode(['success' => true, 'id' => $id]);
        break;
    case 'PUT':
        if (!in_array('Admin', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE modules SET name=?, description=? WHERE id=?');
        $stmt->execute([$data['name'], $data['description'], $data['id']]);
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        if (!in_array('Admin', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('DELETE FROM modules WHERE id=?');
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Methode nicht erlaubt']);
}
