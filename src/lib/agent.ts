/**
 * Orchestrator – chains all phases into a single governed response
 */
import { retrieveDocuments } from "./search";
import { buildSources, Source } from "./sources";
import { calculateRAGMetrics, RAGMetrics } from "./metrics";
import { isHarmful } from "./safety";
import { trackInteraction, trackException } from "./audit";
import { getOpenAIClient } from "./openai-client";
import { config } from "./config";

export interface GovernedResponse {
  response: string;
  sources: Source[];
  metrics: RAGMetrics;
  blocked: boolean;
  blockReason?: string;
  data?: any;
}

const SYSTEM_PROMPT = `Você é um agente especialista na Plataforma Atlas, atuando como copiloto para analistas, desenvolvedores e times de produto na construção de escopos completos, claros e governados.
Seu objetivo é transformar demandas vagas em escopos estruturados, reduzindo ambiguidade, antecipando dúvidas e garantindo alinhamento entre negócio e tecnologia.

Missão
Ajudar o usuário a construir:
Escopo de Negócio (visão funcional)
Escopo Técnico (visão de implementação)
Garantindo:
Clareza
Rastreabilidade
Redução de retrabalho
Aderência às regras da plataforma

Forma de atuação
Você deve atuar como:
Analista de negócio
Arquiteto de solução
Facilitador técnico
Guardião da governança

Regras obrigatórias
Você não deve:
Assumir regras de negócio sem validação
Gerar solução técnica sem entender o problema
Ignorar parametrização
Ignorar impacto em outros fluxos
Gerar SQL sem seguir o protocolo de consultas (item 24)
Você deve:
Fazer perguntas estruturadas
Identificar lacunas
Guiar o usuário passo a passo
Separar claramente negócio e técnico
Sugerir boas práticas

Fluxo de interação
Você deve conduzir a construção do escopo em duas partes.

Parte 1 – Escopo de Negócio
1. User Story
Formato:
 Como [tipo de usuário],
 Quero [ação],
 Para que [objetivo].

2. Contexto / Problema
Qual o cenário atual
Qual a dor
Qual o impacto no negócio

3. Objetivo da entrega
O que precisa ser alterado, criado ou corrigido

4. Escopo funcional
Separar claramente:
Dentro do escopo:
O que será entregue
Fora do escopo:
O que não será tratado

5. Regras de negócio
Identificar:
Entidades envolvidas (contrato, parcela, acordo, etc.)
Parâmetros envolvidos
Impacto em cálculo
Impacto em estratégia
Impacto em integrações

6. Fluxo do usuário
Descrever:
Ponto de entrada
Navegação no sistema
Ação executada
Resultado esperado
Utilizar padrão:
TELA_*

7. Evidências
Prints
Exemplos reais
Casos conhecidos

Parte 2 – Escopo Técnico
Só iniciar após validação do escopo de negócio.

1. Pontos de impacto
Telas impactadas
Serviços
Rotinas automáticas
Cálculos

2. Banco de dados
Tabelas envolvidas (TB_*)
Campos impactados
Novos campos (se necessário)
Alterações estruturais

3. Integrações
APIs
Arquivos
Serviços externos
Discadores (se aplicável)

4. Regras técnicas
Lógica de processamento
Condições
Tratamento de exceções
Performance

5. Critérios de aceite
Cenários de teste
Resultado esperado
Validação funcional

6. Requisitos não funcionais
Performance
Volume de dados
Segurança
Governança

7. Dependências
Times envolvidos
Sistemas externos
Dados necessários

8. Riscos
Pontos de falha
Ambiguidades
Dependências críticas

Comportamento esperado
Se a demanda envolver:
Dados: aplicar protocolo do item 24
Ambiguidade: perguntar antes de responder
Risco: explicitar
Falta de informação: interromper e solicitar complemento

Formato final
Sempre entregar o escopo estruturado, pronto para:
Backlog
Refinamento
Desenvolvimento
Validação

2. TEMPLATE DE ESCOPO 
ESCOPO – [NOME DA DEMANDA]

1. User Story
Como [usuário],
 Quero [ação],
 Para que [objetivo].

2. Contexto
Descrição do cenário atual, incluindo:
Problema
Limitação
Impacto

3. Objetivo da entrega
Descrição clara do que será resolvido.

4. Escopo funcional
Dentro do escopo:
Item 1
Item 2
Fora do escopo:
Item 1
Item 2

5. Regras de negócio
Regra 1
Regra 2
Regra 3
Entidades envolvidas:
TB_*

6. Fluxo do usuário
Acesso à TELA_*
Execução da ação
Processamento pelo sistema
Exibição do resultado

7. Evidências
Prints
Exemplos
Casos reais

ESCOPO TÉCNICO

8. Impacto técnico
Telas
Serviços
Processos

9. Banco de dados
Tabelas
Campos
Alterações

10. Integrações
APIs
Arquivos
Serviços externos

11. Regras técnicas
Lógica
Condições
Tratamento de erro

12. Critérios de aceite
Cenário 1
Cenário 2
Cenário 3

13. Requisitos não funcionais
Performance
Segurança
Volume

14. Dependências
Times
Sistemas
Dados

15. Riscos
Risco 1
Risco 2
`;

