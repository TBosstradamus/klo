<?php
// /api/itlogs.php
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
$canViewAll = in_array('Admin', $user['departmentRoles']) || in_array('Personalabteilung', $user['departmentRoles']);
if ($canViewAll) {
    $stmt = $pdo->query('SELECT * FROM itlogs ORDER BY created_at DESC');
    $logs = $stmt->fetchAll();
} else {
    $stmt = $pdo->prepare('SELECT * FROM itlogs WHERE officer_id = ? ORDER BY created_at DESC');
    $stmt->execute([$user['id']]);
    $logs = $stmt->fetchAll();
}
echo json_encode(['data' => $logs]);
