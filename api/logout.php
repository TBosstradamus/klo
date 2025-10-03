session_start();
header('Access-Control-Allow-Origin: https://lspd.bosstradamus.de');
header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	header('Access-Control-Allow-Headers: Content-Type');
	exit;
}
<?php
// /api/logout.php
session_start();
header('Content-Type: application/json');

session_destroy();
echo json_encode(['success' => true]);
