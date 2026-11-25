# API Concessionária — Avaliação Semestral (AS)

## Tema e Objetivo

Projeto de gerenciamento de concessionária de veículos desenvolvido para a Avaliação Semestral (AS) da disciplina de Desenvolvimento Back-end.
O objetivo da aplicação é consolidar a API REST desenvolvida em ASP.NET Core (.NET 10) com persistência em banco de dados SQLite via Entity Framework Core, organizando a estrutura do código por responsabilidades (Models, Dtos e Data), preservando o middleware de tratamento de exceções, a interface gráfica integrada em wwwroot e a suíte de testes de endpoints validada via Collection do Bruno.

## Requisitos

- .NET SDK 10.0 ou superior
- Ferramenta dotnet-ef para aplicação de migrações:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

## Estrutura do Projeto e Funções das Pastas

```text
ApiConcessionária/
├── Data/
│   └── ApiDbContext.cs
├── Dtos/
│   ├── AtualizarCarroDto.cs
│   ├── Carro.cs
│   └── CriarCarroDto.cs
├── Models/
│   └── VeiculoEntity.cs
├── Migrations/
│   ├── 20261006190022_BancoInicial.cs
│   ├── 20261006190022_BancoInicial.Designer.cs
│   └── ApiDbContextModelSnapshot.cs
├── wwwroot/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── bruno/
│   └── ReqConcessionária/
│       ├── Adicionar Carro.yml
│       ├── Atualizar carro.yml
│       ├── Buscar por ID inexistente.yml
│       ├── Deletar carro.yml
│       ├── Listar por ID.yml
│       ├── Listar.yml
│       └── opencollection.yml
├── Properties/
│   └── launchSettings.json
├── .gitignore
├── ApiConcessionária.csproj
├── appsettings.Development.json
├── appsettings.json
├── Program.cs
└── README.md
```

### Descricao das Pastas e Componentes

- **Data/**: Contém a classe de contexto do Entity Framework Core (`ApiDbContext.cs`). É responsável pela configuração da conexão com o banco de dados SQLite, mapeamento do DbSet de veículos e gerenciamento das operações de persistência.
- **Dtos/**: Contém os Data Transfer Objects (`CriarCarroDto.cs`, `AtualizarCarroDto.cs`, `Carro.cs`). Representam os tipos de entrada e transferência de dados entre as requisições HTTP e a aplicação, desacoplando o contrato da API da estrutura interna do banco.
- **Models/**: Contém as entidades de domínio (`VeiculoEntity.cs`). Representa a tabela de veículos persistida no banco de dados SQLite com suas propriedades (id, marca, nome, ano, valor).
- **Migrations/**: Histórico de migrações versionadas geradas pelo Entity Framework Core para criação e evolução do esquema do banco de dados SQLite.
- **wwwroot/**: Front-end estático da aplicação (`index.html`, `style.css`, `app.js`), servido pela mesma origem da API para visualização, cadastro, edição e exclusão de registros.
- **bruno/**: Collection de testes de API do cliente Bruno (`ReqConcessionária`), contendo as requisições HTTP para validação do CRUD e cenários de erro.
- **Program.cs**: Ponto de entrada da aplicação. Configura o builder, a injeção de dependência do DbContext, o CORS, o middleware de tratamento de exceções (`UseExceptionHandler`), os arquivos estáticos e o mapeamento das rotas HTTP mínimas.

## Como Executar

### 1. Preparar o banco de dados

O projeto utiliza migrações versionadas do Entity Framework Core. Para aplicar o esquema e gerar o arquivo de banco de dados SQLite local, execute na raiz do projeto:

```bash
dotnet ef database update
```

### 2. Executar a aplicação

Na raiz do projeto, execute:

```bash
dotnet run
```

A aplicação iniciará nos seguintes endereços:

- HTTP: `http://localhost:5240`
- HTTPS: `https://localhost:7235`

### 3. Acessar a interface

A interface web está localizada em `wwwroot/` e é servida diretamente pela mesma origem da API. Para acessá-la, abra no navegador:

```text
http://localhost:5240
```

## Endpoints

| Metodo | Rota | Descricao | Status de Sucesso | Status de Erro |
| --- | --- | --- | --- | --- |
| GET | `/api/carros` | Lista todos os veículos | `200 OK` | `500 Internal Server Error` |
| GET | `/api/carros/{id}` | Busca um veículo pelo ID | `200 OK` | `404 Not Found` |
| POST | `/api/carros` | Cadastra um novo veículo | `201 Created` | `500 Internal Server Error` |
| PUT | `/api/carros/{id}` | Atualiza um veículo existente | `200 OK` | `404 Not Found` |
| DELETE | `/api/carros/{id}` | Remove um veículo pelo ID | `204 NoContent` | `404 Not Found` |

### Exemplos de Requisicoes e JSONs

#### Listar carros

```http
GET /api/carros
```

Resposta (`200 OK`):
```json
[
  {
    "id": 1,
    "marca": "Chevrolet",
    "nome": "Cruze",
    "ano": 2017,
    "valor": 79000.0
  }
]
```

#### Buscar carro por ID

```http
GET /api/carros/1
```

Resposta (`200 OK`):
```json
{
  "id": 1,
  "marca": "Chevrolet",
  "nome": "Cruze",
  "ano": 2017,
  "valor": 79000.0
}
```

Caso o ID não exista na base de dados, a API retorna HTTP `404 Not Found`.

#### Cadastrar carro

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

Resposta (`201 Created`):
```json
{
  "id": 1,
  "marca": "Chevrolet",
  "nome": "Cruze",
  "ano": 2017,
  "valor": 79000.0
}
```

#### Atualizar carro

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

Resposta (`200 OK`):
```json
{
  "id": 1,
  "marca": "Chevrolet",
  "nome": "Cruze Premier",
  "ano": 2017,
  "valor": 82000.0
}
```

Caso o ID não seja encontrado para atualização, a API retorna HTTP `404 Not Found`.

#### Remover carro

```http
DELETE /api/carros/1
```

Resposta: HTTP `204 NoContent` (sem corpo de resposta).  
Caso o ID não seja encontrado para exclusão, a API retorna HTTP `404 Not Found`.

## Localizacao da Collection do Bruno

A Collection com as requisições de teste está salva na pasta:
`bruno/ReqConcessionária/`

Roteiro de requisições incluído:
1. `Listar.yml`: Listagem de todos os registros (HTTP 200).
2. `Adicionar Carro.yml`: Criação de novo registro (HTTP 201).
3. `Listar por ID.yml`: Consulta do registro criado pelo ID retornado (HTTP 200).
4. `Atualizar carro.yml`: Atualização dos dados do veículo (HTTP 200).
5. `Deletar carro.yml`: Exclusão do veículo (HTTP 204).
6. `Buscar por ID inexistente.yml`: Consulta ao ID excluído confirmando o retorno HTTP 404.

## Observacoes

- A persistência dos dados é realizada no banco de dados SQLite através do Entity Framework Core, garantindo que os dados não excluídos permaneçam gravados após o reinício da aplicação.
- A aplicação possui middleware de tratamento de exceções global configurado no Program.cs (`app.UseExceptionHandler`), retornando HTTP 500 com mensagem padronizada em caso de falha não tratada.
- O repositório possui arquivo `.gitignore` configurado para não versionar arquivos compilados (`bin/`, `obj/`) e o arquivo de banco de dados SQLite local (`*.db`).

## Vídeo de demonstração — AS

- Link do vídeo de demonstração da AS: https://youtu.be/sFaKC4nK9Bw
