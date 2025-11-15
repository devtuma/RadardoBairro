<?php
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * GET - Buscar mensagens do chat por proximidade
 */
if ($method === 'GET') {
    try {
        $userLat = floatval($_GET['lat'] ?? 0);
        $userLng = floatval($_GET['lng'] ?? 0);
        $radius = floatval($_GET['radius'] ?? CHAT_PROXIMITY_RADIUS);
        $limit = intval($_GET['limit'] ?? 50);

        if (!isValidCoordinate($userLat, $userLng)) {
            errorResponse('Coordenadas inválidas');
        }

        // Limpar mensagens antigas (mais de 20 minutos)
        $stmt = $db->prepare("DELETE FROM chat_messages WHERE created_at < DATE_SUB(NOW(), INTERVAL 20 MINUTE)");
        $stmt->execute();

        // Buscar todas as mensagens recentes (últimos 20 minutos)
        $sql = "SELECT
                    id,
                    message,
                    latitude,
                    longitude,
                    created_at
                FROM chat_messages
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 20 MINUTE)
                ORDER BY created_at DESC
                LIMIT ?";

        $stmt = $db->prepare($sql);
        $stmt->execute([$limit * 2]); // Pega mais mensagens para filtrar por distância
        $messages = $stmt->fetchAll();

        // Filtrar por proximidade
        $nearbyMessages = [];
        foreach ($messages as $message) {
            $distance = calculateDistance(
                $userLat,
                $userLng,
                $message['latitude'],
                $message['longitude']
            );

            if ($distance <= $radius) {
                $message['time_ago'] = timeAgo($message['created_at']);
                $message['distance'] = round($distance, 2);
                unset($message['latitude'], $message['longitude']); // Não expor localização exata
                $nearbyMessages[] = $message;
            }
        }

        // Limitar resultado
        $nearbyMessages = array_slice($nearbyMessages, 0, $limit);

        successResponse($nearbyMessages);

    } catch (Exception $e) {
        error_log("Erro ao buscar mensagens do chat: " . $e->getMessage());
        errorResponse('Erro ao buscar mensagens', 500);
    }
}

/**
 * POST - Enviar mensagem no chat
 */
if ($method === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);

        $message = sanitizeInput($input['message'] ?? '');
        $latitude = floatval($input['latitude'] ?? 0);
        $longitude = floatval($input['longitude'] ?? 0);
        $userHash = getUserHash();

        // Validações
        if (empty($message)) {
            errorResponse('Mensagem não pode estar vazia');
        }

        if (strlen($message) > 200) {
            errorResponse('Mensagem deve ter no máximo 200 caracteres');
        }

        if (!isValidCoordinate($latitude, $longitude)) {
            errorResponse('Coordenadas inválidas');
        }

        // Rate limiting: verificar se usuário enviou mensagem nos últimos 10 segundos
        $stmt = $db->prepare("
            SELECT id FROM chat_messages
            WHERE user_hash = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 SECOND)
        ");
        $stmt->execute([$userHash]);

        if ($stmt->fetch()) {
            errorResponse('Aguarde alguns segundos antes de enviar outra mensagem', 429);
        }

        // Inserir mensagem
        $sql = "INSERT INTO chat_messages (message, latitude, longitude, user_hash)
                VALUES (?, ?, ?, ?)";

        $stmt = $db->prepare($sql);
        $stmt->execute([$message, $latitude, $longitude, $userHash]);

        $messageId = $db->lastInsertId();

        // Buscar mensagem criada
        $stmt = $db->prepare("SELECT id, message, created_at FROM chat_messages WHERE id = ?");
        $stmt->execute([$messageId]);
        $newMessage = $stmt->fetch();
        $newMessage['time_ago'] = timeAgo($newMessage['created_at']);

        successResponse($newMessage, 'Mensagem enviada!');

    } catch (Exception $e) {
        error_log("Erro ao enviar mensagem: " . $e->getMessage());
        errorResponse('Erro ao enviar mensagem', 500);
    }
}

errorResponse('Método não suportado', 405);
?>
