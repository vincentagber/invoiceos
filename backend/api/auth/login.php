<?php
// backend/api/auth/login.php

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
require_once '../../classes/JwtHandler.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->email) && !empty($data->password)){
    $query = "SELECT id, name, email, password, role, profile_picture FROM users WHERE email = :email LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":email", $data->email);
    $stmt->execute();

    if(($row = $stmt->fetch(PDO::FETCH_ASSOC))){

        
        if(password_verify($data->password, $row['password'])){
            $jwt = new JwtHandler();
            $token_payload = [
                "iss" => "superlink_invoice",
                "iat" => time(),
                "exp" => time() + (60*60*24), // 24 hours
                "data" => [
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "email" => $row['email'],
                    "role" => $row['role'],
                    "profile_picture" => $row['profile_picture']
                ]
            ];
            
            $token = $jwt->encode($token_payload);
            
            http_response_code(200);
            echo json_encode([
                "message" => "Login successful.",
                "token" => $token,
                "user" => [
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "email" => $row['email'],
                    "role" => $row['role'],
                    "profile_picture" => $row['profile_picture']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["message" => "Invalid password."]);
        }
    } else {
        http_response_code(404); // Or 401 to be ambiguous
        echo json_encode(["message" => "User not found."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
?>
