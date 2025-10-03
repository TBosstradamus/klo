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
$user = $_SESSION['user'] ?? null;
if (!$user) {
    echo json_encode(['error' => 'Nicht eingeloggt']);
    exit;
}
$method = $_SERVER['REQUEST_METHOD'];
switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM documents');
        $documents = $stmt->fetchAll();
        echo json_encode(['data' => $documents]);
        break;
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO documents (id, title, content, created_at) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $input['id'], $input['title'], $input['content'], $input['created_at']
        ]);
        echo json_encode(['success' => true]);
        break;
    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE documents SET title=?, content=? WHERE id=?');
        $stmt->execute([
            $input['title'], $input['content'], $input['id']
        ]);
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare('DELETE FROM documents WHERE id=?');
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['error' => 'ID fehlt']);
        }
        break;
    default:
        echo json_encode(['error' => 'Methode nicht unterstützt']);
}
