<?php
// backend/classes/AuthMiddleware.php
require_once __DIR__ . '/JwtHandler.php';

class AuthMiddleware {
    private $db;
    private $headers;

    public function __construct($db, $headers) {
        $this->db = $db;
        $this->headers = $headers;
        
        // Polyfill for getallheaders() if not available (e.g. FPM or some CLI servers)
        if (!function_exists('getallheaders')) {
             $this->headers = [];
             foreach ($_SERVER as $name => $value) {
                 if (substr($name, 0, 5) == 'HTTP_') {
                     $header = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($name, 5)))));
                     $this->headers[$header] = $value;
                 }
             }
        }
    }

    public function isValid() {
        if (array_key_exists('Authorization', $this->headers) && preg_match('/Bearer\s(\S+)/', $this->headers['Authorization'], $matches)) {
            $jwt = $matches[1];
            $jwtHandler = new JwtHandler();
            $token = $jwtHandler->decode($jwt);
            if ($token && isset($token['data']['id']) && isset($token['iss']) && $token['iss'] === 'superlink_invoice') {
                return (object) $token['data'];
            }
        }
        return false;
    }
}
?>
