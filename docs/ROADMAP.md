# MAIA'S TECH V2 — ROADMAP DE DESENVOLVIMENTO

Este documento registra a evolução do projeto Maia's Tech V2.

Cada funcionalidade é organizada por ETAPA para facilitar manutenção,
consulta futura e continuidade do desenvolvimento.

---

# LEGENDA

- ✅ Concluído
- 🚧 Em desenvolvimento
- ⏳ Planejado
- 🔧 Revisar futuramente

---

# 01 — BASE DO PROJETO

## ETAPA 01 — Criação do projeto
**Status:** ✅ Concluído

Configuração inicial da aplicação.

Tecnologias principais:
- React
- TypeScript
- Vite

---

## ETAPA 02 — Organização da estrutura

**Status:** ✅ Concluído

Estrutura organizada em pastas para separar responsabilidades.

Principais diretórios:

```text
src/
├── assets/
├── components/
├── pages/
├── services/
├── styles/
├── types/
└── utils/
```

---

## ETAPA 03 — Identidade visual e tema global

**Status:** ✅ Concluído

Criação da identidade visual da Maia's Tech.

Inclui:
- fundo escuro
- tons roxos
- efeitos neon
- variáveis CSS
- bordas
- sombras
- superfícies
- tipografia
- padrões visuais reutilizáveis

---

# 02 — INTERFACE PÚBLICA

## ETAPA 04 — Header

**Status:** ✅ Concluído

Criação do cabeçalho principal.

Inclui:
- identidade Maia's Tech
- navegação
- acesso às categorias
- estrutura responsiva

---

## ETAPA 05 — Hero

**Status:** ✅ Concluído

Criação da área principal da Home seguindo a identidade visual do projeto.

---

## ETAPA 06 — Sistema de rotas

**Status:** ✅ Concluído

Implementação da navegação utilizando React Router.

Inclui rotas públicas e administrativas.

---

## ETAPA 07 — Categorias na Home

**Status:** ✅ Concluído

Criação dos cards de categorias.

As categorias são carregadas a partir do Supabase.

---

## ETAPA 08 — Páginas dinâmicas de categorias

**Status:** ✅ Concluído

Cada categoria possui sua própria página.

Exemplo:

```text
/categoria/placas-de-video
/categoria/processadores
/categoria/gabinetes
```

Os produtos são filtrados de acordo com a categoria.

---

# 03 — SUPABASE

## ETAPA 09 — Conexão com Supabase

**Status:** ✅ Concluído

Integração do frontend com Supabase.

Configuração por variáveis de ambiente.

Exemplo:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

## ETAPA 10 — Tabela categories

**Status:** ✅ Concluído

Tabela responsável pelas categorias da loja.

Principais informações:
- id
- name
- slug
- description

---

## ETAPA 11 — Tabela products

**Status:** ✅ Concluído

Tabela principal do catálogo.

Principais informações:
- id
- category_id
- name
- slug
- brand
- model
- condition
- price
- description
- stock
- featured
- active

---

## ETAPA 12 — Tabela product_images

**Status:** ✅ Concluído

Responsável pelas imagens vinculadas aos produtos.

Principais informações:
- id
- product_id
- image_url
- storage_path
- alt_text
- position

---

## ETAPA 13 — Tabela product_specs

**Status:** ✅ Concluído

Estrutura criada para especificações adicionais dos produtos.

### Decisão atual

Manter o cadastro de produtos simples.

Características adicionais podem ser colocadas no campo descrição.

**Status de uso:** 🔧 Estrutura disponível para evolução futura.

---

## ETAPA 14 — Supabase Storage

**Status:** ✅ Concluído

Bucket:

```text
products
```

Responsável pelo armazenamento físico das imagens dos produtos.

---

# 04 — CATÁLOGO DE PRODUTOS

## ETAPA 15 — Card de produto

**Status:** ✅ Concluído

Criação dos cards utilizados para apresentar produtos no site.

Inclui:
- imagem
- nome
- condição
- preço
- acesso ao produto

---

## ETAPA 16 — Página individual do produto

**Status:** ✅ Concluído

Criação da página detalhada do produto.

Rota baseada no slug.

Exemplo:

```text
/produto/geforce-rtx-4060-8gb
```

---

## ETAPA 17 — Galeria de imagens

**Status:** ✅ Concluído

Produtos podem possuir várias imagens.

A posição das imagens define sua ordem de exibição.

A primeira imagem é atualmente considerada a capa.

### Evolução futura

🔧 Permitir escolher manualmente qual imagem será a capa.

---

# 05 — AUTENTICAÇÃO ADMINISTRATIVA

## ETAPA 18 — Supabase Auth

**Status:** ✅ Concluído

Implementação de autenticação para acesso administrativo.

---

## ETAPA 19 — Rotas protegidas

**Status:** ✅ Concluído

Páginas administrativas protegidas contra usuários não autenticados.

---

# 06 — PAINEL ADMIN

## ETAPA 20 — Dashboard

