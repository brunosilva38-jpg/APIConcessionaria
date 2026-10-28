# API Concessionária

API REST para gerenciamento de uma concessionária, desenvolvida com ASP.NET Core, .NET 10, Entity Framework Core e SQLite, com interface front-end integrada.

## Requisitos

- .NET SDK 10.0 ou superior
- Ferramenta dotnet-ef (para gerenciamento de migrações):
  ```bash
  dotnet tool install --global dotnet-ef
  ```

## Como executar

### 1. Preparar o banco de dados

Para aplicar as migrações e criar o banco de dados SQLite local, execute na raiz do projeto:

```bash
dotnet ef database update
```

### 2. Executar a aplicação

Na raiz do projeto, execute:

```bash
dotnet run
```

A aplicação estará disponível em:

- HTTP: `http://localhost:5240`
- HTTPS: `https://localhost:7235`

### 3. Acessar a interface

A interface web está localizada em `wwwroot/` e é servida diretamente pela mesma origem da API. Para acessá-la, abra no navegador:

```text
http://localhost:5240
```

## Endpoints

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/carros` | Lista todos os carros |
| GET | `/api/carros/{id}` | Busca um carro pelo ID |
| POST | `/api/carros` | Cadastra um novo carro |
| PUT | `/api/carros/{id}` | Atualiza um carro existente |
| DELETE | `/api/carros/{id}` | Remove um carro |

### Listar carros

```http
GET /api/carros
```

### Buscar carro por ID

```http
GET /api/carros/1
```

### Cadastrar carro

```http
POST /api/carros
Content-Type: application/json

{
  "marca": "Chevrolet",
  "nome": "Cruze",
  "ano": 2017,
  "valor": 79000
}
```

### Atualizar carro

```http
PUT /api/carros/1
Content-Type: application/json

{
  "marca": "Chevrolet",
  "nome": "Cruze Premier",
  "ano": 2017,
  "valor": 82000
}
```

### Remover carro

```http
DELETE /api/carros/1
```

## Observacoes

- Os dados são persistidos em banco de dados SQLite via Entity Framework Core e permanecem armazenados mesmo após reiniciar a aplicação.
- A interface gráfica em `wwwroot/` está conectada aos endpoints reais da API e permite listar, cadastrar, editar e excluir registros.
- Operações para um ID inexistente retornam HTTP `404 Not Found`.
- O cadastro retorna HTTP `201 Created` e a remoção bem-sucedida retorna HTTP `204 No Content`.
- As requisições de teste estão configuradas na Collection do Bruno na pasta `bruno/ReqConcessionária/`.

## Vídeo de demonstração — AP2

- Link do vídeo de demonstração da AP2: https://youtu.be/hmt1xc9ftHM
