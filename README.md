# 🛒 Digital Store — Projeto Back-end (API)

<div align="center">
  <img src="https://raw.githubusercontent.com/CaioIan/digital-store-api/main/assets/logo-header.svg" alt="Digital Store Logo" height="50" />
  <br /><br />

  ![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
  ![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
  ![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?logo=sequelize&logoColor=white)
  ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
  ![JWT](https://img.shields.io/badge/JWT-9-000000?logo=jsonwebtokens&logoColor=white)
  ![Zod](https://img.shields.io/badge/Zod-4-3E67B1?logo=zod&logoColor=white)
  ![Jest](https://img.shields.io/badge/Jest-30-C21325?logo=jest&logoColor=white)
  ![Biome](https://img.shields.io/badge/Biome-2.3-60A5FA?logo=biome&logoColor=white)
  ![License](https://img.shields.io/badge/Licença-MIT-green)
</div>

<br />

> [!IMPORTANT]
> **Projeto Final — Geração Tech 3.0**
> Este repositório contém o **Back-end (API)** da plataforma **Digital Store**, desenvolvido como **Trabalho Final do Curso** do **Geração Tech 3.0**. Trata-se de um E-commerce para vestuário e acessórios.

---

## 📦 O Ecossistema Digital Store

O projeto **Digital Store** é composto por **3 repositórios independentes** que juntos formam um ecossistema completo de E-commerce:

| Repositório | Descrição | Responsável por |
|---|---|---|
| **🖥️ digital-store-frontend** [https://github.com/CaioIan/digital-store-frontend] | Interface do consumidor final | Navegação de produtos, carrinho, checkout, gestão de pedidos e perfil do usuário |
| **🔧 digital-store-api** (este repo) | API RESTful | Autenticação, CRUD de produtos, gestão de pedidos, controle de estoque, processamento de pagamentos e lógica de negócio |
| **📊 digital-store-admin** [https://github.com/CaioIan/digital-store-admin] | Painel administrativo | Cadastro/edição de produtos, gestão de categorias/marcas, visualização de pedidos e métricas do negócio |

### Como os projetos se conectam

```
┌──────────────────────┐         ┌──────────────────┐         ┌──────────────────────┐
│   Front-end Cliente  │◄───────►│    API (Back-end) │◄───────►│   Front-end Admin    │
│ (digital-store-frontend) │  HTTP   │   (Este repositório)  │  HTTP   │ (digital-store-admin)  │
│                      │ Cookies │                   │         │                      │
│  • Catálogo          │         │  • Auth JWT       │         │  • CRUD de Produtos  │
│  • Carrinho          │         │  • Rotas REST     │         │  • Gestão de Pedidos │
│  • Checkout          │         │  • Banco de Dados │         │  • Categorias/Marcas │
│  • Meus Pedidos      │         │  • Upload Imagens │         │  • Dashboard         │
│  • Perfil do Usuário │         │  • Validações     │         │                      │
└──────────────────────┘         └──────────────────┘         └──────────────────────┘
```

> O **Front-end do Cliente** consome a mesma API que o **Painel Admin**, porém com permissões e endpoints diferentes. A autenticação é feita via **HTTP-Only Cookies**, garantindo segurança contra ataques XSS. Para acesso ao painel administrativo, o login deve ser feito pela rota **`POST /v1/admin/login`**.

---

## Arquitetura

O projeto adota um padrão de **Arquitetura em Camadas (Layered Architecture)** fortemente inspirada e organizada no modelo **Domain-Driven Design (DDD) simplificado / Modular**, isolando responsabilidades para facilitar a manutenção e evolução da API.

### Organização de Camadas:
- **Routes (`routes/`):** Define os endpoints da API e orquestra a execução dos Middlewares e Controllers.
- **Controllers (`http/controllers/`):** Ponto de entrada das requisições. Extraem parâmetros (body, query, params) e invocam a camada de negócio (Services), retornando a resposta formatada ao cliente.
- **Validators & DTOs (`http/validators/` & `http/dto/`):** Validadores rigorosos usando Zod para garantir a integridade dos dados de entrada (Request) e saída (Response DTOs).
- **Services (`core/services/`):** Contém toda a regra de negócio da aplicação. Não conhecem detalhes de HTTP (req/res).
- **Repositories (`persistence/`):** Isola a comunicação direta com o ORM (Sequelize) e o banco de dados.
- **Models (`models/`):** Definição das entidades do banco e seus relacionamentos utilizando Sequelize.

### Fluxo de Requisição

```mermaid
sequenceDiagram
    participant Client
    participant Router
    participant Middleware (Auth/Role/Validator)
    participant Controller
    participant Service
    participant Repository
    participant Database

    Client->>Router: Requisição HTTP (GET, POST, etc.)
    Router->>Middleware (Auth/Role/Validator): Valida Token, Permissão e Payload
    Middleware (Auth/Role/Validator)->>Controller: Encaminha requisição validada
    Controller->>Service: Chama regra de negócio com dados limpos
    Service->>Repository: Solicita operações de dados
    Repository->>Database: Query SQL via Sequelize
    Database-->>Repository: Resultado da Query
    Repository-->>Service: Entidade Mapeada
    Service-->>Controller: Retorno da Lógica de Negócio
    Controller-->>Client: Resposta formatada (DTO JSON)
```

---

## Tecnologias Utilizadas

- **Linguagem:** JavaScript (Node.js)
- **Framework principal:** Express.js `v5.x`
- **ORM:** Sequelize `v6.x`
- **Banco de dados:** MySQL `8.0`
- **Biblioteca de autenticação:** `jsonwebtoken` (JWT) & `bcrypt` (Hashing)
- **Biblioteca de validação:** `zod`
- **Integração de Mídia:** `cloudinary` & `multer`
- **Documentação:** `swagger-jsdoc` & `swagger-ui-express`
- **Testes:** `jest` e `supertest` (Cobertura Unitária e Integração)
- **Ferramentas de build/qualidade:** `@biomejs/biome` (Linter & Formatter), `nodemon`

---

## Estrutura de Pastas

```text
src/
 ├── config/            # Configurações gerais (Banco de Dados, Cloudinary, Swagger)
 ├── database/          # Configuração e inicialização da conexão com o banco
 ├── models/            # Modelos do Sequelize (Entidades e Associações)
 ├── modules/           # Módulos principais (DDD-like)
 │   ├── category/      # Módulo de Categorias
 │   ├── product/       # Módulo de Produtos
 │   └── user/          # Módulo de Usuários
 │       ├── core/          # Regras de Negócio (Services)
 │       ├── http/          # Camada de Apresentação (Controllers, DTOs, Validators)
 │       ├── persistence/   # Acesso a Dados (Repositories)
 │       └── routes/        # Rotas Express específicas do módulo
 ├── shared/            # Código compartilhado entre módulos
 │   ├── auth/          # Utilitários de JWT e Middlewares de autenticação
 │   └── middlewares/   # Middlewares globais (Error Handler, Role Guard, Upload)
 └── app.js & server.js # Arquivos de inicialização e montagem do Express
tests/                  # Suíte de testes (Integração e Unitários organizados por módulo / setup)
```

**Responsabilidade de cada camada no módulo:**
- `core/services`: Onde a regra de negócio realmente acontece (ex: validação se usuário existe antes de atualizar).
- `http/controllers`: Recebem requisições web, chamam os Services, e enviam a resposta (ex: `res.status(200).json(...)`).
- `http/validators`: Validam os dados enviados pelo cliente no formato correto (Body/Params/Query) usando Zod.
- `http/dto`: Garantem que o objeto de resposta devolvido não exponha dados sensíveis (como senhas).
- `persistence`: Abstração para buscas, inserções e deleções no Sequelize, separando o DB da regra de negócio.

---

## Requisitos

- **Ambiente:** Node.js (versão 18+ recomendada)
- **Banco de Dados:** MySQL 8.0 rodando localmente (ou via Docker)
- **Dependências Externas:** Conta no Cloudinary para realizar os uploads de imagens.

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto contendo as seguintes variáveis:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PORT` | Sim | Porta em que o servidor Express irá rodar (Padrão: 3000) |
| `NODE_ENV` | Sim | Ambiente de execução (`development`, `test` ou `production`) |
| `DB_USER` | Sim | Usuário do MySQL (ex: `usuario_app`) |
| `DB_PASSWORD` | Sim | Senha do banco MySQL (ex: `senha_app`) |
| `DB_NAME` | Sim | Nome do banco principal (ex: `digital_store_db`) |
| `DB_HOST` | Sim | IP/Host do banco de dados (ex: `127.0.0.1`) |
| `DB_PORT` | Não | Porta do banco de dados (Padrão: 3306) |
| `DB_NAME_TEST`| Sim (em Teste) | Nome do banco dedicado para testes (ex: `digital_store_test`) |
| `JWT_SECRET` | Sim | Chave criptográfica secreta usada para assinar e verificar tokens JWT |
| `CLOUDINARY_CLOUD_NAME`| Sim | Nome da Cloud associada à conta no Cloudinary |
| `CLOUDINARY_API_KEY`| Sim | Chave de API do Cloudinary para uploads de Imagem |
| `CLOUDINARY_API_SECRET`| Sim | Secret de API do Cloudinary para validação do Upload |

---

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/CaioIan/digital-store-api.git
cd digital-store-api
```

2. Instale as dependências:
```bash
npm install
```

3. Suba o ambiente do banco de dados (via Docker Compose):
```bash
docker-compose up -d
```

4. Rode as migrations:
```bash
npx sequelize db:migrate
```

5. Rode as seeds:
```bash
npx sequelize db:seed:all
```

6. Acesse o container do app localmente (se aplicável) e rode as Migrations e Seeds (utilizando Sequelize-CLI se configurado no projeto) ou deixe o `sync()` rodar em desenvolvimento.

---

## Como Executar a API

### Scripts Disponíveis (`package.json`)

- `npm run start:dev` : Inicia o servidor em modo de desenvolvimento utilizando `nodemon` (recarrega ao salvar arquivos).
- `npm run test` : Executa toda a suíte de testes (Integração e Unitários) utilizando Jest.
- `npm run test:watch` : Executa os testes em modo iterativo/observador.
- `npm run test:coverage` : Executa os testes e gera o relatório detalhado de cobertura de código (Coverage).
- `npm run test:ci` : Executa testes otimizados para pipelines de Integração Contínua.
- `npm run format` (e `format:files`) : Formata os arquivos do projeto de maneira padronizada com a ferramenta Biome.
- `npm run lint` / `npm run check` : Valida regras de código, potenciais erros usando BiomeLinter.

### Ambiente de Desenvolvimento local
1. Configure as variáveis de ambiente acima.
2. Inicie os containers Docker de DB: `docker-compose up -d`
3. Execute o projeto: `npm run start:dev`
4. Acesse: `http://localhost:3000/api-docs` para abrir a interface nativa do Swagger no Navegador.

---

## Documentação da API

Esta API possui documentação completa utilizando **Swagger/OpenAPI 3.0**. Acesse a interface interativa em:

### 🔗 **Desenvolvimento Local:** `http://localhost:3000/api-docs`

A documentação Swagger inclui:

- ✅ **Definições completas de todos os endpoints** com esquemas de request/response
- 🔐 **Requisitos de autenticação** para cada rota
- 🧪 **Interface de teste interativo** para experimentar a API diretamente
- 📝 **Descrições detalhadas** de parâmetros, headers e payloads
- ⚠️ **Documentação completa de respostas de erro**

### 📋 **Módulos da API:**

| Módulo | Descrição | Endpoints |
|--------|-----------|-----------|
| **👤 Usuários & Autenticação** | Login, registro, gerenciamento de perfil | 6 rotas |
| **🗂 Categorias** | Categorização de produtos | 5 rotas |
| **📦 Produtos** | Gestão de inventário, busca, upload de imagens | 6 rotas |
| **🛒 Carrinho** | Operações do carrinho de compras | 5 rotas |
| **🚚 Pedidos** | Checkout e histórico de pedidos | 5 rotas |
| **🌐 Sistema** | Health check e login administrativo | 2 rotas |

> **💡 Dica:** Utilize a interface Swagger para explorar e testar todos os **29 endpoints** disponíveis na API.

---

## Banco de Dados

A API utiliza amplamente banco Relacional suportado pelo `MySQL` governado pelo ORM `Sequelize`.

### Modelos / Entidades Principais
- **User:** Perfil do administrador e clientes convencionais (Controlado via Soft-Delete `paranoid: true`).
- **Category:** Árvore de ramificação das categorias do sistema (Soft-Deleted `paranoid: true`).
- **Product:** Inventário contendo preços, descontos, flags de status e estoque.
- **ProductImage:** Controle N:1 (Filho para pai) referenciando os Assets/URLs gerados no Cloudinary por produto.
- **ProductOption:** Possibilita que um Produto tenha múltiplos sub-variações estruturalmente descritivas com JSON/String (Tamanhos 39, 40 / Cores Azul, Vermelha).
- **ProductCategory** (Through Table / Pivot): Tabela agregadora de relacionamento Muitos-Para-Muitos (N:N) que lida com as Associações de Várias Categorias sendo marcadas por Vários Produtos simultaneamente.
- **Cart & CartItem:** Controle temporário do carrinho de compras ativo dos usuários.
- **Order & OrderItem:** Registro histórico permanente e imutável de uma transação finalizada via Checkout.

### Diagrama ER
```mermaid
erDiagram
    user {
        UUID id PK
        string firstname
        string surname
        string email
        string password
        enum role
        date deleted_at
    }

    category {
        UUID id PK
        string name
        string slug
        boolean use_in_menu
        date deleted_at
    }

    product {
        int id PK
        boolean enabled
        string name
        string slug
        string brand
        string gender
        boolean use_in_menu
        int stock
        string description
        float price
        float price_with_discount
    }

    product_image {
        int id PK
        int product_id FK
        boolean enabled
        string path
    }

    product_option {
        int id PK
        int product_id FK
        string title
        string shape
        int radius
        string type
        string values
    }

    product_category {
        int product_id FK
        UUID category_id FK
    }

    cart {
        int id PK
        UUID user_id FK
    }

    cart_item {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
        string selected_color
        string selected_size
    }

    order {
        int id PK
        UUID user_id FK
        string status
        float subtotal
        float shipping
        float discount
        float total
        json personal_info
        json delivery_address
        json payment_info
    }

    order_item {
        int id PK
        int order_id FK
        int product_id FK
        string product_name
        string image_url
        int quantity
        float price_at_purchase
        string selected_color
        string selected_size
    }

    user ||--o| cart : has
    cart ||--o{ cart_item : contains
    cart_item }o--|| product : refers_to
    user ||--o{ order : places
    order ||--o{ order_item : contains
    order_item }o--|| product : refers_to
    category ||--o{ product_category : has
    product ||--o{ product_category : has
    product ||--o{ product_image : has
    product ||--o{ product_option : has
```

---

## Autenticação e Autorização

- **Tipo:** JWT (JSON Web Token) via Header `Authorization: Bearer <Token>`.
- **Fluxo de autenticação:** O Cliente realiza login (`/v1/user/login`). A API retorna o JWT assinado (`jsonwebtoken`). Em chamadas subsequentes protegidas, o `authVerificationMiddleware` valida a integridade, não-expiração e extrai o `req.user`.
- **Estratégia de autorização:** Os usuários contam com enumeração de Roles estritas (`USER` e `ADMIN`). O Middleware **`roleGuardMiddleware`** impede clientes do tipo `USER` comum de efetuarem alterações massivas (Cadastrar Produtos, Modificar Categorias). Modificações de próprio perfil e exclusão estão acessíveis checando internamente autorizações granulares pelo UUID no próprio Controller/Service.

---

## Middlewares

- `auth-verification.middleware.js`: Intercepta o request verificando presença e expiração de assinaturas JWT. Carrega dados validados do User ativo.
- `role-guard.middleware.js`: Fábrica de bloqueio de Rotas que aceita um array limitador de roles necessárias. Gera Erro Restrito (`403 Forbidden`).
- `error-handler.middleware.js`: Padrão concentrado global que unifica erros disparados pelo Express, retornando formatação HTTP padronizada (Error handling).
- `async-handler.middleware.js`: Simplifica Controllers capturando erros subjacentes de Async/Await e repassando para o Error Handler.
- `upload.middleware.js`: Faz bridge com o `multer`, aplica filtro rigoroso de tipagem Restrita apenas a `image/jpeg|png|webp|svg` barrando scripts nocivos.



---

## Tratamento de Erros

A API possui uma **estratégia global e unificada** via Middleware (`error-handler`).

- Em Serviços, classes de exceção especializadas como Entidades Not-Found explodem erros conhecidos (ou status HTTP diretamente) que bolham à Camada do Express.
- Zod Validators devolvem padronizados e interceptados o status Rest API apropriado: `400 Bad Request` com Field/Messages mapeados.
- Se fora de Contexto Seguro: `500 Server Error Internal` é devolvido blindando detalhes ocultos/internos na versão Prod (StackTraces somem de res).
- **Códigos Comuns:**
  - `400`: Payload falhou validações Zod ou falha lógica Negócio.
  - `401`: JWT Ausente/Expirou.
  - `403`: Papel (Role) Sem Acesso Privilegiado.
  - `404`: UUID não constam do Banco na Tabela informada.
  - `409`: Violação Unique Constraint (Emails duplicados / Slugs Indisponíveis).

---

## Testes

- **Framework Utilizado:** **Jest** (Test Runner + Asserções) integrado ao **Supertest** (Requests do ambiente Express Mockado de forma Integrativa/End-to-end).
- **Cobertura:** Extensiva, segmentando em Suítes por Cada Modulo em Abordagem:
  - **Unidade (Unit):** Validam regras de negócios no `[módulo].service.spec.js` interceptando chamadas aos Repository Methods.
  - **Integração (Int/E2E):** Validam as Requisições completas das `/routes.int.spec.js` subindo o ambiente Expresso junto a Bancos `digital_store_db_test` em Containers DB Isolados disparando Inserções e Confirmações Finais diretas, com Limpeza do Setup/Teardown global e Transações nativas no Banco (Serial).
- **Como rodar:** `npm run test`.
- A API conta com mais de 160+ Assertions rodando na suite global perfeitamente controlados.

---

## Segurança

- **Proteção Criptográfica:** Salvas as senhas via Hash `bcrypt` (`genSalt(10)`) rodando diretamente de `hooks` Nativo Sequelize (Never-expose-passwords approach).
- **Validações Fortes:** Validação imperativa Typescript-like de Request Body por Schema ZOD com `.strict()` descartando/limpando Injection via Atributos Estranhos mass-assign, mitigação de Poluição e restrição de tipagem profunda.
- **Sanitização Básica Uploads:** O backend nega uploads com MimeTypes não explicitamente homologados (Anti-Webshells). Autentica no backend Third-Party CDN (Cloudinary).
- *Rate Limiting / CORS*: No estado atual, configuráveis via reverse-proxy ou Ingress-controllers nas frentes Cloud Native; Código nativo sem Middlewares obstrutivos limitadores.

---

## Build e Deploy

- O projeto não requer um passo de "build" JS pesado (como Typescript, embora seja JS Vanilla moderno). Pode rodar diretamente o código-fonte via Node `v18+`.
- A API está empacotada com receita `Docker-Compose` subindo Serviços Auxiliares, o que a torna `Docker-Ready`. Crie uma `Dockerfile` caso deseje containerização da Stack Front-Web e Deploy em Orquestradores como Heroku, ECS Fargate ou DO App-Platform apontando p/ `npm run start:dev` vs `npm start`.

---

## Licença

Projeto regido sob a Licença Pública ISC padrão. 

---
**Autor**: Desenvolvido sob esforço Open-Source e Arquitetural por *Caio Ian Oliveira dos Santos*.
