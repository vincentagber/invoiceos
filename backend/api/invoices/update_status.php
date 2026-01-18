<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../classes/AuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

$auth = new AuthMiddleware($db);
$user = $auth->isValid();

if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->status)) {
    try {
        // Validate status
        $valid_statuses = ['draft', 'pending', 'paid', 'overdue', 'cancelled'];
        if (!in_array($data->status, $valid_statuses)) {
            throw new Exception("Invalid status.");
        }

        // Check ownership
        $check_query = "SELECT id FROM invoices WHERE id = :id AND user_id = :user_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->bindParam(':id', $data->id);
        $check_stmt->bindParam(':user_id', $user->id);
        $check_stmt->execute();

        if ($check_stmt->rowCount() === 0) { // Should be fine for SELECT id checks or fetch
             // Double check with fetch for safety if rowCount unreliabile for SQLite select
             if (!$check_stmt->fetch()) {
                 http_response_code(404);
                 echo json_encode(["message" => "Invoice not found."]);
                 exit();
             }
        }

        $query = "UPDATE invoices SET status = :status WHERE id = :id";
        $stmt = $db->prepare($query);

        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':id', $data->id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(["message" => "Invoice status updated."]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to update invoice."]);
        }
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(["message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
