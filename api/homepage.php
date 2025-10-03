session_start();
header('Access-Control-Allow-Origin: https://lspd.bosstradamus.de');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}
header('Access-Control-Allow-Origin: https://lspd.bosstradamus.de');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}
<?php
// /api/homepage.php
require_once 'db.php';
header('Content-Type: application/json');
session_start();

$file = __DIR__ . '/../homepage_content.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        echo json_encode(['content' => $data['content'] ?? '']);
    } else {
        echo json_encode(['content' => '']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user']) || !in_array('Admin', $_SESSION['user']['departmentRoles'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Keine Berechtigung']);
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    file_put_contents($file, json_encode(['content' => $data['content']]));
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Methode nicht erlaubt']);
