# 🗄️ Instruções do Banco de Dados

## 📋 Arquivos

- **`schema.sql`** - Schema completo (para instalação nova)
- **`migration-reset.sql`** - Script de migração (para atualizar/resetar)

## 🆕 Instalação Nova (Primeira vez)

Se você está instalando pela primeira vez:

1. Acesse o **phpMyAdmin**
2. Selecione o banco `u758469769_radarbairro`
3. Vá na aba **SQL**
4. Copie e cole todo o conteúdo do arquivo `schema.sql`
5. Clique em **Executar**

## 🔄 Atualização/Migração (Já tem dados antigos)

Se você já tinha uma versão antiga e quer atualizar:

### ⚠️ ATENÇÃO: Isso vai apagar todos os dados existentes!

1. Acesse o **phpMyAdmin**
2. Selecione o banco `u758469769_radarbairro`
3. Vá na aba **SQL**
4. Copie e cole todo o conteúdo do arquivo `migration-reset.sql`
5. Clique em **Executar**

Este script irá:
- ✅ Dropar todas as views antigas
- ✅ Dropar todos os triggers antigos
- ✅ Dropar todos os events antigos
- ✅ Dropar todas as tabelas antigas
- ✅ Criar tudo novamente com a estrutura atualizada
- ✅ Inserir dados de exemplo

## 📊 Estrutura do Banco

### Tabelas

1. **`posts`** - Postagens principais
   - Novo: Campo `expires_at` (expira após 48h por padrão)

2. **`votes`** - Votos dos usuários (verdadeiro/falso/exagero)

3. **`chat_messages`** - Mensagens do chat global
   - Auto-deletadas após 20 minutos

4. **`post_comments`** - Comentários por post (NOVA)
   - Até 500 caracteres
   - Estende vida do post

5. **`post_views`** - Visualizações dos posts

6. **`reports`** - Denúncias de abuso (NOVA)
   - Auto-delete com 5+ reportes

### Views

- **`hot_posts`** - Ranking de posts mais quentes
  - Calcula score baseado em votos, views e comentários
  - Apenas posts não expirados

### Triggers

1. **`extend_post_lifetime_on_comment`**
   - Adiciona +48h ao post a cada 100 comentários

2. **`auto_delete_reported_posts`**
   - Deleta posts/comentários/mensagens com 5+ reportes

### Events

- **`delete_expired_posts`**
  - Executa a cada hora
  - Remove posts expirados

## 🔧 Configuração do Event Scheduler

Se os events não estiverem funcionando, execute:

```sql
SET GLOBAL event_scheduler = ON;
```

Para verificar se está ativo:

```sql
SHOW VARIABLES LIKE 'event_scheduler';
```

## 🧪 Verificar Instalação

Após executar o script, verifique:

```sql
-- Ver tabelas criadas
SHOW TABLES;

-- Ver triggers
SHOW TRIGGERS;

-- Ver events
SHOW EVENTS;

-- Ver dados de exemplo
SELECT * FROM posts;
SELECT * FROM post_comments;
SELECT * FROM hot_posts;
```

## ❓ Solução de Problemas

### Erro: "Coluna 'expires_at' desconhecida"

**Solução**: Execute o `migration-reset.sql` completo para recriar as tabelas.

### Erro: "Trigger já existe"

**Solução**: O script já dropa os triggers antes de criar. Se persistir:

```sql
DROP TRIGGER IF EXISTS extend_post_lifetime_on_comment;
DROP TRIGGER IF EXISTS auto_delete_reported_posts;
```

### Erro: "Event já existe"

**Solução**: O script já dropa os events. Se persistir:

```sql
DROP EVENT IF EXISTS delete_expired_posts;
```

### Posts não expiram automaticamente

**Solução**: Verifique se o event scheduler está ativo:

```sql
SET GLOBAL event_scheduler = ON;
```

## 📈 Monitoramento

### Ver posts prestes a expirar

```sql
SELECT id, title, created_at, expires_at,
       TIMESTAMPDIFF(HOUR, NOW(), expires_at) as horas_restantes
FROM posts
WHERE expires_at > NOW()
ORDER BY expires_at ASC;
```

### Ver estatísticas de comentários

```sql
SELECT p.id, p.title,
       COUNT(pc.id) as comentarios,
       p.expires_at
FROM posts p
LEFT JOIN post_comments pc ON p.id = pc.post_id
GROUP BY p.id
ORDER BY comentarios DESC;
```

### Ver denúncias por item

```sql
SELECT report_type, item_id,
       COUNT(DISTINCT user_hash) as total_reportes
FROM reports
GROUP BY report_type, item_id
HAVING total_reportes >= 3
ORDER BY total_reportes DESC;
```

## 🚀 Manutenção

### Limpar mensagens antigas do chat manualmente

```sql
DELETE FROM chat_messages
WHERE created_at < DATE_SUB(NOW(), INTERVAL 20 MINUTE);
```

### Limpar posts expirados manualmente

```sql
DELETE FROM posts WHERE expires_at < NOW();
```

### Resetar denúncias antigas

```sql
DELETE FROM reports
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

---

**Dúvidas?** Consulte o [README principal](../README.md)
