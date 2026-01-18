<?php
// backend/index.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

// Simple Router
// URI structure: /api/resource/id
// but since we are running php -S, it might be just /resource/id if we point to index.php or use it as router

$response = [
    "status" => "success",
    "message" => "SuperlinkInvoice API is running",
    "timestamp" => date('c')
];

echo json_encode($response);
?>
