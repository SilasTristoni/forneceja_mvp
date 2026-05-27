# ForneceJá — MVP comercializável

Marketplace B2B para pequenos mercados encontrarem fornecedores confiáveis, pedir cotação e acompanhar resposta comercial sem virar ERP.

## Proposta

Pequenos mercados perdem venda quando compram de fornecedores ruins, atrasados ou imprevisíveis. O ForneceJá resolve isso com busca por produto, região, prazo, preço, score de confiança, histórico público e cotação direta.

## Modelo de negócio

- Mercados usam gratuitamente.
- Fornecedores pagam por visibilidade, analytics e mais oportunidades.
- Plano pago nunca altera score, ranking de confiança ou recomendação automática.

## Funcionalidades atuais

- Busca de fornecedores por produto, categoria, região, prazo, preço e score.
- Recomendação automática do melhor fornecedor para a busca.
- Perfil público com avaliações, atrasos, taxa de resposta e score explicável.
- Envio de pedido/cotação pelo mercado.
- Painel do fornecedor para responder com preço final, prazo e observação.
- Status do pedido: enviado, em análise, respondido, aceito, recusado, concluído e cancelado.
- Avaliação vinculada ao pedido concluído.
- Comparador de fornecedores.
- Planos Gratuito, Destaque e Premium.
- Dashboard com métricas de impacto, operação e monetização.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: MySQL
- API: REST

## Rodar localmente

### Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Teste:

- http://localhost:3333
- http://localhost:3333/api/health

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse:

- http://localhost:5173

### Banco MySQL

No MySQL Workbench, execute:

```sql
database/schema.sql
database/seed.sql
```

Ou no terminal:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p forneceja < database/seed.sql
```

Se o banco estiver vazio ou indisponível, a API usa dados demo em memória para preservar a apresentação.

## Fluxo recomendado de demo

1. Entrar como `Mercado do Bairro`.
2. Buscar `refrigerante`, região `Joinville`, entrega até `2 dias`.
3. Mostrar recomendação automática e comparador.
4. Abrir o fornecedor recomendado e enviar uma cotação.
5. Trocar o usuário para `Bebidas Norte Distribuidora`.
6. Abrir `Painel fornecedor` e responder o pedido com preço e prazo.
7. Voltar para `Mercado do Bairro`, abrir `Meus pedidos` e aceitar a cotação.
8. Mostrar `Planos` e reforçar: plano pago compra visibilidade, não score.
9. Fechar no `Dashboard` com impacto, resposta, aceite, MRR estimado e ranking real de confiança.
