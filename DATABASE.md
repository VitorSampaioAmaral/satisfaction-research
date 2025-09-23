# Estrutura do Banco de Dados

Este documento descreve a estrutura do banco de dados implementada com Prisma para o sistema de pesquisa de ambiente corporativo.

## 📊 Tabelas

### 1. **User** (Usuários)
Armazena informações dos colaboradores que respondem às pesquisas.

```sql
- id: String (CUID) - Chave primária
- email: String (único) - Email do usuário
- name: String - Nome completo
- createdAt: DateTime - Data de criação
- updatedAt: DateTime - Data da última atualização
```

### 2. **Question** (Perguntas)
Armazena as perguntas da pesquisa de ambiente corporativo.

```sql
- id: Int (auto-increment) - Chave primária
- text: String - Texto da pergunta
- category: String - Categoria da pergunta
- order: Int (único) - Ordem de exibição
```

### 3. **SurveyResponse** (Respostas da Pesquisa)
Armazena cada resposta completa de uma pesquisa.

```sql
- id: String (CUID) - Chave primária
- userId: String - ID do usuário (FK)
- totalScore: Int - Pontuação total (0-30)
- completedAt: DateTime - Data de conclusão
- createdAt: DateTime - Data de criação
- updatedAt: DateTime - Data da última atualização
```

### 4. **QuestionResponse** (Respostas das Perguntas)
Armazena as respostas individuais para cada pergunta.

```sql
- id: String (CUID) - Chave primária
- surveyResponseId: String - ID da resposta da pesquisa (FK)
- questionId: Int - ID da pergunta (FK)
- score: Int - Pontuação (0, 1, 2, ou 3)
```

## 🔗 Relacionamentos

### User → SurveyResponse (1:N)
- Um usuário pode ter múltiplas respostas de pesquisa
- Uma resposta de pesquisa pertence a um único usuário
- **Cascade Delete**: Se um usuário for deletado, suas respostas também são deletadas

### SurveyResponse → QuestionResponse (1:N)
- Uma resposta de pesquisa tem múltiplas respostas de perguntas
- Uma resposta de pergunta pertence a uma única resposta de pesquisa
- **Cascade Delete**: Se uma resposta de pesquisa for deletada, suas respostas de perguntas também são deletadas

### Question → QuestionResponse (1:N)
- Uma pergunta pode ter múltiplas respostas (de diferentes pesquisas)
- Uma resposta de pergunta pertence a uma única pergunta
- **Cascade Delete**: Se uma pergunta for deletada, suas respostas também são deletadas

### Constraint Única
- **QuestionResponse**: `(surveyResponseId, questionId)` - Garante que cada pergunta só pode ser respondida uma vez por pesquisa

## 📋 Perguntas Padrão

O sistema vem com 10 perguntas pré-configuradas sobre ambiente corporativo:

1. **Reconhecimento** - "Me sinto valorizado e reconhecido no meu trabalho"
2. **Ambiente** - "O ambiente de trabalho é colaborativo e positivo"
3. **Crescimento** - "Tenho oportunidades claras de crescimento e desenvolvimento"
4. **Comunicação** - "A comunicação entre equipes e gestores é eficaz"
5. **Propósito** - "Meu trabalho tem propósito e contribui para os objetivos da empresa"
6. **Equilíbrio** - "A empresa promove um equilíbrio saudável entre vida pessoal e profissional"
7. **Feedback** - "Recebo feedback construtivo e regular sobre meu desempenho"
8. **Liderança** - "A liderança é inspiradora e me motiva a dar o meu melhor"
9. **Autonomia** - "Tenho autonomia suficiente para realizar minhas tarefas"
10. **Recomendação** - "Recomendaria esta empresa como um bom lugar para trabalhar"

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular banco com dados iniciais
npm run db:seed

# Abrir Prisma Studio (interface visual)
npm run db:studio
```

### Produção
```bash
# Aplicar migrações em produção
npx prisma migrate deploy

# Gerar cliente para produção
npx prisma generate
```

## 📈 Estatísticas Disponíveis

O sistema permite consultar:
- Total de respostas
- Total de usuários
- Pontuação média
- Respostas por usuário
- Respostas por pergunta

## 🔒 Segurança

- **Validação**: Todas as entradas são validadas antes de serem salvas
- **Constraints**: Relacionamentos e unicidade são garantidos pelo banco
- **Cascade Delete**: Mantém integridade referencial
- **Tipos**: TypeScript garante tipagem segura

## 🚀 Escalabilidade

- **SQLite**: Adequado para desenvolvimento e pequenas aplicações
- **Migração**: Fácil migração para PostgreSQL/MySQL em produção
- **Índices**: Otimizado para consultas frequentes
- **Relacionamentos**: Estrutura normalizada para eficiência
