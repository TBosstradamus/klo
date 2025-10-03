ini_set('session.save_path', '/www/htdocs/w01d9b24/lspd.bosstradamus.de/sessions');
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
// /api/settings.php
require_once 'db.php';
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Nicht eingeloggt']);
    exit;
}

$user = $_SESSION['user'];
$file = __DIR__ . '/../settings_' . $user['id'] . '.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        echo json_encode(['email_notify' => $data['email_notify'] ?? false]);
    } else {
        echo json_encode(['email_notify' => false]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    // Passwort ändern
    if (!empty($data['oldpw']) && !empty($data['newpw'])) {
        $stmt = $pdo->prepare('SELECT password_hash FROM officers WHERE id=?');
        $stmt->execute([$user['id']]);
        $row = $stmt->fetch();
        if (!$row || !password_verify($data['oldpw'], $row['password_hash'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Altes Passwort falsch']);
            exit;
        }
        $hash = password_hash($data['newpw'], PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE officers SET password_hash=? WHERE id=?');
        $stmt->execute([$hash, $user['id']]);
    }
    // Benachrichtigungen speichern
    file_put_contents($file, json_encode(['email_notify' => !empty($data['email_notify'])]));
    echo json_encode(['success' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Methode nicht erlaubt']);
