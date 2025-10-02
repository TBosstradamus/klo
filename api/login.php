<?php
// /api/login.php
session_start();
header('Content-Type: application/json');
require_once 'db.php'; // Stellt $pdo bereit

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Benutzername und Passwort erforderlich']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, username, password_hash, rank, department_roles FROM officers WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Login fehlgeschlagen']);
    exit;
}

// Rollen als Array
$roles = $user['department_roles'] ? explode(',', $user['department_roles']) : [];

$_SESSION['user'] = [
    'id' => $user['id'],
    'username' => $user['username'],
    'rank' => $user['rank'],
    'departmentRoles' => $roles
];

echo json_encode([
    'id' => $user['id'],
    'username' => $user['username'],
    'rank' => $user['rank'],
    'departmentRoles' => $roles
]);
