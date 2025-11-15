-- Banco de dados: radar_do_bairro
-- Configuração para MySQL

CREATE DATABASE IF NOT EXISTS radar_do_bairro
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE radar_do_bairro;

-- Tabela de posts
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category ENUM('fofoca', 'alerta', 'evento', 'achados') NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de votos/confirmações
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    vote_type ENUM('true', 'false', 'exag') NOT NULL,
    user_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vote (post_id, user_hash),
    INDEX idx_post_id (post_id),
    INDEX idx_vote_type (vote_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    user_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de visualizações (para calcular posts quentes)
CREATE TABLE IF NOT EXISTS post_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- View para calcular hotness score dos posts
CREATE OR REPLACE VIEW hot_posts AS
SELECT
    p.id,
    p.category,
    p.title,
    p.description,
    p.latitude,
    p.longitude,
    p.created_at,
    COUNT(DISTINCT v.id) as vote_count,
    COUNT(DISTINCT pv.id) as view_count,
    SUM(CASE WHEN v.vote_type = 'true' THEN 1 ELSE 0 END) as true_votes,
    SUM(CASE WHEN v.vote_type = 'false' THEN 1 ELSE 0 END) as false_votes,
    SUM(CASE WHEN v.vote_type = 'exag' THEN 1 ELSE 0 END) as exag_votes,
    -- Fórmula de hotness: (votos + visualizações) / (horas desde criação + 2)^1.5
    (COUNT(DISTINCT v.id) * 2 + COUNT(DISTINCT pv.id)) /
    POW((TIMESTAMPDIFF(HOUR, p.created_at, NOW()) + 2), 1.5) as hotness_score
FROM posts p
LEFT JOIN votes v ON p.id = v.post_id
LEFT JOIN post_views pv ON p.id = pv.post_id
GROUP BY p.id
ORDER BY hotness_score DESC;

-- Inserir alguns dados de exemplo (opcional - remova em produção)
INSERT INTO posts (category, title, description, latitude, longitude) VALUES
('fofoca', 'Vizinho do 302 comprou carro novo', 'Dizem que foi um BMW zero km, será que ganhou na loteria?', -23.5505, -46.6333),
('alerta', 'Buraco grande na Rua das Flores', 'Cuidado ao passar pela esquina da padaria, tem um buraco enorme!', -23.5515, -46.6343),
('evento', 'Festa junina na praça', 'Sábado às 18h terá festa junina com comidas típicas e quadrilha', -23.5525, -46.6323),
('achados', 'Achei um gatinho na praça', 'Gatinho laranja, bem cuidado, deve ter dono. Está comigo.', -23.5535, -46.6353);

-- Inserir alguns votos de exemplo
INSERT INTO votes (post_id, vote_type, user_hash) VALUES
(1, 'true', 'hash_usuario_1'),
(1, 'exag', 'hash_usuario_2'),
(2, 'true', 'hash_usuario_1'),
(2, 'true', 'hash_usuario_3'),
(3, 'true', 'hash_usuario_1'),
(4, 'true', 'hash_usuario_2');
