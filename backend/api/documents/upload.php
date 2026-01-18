<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../vendor/autoload.php';
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$database = new Database();
$db = $database->getConnection();

// Authenticate
$headers = getallheaders();
$jwt = null;
if (isset($headers['Authorization'])) {
    $matches = array();
    preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches);
    if (isset($matches[1])) {
        $jwt = $matches[1];
    }
}

$user_id = null;
if ($jwt) {
    try {
        $key = getenv('JWT_SECRET') ?: "YOUR_SECRET_KEY";
        $decoded = JWT::decode($jwt, new Key($key, 'HS256'));
        $user_id = $decoded->data->id;
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(["message" => "Access denied. Invalid token."]);
        exit();
    }
} else {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. No token provided."]);
    exit();
}

// Check for file upload
if (!isset($_FILES['file']) || !isset($_POST['type'])) {
    http_response_code(400);
    echo json_encode(["message" => "No file or document type provided."]);
    exit();
}

$file = $_FILES['file'];
$doc_type = $_POST['type']; // invoice, receipt, tax_filing, etc.
$title = $_POST['title'] ?? $file['name'];

// Validate file type
$allowed_extensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
$file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($file_ext, $allowed_extensions)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid file type. Allowed: pdf, doc, docx, xls, xlsx, images."]);
    exit();
}

// Upload directory
$upload_dir = __DIR__ . '/../../uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Generate unique filename
$new_filename = uniqid() . '_' . time() . '.' . $file_ext;
$target_path = $upload_dir . $new_filename;
$relative_path = 'uploads/' . $new_filename;

if (move_uploaded_file($file['tmp_name'], $target_path)) {
    try {
        // Updated column name from 'type' to 'doc_type' for MySQL compatibility
        $stmt = $db->prepare("INSERT INTO documents (user_id, title, doc_type, file_path, file_type) VALUES (:user_id, :title, :doc_type, :file_path, :file_type)");
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':doc_type', $doc_type);
        $stmt->bindParam(':file_path', $relative_path);
        $stmt->bindParam(':file_type', $file_ext);
        
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["message" => "File uploaded successfully.", "file_path" => $relative_path]);
        } else {
            http_response_code(503);
            echo json_encode(["message" => "Unable to save document info to database."]);
        }
    } catch (PDOException $e) {
         http_response_code(503);
         echo json_encode(["message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(["message" => "Failed to move uploaded file."]);
}
?>
