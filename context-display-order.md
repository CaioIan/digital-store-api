# Contexto para o Backend: Ordenação de Exibição de Produtos

## Resumo

O painel admin (frontend React) agora permite que o administrador **reordene a exibição dos produtos** que aparecem no site do cliente. A interface oferece drag & drop e setas para reposicionar produtos, e ao salvar envia as novas posições para a API.

O backend precisa suportar um novo campo `display_order` no modelo de produto para que essa funcionalidade funcione end-to-end.

---

## O que o frontend faz

### Fluxo do admin

1. Na tela de listagem de produtos (`/products`), o admin clica em **"Ordenar Exibição"**
2. A tabela entra em modo de ordenação com **drag & drop** (arrastar pelo ícone de grip) e **setas** (ArrowUp/ArrowDown)
3. O admin reposiciona os produtos na ordem desejada
4. Ao clicar **"Salvar Ordem"**, o frontend dispara as chamadas para a API

### Chamadas que o frontend faz ao salvar

Para cada produto na lista, o frontend faz um `PATCH` individual **em paralelo**:

```http
PATCH /v1/product/{id}
Content-Type: application/json

{
  "display_order": 1
}
```

Exemplo com 4 produtos reordenados — são disparadas 4 chamadas simultâneas:

```
PATCH /v1/product/10  →  { "display_order": 1 }
PATCH /v1/product/3   →  { "display_order": 2 }
PATCH /v1/product/7   →  { "display_order": 3 }
PATCH /v1/product/1   →  { "display_order": 4 }
```

### Como o frontend consome os dados

O frontend busca produtos via:

```http
GET /v1/product/search?limit=50
```

E espera que cada produto no array `data` contenha o campo `display_order`:

```json
{
  "data": [
    {
      "id": 10,
      "name": "Camiseta Premium",
      "display_order": 1,
      "enabled": true,
      "price": 89.90,
      ...
    },
    {
      "id": 3,
      "name": "Calça Jeans Slim",
      "display_order": 2,
      "enabled": true,
      "price": 159.90,
      ...
    }
  ]
}
```

O frontend já faz sort client-side como fallback (`display_order ASC`, nulls por último), mas o ideal é que a API já retorne ordenado.

---

## O que o backend precisa implementar

### 1. Adicionar coluna `display_order` na tabela `product`

```sql
ALTER TABLE product ADD COLUMN display_order INTEGER DEFAULT NULL;
```

- **Tipo:** `INTEGER`
- **Nullable:** `true` (produtos existentes ficam com `NULL` até serem ordenados)
- **Default:** `NULL`
- **Sem unique constraint** (a numeração é sequencial mas pode ter gaps temporários)

### 2. Aceitar `display_order` no endpoint `PATCH /v1/product/{id}`

O endpoint de update parcial do produto já existe. Ele precisa:

- Aceitar o campo `display_order` no body da requisição
- Validar como **inteiro positivo** (>= 1) ou `null`
- Persistir o valor no banco

Exemplo de body que o frontend vai enviar:

```json
{
  "display_order": 3
}
```

Apenas o campo `display_order` é enviado nessas chamadas de ordenação (sem outros campos do produto).

### 3. Retornar `display_order` nas respostas

Incluir o campo `display_order` em todas as respostas que retornam produto:

- `GET /v1/product/search` — no array de produtos
- `GET /v1/product/{id}` — no objeto do produto individual
- `POST /v1/product` — na resposta de criação
- `PATCH /v1/product/{id}` — na resposta de update

### 4. Ordenar por `display_order` no `GET /v1/product/search`

A query de busca deve retornar produtos ordenados por `display_order` ascendente, com produtos sem ordenação definida aparecendo por último:

```sql
SELECT * FROM product
ORDER BY display_order ASC NULLS LAST, id ASC
```

Isso garante que:
- Produtos ordenados pelo admin aparecem na posição correta
- Produtos novos (sem `display_order`) aparecem no final
- Produtos com mesmo `display_order` (edge case) são desempatados por `id`

---

## Melhoria futura (opcional): Endpoint bulk

Atualmente o frontend faz N chamadas `PATCH` paralelas (uma por produto). Para melhorar performance e garantir atomicidade, um endpoint bulk seria ideal:

```http
PATCH /v1/product/display-order
Content-Type: application/json

{
  "products": [
    { "id": 10, "display_order": 1 },
    { "id": 3, "display_order": 2 },
    { "id": 7, "display_order": 3 },
    { "id": 1, "display_order": 4 }
  ]
}
```

**Vantagens do bulk:**
- Uma única transação no banco (atomicidade)
- Uma única chamada HTTP em vez de N
- Mais fácil de tratar erros (tudo falha ou tudo sucede)

Quando esse endpoint existir, a mudança no frontend é mínima — basta alterar uma única função no `productService.ts`.

---

## Resumo das tarefas

| Prioridade | Tarefa | Detalhes |
|:---:|---|---|
| **1** | Adicionar coluna `display_order` | `INTEGER`, nullable, default `NULL` na tabela `product` |
| **2** | Aceitar `display_order` no `PATCH /v1/product/{id}` | Validar como inteiro positivo opcional |
| **3** | Retornar `display_order` nas respostas de produto | Em search, getById, create e update |
| **4** | Ordenar por `display_order` no search | `ORDER BY display_order ASC NULLS LAST, id ASC` |
| *Opcional* | Criar endpoint bulk `PATCH /v1/product/display-order` | Recebe array de `{ id, display_order }`, atualiza em transação única |
