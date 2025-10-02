<?php
// /api/itlogs.php
require_once 'db.php';
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nicht eingeloggt']);
    exit;
}

// Nur Admin/Personalabteilung darf alle Logs sehen
$user = $_SESSION['user'];
$canViewAll = in_array('Admin', $user['departmentRoles']) || in_array('Personalabteilung', $user['departmentRoles']);

if ($canViewAll) {
    $stmt = $pdo->query('SELECT * FROM itlogs ORDER BY created_at DESC');
    $logs = $stmt->fetchAll();
} else {
    // Nur eigene Logs
    $stmt = $pdo->prepare('SELECT * FROM itlogs WHERE officer_id = ? ORDER BY created_at DESC');
    $stmt->execute([$user['id']]);
    $logs = $stmt->fetchAll();
}
echo json_encode($logs);
