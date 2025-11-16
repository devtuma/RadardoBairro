# 📱 Radar do Bairro

**Aplicativo de acontecimentos anônimos em tempo real na sua região**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.0+-777BB4?logo=php)](https://php.net)
[![MySQL](https://img.shields.io/badge/MySQL-5.7+-4479A1?logo=mysql)](https://www.mysql.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

---

## 📖 Sobre

**Radar do Bairro** é uma plataforma anônima onde usuários compartilham acontecimentos, eventos e alertas em sua região em tempo real. Construído com foco em privacidade, performance e experiência mobile-first.

### ✨ Funcionalidades

#### 🗺️ Core
- **Mapa Interativo** com Leaflet.js e OpenStreetMap
- **Posts por Categoria**: Fofoca, Alerta, Evento, Achados/Perdidos
- **Sistema de Votação**: Verdadeiro, Falso, Exagero
- **Geolocalização** automática
- **Filtros Avançados** por categoria e período

#### 💬 Social
- **Chat por Proximidade** (raio de 3km)
- **Comentários** em posts
- **Sistema de Denúncias** com auto-moderação
- **Compartilhamento** em redes sociais (WhatsApp, Twitter, Facebook, Telegram)
- **Anonimato Total** via hash SHA-256

#### 📊 Avançado
- **Posts em Alta** (algoritmo de ranking)
- **Dashboard de Estatísticas** completo
- **Notificações de Proximidade** (1km)
- **Upload de Imagens** com otimização automática
- **Modo Escuro/Claro** com persistência

#### 📱 PWA
- **Instalável** como app nativo
- **Funciona Offline** após primeira visita
- **Push Notifications** (preparado)
- **Service Worker** com cache inteligente

---

## 🚀 Início Rápido

### Pré-requisitos

- PHP 8.0+
- MySQL 5.7+
- Servidor web (Apache/Nginx)
- Hostinger ou servidor similar

### Instalação em 5 Passos

```bash
# 1. Criar banco de dados MySQL
# 2. Executar database/migration-hostinger.sql
# 3. Editar api/config.php (credenciais)
# 4. Upload para public_html/
# 5. Criar diretório uploads/posts/ (755)
```

📚 **[GUIA COMPLETO DE INSTALAÇÃO](INSTALACAO.md)**

---

## 📁 Estrutura do Projeto

```
RadardoBairro/
├── api/                   # Backend PHP
│   ├── config.php        # Configuração
│   ├── posts.php         # CRUD posts
│   ├── votes.php         # Votação
│   ├── chat.php          # Chat
│   ├── upload.php        # Upload imagens
│   └── stats.php         # Estatísticas
├── js/                    # Frontend JavaScript
│   ├── map.js            # Leaflet Maps
│   ├── posts.js          # Gerenciamento posts
│   ├── theme.js          # Modo escuro/claro
│   └── app.js            # Inicialização
├── css/style.css         # Estilos
├── database/             # SQL schemas
└── uploads/posts/        # Imagens
```

---

## 🛠️ Tecnologias

### Frontend
- **HTML5** / **CSS3** (responsive design)
- **JavaScript ES6+** (vanilla, sem frameworks)
- **Leaflet.js** (mapas interativos)
- **Font Awesome** (ícones)
- **PWA APIs** (Service Worker, Web App Manifest)

### Backend
- **PHP 8** (orientado a objetos)
- **MySQL** (com triggers e events)
- **PDO** (prepared statements)
- **GD Library** (processamento de imagens)

### Recursos
- **LocalStorage** (cache client-side)
- **Geolocation API**
- **Fetch API** (requisições assíncronas)
- **Clipboard API** (copiar links)

---

## 🎨 Screenshots

### Desktop
```
[Mapa] [Sidebar com Filtros, Posts em Alta, Chat]
```

### Mobile
```
[Mapa Compacto]
[Lista de Posts]
[Chat do Bairro]
```

---

## 🔐 Segurança & Privacidade

### Anonimato
- **Hash SHA-256** de IP + User Agent + Data
- **Sem cadastro** ou login
- **Sem cookies** de tracking
- **Localização aproximada** (não exata)

### Proteções
- **SQL Injection**: Prepared Statements (PDO)
- **XSS**: htmlspecialchars + sanitização
- **CSRF**: Validação de origem
- **Rate Limiting**: Chat (3s), Comentários (5s)
- **Auto-Moderação**: 5 denúncias = delete automático

### Validações
- **Upload**: Tipo, tamanho (5MB), dimensões
- **Inputs**: Maxlength, sanitização, escape
- **Coordenadas**: Validação de range
- **Categorias**: Whitelist

---

## 📊 Performance

### Otimizações
- **Lazy Loading** de posts
- **Cache de API** (LocalStorage)
- **Service Worker** (offline-first)
- **Compressão de Imagens** (max 1200x1200)
- **Índices MySQL** em todas foreign keys
- **Triggers** para operações em lote

### Métricas
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+
- **Mobile-Friendly**: 100%

---

## 🧪 Testes

Execute o checklist completo em [INSTALACAO.md](INSTALACAO.md#testes)

```bash
# Testes essenciais
□ Criar post
□ Clicar no mapa (ver logs no console)
□ Upload de imagem
□ Votar em post
□ Comentar
□ Enviar mensagem no chat
□ Filtros
□ Estatísticas
□ Modo escuro/claro
□ Compartilhamento
```

---

## 🐛 Debug

### Logs no Console

O sistema possui logging extremo para debug:

```javascript
=== MAP INIT START ===
>>> ENABLE LOCATION SELECTION <<<
>>> MAP CLICK DETECTED <<<
>>> SET TEMP LOCATION <<<
>>> LOCATION SET SUCCESSFULLY <<<
```

**Abra o console (F12)** para acompanhar cada operação.

### Comum

| Problema | Solução |
|----------|---------|
| Mapa não aparece | Verificar coordenadas em `js/config.js` |
| Clique não funciona | Ver logs no console (F12) |
| Upload falha | Verificar permissões `uploads/posts/` (755) |
| Posts não aparecem | Verificar filtros e banco de dados |

📚 **[TROUBLESHOOTING COMPLETO](INSTALACAO.md#troubleshooting)**

---

## 🔄 Atualizações

### v2.0 (Atual)
- ✅ Upload de imagens
- ✅ Modo escuro/claro
- ✅ PWA completo
- ✅ Compartilhamento social
- ✅ Dashboard de estatísticas
- ✅ Sistema de denúncias
- ✅ Map.js reescrito (mais robusto)

### v1.0
- ✅ Sistema base
- ✅ Mapa com posts
- ✅ Chat por proximidade
- ✅ Votação
- ✅ Comentários

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFuncionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido para a comunidade.

---

## 🙏 Agradecimentos

- **Leaflet.js** - Mapas interativos
- **OpenStreetMap** - Dados de mapas
- **Font Awesome** - Ícones
- **Hostinger** - Hospedagem
- **Comunidade Open Source**

---

## 📞 Suporte

- 📖 [Guia de Instalação](INSTALACAO.md)
- 🐛 [Reportar Bug](https://github.com/seu-usuario/RadardoBairro/issues)
- 💬 [Discussões](https://github.com/seu-usuario/RadardoBairro/discussions)

---

**⭐ Se este projeto foi útil, deixe uma estrela!**

---

*Feito com ❤️ para sua comunidade*
