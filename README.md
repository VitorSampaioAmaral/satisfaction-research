# Dashboard de Relatórios - Pesquisa de Ambiente Corporativo

Dashboard profissional para análise e visualização de dados de pesquisas de ambiente corporativo, desenvolvido com Next.js, TypeScript, Tailwind CSS e Prisma.

## 🔐 Acesso

**Chave de Acesso**: `DASH2024CORP123456789`

## 🚀 Funcionalidades

### 📊 **Gráficos e Visualizações**
- **Gráfico de Pizza**: Distribuição de pontuações (Excelente, Bom, Regular, Ruim)
- **Linha do Tempo**: Respostas por mês com tendências
- **Gráfico de Barras**: Análise por categoria de pergunta
- **Cards de Estatísticas**: Métricas principais em tempo real

### 📈 **Métricas Disponíveis**
- Total de respostas
- Usuários únicos
- Pontuação média geral
- Taxa de satisfação
- Análise por categoria
- Respostas recentes

### 🎨 **Interface**
- **Tema Escuro**: Design moderno e profissional
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Interativo**: Gráficos com tooltips e legendas
- **Atualização em Tempo Real**: Botão para refresh dos dados

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Prisma** - ORM para banco de dados
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones

## 📊 Estrutura do Dashboard

### Cards de Estatísticas
- **Total de Respostas**: Número total de pesquisas respondidas
- **Usuários Únicos**: Quantidade de colaboradores que participaram
- **Pontuação Média**: Média geral das pontuações (0-30)
- **Taxa de Satisfação**: Percentual de satisfação baseado na média

### Gráfico de Pizza
Distribui as respostas em 4 categorias:
- **Excelente (25-30 pontos)**: Verde
- **Bom (20-24 pontos)**: Azul
- **Regular (15-19 pontos)**: Amarelo
- **Ruim (0-14 pontos)**: Vermelho

### Linha do Tempo
Mostra a evolução das respostas ao longo do tempo:
- **Eixo X**: Meses/anos
- **Linha Azul**: Número de respostas por mês
- **Linha Verde**: Pontuação média por mês

### Gráfico de Barras
Análise detalhada por categoria de pergunta:
- **Reconhecimento**: Valorização no trabalho
- **Ambiente**: Colaboração e positividade
- **Crescimento**: Oportunidades de desenvolvimento
- **Comunicação**: Eficácia entre equipes
- **Propósito**: Sentido do trabalho
- **Equilíbrio**: Vida pessoal/profissional
- **Feedback**: Recebimento de feedback
- **Liderança**: Inspiração da liderança
- **Autonomia**: Liberdade nas tarefas
- **Recomendação**: Intenção de recomendar

### Respostas Recentes
Lista das últimas 10 respostas com:
- Nome e email do colaborador
- Pontuação total e classificação
- Data de conclusão

## 🚀 Como Executar

1. **Instalar dependências**:
```bash
npm install
```

2. **Executar em modo desenvolvimento**:
```bash
npm run dev
```

3. **Acessar o dashboard**:
```
http://localhost:3001
```

4. **Fazer login** com a chave: `DASH2024CORP123456789`

## 📱 Páginas

- **`/`** - Redirecionamento automático
- **`/login`** - Página de autenticação
- **`/dashboard`** - Painel principal com gráficos

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Gerar cliente Prisma
npm run db:generate

# Abrir Prisma Studio
npm run db:studio
```

## 🗄️ Banco de Dados

Agora ambos os apps usam PostgreSQL.

Defina as variáveis de ambiente (Windows PowerShell):

```bash
# Projeto raiz
setx DATABASE_URL "postgresql://usuario:senha@localhost:5432/research_root?schema=public"

# Projeto cliente
setx CLIENTE_DATABASE_URL "postgresql://usuario:senha@localhost:5432/research_cliente?schema=public"
```

Aplique as migrações e gere o client:

```bash
# raiz
npx prisma migrate deploy --schema=prisma/schema.prisma
npx prisma generate --schema=prisma/schema.prisma

# cliente
cd cliente
npx prisma migrate deploy --schema=prisma/schema.prisma
npx prisma generate --schema=prisma/schema.prisma
```

## 🎯 Casos de Uso

### Para Gestores
- Monitorar satisfação dos colaboradores
- Identificar tendências ao longo do tempo
- Analisar pontos fortes e fracos por categoria
- Acompanhar evolução da empresa

### Para RH
- Avaliar efetividade de políticas
- Identificar áreas de melhoria
- Planejar ações de engajamento
- Medir impacto de mudanças

### Para Liderança
- Tomar decisões baseadas em dados
- Comunicar resultados para stakeholders
- Estabelecer metas de melhoria
- Celebrar conquistas

## 🔒 Segurança

- **Autenticação por chave**: Acesso controlado
- **Dados anônimos**: Preserva privacidade dos colaboradores
- **Validação**: Todas as entradas são validadas
- **HTTPS**: Recomendado para produção

## 📈 Próximas Funcionalidades

- [ ] Exportação de relatórios em PDF
- [ ] Filtros por período
- [ ] Comparação entre departamentos
- [ ] Alertas automáticos
- [ ] Dashboard em tempo real
- [ ] Análise de sentimentos

---

**Desenvolvido para análise profissional de pesquisas de ambiente corporativo** 🏢📊