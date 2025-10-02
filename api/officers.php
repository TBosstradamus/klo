
<?php
// Fehlerausgabe und Session-Handling GANZ an den Anfang!
ini_set('display_errors', 1);
error_reporting(E_ALL);
session_start();
error_log('officers.php wurde aufgerufen');

// Testausgabe: Session und DB-Check
if (!file_exists(__DIR__.'/db.php')) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'db.php fehlt!']);
    exit;
}

require_once 'db.php';
header('Content-Type: application/json');

$user = $_SESSION['user'] ?? null;
if (!$user) {
    echo json_encode(['error' => 'Nicht eingeloggt', 'session' => $_SESSION]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET': {
        $stmt = $pdo->query('SELECT * FROM officers');
        $officers = $stmt->fetchAll();
        echo json_encode($officers);
        exit;
    }
    case 'POST': {
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
    }
    case 'PUT': {
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE officers SET badge_number=?, first_name=?, last_name=?, phone_number=?, gender=?, rank=? WHERE id=?');
        $stmt->execute([$data['badge_number'], $data['first_name'], $data['last_name'], $data['phone_number'], $data['gender'], $data['rank'], $data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
    case 'DELETE': {
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('DELETE FROM officers WHERE id=?');
        $stmt->execute([$data['id']]);
        echo json_encode(['success' => true]);
        exit;
    }
    default: {
        echo json_encode(['error' => 'Methode nicht erlaubt']);
        exit;
    }
}

$user = $_SESSION['user'] ?? null;
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Nicht eingeloggt']);
    ob_end_clean();
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET': {
        $stmt = $pdo->query('SELECT * FROM officers');
        $officers = $stmt->fetchAll();
    echo json_encode($officers);
    ob_end_clean();
    exit;
    }
    case 'POST': {
        // Nur Admin/Personalabteilung darf anlegen
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO officers (id, badge_number, first_name, last_name, phone_number, gender, rank) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $id = uniqid('off_', true);
        $stmt->execute([$id, $data['badge_number'], $data['first_name'], $data['last_name'], $data['phone_number'], $data['gender'], $data['rank']]);
    echo json_encode(['success' => true, 'id' => $id]);
    ob_end_clean();
    exit;
    }
    case 'PUT': {
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('UPDATE officers SET badge_number=?, first_name=?, last_name=?, phone_number=?, gender=?, rank=? WHERE id=?');
        $stmt->execute([$data['badge_number'], $data['first_name'], $data['last_name'], $data['phone_number'], $data['gender'], $data['rank'], $data['id']]);
    echo json_encode(['success' => true]);
    ob_end_clean();
    exit;
    }
    case 'DELETE': {
        if (!in_array('Admin', $user['departmentRoles']) && !in_array('Personalabteilung', $user['departmentRoles'])) {
            http_response_code(403);
            echo json_encode(['error' => 'Keine Berechtigung']);
            exit;
        }
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('DELETE FROM officers WHERE id=?');
        $stmt->execute([$data['id']]);
    echo json_encode(['success' => true]);
    ob_end_clean();
    exit;
    }
    default: {
        http_response_code(405);
    echo json_encode(['error' => 'Methode nicht erlaubt']);
    ob_end_clean();
    exit;
    }
}
