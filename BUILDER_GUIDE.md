# 🛠️ Guia do Builder de Pesquisa de Satisfação

O Builder permite criar e customizar pesquisas de satisfação com temas, perguntas e gráficos personalizados, tudo protegido com IDs criptografados e senhas de administrador.

## 🚀 Funcionalidades

### 1. **Criação de Configurações Customizadas**
- ID customizado criptografado
- Nome e descrição da pesquisa
- Senha de administrador (obrigatória, mínimo 12 caracteres)
- Senha de usuário comum (opcional, mínimo 6 caracteres)

### 2. **Customização de Tema**
- Cor primária
- Cor secundária
- Cor de fundo
- Cor do texto
- Cor de destaque
- Preview em tempo real

### 3. **Gerenciamento de Perguntas**
- Adicionar perguntas manualmente
- Editar perguntas existentes
- Reordenar perguntas
- Importar perguntas via CSV
- Categorizar perguntas

### 4. **Customização de Gráficos**
- Tipo de gráfico (Barras, Linha, Pizza, Área)
- Cores personalizadas para gráficos
- Mostrar/ocultar legenda
- Mostrar/ocultar grade
- Habilitar/desabilitar animações

## 📋 Como Usar

### Acessar o Builder

Acesse: `http://localhost:3000/builder` (ou sua URL de produção)

### Criar uma Nova Configuração

1. **Aba Básico**:
   - Digite um ID customizado (ex: `minha-pesquisa-2024`)
   - Digite o nome da pesquisa
   - Adicione uma descrição (opcional)
   - Defina a senha de administrador (mínimo 12 caracteres)
   - Defina a senha de usuário comum (opcional, mínimo 6 caracteres)
   - Clique em "Criar Configuração"

2. **Aba Tema**:
   - Selecione as cores desejadas usando os seletores de cor
   - Ou digite os códigos hexadecimais manualmente
   - Veja o preview em tempo real
   - Salve as alterações

3. **Aba Perguntas**:
   - Clique em "Adicionar Pergunta" para criar manualmente
   - Ou use "Importar CSV" para importar múltiplas perguntas de uma vez
   - Edite, reordene ou remova perguntas
   - Clique em "Salvar Perguntas"

4. **Aba Gráficos**:
   - Selecione o tipo de gráfico padrão
   - Configure as cores dos gráficos
   - Ative/desative legenda, grade e animações
   - Salve as alterações

### Importar Perguntas via CSV

O arquivo CSV deve ter o seguinte formato:

```csv
texto da pergunta,categoria,ordem
Me sinto valorizado no trabalho,Reconhecimento,1
O ambiente é colaborativo,Ambiente,2
Tenho oportunidades de crescimento,Crescimento,3
```

**Formato:**
- Uma pergunta por linha
- Campos separados por vírgula
- Campos: `texto`, `categoria`, `ordem`
- A ordem é opcional (será atribuída automaticamente se não fornecida)

### Editar uma Configuração Existente

1. Na sidebar, clique em uma configuração existente
2. A configuração será carregada
3. Faça as alterações desejadas
4. Forneça a senha de administrador
5. Clique em "Salvar Alterações"

## 🔐 Segurança

### Senha de Administrador
- **Mínimo**: 12 caracteres
- **Requisitos**:
  - Pelo menos uma letra maiúscula
  - Pelo menos uma letra minúscula
  - Pelo menos um número
  - Pelo menos um caractere especial
- **Uso**: Necessária para criar, editar e adicionar perguntas

### Senha de Usuário Comum
- **Mínimo**: 6 caracteres
- **Uso**: Opcional, para acesso básico à pesquisa (se configurada)

### ID Customizado
- **Mínimo**: 5 caracteres
- **Caracteres permitidos**: Letras, números, hífens e underscores
- **Criptografia**: O ID é criptografado antes de ser armazenado no banco de dados

## 📡 APIs Disponíveis

### Criar Configuração
```http
POST /api/builder/config
Content-Type: application/json

{
  "customId": "minha-pesquisa-2024",
  "name": "Pesquisa de Satisfação 2024",
  "description": "Pesquisa anual de satisfação",
  "adminPassword": "SenhaForte123!@#",
  "userPassword": "senha123", // opcional
  "primaryColor": "#3b82f6",
  "secondaryColor": "#8b5cf6",
  // ... outras configurações
}
```

### Buscar Configuração
```http
GET /api/builder/config/{customId}
```

