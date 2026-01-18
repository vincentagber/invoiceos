<?php
// backend/api/clients/create.php

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
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->name)) {
        $query = "INSERT INTO clients (user_id, name, email, phone, address, tax_id) VALUES (:user_id, :name, :email, :phone, :address, :tax_id)";
        $stmt = $db->prepare($query);
        
        $name = htmlspecialchars(strip_tags($data->name));
        $email = $data->email ?? null; // Allow null
        $phone = $data->phone ?? null;
        $address = $data->address ?? null;
        $tax_id = $data->tax_id ?? null;
        
        $stmt->bindParam(":user_id", $userData->id);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":address", $address);
        $stmt->bindParam(":tax_id", $tax_id);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "Client created successfully.", "id" => $db->lastInsertId()]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to create client."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Name is required."]);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
}
?>
