This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


### Fluxo da requisição

1. O usuário envia uma pergunta para o endpoint POST /api/chat.
2. O endpoint chama a função processQuery no arquivo src/lib/agent.ts.
3. A função processQuery executa as seguintes etapas:
    a. Verifica se a pergunta contém conteúdo nocivo usando a função isHarmful no arquivo src/lib/safety.ts.
    b. Se a pergunta for nociva, retorna uma resposta bloqueada com o motivo.
    c. Se a pergunta não for nociva, recupera documentos relevantes usando a função retrieveDocuments no arquivo src/lib/search.ts.
    d. Constrói fontes com URLs SAS usando a função buildSources no arquivo src/lib/sources.ts.
    e. Gera uma resposta usando o modelo de linguagem grande (LLM) no arquivo src/lib/openai-client.ts.
    f. Verifica se a resposta contém conteúdo nocivo usando a função isHarmful no arquivo src/lib/safety.ts.
    g. Se a resposta for nociva, retorna uma resposta bloqueada com o motivo.
    h. Calcula métricas RAG usando a função calculateRAGMetrics no arquivo src/lib/metrics.ts.
    i. Retorna a resposta com as fontes e métricas.
4. O endpoint retorna a resposta para o usuário.
