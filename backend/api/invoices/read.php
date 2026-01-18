<?php
// backend/api/invoices/read.php

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
        // Read Single Invoice with Items and Client
        $query = "SELECT i.*, c.name as client_name, c.email as client_email 
                  FROM invoices i 
                  JOIN clients c ON i.client_id = c.id 
                  WHERE i.id = :id AND i.user_id = :user_id 
                  LIMIT 1";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $userData->id);
        $stmt->execute();
        
        if ($invoice = $stmt->fetch(PDO::FETCH_ASSOC)) {
            
            // Get Items
            $itemQuery = "SELECT * FROM invoice_items WHERE invoice_id = :invoice_id";
            $itemStmt = $db->prepare($itemQuery);
            $itemStmt->bindParam(":invoice_id", $id);
            $itemStmt->execute();
            
            $invoice['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode($invoice);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Invoice not found."]);
        }
    } else {
        // Read All Invoices
        $query = "SELECT i.id, i.invoice_number, i.issue_date, i.total, i.status, c.name as client_name 
                  FROM invoices i 
                  JOIN clients c ON i.client_id = c.id 
                  WHERE i.user_id = :user_id 
                  ORDER BY i.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(":user_id", $userData->id);
        $stmt->execute();
        
        $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);
        http_response_code(200);
        echo json_encode($invoices);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
}
?>
