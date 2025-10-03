<?php
// Zentraler Session-Router für alle API-Module
ini_set('session.save_path', '/www/htdocs/w01d9b24/lspd.bosstradamus.de/sessions');
session_start();

$module = $_GET['module'] ?? '';
$apiFile = __DIR__ . "/$module.php";
if (!preg_match('/^[a-z0-9_]+$/i', $module) || !file_exists($apiFile)) {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['error' => 'Modul nicht gefunden']);
    exit;
}
require $apiFile;
