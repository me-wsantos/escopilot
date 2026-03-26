"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Image from "next/image";

/* ──────── Types ──────── */
interface Source {
  title: string;
  page: number;
  chunkId: string;
  url: string;
}

interface RAGMetrics {
  faithfulness: number;
  answerRelevance: number;
  contextPrecision: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  metrics?: RAGMetrics;
  blocked?: boolean;
  blockReason?: string;
  timestamp: Date;
}

/* ──────── Helpers ──────── */
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function metricColor(value: number) {
  if (value >= 0.75) return "bg-green-500";
  if (value >= 0.5) return "bg-yellow-500";
  return "bg-red-500";
}

function metricLabel(value: number) {
  if (value >= 0.75) return "Alto";
  if (value >= 0.5) return "Médio";
  return "Baixo";
}

/* ──────── Component ──────── */
export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, userId: "user-web" }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: data.response ?? "Sem resposta.",
        sources: data.sources ?? [],
        metrics: data.metrics,
        blocked: data.blocked,
        blockReason: data.blockReason,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setSelectedMsg(assistantMsg.id);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: "Erro ao se comunicar com o servidor.",
          timestamp: new Date(),
          blocked: true,
          blockReason: "Network Error",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const selectedDetail = messages.find((m) => m.id === selectedMsg && m.role === "assistant");

  return (
    <div className="flex h-screen bg-[var(--color-bg-primary)]">
      {/* ─── Main Chat ─── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="glass border-b border-[var(--color-border-primary)] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/assets/logo.png"
                alt="EscoPilot Logo"
                width={200}
                height={200}
                className="object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-[var(--color-bg-secondary)]" />
            </div>
            <div className="flex flex-col items-center justify-center pl-4 pt-2">
              <p className="text-xs text-gray-300">
                Base de Conhecimento - Plataforma Atlas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com/me-wsantos/escopilot.git"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
              title="Repositório GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
              </svg>
            </a>
            <a
              href="https://innovationstudio.microsoft.com/hackathons/Innovation-Challenge-Spring-2025/project/121674"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all duration-200"
              title="Projeto no Innovation Studio"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <div className="w-20 h-20 flex-col rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
                <span className="text-[.5rem] text-gray-800">SL-CXV-I</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Bem-vindo ao EscoPilot</p>
                <p className="text-sm text-gray-100 max-w-md">
                  Faça uma pergunta sobre a Plataforma Atlas. Todas as respostas são fundamentadas, rastreáveis e auditáveis.
                </p>
              </div>
              <div className="flex gap-2 flex-wrap justify-center max-w-lg">
                {[
                  "Como uma nova funcionalidade impacta as tabelas, telas e parâmetros do sistema?",
                  "Quais são as boas práticas técnicas e de performance?",
                  "Qual é o fluxo completo da operação de cobrança?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="text-xs px-3 py-1.5 rounded-lg glass border text-gray-50 border-[var(--color-border-primary)] hover:border-indigo-500/50 text-[var(--color-text-secondary)] hover:text-indigo-300 transition-all duration-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex animate-fade-in-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 ${msg.role === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : `glass ${selectedMsg === msg.id ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10" : ""}`
                  } ${msg.blocked ? "border border-red-500/30" : ""}`}
                onClick={() => msg.role === "assistant" && setSelectedMsg(msg.id)}
              >
                {msg.blocked && (
                  <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium mb-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {msg.blockReason}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-2 ${msg.role === "user" ? "text-indigo-200" : "text-gray-100"}`}>
                  {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="glass rounded-2xl px-5 py-4 flex items-center gap-1.5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Input area highlighting */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 shrink-0">
          <div className="bg-gray-700 backdrop-blur-xl rounded-2xl flex items-end gap-3 px-4 py-3 border border-indigo-500/20 shadow-xl shadow-black/20 focus-within:border-indigo-500/50 focus-within:shadow-indigo-500/10 transition-all duration-300">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Digite sua pergunta..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-gray-100 resize-none outline-none max-h-32"
              disabled={loading}
              id="chat-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200"
              id="send-button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* ─── Evidence Panel (Right Sidebar) ─── */}
      <aside className="hidden lg:flex flex-col w-[380px] border-l border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
        <div className="px-5 py-4 border-b border-[var(--color-border-primary)]">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Painel de Evidências</h2>
          <p className="text-xs text-gray-100">Fontes e métricas de confiança</p>
        </div>

        {selectedDetail ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Metrics */}
            {selectedDetail.metrics && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-100">
                  Métricas de Confiança
                </h3>
                {(
                  [
                    ["Fidelidade", selectedDetail.metrics.faithfulness, "A resposta é totalmente fundamentada pelo contexto?"],
                    ["Relevância", selectedDetail.metrics.answerRelevance, "A resposta aborda a pergunta?"],
                    ["Precisão do Contexto", selectedDetail.metrics.contextPrecision, "Os trechos recuperados são relevantes para a pergunta?"],
                  ] as [string, number, string][]
                ).map(([label, value, description]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center gap-1.5 group relative">
                        <span className="text-[var(--color-text-secondary)]">{label}</span>
                        <div className="cursor-help text-gray-400 hover:text-indigo-400 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                          </svg>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 text-[10px] text-gray-200 rounded-lg border border-indigo-500/30 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          {description}
                          <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                      <span className={`font-medium ${value >= 0.75 ? "text-green-400" : value >= 0.5 ? "text-yellow-400" : "text-red-400"}`}>
                        {(value * 100).toFixed(0)}% · {metricLabel(value)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                      <div
                        className={`h-full rounded-full metric-bar-fill ${metricColor(value)}`}
                        style={{ width: `${Math.max(2, value * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Status */}
            {selectedDetail.blocked !== undefined && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-100">
                  Status de Segurança
                </h3>
                <div className={`glass rounded-xl p-3 flex items-center gap-2 ${selectedDetail.blocked ? "border-red-500/30" : "border-green-500/20"}`}>
                  {selectedDetail.blocked ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs text-red-400 font-medium">Bloqueado: {selectedDetail.blockReason}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-xs text-green-400 font-medium">Aprovado — conteúdo seguro</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Sources */}
            {selectedDetail.sources && selectedDetail.sources.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-100">
                  Fontes ({selectedDetail.sources.length})
                </h3>
                {selectedDetail.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block glass rounded-xl p-3 hover:border-indigo-500/30 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="shrink-0 w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[var(--color-text-primary)] truncate group-hover:text-indigo-300 transition-colors">
                          {src.title}
                        </p>
                        <p className="text-[10px] text-gray-100">
                          Página {src.page}
                        </p>
                      </div>
                      <svg className="shrink-0 w-3.5 h-3.5 text-gray-100 group-hover:text-indigo-400 transition-colors ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* No sources */}
            {(!selectedDetail.sources || selectedDetail.sources.length === 0) && !selectedDetail.blocked && (
              <div className="text-center py-8">
                <p className="text-xs text-gray-100">Nenhuma fonte encontrada para esta resposta</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-2 opacity-50">
              <svg className="w-12 h-12 mx-auto text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-xs text-gray-100">
                Clique em uma resposta para visualizar as fontes e métricas
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
