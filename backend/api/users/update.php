<?php
// backend/api/users/update.php

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
    
    // We only allow updating the current user's own profile for now
    $userId = $userData->id;

    if (!empty($data)) {
        try {
            // Build dynamic query based on provided fields
            $fields = [];
            $params = [':id' => $userId];

            if (isset($data->name)) {
                $fields[] = "name = :name";
                $params[':name'] = $data->name;
            }
            if (isset($data->email)) {
                $fields[] = "email = :email";
                $params[':email'] = $data->email;
            }
            if (isset($data->profile_picture)) {
                $fields[] = "profile_picture = :profile_picture";
                $params[':profile_picture'] = $data->profile_picture;
            }

            if (empty($fields)) {
                 http_response_code(400);
                 echo json_encode(["message" => "No fields provided to update."]);
                 exit();
            }

            $query = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = :id";
            $stmt = $db->prepare($query);
            
            if ($stmt->execute($params)) {
                // Return updated user data
                 $stmt = $db->prepare("SELECT id, name, email, role, profile_picture FROM users WHERE id = :id");
                 $stmt->execute([':id' => $userId]);
                 $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

                http_response_code(200);
                echo json_encode([
                    "message" => "Profile updated successfully.",
                    "user" => $updatedUser
                ]);
            } else {
                throw new Exception("Execution failed.");
            }

        } catch (Exception $e) {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update profile. " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data."]);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
}
?>
