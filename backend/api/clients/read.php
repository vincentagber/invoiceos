<?php
// backend/api/clients/read.php

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
    $id = isset($_GET['id']) ? $_GET['id'] : null;

    if ($id) {
        // Read Single Client
        $query = "SELECT * FROM clients WHERE id = :id AND user_id = :user_id LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $userData->id);
        $stmt->execute();
        
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            http_response_code(200);
            echo json_encode($row);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Client not found."]);
        }
    } else {
        // Read All Clients for the user
        $query = "SELECT * FROM clients WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $userData->id);
        $stmt->execute();
        
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode($clients);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
}
?>
