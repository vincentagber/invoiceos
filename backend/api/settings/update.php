<?php
// backend/api/settings/update.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
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
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!empty($data) && is_array($data)) {
        try {
            $db->beginTransaction();
            
            // MySQL uses ON DUPLICATE KEY UPDATE instead of ON CONFLICT
            $query = "INSERT INTO settings (user_id, setting_key, setting_value) 
                      VALUES (:user_id, :setting_key, :setting_value)
                      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";
            $stmt = $db->prepare($query);
            
            foreach ($data as $key => $value) {
                // Skip if value is not string or null
                if (!is_scalar($value) && !is_null($value)) continue;
                
                $stmt->bindValue(':user_id', $userData->id);
                $stmt->bindValue(':setting_key', $key);
                $stmt->bindValue(':setting_value', $value);
                $stmt->execute();
            }
            
            $db->commit();
            http_response_code(200);
            echo json_encode(["message" => "Settings updated successfully."]);
            
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(["message" => "Unable to update settings. " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Invalid data. Expected JSON object with key-value pairs."]);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
}
?>
