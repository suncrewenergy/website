<?php
/**
 * config.example.php — SMTP credentials TEMPLATE
 * -------------------------------------------------------------
 * Copy this file to "config.php" on the server and fill in the
 * real mailbox password. config.php is git-ignored and must
 * NEVER be committed.
 *
 *   cp forms/config.example.php forms/config.php
 *   nano forms/config.php   # set SMTP_PASS
 * -------------------------------------------------------------
 */

return [
    // Hostinger email SMTP server
    'SMTP_HOST'   => 'smtp.hostinger.com',
    'SMTP_PORT'   => 465,            // 465 = SSL, 587 = STARTTLS
    'SMTP_SECURE' => 'ssl',         // 'ssl' for 465, 'tls' for 587

    // The mailbox the form logs in as (also the visible "From")
    'SMTP_USER'   => 'info@suncrewenergy.com',
    'SMTP_PASS'   => 'CHANGE_ME',   // ← mailbox password (set on server only)

    // Where inquiries are delivered (usually the same mailbox)
    'RECEIVER_EMAIL' => 'info@suncrewenergy.com',
];
