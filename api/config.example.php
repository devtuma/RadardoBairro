<?php
/**
 * Configuração do Banco de Dados - EXEMPLO
 *
 * INSTRUÇÕES:
 * 1. Copie este arquivo e renomeie para 'config.php'
 * 2. Altere as credenciais abaixo com suas informações reais
 * 3. NUNCA faça commit do arquivo config.php real no Git
 */

// Configurações do banco de dados
define('DB_HOST', 'localhost');              // Host do MySQL (geralmente 'localhost')
define('DB_NAME', 'radar_do_bairro');        // Nome do banco de dados
define('DB_USER', 'seu_usuario_mysql');      // Usuário do MySQL
define('DB_PASS', 'sua_senha_mysql');        // Senha do MySQL
define('DB_CHARSET', 'utf8mb4');

// Configurações gerais
define('TIMEZONE', 'America/Sao_Paulo');
date_default_timezone_set(TIMEZONE);

// Raio de proximidade para chat (em km)
define('CHAT_PROXIMITY_RADIUS', 2);

// Raio de proximidade para notificações (em km)
define('NOTIFICATION_RADIUS', 1);

// Headers CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Se for OPTIONS request (preflight), retorna 200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Classe de Conexão com Banco de Dados
 */
class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Erro de conexão: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao conectar com o banco de dados']);
            exit();
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}

/**
 * Função para gerar hash anônimo do usuário
 */
function getUserHash() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';

    // Adiciona um salt do dia para permitir que usuários votem novamente em dias diferentes
    $dateSalt = date('Y-m-d');

    return hash('sha256', $ip . $userAgent . $dateSalt);
}

/**
 * Função para calcular distância entre dois pontos (Haversine)
 */
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371; // Raio da Terra em km

    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);

    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon/2) * sin($dLon/2);

    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    $distance = $earthRadius * $c;

    return $distance;
}

/**
 * Função para validar categoria
 */
function isValidCategory($category) {
    return in_array($category, ['fofoca', 'alerta', 'evento', 'achados']);
}

/**
 * Função para validar tipo de voto
 */
function isValidVoteType($type) {
    return in_array($type, ['true', 'false', 'exag']);
}

/**
 * Função para formatar timestamp para tempo relativo
 */
function timeAgo($timestamp) {
    $time = strtotime($timestamp);
    $diff = time() - $time;

    if ($diff < 60) {
        return 'agora mesmo';
    } elseif ($diff < 3600) {
        $mins = floor($diff / 60);
        return $mins . ' min atrás';
    } elseif ($diff < 86400) {
        $hours = floor($diff / 3600);
        return $hours . 'h atrás';
    } elseif ($diff < 604800) {
        $days = floor($diff / 86400);
        return $days . 'd atrás';
    } else {
        return date('d/m/Y', $time);
    }
}

/**
 * Função para validar coordenadas
 */
function isValidCoordinate($lat, $lng) {
    return is_numeric($lat) && is_numeric($lng) &&
           $lat >= -90 && $lat <= 90 &&
           $lng >= -180 && $lng <= 180;
}

/**
 * Função para sanitizar entrada
 */
function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Função para resposta JSON de sucesso
 */
function successResponse($data = [], $message = null) {
    $response = ['success' => true];
    if ($message) $response['message'] = $message;
    if (!empty($data)) $response['data'] = $data;
    echo json_encode($response);
    exit();
}

/**
 * Função para resposta JSON de erro
 */
function errorResponse($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit();
}
?>
