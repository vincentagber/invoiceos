<?php
// backend/api/invoices/create.php

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
    
    if (!empty($data->client_id) && !empty($data->items) && is_array($data->items)) {
        try {
            $db->beginTransaction();

            // Calculate totals
            $subtotal = 0;
            foreach ($data->items as $item) {
                $subtotal += ($item->quantity * $item->unit_price);
            }
            
            $discount = $data->discount ?? 0;
            $tax_rate = $data->tax_rate ?? 0;
            $tax_amount = ($subtotal - $discount) * ($tax_rate / 100);
            $total = ($subtotal - $discount) + $tax_amount;
            
            // Generate Invoice Number (Simple Auto-increment or Custom format)
            // For now, let's generate a basic one: INV-YEAR-RANDOM
            $invoice_number = "INV-" . date('Y') . "-" . strtoupper(substr(uniqid(), -5));

            $query = "INSERT INTO invoices 
                      (invoice_number, user_id, client_id, issue_date, due_date, subtotal, tax_rate, tax_amount, discount, total, notes, status) 
                      VALUES 
                      (:invoice_number, :user_id, :client_id, :issue_date, :due_date, :subtotal, :tax_rate, :tax_amount, :discount, :total, :notes, :status)";
            
            $stmt = $db->prepare($query);
            
            // Dates
            $issue_date = $data->issue_date ?? date('Y-m-d');
            $due_date = $data->due_date ?? date('Y-m-d', strtotime('+30 days'));
            $notes = $data->notes ?? '';
            $status = $data->status ?? 'draft';
            
            $stmt->bindParam(":invoice_number", $invoice_number);
            $stmt->bindParam(":user_id", $userData->id);
            $stmt->bindParam(":client_id", $data->client_id);
            $stmt->bindParam(":issue_date", $issue_date);
            $stmt->bindParam(":due_date", $due_date);
            $stmt->bindParam(":subtotal", $subtotal);
            $stmt->bindParam(":tax_rate", $tax_rate);
            $stmt->bindParam(":tax_amount", $tax_amount);
            $stmt->bindParam(":discount", $discount);
            $stmt->bindParam(":total", $total);
            $stmt->bindParam(":notes", $notes);
            $stmt->bindParam(":status", $status);
            
            $stmt->execute();
            $invoice_id = $db->lastInsertId();

            // Insert Items
            $itemQuery = "INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total) VALUES (:invoice_id, :description, :quantity, :unit_price, :total)";
            $itemStmt = $db->prepare($itemQuery);

            foreach ($data->items as $item) {
                $itemTotal = $item->quantity * $item->unit_price;
                $itemStmt->bindParam(":invoice_id", $invoice_id);
                $itemStmt->bindParam(":description", $item->description);
                $itemStmt->bindParam(":quantity", $item->quantity);
                $itemStmt->bindParam(":unit_price", $item->unit_price);
                $itemStmt->bindParam(":total", $itemTotal);
                $itemStmt->execute();
            }

            $db->commit();
            
            http_response_code(201);
            echo json_encode(["message" => "Invoice created successfully.", "id" => $invoice_id, "invoice_number" => $invoice_number]);
            
        } catch (Exception $e) {
            $db->rollBack();
            http_response_code(503);
            echo json_encode(["message" => "Unable to create invoice. " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data (Client and Items required)."]);
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
}
?>
