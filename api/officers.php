<?php
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
if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nicht eingeloggt']);
    exit;
}
$user = $_SESSION['user'];
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM officers');
        $officers = $stmt->fetchAll();
        echo json_encode(['data' => $officers]);
        exit;
    case 'POST':
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO officers (id, badge_number, first_name, last_name, phone_number, gender, rank) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $id = uniqid('off_', true);
        $stmt->execute([$id, $data['badge_number'], $data['first_name'], $data['last_name'], $data['phone_number'], $data['gender'], $data['rank']]);
        echo json_encode(['success' => true, 'id' => $id]);
        exit;
    case 'PUT':
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE officers SET badge_number=?, first_name=?, last_name=?, phone_number=?, gender=?, rank=? WHERE id=?');
        $stmt->execute([$data['badge_number'], $data['first_name'], $data['last_name'], $data['phone_number'], $data['gender'], $data['rank'], $data['id']]);
        echo json_encode(['success' => true]);
        exit;
    case 'DELETE':
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('DELETE FROM officers WHERE id=?');
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
        exit;
    default:
        echo json_encode(['error' => 'Methode nicht erlaubt']);
        exit;
}
