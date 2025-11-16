<?php
require_once 'config.php';

$db = Database::getInstance()->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

/**
 * GET - Buscar estatísticas do bairro
 */
if ($method === 'GET') {
    try {
        $userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
        $userLng = isset($_GET['lng']) ? floatval($_GET['lng']) : null;
        $radius = isset($_GET['radius']) ? floatval($_GET['radius']) : 5; // 5km padrão

        // Estatísticas gerais
        $stats = [];

        // Total de posts ativos
        $stmt = $db->query("SELECT COUNT(*) as total FROM posts WHERE expires_at > NOW()");
        $stats['total_posts'] = intval($stmt->fetch()['total']);

        // Total de votos
        $stmt = $db->query("SELECT COUNT(*) as total FROM votes");
        $stats['total_votes'] = intval($stmt->fetch()['total']);

        // Total de comentários
        $stmt = $db->query("SELECT COUNT(*) as total FROM post_comments");
        $stats['total_comments'] = intval($stmt->fetch()['total']);

        // Mensagens de chat nas últimas 24h
        $stmt = $db->query("SELECT COUNT(*) as total FROM chat_messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $stats['chat_messages_24h'] = intval($stmt->fetch()['total']);

        // Posts por categoria
        $stmt = $db->query("
            SELECT category, COUNT(*) as count
            FROM posts
            WHERE expires_at > NOW()
            GROUP BY category
        ");
        $stats['posts_by_category'] = $stmt->fetchAll();

        // Posts nas últimas 24h, 7d, 30d
        $stmt = $db->query("SELECT COUNT(*) as total FROM posts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)");
        $stats['posts_24h'] = intval($stmt->fetch()['total']);

        $stmt = $db->query("SELECT COUNT(*) as total FROM posts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
        $stats['posts_7d'] = intval($stmt->fetch()['total']);

        $stmt = $db->query("SELECT COUNT(*) as total FROM posts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $stats['posts_30d'] = intval($stmt->fetch()['total']);

        // Top 5 posts mais votados
        $stmt = $db->query("
            SELECT p.id, p.title, p.category, COUNT(v.id) as votes
            FROM posts p
            LEFT JOIN votes v ON p.id = v.post_id
            WHERE p.expires_at > NOW()
            GROUP BY p.id
            ORDER BY votes DESC
            LIMIT 5
        ");
        $stats['top_posts'] = $stmt->fetchAll();

        // Estatísticas por hora do dia (posts criados)
        $stmt = $db->query("
            SELECT HOUR(created_at) as hour, COUNT(*) as count
            FROM posts
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY hour
            ORDER BY hour
        ");
        $stats['posts_by_hour'] = $stmt->fetchAll();

        // Média de votos por post
        $stmt = $db->query("
            SELECT AVG(vote_count) as avg_votes
            FROM (
                SELECT COUNT(*) as vote_count
                FROM votes
                GROUP BY post_id
            ) as subquery
        ");
        $result = $stmt->fetch();
        $stats['avg_votes_per_post'] = round(floatval($result['avg_votes'] ?? 0), 2);

        // Média de comentários por post
        $stmt = $db->query("
            SELECT AVG(comment_count) as avg_comments
            FROM (
                SELECT COUNT(*) as comment_count
                FROM post_comments
                GROUP BY post_id
            ) as subquery
        ");
        $result = $stmt->fetch();
        $stats['avg_comments_per_post'] = round(floatval($result['avg_comments'] ?? 0), 2);

        // Se coordenadas fornecidas, estatísticas locais
        if ($userLat && $userLng) {
            // Posts próximos (dentro do raio)
            $sql = "SELECT
                        p.id,
                        p.latitude,
                        p.longitude,
                        p.category
                    FROM posts p
                    WHERE p.expires_at > NOW()";

            $stmt = $db->query($sql);
            $nearbyPosts = [];

            while ($row = $stmt->fetch()) {
                $distance = calculateDistance($userLat, $userLng, $row['latitude'], $row['longitude']);
                if ($distance <= $radius) {
                    $nearbyPosts[] = $row;
                }
            }

            $stats['nearby_posts'] = count($nearbyPosts);

            // Categoria mais comum na região
            if (count($nearbyPosts) > 0) {
                $categories = array_count_values(array_column($nearbyPosts, 'category'));
                arsort($categories);
                $stats['top_category_nearby'] = array_key_first($categories);
            } else {
                $stats['top_category_nearby'] = null;
            }
        }

        successResponse($stats);

    } catch (Exception $e) {
        error_log("Erro ao buscar estatísticas: " . $e->getMessage());
        errorResponse('Erro ao buscar estatísticas', 500);
    }
}

errorResponse('Método não suportado', 405);
?>
