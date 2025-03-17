<?php
if (strpos($_SERVER['HTTP_USER_AGENT'], 'curl') !== false || 
    strpos($_SERVER['HTTP_USER_AGENT'], 'wget') !== false) {
    // Перенаправляем curl и wget на альтернативный URL
	header('HTTP/1.1 204 No Content');
    exit;
}
header("Location: login.php");
exit();
?>