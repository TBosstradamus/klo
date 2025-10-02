<?php
// /api/uprank.php
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
    case 'POST':
        // Nur Admin/Personalabteilung darf befördern/degradieren
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $officer_id = $data['officer_id'];
        $new_rank = $data['new_rank'];
        $old_rank = $data['old_rank'];
        // Rang aktualisieren
        $stmt = $pdo->prepare('UPDATE officers SET rank=? WHERE id=?');
        $stmt->execute([$new_rank, $officer_id]);
        // ITLog-Eintrag
        $log = $pdo->prepare('INSERT INTO itlogs (id, event_type, officer_id, description, created_at) VALUES (?, ?, ?, ?, NOW())');
        $log->execute([
            uniqid('log_', true),
            'officer_role_updated',
            $officer_id,
            'Rang geändert von ' . $old_rank . ' auf ' . $new_rank . ' durch ' . $user['first_name'] . ' ' . $user['last_name'],
        ]);
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Methode nicht erlaubt']);
}
