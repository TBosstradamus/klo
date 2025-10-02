<?php
// /api/licenses.php
require_once 'db.php';
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nicht eingeloggt']);
    exit;
}

$user = $_SESSION['user'];
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Lizenzen für aktuellen User oder für Officer (Admin/Personalabteilung)
        $officer_id = isset($_GET['officer_id']) ? $_GET['officer_id'] : $user['id'];
        $stmt = $pdo->prepare('SELECT * FROM licenses WHERE officer_id = ?');
        $stmt->execute([$officer_id]);
        $licenses = $stmt->fetchAll();
        echo json_encode($licenses);
        break;
    case 'POST':
        // Nur Admin/Personalabteilung darf hinzufügen
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO licenses (id, officer_id, name, issued_by, expires_at) VALUES (?, ?, ?, ?, ?)');
        $id = uniqid('lic_', true);
        $stmt->execute([$id, $data['officer_id'], $data['name'], $data['issued_by'], $data['expires_at']]);
        echo json_encode(['success' => true, 'id' => $id]);
        break;
    case 'PUT':
        // Nur Admin/Personalabteilung darf bearbeiten
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE licenses SET name=?, issued_by=?, expires_at=? WHERE id=?');
        $stmt->execute([$data['name'], $data['issued_by'], $data['expires_at'], $data['id']]);
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        // Nur Admin/Personalabteilung darf löschen
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('DELETE FROM licenses WHERE id=?');
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Methode nicht erlaubt']);
}
