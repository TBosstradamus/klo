<?php
ini_set('session.save_path', '/www/htdocs/w01d9b24/lspd.bosstradamus.de/sessions');
session_start();
header('Content-Type: application/json');
require_once 'db.php';
$user = $_SESSION['user'] ?? null;
if (!$user) {
    echo json_encode(['error' => 'Nicht eingeloggt']);
    exit;
}
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM sanctions');
        $sanctions = $stmt->fetchAll();
        echo json_encode(['data' => $sanctions]);
        break;
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO sanctions (id, officer_id, sanction_type, issued_by, timestamp) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $input['id'], $input['officer_id'], $input['sanction_type'], $input['issued_by'], $input['timestamp']
        ]);
        echo json_encode(['success' => true]);
        break;
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE sanctions SET officer_id=?, sanction_type=?, issued_by=?, timestamp=? WHERE id=?');
        $stmt->execute([
            $input['officer_id'], $input['sanction_type'], $input['issued_by'], $input['timestamp'], $input['id']
        ]);
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare('DELETE FROM sanctions WHERE id=?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'ID fehlt']);
        }
        break;
    default:
        echo json_encode(['error' => 'Methode nicht unterstützt']);
}
