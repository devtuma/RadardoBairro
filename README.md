# 📍 Radar do Bairro

Aplicação web interativa para que usuários postem anonimamente acontecimentos do bairro em um mapa, com sistema de confirmação, chat por proximidade e notificações em tempo real.

## 🚀 Funcionalidades

### ✨ Principais Features

- **🗺️ Mapa Interativo**: Interface estilo Google Maps com Leaflet
- **📌 Posts com Pins Coloridos**: Categorias visuais (fofoca, alerta, evento, achados/perdidos)
- **✅ Sistema de Confirmação**: Usuários votam (verdadeiro/falso/exagero)
- **🔥 Ranking de Posts Quentes**: Algoritmo que calcula popularidade baseado em votos e visualizações
- **💬 Chat Anônimo por Proximidade**: Converse com pessoas na mesma região (raio de 2km)
- **🔔 Notificações de Proximidade**: Alertas quando algo acontece perto de você (raio de 1km)
- **🎯 Filtros Avançados**: Por categoria e período de tempo
- **📱 Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **🔒 Totalmente Anônimo**: Nenhum cadastro ou login necessário

## 🛠️ Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3 (Design moderno e responsivo)
- JavaScript Vanilla (ES6+)
- Leaflet.js (Mapas interativos)
- Font Awesome (Ícones)

### Backend
- PHP 7.4+
- MySQL 5.7+
- API REST

### Armazenamento
- localStorage (Cache e preferências do usuário)
- MySQL (Dados persistentes)

## 📦 Instalação

### Requisitos
- Servidor web com suporte a PHP (Apache/Nginx)
- MySQL 5.7 ou superior
- PHP 7.4 ou superior com PDO habilitado

### Passo 1: Upload dos Arquivos

Faça upload de todos os arquivos para seu servidor (Hostinger ou similar):

```
/public_html/
  ├── index.html
  ├── .htaccess
  ├── css/
  │   └── style.css
  ├── js/
  │   ├── config.js
  │   ├── storage.js
  │   ├── api.js
  │   ├── map.js
  │   ├── posts.js
  │   ├── chat.js
  │   ├── notifications.js
  │   └── app.js
  ├── api/
  │   ├── config.php
  │   ├── posts.php
  │   ├── votes.php
  │   ├── chat.php
  │   ├── hot-posts.php
  │   └── notifications.php
  └── database/
      └── schema.sql
```

### Passo 2: Criar Banco de Dados

1. Acesse o **phpMyAdmin** no painel da Hostinger
2. Crie um novo banco de dados chamado `radar_do_bairro`
3. Importe o arquivo `database/schema.sql`

**OU** execute o SQL manualmente:

```sql
-- Copie e cole todo o conteúdo do arquivo schema.sql no phpMyAdmin
```

### Passo 3: Configurar Conexão com Banco de Dados

Edite o arquivo `api/config.php` e altere as credenciais:

```php
define('DB_HOST', 'localhost');          // Geralmente 'localhost'
define('DB_NAME', 'radar_do_bairro');    // Nome do seu banco
define('DB_USER', 'seu_usuario');        // Seu usuário MySQL
define('DB_PASS', 'sua_senha');          // Sua senha MySQL
```

### Passo 4: Configurar Localização Padrão (Opcional)

Edite `js/config.js` para definir a localização inicial do mapa:

```javascript
// Coordenadas iniciais do mapa (São Paulo por padrão)
DEFAULT_LAT: -23.5505,  // Altere para sua cidade
DEFAULT_LNG: -46.6333,  // Altere para sua cidade
DEFAULT_ZOOM: 15,
```

### Passo 5: Testar a Aplicação

Acesse `http://seudominio.com` e a aplicação deve estar funcionando!

## 🎨 Categorias de Posts

| Categoria | Ícone | Cor | Descrição |
|-----------|-------|-----|-----------|
| 🗣️ Fofoca | 💬 | Rosa | Novidades e fofocas do bairro |
| ⚠️ Alerta | ⚠️ | Vermelho | Alertas de segurança e avisos |
| 📅 Evento | 📅 | Roxo | Eventos locais e atividades |
| 🔍 Achados/Perdidos | 🔍 | Azul | Objetos ou pets achados/perdidos |

## 📊 Sistema de Hotness

O ranking de "Posts Mais Quentes" usa a seguinte fórmula:

```
Hotness = (votos × 2 + visualizações) / (horas desde criação + 2)^1.5
```

Isso garante que:
- Posts novos com engajamento apareçam no topo
- Posts antigos gradualmente percam relevância
- Votos têm peso maior que visualizações

## 🔒 Privacidade e Anonimato

- **Hash Anônimo**: Usuários são identificados por um hash SHA-256 baseado em IP + User Agent + Data
- **Sem Cadastro**: Nenhuma informação pessoal é coletada
- **Localização**: GPS é usado apenas localmente, coordenadas exatas não são expostas no chat
- **Votos Únicos**: Um voto por dia por usuário (hash renovado diariamente)

## 🌐 Configurações de Proximidade

Você pode ajustar os raios em `js/config.js`:

```javascript
CHAT_RADIUS: 2,           // Chat exibe mensagens em raio de 2km
NOTIFICATION_RADIUS: 1,   // Notificações para posts em raio de 1km
```

E no backend `api/config.php`:

```php
define('CHAT_PROXIMITY_RADIUS', 2);      // km
define('NOTIFICATION_RADIUS', 1);         // km
```

## 🐛 Troubleshooting

### Erro: "Erro ao conectar com o banco de dados"
- Verifique as credenciais em `api/config.php`
- Confirme que o banco de dados foi criado
- Verifique se a extensão PDO está habilitada no PHP

### Mapa não carrega
- Verifique sua conexão com internet
- Confirme que as bibliotecas Leaflet estão carregando (veja o Console do navegador)

### GPS não funciona
- Permita acesso à localização no navegador
- Use HTTPS (alguns navegadores exigem conexão segura para GPS)

### Posts não aparecem
- Abra o Console do navegador (F12) e verifique erros
- Confirme que a API está respondendo: acesse `http://seudominio.com/api/posts.php`

## 📱 Suporte a Navegadores

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Navegadores mobile (iOS Safari, Chrome Mobile)

## 🚀 Melhorias Futuras

Ideias para expandir o projeto:

- [ ] Upload de imagens nos posts
- [ ] Modo escuro/claro
- [ ] Integração com PWA (Progressive Web App)
- [ ] Sistema de denúncias
- [ ] Moderação de conteúdo
- [ ] Compartilhamento de posts em redes sociais
- [ ] Estatísticas do bairro
- [ ] Integração com serviços de mapas (Google Maps, Waze)

## 📄 Licença

Este projeto é open-source e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no GitHub ou entre em contato.

---

**Desenvolvido com ❤️ para fortalecer a comunidade do bairro!**
