# API Concessionária

API REST minimalista para gerenciamento de uma concessionária, desenvolvida com ASP.NET Core e .NET 10.

## Requisitos

- .NET SDK 10.0 ou superior

## Como executar

Na raiz do projeto, execute:

```bash
dotnet run
```

A API estará disponível em:

- HTTP: `http://localhost:5240`
- HTTPS: `https://localhost:7235`

Para verificar se a API está funcionando:

```http
GET http://localhost:5240/
```

Resposta esperada:

```text
API está no ar
```

## Endpoints

| Metodo | Rota | Descricao |
| --- | --- | --- |
| GET | `/api/carros` | Lista todos os carros |
| GET | `/api/carros/{id}` | Busca um carro pelo ID |
| POST | `/api/carros` | Cadastra um novo carro |
| PUT | `/api/carros/{id}` | Atualiza um carro existente |
| DELETE | `/api/carro/{id}` | Remove um carro |

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
  "marca" : "Chevrolet",
  "nome" : "Cruze",
  "ano" : 2017,
  "valor" : 79000

```

### Atualizar carro

```http
PUT /api/carro/1
Content-Type: application/json

{
  "valor" : 21000,
  "nome" : "Creta"
}
```

### Remover carro

```http
DELETE /api/carros/1
```

## Observacoes

- A aplicacao inicia com os carros `Virtua` e `HB20`.
- Os dados ficam armazenados somente em memoria e sao perdidos ao reiniciar a aplicacao.
- Operacoes para um ID inexistente retornam HTTP `404 Not Found`.
- O cadastro retorna HTTP `201 Created` e a remocao bem-sucedida retorna HTTP `204 No Content`.
