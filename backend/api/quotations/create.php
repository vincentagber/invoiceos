<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
include_once '../../classes/AuthMiddleware.php';

$database = new Database();
$db = $database->getConnection();

$auth = new AuthMiddleware($db, getallheaders());
$user = $auth->isValid();

if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->client_id) &&
    !empty($data->issue_date) &&
    !empty($data->expiry_date) &&
    !empty($data->items) &&
    is_array($data->items)
) {
    try {
        $db->beginTransaction();

        // Generate Quotation Number (QT-TIMESTAMP)
        $quotation_number = 'QT-' . time();

        $subtotal = 0;
        foreach ($data->items as $item) {
            $subtotal += $item->quantity * $item->unit_price;
        }
        $total = $subtotal; // Add tax logic here if needed

        $query = "INSERT INTO quotations 
                  (user_id, client_id, quotation_number, issue_date, expiry_date, subtotal, total, notes, status) 
                  VALUES (:user_id, :client_id, :quotation_number, :issue_date, :expiry_date, :subtotal, :total, :notes, :status)";

        $stmt = $db->prepare($query);

        $stmt->bindParam(':user_id', $user->id);
        $stmt->bindParam(':client_id', $data->client_id);
        $stmt->bindParam(':quotation_number', $quotation_number);
        $stmt->bindParam(':issue_date', $data->issue_date);
        $stmt->bindParam(':expiry_date', $data->expiry_date);
        $stmt->bindParam(':subtotal', $subtotal);
        $stmt->bindParam(':total', $total);
        $stmt->bindParam(':notes', $data->notes);
        
        $status = $data->status ?? 'draft';
        $stmt->bindParam(':status', $status);

        if ($stmt->execute()) {
            $quotation_id = $db->lastInsertId();

            $item_query = "INSERT INTO quotation_items (quotation_id, description, quantity, unit_price, total) VALUES (:quotation_id, :description, :quantity, :unit_price, :total)";
            $item_stmt = $db->prepare($item_query);

            foreach ($data->items as $item) {
                $item_total = $item->quantity * $item->unit_price;
                $item_stmt->bindParam(':quotation_id', $quotation_id);
                $item_stmt->bindParam(':description', $item->description);
                $item_stmt->bindParam(':quantity', $item->quantity);
                $item_stmt->bindParam(':unit_price', $item->unit_price);
                $item_stmt->bindParam(':total', $item_total);
                $item_stmt->execute();
            }

            $db->commit();
            http_response_code(201);
            echo json_encode(["message" => "Quotation created successfully.", "id" => $quotation_id]);
        } else {
            throw new Exception("Quotation creation failed.");
        }
    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(503);
        echo json_encode(["message" => "Unable to create quotation. " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
