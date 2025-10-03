switch ($method) {
<?php
// /api/modules.php
ini_set('session.save_path', '/www/htdocs/w01d9b24/lspd.bosstradamus.de/sessions');
session_start();
header('Access-Control-Allow-Origin: https://lspd.bosstradamus.de');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}
header('Content-Type: application/json');
require_once 'db.php';
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
        echo json_encode(['data' => $modules]);
        break;
    case 'POST':
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
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM modules');
        $modules = $stmt->fetchAll();
        echo json_encode(['data' => $modules]);
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
