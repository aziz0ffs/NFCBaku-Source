<?php

// Lets application views distinguish this protected router from a bare
// `php -S` launch, which would expose existing files directly.
defined('LINKSTACK_PROTECTED_LOCAL_ROUTER') || define('LINKSTACK_PROTECTED_LOCAL_ROUTER', true);

/**
 * Laravel - A PHP Framework For Web Artisans
 *
 * @package  Laravel
 * @author   Taylor Otwell <taylor@laravel.com>
 */

// LinkStack views expect this key even when the URL has no query string.
$_SERVER['QUERY_STRING'] ??= parse_url($_SERVER['REQUEST_URI'], PHP_URL_QUERY) ?? '';

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);

// This file allows us to emulate Apache's "mod_rewrite" functionality from the
// built-in PHP web server. This provides a convenient way to test a Laravel
// application without having installed a "real" web server software here.
// Never expose application internals through the local development server.
if (preg_match('~(?:^|/)\.|^/(?:app|bootstrap|config|database|vendor|backups|routes|resources|storage)(?:/|$)|^/(?:artisan|composer\.(?:json|lock)|server\.php|package(?:-lock)?\.json|web\.config|phpunit\.xml)$~i', $uri)) {
    http_response_code(404);
    exit('Not found');
}
if ($uri !== '/' && is_file(__DIR__.$uri)) {
    $real = realpath(__DIR__.$uri);
    $extension = strtolower(pathinfo($uri, PATHINFO_EXTENSION));
    if ($real && str_starts_with($real, __DIR__.DIRECTORY_SEPARATOR)
        && in_array($extension, ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'otf', 'mp4', 'webm', 'avif'], true)) {
        return false;
    }
}

require_once __DIR__.'/index.php';
