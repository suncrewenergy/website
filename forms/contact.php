<?php
/**
 * contact.php — Sun Crew Energy Website
 * Processes inquiry form submissions:
 *  1. Validates required fields
 *  2. Sanitizes all input
 *  3. Sends email via authenticated SMTP (PHPMailer)
 *  4. Redirects to thank-you.html on success
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ── Load dependencies & config ───────────────────────────────────────
require __DIR__ . '/../vendor/autoload.php';   // composer install (PHPMailer)

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    http_response_code(500);
    exit('Mailer not configured.');
}
$config = require $configFile;

define('SITE_NAME',      'Sun Crew Energy');
define('THANK_YOU_URL',  '../thank-you.html');
define('ERROR_URL',      '../contact.html?error=1');
define('RATE_LIMIT_SECS', 60);  // one submission per 60 s per session

// ── Only accept POST ─────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

// ── CSRF / origin check ──────────────────────────────────────────────
$origin   = $_SERVER['HTTP_ORIGIN']   ?? '';
$referer  = $_SERVER['HTTP_REFERER']  ?? '';
$host     = $_SERVER['HTTP_HOST']     ?? '';

// Accept requests that originate from the same host (simple check)
// For production consider token-based CSRF protection
if ($origin && parse_url($origin,  PHP_URL_HOST) !== $host &&
    $referer && parse_url($referer, PHP_URL_HOST) !== $host) {
    http_response_code(403);
    exit('Forbidden');
}

// ── Session-based rate limiting ──────────────────────────────────────
session_start();
$now = time();
if (isset($_SESSION['last_submission']) &&
    ($now - $_SESSION['last_submission']) < RATE_LIMIT_SECS) {
    http_response_code(429);
    header('Location: ' . ERROR_URL);
    exit;
}

// ── Sanitizer ────────────────────────────────────────────────────────
function clean(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

// ── Collect fields ───────────────────────────────────────────────────
$name     = clean($_POST['name']     ?? '');
$company  = clean($_POST['company']  ?? '');
$phone    = clean($_POST['phone']    ?? '');
$email    = clean($_POST['email']    ?? '');
$service  = clean($_POST['service']  ?? '');
$location = clean($_POST['location'] ?? '');
$message  = clean($_POST['message']  ?? '');

// ── Validation ───────────────────────────────────────────────────────
$errors = [];

if (strlen($name) < 2) {
    $errors[] = 'Invalid name.';
}
if (!preg_match('/^[\+]?[\d\s\-\(\)]{8,20}$/', $phone)) {
    $errors[] = 'Invalid phone number.';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email address.';
}
if (empty($service)) {
    $errors[] = 'Service selection is required.';
}
if (strlen($message) < 10) {
    $errors[] = 'Message too short.';
}

if (!empty($errors)) {
    http_response_code(400);
    header('Location: ' . ERROR_URL);
    exit;
}

// ── Build email body ─────────────────────────────────────────────────
$subject  = SITE_NAME . ' — New Inquiry from ' . $name;

$body  = "A new inquiry has been submitted via the Sun Crew Energy website.\n\n";
$body .= "────────────────────────────────────\n";
$body .= "Name         : " . $name    . "\n";
$body .= "Company      : " . ($company ?: '—')  . "\n";
$body .= "Phone        : " . $phone   . "\n";
$body .= "Email        : " . $email   . "\n";
$body .= "Service      : " . $service . "\n";
$body .= "Location     : " . ($location ?: '—') . "\n";
$body .= "────────────────────────────────────\n";
$body .= "Message:\n"       . $message . "\n";
$body .= "────────────────────────────────────\n";
$body .= "Submitted at : " . date('Y-m-d H:i:s T') . "\n";

// ── Send via authenticated SMTP ──────────────────────────────────────
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $config['SMTP_HOST'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['SMTP_USER'];
    $mail->Password   = $config['SMTP_PASS'];
    $mail->SMTPSecure = $config['SMTP_SECURE']; // 'ssl' or 'tls'
    $mail->Port       = (int) $config['SMTP_PORT'];
    $mail->CharSet    = 'UTF-8';

    // From must be the authenticated mailbox (SPF/DKIM aligned)
    $mail->setFrom($config['SMTP_USER'], SITE_NAME . ' Website');
    $mail->addAddress($config['RECEIVER_EMAIL']);
    $mail->addReplyTo($email, $name);   // reply goes to the visitor

    $mail->Subject = $subject;
    $mail->Body    = $body;

    $mail->send();
    $sent = true;
} catch (Exception $e) {
    $sent = false;
    error_log('Contact form mail error: ' . $mail->ErrorInfo);
}

$_SESSION['last_submission'] = $now;

if ($sent) {
    header('Location: ' . THANK_YOU_URL);
} else {
    http_response_code(500);
    header('Location: ' . ERROR_URL);
}
exit;