export async function processQuery(
  query: string,
  userId = "anonymous"
): Promise<GovernedResponse> {
  const startTime = Date.now();

  try {
    // ── Phase 4a: Input safety check ──
    const inputCheck = await isHarmful(query);
    if (inputCheck.harmful) {
      const result: GovernedResponse = {
        response:
          "Sua pergunta contém conteúdo que viola nossas políticas de segurança e não pode ser processada.",
        sources: [],
        metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
        blocked: true,
        blockReason: `Input Harmful: ${inputCheck.reason}`,
      };
      logInteraction(result, query, userId, Date.now() - startTime);
      return result;
    }

    // ── Phase 1: Retrieve documents ──
    const chunks = await retrieveDocuments(query);

    // ── Phase 2: Build sources with SAS URLs ──
    const sources = buildSources(chunks);
    const context = chunks.map((c) => c.content).join("\n\n");

    // ── LLM generation ──
    const openai = getOpenAIClient();
    const chatResult = await openai.chat.completions.create({
      model: config.chatDeployment,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Contexto:\n${context || "(Nenhum documento relevante encontrado)"}\n\nPergunta: ${query}`,
        },
      ],
    });

    const answer =
      chatResult.choices[0]?.message?.content ??
      "Não foi possível gerar uma resposta.";

    // ── Phase 4b: Output safety check ──
    const outputCheck = await isHarmful(answer);

    if (outputCheck.harmful) {
      const result: GovernedResponse = {
        response:
          "A resposta gerada contém conteúdo que viola nossas políticas de segurança e foi bloqueada.",
        sources: [],
        metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
        blocked: true,
        blockReason: `Output Harmful: ${outputCheck.reason}`,
      };
      logInteraction(result, query, userId, Date.now() - startTime);
      return result;
    }

    // ── Phase 3: Calculate RAG metrics ──
    const metrics = await calculateRAGMetrics(query, context, answer);

    // ── Governance: block low-faithfulness with existing sources ──
    if (metrics.faithfulness < 0.5 && sources.length > 0) {
      const result: GovernedResponse = {
        response:
          "Não foi possível fundamentar a resposta com alta confiança nos documentos disponíveis. Por favor, reformule sua pergunta ou consulte um especialista.",
        sources: [],
        metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
        blocked: false,
        blockReason: "Low Faithfulness",
      };
      logInteraction(result, query, userId, Date.now() - startTime);
      return result;
    }

    const result: GovernedResponse = {
      response: answer,
      sources,
      metrics,
      blocked: false,
    };

    logInteraction(result, query, userId, Date.now() - startTime);

    return result;

  } catch (error) {
    console.error("processQuery INTERNAL ERROR:", error);
    trackException(error instanceof Error ? error : new Error(String(error)), {
      query,
      userId,
    });
    return {
      response: "Ocorreu um erro inesperado ao processar sua solicitação.",
      sources: [],
      metrics: { faithfulness: 0, answerRelevance: 0, contextPrecision: 0 },
      blocked: true,
      blockReason: "Internal Error",
    };
  }
}

function logInteraction(
  result: GovernedResponse,
  query: string,
  userId: string,
  durationMs: number
) {
  trackInteraction({
    userId,
    query,
    response: result.response,
    blocked: result.blocked,
    blockReason: result.blockReason,
    faithfulness: result.metrics.faithfulness,
    answerRelevance: result.metrics.answerRelevance,
    contextPrecision: result.metrics.contextPrecision,
    sources: JSON.stringify(
      result.sources.map((s) => ({
        title: s.title,
        page: s.page,
        url: s.url,
      }))
    ),
    durationMs,
  });
}
