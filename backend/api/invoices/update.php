<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/db.php';
include_once '../../middleware/AuthMiddleware.php';

$database = new Database();
$db = $database->connect();

$auth = new AuthMiddleware($db);
$user_data = $auth->authorize();

if (!$user_data) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (
    !isset($data->id) ||
    !isset($data->client_id) ||
    !isset($data->issue_date) ||
    !isset($data->due_date) ||
    !isset($data->items)
) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data"]);
    exit();
}

$invoice_id = $data->id;

try {
    // Check ownership
    $check_query = "SELECT id FROM invoices WHERE id = :id AND user_id = :user_id";
    $check_stmt = $db->prepare($check_query);
    $check_stmt->bindParam(':id', $invoice_id);
    $check_stmt->bindParam(':user_id', $user_data['user_id']);
    $check_stmt->execute();

    if ($check_stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(["message" => "Invoice not found or access denied"]);
        exit();
    }

    $db->beginTransaction();

    // Calculate totals
    $subtotal = 0;
    foreach ($data->items as $item) {
        $subtotal += ($item->quantity * $item->unit_price);
    }
    // Simple logic: total = subtotal for now
    $total = $subtotal;

    // Update Invoice Record
    $update_query = "UPDATE invoices SET 
        client_id = :client_id,
        issue_date = :issue_date,
        due_date = :due_date,
        subtotal = :subtotal,
        total = :total,
        notes = :notes
        WHERE id = :id";
    
    $stmt = $db->prepare($update_query);
    $stmt->bindParam(':client_id', $data->client_id);
    $stmt->bindParam(':issue_date', $data->issue_date);
    $stmt->bindParam(':due_date', $data->due_date);
    $stmt->bindParam(':subtotal', $subtotal);
    $stmt->bindParam(':total', $total);
    $stmt->bindParam(':notes', $data->notes);
    $stmt->bindParam(':id', $invoice_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to update invoice record");
    }

    // Replace Items: Delete existing, Insert new
    $del_items = "DELETE FROM invoice_items WHERE invoice_id = :invoice_id";
    $del_stmt = $db->prepare($del_items);
    $del_stmt->bindParam(':invoice_id', $invoice_id);
    $del_stmt->execute();

    $item_query = "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES (:invoice_id, :description, :quantity, :unit_price, :total)";
    $item_stmt = $db->prepare($item_query);

    foreach ($data->items as $item) {
        $item_total = $item->quantity * $item->unit_price;
        $item_stmt->bindParam(':invoice_id', $invoice_id);
        $item_stmt->bindParam(':description', $item->description);
        $item_stmt->bindParam(':quantity', $item->quantity);
        $item_stmt->bindParam(':unit_price', $item->unit_price);
        $item_stmt->bindParam(':total', $item_total);
        $item_stmt->execute();
    }

    $db->commit();
    echo json_encode(["message" => "Invoice updated successfully"]);

} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Failed to update invoice", "error" => $e->getMessage()]);
}
