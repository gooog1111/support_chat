<?php
require_once '../includes/config.php';
require_once '../includes/functions.php';

header('Content-Type: application/json');
echo json_encode(['online' => getOnlineAdminsCount()]);
?>