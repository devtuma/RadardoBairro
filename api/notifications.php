<?php
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * GET - Buscar novos posts próximos ao usuário (para notificações)
 */
if ($method === 'GET') {
    try {
        $userLat = floatval($_GET['lat'] ?? 0);
        $userLng = floatval($_GET['lng'] ?? 0);
        $radius = floatval($_GET['radius'] ?? NOTIFICATION_RADIUS);
        $since = sanitizeInput($_GET['since'] ?? '');

        if (!isValidCoordinate($userLat, $userLng)) {
            errorResponse('Coordenadas inválidas');
        }

        // Se não foi fornecido timestamp, usar últimos 5 minutos
        if (empty($since)) {
            $since = date('Y-m-d H:i:s', strtotime('-5 minutes'));
        }

        // Buscar posts recentes
        $sql = "SELECT
                    id,
                    category,
                    title,
                    description,
                    latitude,
                    longitude,
                    created_at
                FROM posts
                WHERE created_at > ?
                ORDER BY created_at DESC
                LIMIT 20";

        $stmt = $db->prepare($sql);
        $stmt->execute([$since]);
        $recentPosts = $stmt->fetchAll();

        // Filtrar por proximidade
        $nearbyPosts = [];
        foreach ($recentPosts as $post) {
            $distance = calculateDistance(
                $userLat,
                $userLng,
                $post['latitude'],
                $post['longitude']
            );

            if ($distance <= $radius) {
                $post['time_ago'] = timeAgo($post['created_at']);
                $post['distance'] = round($distance, 2);
                $nearbyPosts[] = $post;
            }
        }

        $response = [
            'count' => count($nearbyPosts),
            'posts' => $nearbyPosts
        ];

        successResponse($response);

    } catch (Exception $e) {
        error_log("Erro ao buscar notificações: " . $e->getMessage());
        errorResponse('Erro ao buscar notificações', 500);
    }
}

errorResponse('Método não suportado', 405);
?>
