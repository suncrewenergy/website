<?php
/**
 * contact.php — Sun Crew Energy Website
 * Processes inquiry form submissions:
 *  1. Validates required fields
 *  2. Sanitizes all input
 *  3. Sends email to company address
 *  4. Redirects to thank-you.html on success
 */

// ── Config ──────────────────────────────────────────────────────────
define('RECEIVER_EMAIL', 'info@suncrewenergy.com');      // ← update before launch
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

// ── Build email ──────────────────────────────────────────────────────
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

$headers  = "From: " . SITE_NAME . " <noreply@suncrewenergy.com>\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// ── Send ─────────────────────────────────────────────────────────────
$sent = mail(RECEIVER_EMAIL, $subject, $body, $headers);

$_SESSION['last_submission'] = $now;

if ($sent) {
    header('Location: ' . THANK_YOU_URL);
} else {
    http_response_code(500);
    header('Location: ' . ERROR_URL);
}
exit;
