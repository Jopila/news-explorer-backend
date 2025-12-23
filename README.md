# News Explorer Backend

Live URL: https://news-explorer-backend-mb3l.onrender.com

API do projeto News Explorer. Fornece cadastro, login e gerenciamento de artigos salvos.

## Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- validator
- winston (logs)

## Scripts
- `npm install`
- `npm run dev` (nodemon)
- `npm start`

## Variaveis de ambiente
- `PORT` (padrao: 3000)
- `MONGO_URI` (string de conexao do MongoDB)
- `JWT_SECRET` (usado quando `NODE_ENV=production`)
- `NODE_ENV` (development/production)

## Autorizacao
Rotas protegidas exigem header:

```
Authorization: Bearer <token>
```

## Endpoints
Base local: `http://localhost:3000`

### Auth
- `POST /signup`
  - Body:
    ```json
    {
      "name": "Nome",
      "email": "email@exemplo.com",
      "password": "senha"
    }
    ```
  - Response: `{ "_id", "email", "name" }`

- `POST /signin`
  - Body:
    ```json
    {
      "email": "email@exemplo.com",
      "password": "senha"
    }
    ```
  - Response: `{ "token": "JWT" }`

- `GET /users/me` (protegida)
  - Response: `{ "email", "name" }`

### Artigos
- `GET /articles` (protegida)
  - Response: lista de artigos do usuario

- `POST /articles` (protegida)
  - Body:
    ```json
    {
      "keyword": "Palavra-chave",
      "title": "Titulo",
      "text": "Resumo",
      "date": "2024-01-01",
      "fonte": "Nome da fonte",
      "link": "https://exemplo.com/noticia",
      "image": "https://exemplo.com/imagem.jpg"
    }
    ```
  - Response: artigo criado (sem `owner`)

- `DELETE /articles/:articleId` (protegida)
  - Remove somente artigos do proprio usuario

## Logs
Os logs sao gravados em:
- `request.log`
- `error.log`

## Estrutura do projeto
- `controllers/` regras de negocio
- `models/` schemas do MongoDB
- `routes/` rotas da API
- `middlewares/` auth, logger e handler de erros
- `errors/` classes de erro customizadas
- `index.js` ponto de entrada
