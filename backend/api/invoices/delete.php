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

if (!isset($data->id)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing invoice ID"]);
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

    // Delete Invoice (Items should cascade delete due to schema, but let's be safe and transaction it or rely on CASCADE)
    // Schema says: FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    // So distinct delete of items is not strictly necessary if foreign keys are enabled, 
    // but SQLite needs PRAGMA foreign_keys = ON; usually.
    // Let's rely on standard DELETE and if Items remain it's a schema config issue, 
    // but usually PHP PDO + SQLite might need explicit delete if schema isn't enforced.
    // Let's do explicit delete for safety.

    $db->beginTransaction();

    // Delete Items
    $del_items = "DELETE FROM invoice_items WHERE invoice_id = :invoice_id";
    $del_items_stmt = $db->prepare($del_items);
    $del_items_stmt->bindParam(':invoice_id', $invoice_id);
    $del_items_stmt->execute();

    // Delete Invoice
    $del_inv = "DELETE FROM invoices WHERE id = :id";
    $del_inv_stmt = $db->prepare($del_inv);
    $del_inv_stmt->bindParam(':id', $invoice_id);
    $del_inv_stmt->execute();

    $db->commit();

    echo json_encode(["message" => "Invoice deleted successfully"]);

} catch (Exception $e) {
    if ($db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(["message" => "Failed to delete invoice", "error" => $e->getMessage()]);
}