**Status:** ✅ Concluído

Criação do painel administrativo Maia's Tech.

Principais áreas:
- Visão geral
- Produtos
- Novo produto
- Categorias
- Mensagens
- Sair

---

## ETAPA 21 — Estatísticas do Dashboard

**Status:** ✅ Concluído

Dashboard conectado ao Supabase.

Contadores:
- produtos
- categorias
- mensagens

---

# 07 — ADMINISTRAÇÃO DE PRODUTOS

## ETAPA 22 — Cadastro de produto

**Status:** ✅ Concluído

Tela administrativa para cadastrar novos produtos.

Campos:
- nome
- categoria
- marca
- modelo
- condição
- preço
- estoque
- descrição
- destaque

---

## ETAPA 23 — Upload de múltiplas imagens

**Status:** ✅ Concluído

Permite selecionar várias imagens durante o cadastro.

Formatos utilizados:
- JPG
- PNG
- WEBP

---

## ETAPA 24 — Preview das imagens

**Status:** ✅ Concluído

Exibição das imagens antes do cadastro.

Inclui identificação visual da imagem de capa.

---

## ETAPA 25 — Listagem administrativa de produtos

**Status:** ✅ Concluído

Página:

```text
/admin/produtos
```

Exibe os produtos cadastrados em formato de cards administrativos.

---

## ETAPA 26 — Ativar e desativar produto

**Status:** ✅ Concluído

Permite controlar se determinado produto aparece no site.

Campo utilizado:

```text
active
```

---

## ETAPA 27 — Editar produto

**Status:** ✅ Concluído

Permite alterar:
- nome
- categoria
- marca
- modelo
- condição
- preço
- estoque
- descrição
- destaque
- status

---

## ETAPA 28 — Adicionar fotos na edição

**Status:** ✅ Concluído

Permite adicionar novas imagens a produtos existentes.

As imagens são:
1. enviadas ao Storage;
2. registradas em product_images;
3. exibidas imediatamente na edição.

---

## ETAPA 29 — Exclusão de fotos

**Status:** ✅ Concluído

Permite remover uma imagem individual.

Fluxo:

```text
Excluir foto
↓
Storage
↓
product_images
↓
Interface
```

---

## ETAPA 30 — storage_path

**Status:** ✅ Concluído

### Problema encontrado

Inicialmente armazenávamos apenas:

```text
image_url
```

Ao excluir uma imagem, era necessário tentar descobrir seu caminho dentro
do Storage através da URL.

Isso provocou arquivos órfãos.

### Solução

Foi adicionada a coluna:

```text
storage_path
```

em:

```text
product_images
```

Agora o caminho real do arquivo é armazenado diretamente.

Exemplo:

```text
geforce-rtx-4060-8gb/foto-01.webp
```

Isso permite exclusão confiável no Storage.

---

## ETAPA 31 — Exclusão completa de produto

**Status:** ✅ Concluído

Botão Excluir implementado no gerenciamento de produtos.

A exclusão considera:
- produto
- registros relacionados
- imagens
- arquivos no Storage

Também foi realizada limpeza manual dos arquivos antigos de testes que
haviam ficado órfãos antes da implementação de storage_path.

---

# 08 — ADMINISTRAÇÃO DE CATEGORIAS

## ETAPA 32 — Listagem de categorias

**Status:** ✅ Concluído

Página:

```text
/admin/categorias
```

Exibe as categorias existentes.

---

## ETAPA 33 — Criar categoria

**Status:** ✅ Concluído

Criação de novas categorias diretamente pelo painel.

Exemplos:
- Mouse
- Teclados
- Headsets

O slug é gerado automaticamente.

Exemplo:

```text
Mouse
↓
mouse
```

---

## ETAPA 34 — Editar categoria

**Status:** ✅ Concluído

Permite alterar:
- nome
- descrição

Foi necessária policy RLS de UPDATE para usuários autenticados.

---

## ETAPA 35 — Excluir categoria

**Status:** ✅ Concluído

Permite excluir categorias sem produtos vinculados.

### Proteção

Antes da exclusão o sistema verifica:

```text
Essa categoria possui produtos?
```

Se SIM:

```text
Exclusão bloqueada
```

Se NÃO:

```text
Categoria pode ser excluída
```

Isso evita produtos sem categoria.

---

# 09 — CHAT E ATENDIMENTO

## ETAPA 36 — Estrutura do banco do Chat

**Status:** ⏳ Próxima etapa

Planejamento das tabelas responsáveis pelas conversas.

Possível estrutura:

```text
conversations
messages
```

---

## ETAPA 37 — Chat do visitante

**Status:** ⏳ Planejado

Criar componente de chat dentro do site.

Fluxo:

```text
Visitante
↓
Chat
↓
Mensagem
↓
Supabase
```

---

## ETAPA 38 — Inteligência Artificial no Chat

**Status:** ⏳ Planejado

Integração de IA para atendimento automático.

Arquitetura prevista:

```text
React
↓
Backend seguro
↓
IA
↓
Supabase
```

