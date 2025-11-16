-- Adicionar coluna de imagem na tabela posts
ALTER TABLE posts ADD COLUMN image_url VARCHAR(500) DEFAULT NULL AFTER description;

-- Criar índice para melhor performance
CREATE INDEX idx_posts_image ON posts(image_url);
