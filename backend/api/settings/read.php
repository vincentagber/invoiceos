<?php
// backend/api/settings/read.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../classes/AuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

$auth = new AuthMiddleware($db, getallheaders());
$userData = $auth->isValid();

if ($userData) {
    if (isset($_GET['all']) && $_GET['all'] === 'true') {
         // Fetch all settings for user
         $query = "SELECT setting_key, setting_value FROM settings WHERE user_id = :user_id";
         $stmt = $db->prepare($query);
         $stmt->bindParam(":user_id", $userData->id);
         $stmt->execute();
         
         $settings = [];
         while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
             $settings[$row['setting_key']] = $row['setting_value'];
         }
         
         http_response_code(200);
         echo json_encode($settings);
    } else {
        // Fetch specific key
         $key = $_GET['key'] ?? null;
         if ($key) {
             $query = "SELECT setting_value FROM settings WHERE user_id = :user_id AND setting_key = :setting_key LIMIT 1";
             $stmt = $db->prepare($query);
             $stmt->bindParam(":user_id", $userData->id);
             $stmt->bindParam(":setting_key", $key);
             $stmt->execute();
             
             if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                 http_response_code(200);
                 echo json_encode(["key" => $key, "value" => $row['setting_value']]);
             } else {
                 http_response_code(404);
                 echo json_encode(["message" => "Setting not found."]);
             }
         } else {
             http_response_code(400);
             echo json_encode(["message" => "Key is required."]);
         }
    }

} else {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
}
?>
