



<?php
// ACHTUNG: KEIN ZEICHEN, KEIN LEERZEICHEN, KEIN BOM VOR DIESER ZEILE!

ini_set('session.save_path', '/www/htdocs/w01d9b24/lspd.bosstradamus.de/sessions');
file_put_contents(__DIR__ . '/../session_debug.txt', 'session.save_path: ' . ini_get('session.save_path') . ' is_writable: ' . (is_writable(ini_get('session.save_path')) ? 'yes' : 'no') . PHP_EOL, FILE_APPEND);
session_start();
file_put_contents(__DIR__ . '/../session_debug.txt', 'session_id after start: ' . session_id() . PHP_EOL, FILE_APPEND);
// Debug: Schreibe Session-Infos in /workspaces/klo/session_debug.txt
$debugFile = __DIR__ . '/../session_debug.txt';
$debugData = print_r([
    'PHPSESSID' => $_COOKIE[session_name()] ?? null,
    'session_id' => session_id(),
    'session' => $_SESSION
], true);
if (@file_put_contents($debugFile, $debugData, FILE_APPEND) === false) {
    error_log('Konnte Session-Debug nicht schreiben: ' . $debugFile);
}
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
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);
// Output-Buffer starten, um ungewollte Ausgaben von db.php zu erkennen
ob_start();
require_once 'db.php';
$dbphp_output = ob_get_clean();
if (strlen($dbphp_output) > 0) {
    echo json_encode(['error' => 'db.php erzeugt Output!', 'output' => $dbphp_output]);
    exit;
}


global $_SESSION;
$user = isset($_SESSION['user']) ? $_SESSION['user'] : null;
if (!$user) {
    echo json_encode(['error' => 'Nicht eingeloggt', 'session' => $_SESSION]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query('SELECT * FROM officers');
        $officers = $stmt->fetchAll();
        echo json_encode($officers);
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
