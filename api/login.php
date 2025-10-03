<?php
// /api/login.php
ini_set('session.save_path', '/www/htdocs/w01d9b24/lspd.bosstradamus.de/sessions');
file_put_contents(__DIR__ . '/../session_debug.txt', 'session.save_path: ' . ini_get('session.save_path') . ' is_writable: ' . (is_writable(ini_get('session.save_path')) ? 'yes' : 'no') . PHP_EOL, FILE_APPEND);
session_start();
file_put_contents(__DIR__ . '/../session_debug.txt', 'session_id after start: ' . session_id() . PHP_EOL, FILE_APPEND);
if (session_status() === PHP_SESSION_ACTIVE) {
    setcookie(session_name(), session_id(), [
        'path' => '/',
        'secure' => true,
        'httponly' => true,
        'samesite' => 'None'
    ]);
}
header('Access-Control-Allow-Origin: https://lspd.bosstradamus.de');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}
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
