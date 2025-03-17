<?php
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function getClientIP() {
    $keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($keys as $key) {
        if (!empty($_SERVER[$key])) {
            return $_SERVER[$key];
        }
    }
    return 'unknown';
}

function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
function updateAdminOnlineStatus($username) {
    $file = ADMINS_ONLINE_DIR . md5($username) . '.txt';
    file_put_contents($file, time());
}

function getOnlineAdminsCount() {
    $online = 0;
    $files = glob(ADMINS_ONLINE_DIR . '*.txt');
    $currentTime = time();
    foreach ($files as $file) {
        $lastActive = (int)file_get_contents($file);
        if ($currentTime - $lastActive <= 300) { // 5 минут активности
            $online++;
        }
    }
    return $online;
}
?>