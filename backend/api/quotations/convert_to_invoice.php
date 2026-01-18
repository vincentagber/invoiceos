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

if (!empty($data->quotation_id)) {
    try {
        $db->beginTransaction();

        // 1. Fetch the Quotation
        $q_query = "SELECT * FROM quotations WHERE id = :id AND user_id = :user_id";
        $q_stmt = $db->prepare($q_query);
        $q_stmt->bindParam(':id', $data->quotation_id);
        $q_stmt->bindParam(':user_id', $user->id);
        $q_stmt->execute();
        $quotation = $q_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$quotation) {
            throw new Exception("Quotation not found.");
        }

        // 2. Fetch Quotation Items
        $qi_query = "SELECT * FROM quotation_items WHERE quotation_id = :id";
        $qi_stmt = $db->prepare($qi_query);
        $qi_stmt->bindParam(':id', $data->quotation_id);
        $qi_stmt->execute();
        $items = $qi_stmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Create Invoice
        $invoice_number = 'INV-' . time(); // Simple generation
        $issue_date = date('Y-m-d');
        $due_date = date('Y-m-d', strtotime('+30 days')); // Default to 30 days

        $inv_query = "INSERT INTO invoices 
                      (user_id, client_id, invoice_number, issue_date, due_date, subtotal, total, notes, status) 
                      VALUES (:user_id, :client_id, :invoice_number, :issue_date, :due_date, :subtotal, :total, :notes, 'pending')";
        
        $inv_stmt = $db->prepare($inv_query);
        $inv_stmt->bindParam(':user_id', $user->id);
        $inv_stmt->bindParam(':client_id', $quotation['client_id']);
        $inv_stmt->bindParam(':invoice_number', $invoice_number);
        $inv_stmt->bindParam(':issue_date', $issue_date);
        $inv_stmt->bindParam(':due_date', $due_date);
        $inv_stmt->bindParam(':subtotal', $quotation['subtotal']);
        $inv_stmt->bindParam(':total', $quotation['total']);
        $inv_stmt->bindParam(':notes', $quotation['notes']);
        
        if (!$inv_stmt->execute()) {
            throw new Exception("Failed to create invoice record.");
        }
        $invoice_id = $db->lastInsertId();

        // 4. Create Invoice Items
        $inv_item_query = "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES (:invoice_id, :description, :quantity, :unit_price, :total)";
        $inv_item_stmt = $db->prepare($inv_item_query);

        foreach ($items as $item) {
            $inv_item_stmt->bindParam(':invoice_id', $invoice_id);
            $inv_item_stmt->bindParam(':description', $item['description']);
            $inv_item_stmt->bindParam(':quantity', $item['quantity']);
            $inv_item_stmt->bindParam(':unit_price', $item['unit_price']);
            $inv_item_stmt->bindParam(':total', $item['total']);
            $inv_item_stmt->execute();
        }

        // 5. Update Quotation Status
        $update_q = "UPDATE quotations SET status = 'accepted' WHERE id = :id";
        $update_stmt = $db->prepare($update_q);
        $update_stmt->bindParam(':id', $data->quotation_id);
        $update_stmt->execute();

        $db->commit();
        http_response_code(201);
        echo json_encode(["message" => "Quotation converted to invoice successfully.", "invoice_id" => $invoice_id]);

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(503);
        echo json_encode(["message" => "Conversion failed: " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data."]);
}
