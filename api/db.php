
<?php

$host = 'localhost';
$db   = 'klo';
// HINWEIS: Diese Datei darf KEINEN Output (echo, header, exit) erzeugen, wenn sie als Include genutzt wird!
// Entferne alle header()- und echo-Ausgaben, die nicht in einer Funktion gekapselt sind.
// Die eigentliche Logik für API-Module muss in den jeweiligen API-Dateien (z.B. officers.php) liegen.

// header('Content-Type: application/json; charset=utf-8');
$user = 'root';
$pass = '';
$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];
try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB-Verbindung fehlgeschlagen: ' . $e->getMessage()]);
    exit;
}

// Hilfsfunktion für sichere SQL-Statements
function db_query($sql, $params = []) {
    global $pdo;
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    if (stripos($sql, 'select') === 0) {
        return $stmt->fetchAll();
    } else {
        return $stmt->rowCount();
    }
}