A chave da IA NÃO deverá ficar exposta no frontend.

---

## ETAPA 39 — Atendimento híbrido

**Status:** ⏳ Planejado

A IA poderá responder perguntas simples.

Exemplos:
- preço
- estoque
- condição
- descrição
- informações dos produtos

Questões comerciais poderão ser encaminhadas para atendimento humano.

Exemplos:
- negociação
- desconto
- troca
- reserva
- condições especiais

---

## ETAPA 40 — Mensagens no Admin

**Status:** ⏳ Planejado

Área:

```text
/admin/mensagens
```

Permitirá visualizar conversas e responder clientes.

---

# 10 — SEGURANÇA

## ETAPA 41 — Revisão completa de RLS

**Status:** ⏳ Planejado

Revisar todas as policies do Supabase.

Tabelas principais:
- categories
- products
- product_images
- product_specs
- conversations
- messages

Storage:
- products

Objetivo:
- leitura pública somente quando necessária;
- alterações somente para Admin;
- impedir operações indevidas.

---

## ETAPA 42 — Revisão da autenticação

**Status:** ⏳ Planejado

Revisar:
- sessão
- logout
- ProtectedRoute
- acesso direto às URLs administrativas
- comportamento após expiração da sessão

---

# 11 — INTERFACE E QUALIDADE

## ETAPA 43 — Responsividade final

**Status:** ⏳ Planejado

Revisão em:
- Desktop
- Notebook
- Tablet
- Android
- iPhone

---

## ETAPA 44 — Estados de carregamento

**Status:** ⏳ Planejado

Revisar:
- loading
- mensagens de sucesso
- mensagens de erro
- botões desabilitados durante operações

---

## ETAPA 45 — Tratamento de erros

**Status:** ⏳ Planejado

Padronizar mensagens de erro do Admin e do site público.

---

## ETAPA 46 — Limpeza do código

**Status:** ⏳ Planejado

Revisão final para remover:
- imports não utilizados
- funções antigas
- console.log de testes
- CSS não utilizado
- arquivos obsoletos
- componentes duplicados

---

# 12 — PRODUÇÃO

## ETAPA 47 — Variáveis de ambiente

**Status:** ⏳ Planejado

Separar corretamente:
- desenvolvimento
- produção

Nunca publicar chaves privadas no GitHub.

---

## ETAPA 48 — GitHub

**Status:** ⏳ Planejado

Revisar:
- .gitignore
- histórico
- arquivos enviados
- segurança do .env
- README

---

## ETAPA 49 — Build de produção

**Status:** ⏳ Planejado

Executar:

```bash
npm run build
```

Corrigir:
- erros TypeScript
- warnings importantes
- imports quebrados
- problemas de rotas

---

## ETAPA 50 — Deploy final

**Status:** ⏳ Planejado

Preparar a Maia's Tech para hospedagem definitiva.

Revisar:
- domínio
- HTTPS
- rotas
- Supabase
- autenticação
- Storage
- chat
- variáveis de ambiente

---

# 13 — MELHORIAS FUTURAS

## ETAPA 51 — Escolher imagem de capa

**Status:** 🔧 Futuro

Permitir selecionar manualmente a imagem principal de cada produto.

---

## ETAPA 52 — Especificações estruturadas

**Status:** 🔧 Futuro

Utilizar `product_specs` para informações como:

```text
Memória: 8 GB
Fabricante: NVIDIA
Interface: PCI Express
Garantia: 12 meses
```

---

## ETAPA 53 — Busca de produtos

**Status:** ⏳ Planejado

Permitir pesquisar produtos pelo nome, marca ou modelo.

---

## ETAPA 54 — Filtros

**Status:** 🔧 Futuro

Possíveis filtros:
- categoria
- preço
- condição
- marca
- disponibilidade

---

## ETAPA 55 — Favoritos

**Status:** 🔧 Futuro

Possibilidade de salvar produtos favoritos.

---

## ETAPA 56 — Analytics do Admin

**Status:** 🔧 Futuro

Possíveis métricas:
- produtos mais visualizados
- categorias mais acessadas
- conversas iniciadas
- produtos mais perguntados no chat

---

# REGRA DE DESENVOLVIMENTO A PARTIR DE AGORA

Toda nova funcionalidade deverá receber um número de etapa.

Formato:

```text
ETAPA XX — NOME DA FUNCIONALIDADE
```

Cada etapa deverá registrar:

1. Objetivo
2. Arquivos envolvidos
3. Banco de dados envolvido
4. Alterações realizadas
5. Testes
6. Problemas encontrados
7. Solução aplicada
8. Status final

---

# PRÓXIMA ETAPA

## ETAPA 36 — CHAT / ESTRUTURA DO BANCO

**Status:** ⏳ A iniciar

Objetivo:

Preparar o Supabase para armazenar conversas entre visitantes,
Inteligência Artificial e atendimento humano.

---

MAIA'S TECH V2  
Documentação técnica do desenvolvimento