### Atualizar Configuração
```http
PUT /api/builder/config/{customId}
Content-Type: application/json

{
  "adminPassword": "SenhaForte123!@#",
  "name": "Novo Nome",
  // ... outras configurações
}
```

### Adicionar Perguntas
```http
POST /api/builder/config/{customId}/questions
Content-Type: application/json

{
  "adminPassword": "SenhaForte123!@#",
  "questions": [
    {
      "text": "Me sinto valorizado",
      "category": "Reconhecimento",
      "order": 1
    }
  ]
}
```

### Importar CSV
```http
POST /api/builder/config/{customId}/import-csv
Content-Type: application/json

{
  "adminPassword": "SenhaForte123!@#",
  "csvData": "texto,categoria,ordem\nMe sinto valorizado,Reconhecimento,1"
}
```

### Verificar Senha
```http
POST /api/builder/config/{customId}/verify
Content-Type: application/json

{
  "password": "senha123",
  "isAdmin": false // ou true para verificar senha de admin
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

1. **survey_configs**: Configurações customizadas
2. **custom_questions**: Perguntas customizadas
3. **custom_survey_responses**: Respostas de pesquisas customizadas
4. **custom_question_responses**: Respostas individuais de perguntas customizadas

## 🔧 Configuração

### Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
DATABASE_URL="postgresql://..."
ENCRYPTION_KEY="sua-chave-secreta-min-32-caracteres" # Opcional, mas recomendado em produção
```

### Aplicar Migrações

```bash
# Gerar migração
npx prisma migrate dev --name add_survey_builder

# Ou aplicar migração existente
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate
```

## 📝 Exemplos de Uso

### Exemplo 1: Criar Pesquisa Simples

1. Acesse `/builder`
2. Aba Básico:
   - ID: `pesquisa-rh-2024`
   - Nome: `Pesquisa de Satisfação RH 2024`
   - Admin Password: `Admin@2024Strong!`
3. Clique em "Criar Configuração"
4. Aba Perguntas:
   - Adicione 10 perguntas manualmente
   - Ou importe via CSV
5. Salve as perguntas

### Exemplo 2: Customizar Tema Corporativo

1. Carregue uma configuração existente
2. Aba Tema:
   - Primary: `#1e40af` (azul corporativo)
   - Secondary: `#7c3aed` (roxo)
   - Background: `#f9fafb` (cinza claro)
   - Text: `#111827` (preto)
   - Accent: `#059669` (verde)
3. Salve as alterações

### Exemplo 3: Importar Perguntas de CSV

Crie um arquivo `perguntas.csv`:

```csv
Me sinto valorizado e reconhecido no meu trabalho,Reconhecimento,1
O ambiente de trabalho é colaborativo e positivo,Ambiente,2
Tenho oportunidades claras de crescimento e desenvolvimento,Crescimento,3
A comunicação entre equipes e gestores é eficaz,Comunicação,4
Meu trabalho tem propósito e contribui para os objetivos da empresa,Propósito,5
```

1. No Builder, aba Perguntas
2. Clique em "Importar CSV"
3. Selecione o arquivo
4. Clique em "Confirmar Importação"

## 🎯 Próximos Passos

Após criar uma configuração, você pode:

1. Usar o ID customizado para acessar a pesquisa customizada
2. Integrar com o sistema de respostas existente
3. Criar dashboards customizados usando as configurações de tema e gráficos
4. Compartilhar o ID customizado com os participantes

## ⚠️ Notas Importantes

- **Senha de Admin**: Guarde com segurança! Ela é necessária para qualquer edição
- **ID Customizado**: Não pode ser alterado após a criação
- **Criptografia**: Os IDs são criptografados no banco de dados
- **Produção**: Configure `ENCRYPTION_KEY` em variável de ambiente para maior segurança

## 🐛 Solução de Problemas

### Erro: "ID customizado já está em uso"
- Escolha um ID diferente

### Erro: "Senha de administrador inválida"
- Verifique se a senha atende aos requisitos (mínimo 12 caracteres, maiúscula, minúscula, número, caractere especial)

### Erro: "Configuração não encontrada"
- Verifique se o ID customizado está correto
- Certifique-se de que a configuração foi criada

### Erro ao importar CSV
- Verifique o formato do CSV (texto,categoria,ordem)
- Certifique-se de que não há linhas vazias no início
- Verifique se a senha de administrador está correta

