<?php
// Index-API: Gibt nur eine Info zurück
header('Content-Type: application/json');
echo json_encode(['api' => 'ok']);
