# EscoPilot 🚀

### RAG Governado para Conformidade Empresarial e Equipes Reguladas

![logo](https://github.com/me-wsantos/escopilot/blob/main/public/assets/logo.png?raw=true)

Organizações que operam em ambientes regulados — como financeiro, jurídico e compliance — enfrentam um desafio crítico: acessar rapidamente informações confiáveis a partir de documentos e sistemas complexos, sem risco de interpretações incorretas ou decisões não auditáveis.

Este projeto apresenta um agente inteligente governado, baseado em **Geração Aumentada por Recuperação (RAG)**, capaz de transformar conhecimento operacional e técnico em respostas rastreáveis, explicáveis e seguras.

A solução vai além de um assistente tradicional: ela atua como um **copiloto de decisão**, apoiando analistas e desenvolvedores na construção de escopos de negócio e técnicos, na análise de problemas e na geração de soluções estruturadas.

O diferencial está na governança do modelo. Cada resposta segue um padrão definido, considera regras de negócio, evita inferências indevidas e orienta o usuário a validar evidências no sistema. Isso reduz significativamente o risco de alucinação e aumenta a confiabilidade das decisões.

A arquitetura foi pensada para escalar de uma prova de conceito para produção, utilizando serviços Azure para ingestão, indexação, orquestração e observabilidade, garantindo segurança, auditabilidade e evolução contínua.

Como resultado, o **EscoPilot** reduz o **tempo de análise**, melhora a **qualidade dos escopos**, diminui **retrabalho entre áreas** e estabelece um **novo padrão de uso de IA em ambientes corporativos críticos**: não apenas responder, mas responder com **responsabilidade, contexto e governança**.

---

## 🎯 O Desafio Hackathon
Este projeto foi desenvolvido para atender ao **Innovation Challenge March 2026**:
> Equipes reguladas precisam de respostas rápidas a partir de documentos corporativos sem o risco de alucinações ou violações de políticas. O sistema deve manter total rastreabilidade, fundamentação e mensurabilidade, implementando verificações de segurança e demonstrando explicabilidade por meio de métricas de avaliação.

---

## ✨ Arquitetura
![arquitetura](https://github.com/me-wsantos/escopilot/blob/main/public/assets/arquitetura.png?raw=true)

## ✨ Principais Recursos

### 🔍 Recuperação Governada
- **Busca Híbrida**: Combina busca por palavras-chave com embeddings vetoriais via **Azure AI Search** para máxima precisão.
- **Fundamentação Estrita (Grounding)**: O sistema é ajustado para responder apenas com base nos documentos fornecidos (políticas internas, contratos, SOPs), reduzindo drasticamente as alucinações.

### 📜 Rastreabilidade Total
- **Citações Inteligentes**: Cada resposta inclui citações que mapeiam diretamente para os fragmentos dos documentos de origem.
- **Acesso Seguro**: Links diretos para documentos são protegidos por **Tokens SAS do Azure**, garantindo que arquivos sensíveis sejam acessíveis apenas através da aplicação.

### 🛡️ Segurança e Conformidade
- **Filtro de Segurança de Conteúdo**: Avaliação em tempo real de entradas e saídas através do **Azure AI Content Safety** para bloquear conteúdo prejudicial (discurso de ódio, violência, automutilação, etc.).
- **Log de Auditoria**: Cada interação é registrada para fins de auditoria e acompanhamento de conformidade.

### 📊 Mensurabilidade e Métricas RAGAS
O EscoPilot não apenas responde; ele se avalia em tempo real usando métricas inspiradas no framework **RAGAS**:
- **Fidelidade (Faithfulness)**: A resposta é baseada em fatos contidos no contexto recuperado?
- **Relevância da Resposta**: Quão bem a resposta aborda a pergunta do usuário?
- **Precisão do Contexto**: Quão relevantes são os fragmentos de documentos recuperados para a pergunta?

### 💎 Experiência de Usuário Premium
- **Painel de Evidências Interativo**: Um painel lateral que exibe pontuações de confiança e os trechos exatos usados para gerar a resposta.
- **Interface Dark Moderna**: Interface responsiva e de alta performance construída com Next.js 14 e Tailwind CSS.

---

## 🏆 Critérios de Avaliação

O EscoPilot foi projetado para excelência técnica e conformidade rigorosa, atendendo aos pilares fundamentais do desafio:

### ⚡ Desempenho
- **Busca Híbrida e Semântica**: Implementação de **Azure AI Search** com vetores e ranking semântico, garantindo a recuperação dos trechos mais relevantes em milissegundos.
- **Métricas em Tempo Real**: Avaliação automatizada de **RAGAS** (Faithfulness, Relevance, Precision) integrada ao ciclo de vida da requisição, garantindo qualidade contínua.
- **Arquitetura Next.js 14**: Uso de *Server Components* e otimizações de borda para uma interface fluida e de baixa latência.

### 💡 Inovação
- **Framework de Governança**: Diferencia-se de chats genéricos ao implementar um orquestrador que guia o usuário na construção de **Escopos de Negócio e Técnicos** estruturados.
- **Painel de Evidências**: Visualização pioneira de métricas de confiança técnica de forma compreensível para usuários de negócio.
- **Segurança de Acesso Dinâmico**: Integração nativa com **SAS Tokens** gerados on-the-fly, permitindo visualização segura de fontes sem expor o storage publicamente.

### 🌐 Amplitude dos Serviços Azure
A solução utiliza de forma sinérgica o ecossistema de dados e IA da Microsoft:
- **Azure OpenAI**: Modelos de geração (GPT-4o) e embeddings.
- **Azure AI Search**: Motor de busca vetorial e semântica.
- **Azure Blob Storage**: Repositório seguro de documentos corporativos.
- **Azure AI Content Safety**: Camada de proteção em tempo real.
- **Application Insights**: Monitoramento detalhado e telemetria de negócio.

### 🛡️ IA Responsável
- **Escudo de Segurança Multicamada**: Filtro rigoroso de entradas e saídas via **Azure AI Content Safety** para bloqueio de conteúdos prejudiciais.
- **Validação de Fundamentação (Grounding)**: O sistema bloqueia automaticamente respostas com baixa pontuação de fidelidade (faithfulness < 0.5), mitigando alucinações.
- **Auditabilidade e Rastreabilidade**: Cada interação é persistida com metadados completos, fontes e pontuações de confiança, permitindo auditoria total conforme normas regulatórias.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | [Next.js 14](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS |
| **Orquestração** | Lógica de Agente Customizada com Integração Azure OpenAI |
| **LLM** | [Azure OpenAI](https://azure.microsoft.com/pt-br/products/ai-services/openai-service) (GPT-4o) |
| **Indexação/Busca** | [Azure AI Search](https://azure.microsoft.com/pt-br/products/ai-services/ai-search) |
| **Armazenamento** | [Azure Blob Storage](https://azure.microsoft.com/pt-br/products/storage/blobs) (com tokens SAS) |
| **Segurança** | [Azure AI Content Safety](https://azure.microsoft.com/pt-br/products/ai-services/ai-content-safety) |
| **Monitoramento** | [Application Insights](https://azure.microsoft.com/pt-br/products/monitor/app-insights) |

---

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+
- Ambiente Azure com serviços de IA configurados.

### Instalação

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/me-wsantos/escopilot.git
   cd escopilot
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente**:
   Crie um arquivo `.env` na raiz do diretório e preencha com suas credenciais Azure:
   ```env
   AZURE_OPENAI_API_KEY=sua_chave
   AZURE_OPENAI_ENDPOINT=https://seu-recurso.openai.azure.com/
   AZURE_AI_SEARCH_ENDPOINT=https://sua-busca.search.windows.net
   AZURE_AI_SEARCH_KEY=sua_chave
   AZURE_STORAGE_CONNECTION_STRING=sua_string_de_conexao
   AZURE_CONTENT_SAFETY_ENDPOINT=seu_endpoint
   AZURE_CONTENT_SAFETY_KEY=sua_chave
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Visão Geral da Arquitetura

O sistema segue uma "Cadeia de Governança" robusta:
1. **Análise de Query**: A pergunta do usuário é avaliada quanto à intenção e segurança.
2. **Recuperação de Contexto**: O Azure AI Search busca os trechos de documentos mais relevantes.
3. **Escudo de Segurança**: O Azure Content Safety verifica tanto a query quanto o contexto recuperado.
4. **Geração Aumentada**: O GPT-4o gera a resposta usando *apenas* o contexto fornecido.
5. **Cálculo de Métricas**: O módulo RAGAS calcula as pontuações de confiança.
6. **Enriquecimento da Interação**: Citações e tokens SAS são adicionados antes de chegar à interface.

---

## 📄 Licença
Este projeto faz parte de um desafio de hackathon e é destinado a fins de demonstração.

---
### **Contatos** <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Love%20Letter.png" alt="Love Letter" width="25" height="25" />

Para perguntas ou sugestões, entre em contato.

| Jéssica Gonçalves  | Wellington Santos  |
|:-----------:|:-----------:|
|[![LinkedIn](https://img.shields.io/badge/Linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jessica-de-castro-gon%C3%A7alves-aa383a35?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app)    | [![LinkedIn](https://img.shields.io/badge/Linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/-wellington-santos/) |

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" alt="Rocket" width="35" height="35" /> Contribuição 

Sinta-se à vontade para contribuir para este repositório. Abra uma issue ou envie um pull request com suas sugestões e melhorias.

**Se este projeto foi útil para você, deixe uma estrela! Isso nos ajuda muito.** <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Star.png" alt="Star" width="25" height="25" />

