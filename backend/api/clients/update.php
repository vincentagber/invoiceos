<?php
// backend/api/clients/update.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
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
    
    if (!empty($data->id)) {
        // Verify ownership
        $checkQuery = "SELECT id FROM clients WHERE id = :id AND user_id = :user_id LIMIT 1";
        $stmt = $db->prepare($checkQuery);
        $stmt->bindParam(":id", $data->id);
        $stmt->bindParam(":user_id", $userData->id);
        $stmt->execute();
        
        if ($stmt->fetch()) {
            $query = "UPDATE clients SET name = :name, email = :email, phone = :phone, address = :address, tax_id = :tax_id WHERE id = :id";
            $updateStmt = $db->prepare($query);
            
            $name = htmlspecialchars(strip_tags($data->name));
            $email = $data->email ?? null;
            $phone = $data->phone ?? null;
            $address = $data->address ?? null;
            $tax_id = $data->tax_id ?? null; // e.g. VAT number
            
            $updateStmt->bindParam(":name", $name);
            $updateStmt->bindParam(":email", $email);
            $updateStmt->bindParam(":phone", $phone);
            $updateStmt->bindParam(":address", $address);
            $updateStmt->bindParam(":tax_id", $tax_id);
            $updateStmt->bindParam(":id", $data->id);
            
            if ($updateStmt->execute()) {
                http_response_code(200);
                echo json_encode(["message" => "Client updated successfully."]);
            } else {
                http_response_code(503);
                echo json_encode(["message" => "Unable to update client."]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Client not found or access denied."]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "ID is required."]);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
}
?>
