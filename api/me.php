<?php
ini_set('session.save_path', '/www/htdocs/w01d9b24/lspd.bosstradamus.de/sessions');
session_start();
header('Access-Control-Allow-Origin: https://lspd.bosstradamus.de');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}
header('Content-Type: application/json');
if (isset($_SESSION['user'])) {
    echo json_encode($_SESSION['user']);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Nicht eingeloggt']);
}
