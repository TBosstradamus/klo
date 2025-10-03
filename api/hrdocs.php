session_start();
header('Access-Control-Allow-Origin: https://lspd.bosstradamus.de');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}
<?php
// /api/hrdocs.php
require_once 'db.php';
header('Content-Type: application/json');
session_start();

$uploadDir = __DIR__ . '/../uploads/hrdocs/';
if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
$fileIndex = __DIR__ . '/../hrdocs_index.json';
if (!file_exists($fileIndex)) file_put_contents($fileIndex, '[]');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $docs = json_decode(file_get_contents($fileIndex), true);
    foreach ($docs as &$doc) {
        $doc['url'] = 'uploads/hrdocs/' . $doc['filename'];
    }
    echo json_encode($docs);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user']) || !(in_array('Personalabteilung', $_SESSION['user']['departmentRoles']) || in_array('Admin', $_SESSION['user']['departmentRoles']))) {
        http_response_code(403);
        echo json_encode(['error' => 'Keine Berechtigung']);
        exit;
    }
    if (!isset($_FILES['file']) || !isset($_POST['title'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Datei und Titel erforderlich']);
        exit;
    }
    $file = $_FILES['file'];
    $title = trim($_POST['title']);
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('hrdoc_', true) . '.' . $ext;
    if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
        http_response_code(500);
        echo json_encode(['error' => 'Upload fehlgeschlagen']);
        exit;
    }
    $docs = json_decode(file_get_contents($fileIndex), true);
    $docs[] = [
        'id' => uniqid('hrdoc_', true),
        'title' => $title,
        'filename' => $filename
    ];
    file_put_contents($fileIndex, json_encode($docs));
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_SESSION['user']) || !(in_array('Personalabteilung', $_SESSION['user']['departmentRoles']) || in_array('Admin', $_SESSION['user']['departmentRoles']))) {
        http_response_code(403);
        echo json_encode(['error' => 'Keine Berechtigung']);
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? '';
    $docs = json_decode(file_get_contents($fileIndex), true);
    $found = false;
    foreach ($docs as $k => $doc) {
        if ($doc['id'] === $id) {
            $found = true;
            $filePath = $uploadDir . $doc['filename'];
            if (file_exists($filePath)) unlink($filePath);
            array_splice($docs, $k, 1);
            break;
        }
    }
    if ($found) {
        file_put_contents($fileIndex, json_encode($docs));
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Dokument nicht gefunden']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Methode nicht erlaubt']);
