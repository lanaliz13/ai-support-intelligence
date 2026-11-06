import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache em memória para garantir respostas instantâneas e sem estourar o limite da API
const responseCache = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Chave da Groq não configurada no .env.local' }, { status: 500 });
    }

    const ultimaMensagem = messages[messages.length - 1]?.content || '';
    const cacheKey = ultimaMensagem.trim().toLowerCase();

    if (responseCache.has(cacheKey)) {
      return NextResponse.json({ reply: responseCache.get(cacheKey) });
    }

    const dadosDir = path.join(process.cwd(), 'dados');
    let contextoDados = 'Gocase/GoBeauté:';

    try {
      const dicionario = fs.readFileSync(path.join(dadosDir, 'dicionario_de_dados.md'), 'utf-8');
      contextoDados += ` ${dicionario.slice(0, 150)}`;
    } catch (e) {}

    try {
      const parametros = fs.readFileSync(path.join(dadosDir, 'parametros.md'), 'utf-8');
      contextoDados += ` ${parametros.slice(0, 150)}`;
    } catch (e) {}

    // Instrução para usar tópicos em vez de tabelas longas, evitando que o texto seja cortado
    const systemPrompt = `Você é um agente de IA especialista em atendimento para Gocase e GoBeauté. Responda de forma direta, clara e estruturada exclusivamente em tópicos ou listas com marcadores (*). NUNCA utilize tabelas extensas para garantir que a resposta termina sempre por completo.`;

    const userPrompt = `${contextoDados}\n\nPergunta: ${ultimaMensagem}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-safeguard-20b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1000, // Aumentado para 1000 para permitir respostas completas
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro detalhado da Groq:', data);
      return NextResponse.json({ 
        reply: `⚠️ O agente atingiu o limite momentâneo da API. Por favor, aguarde exatamente 30 segundos antes de fazer uma nova consulta.` 
      });
    }

    const reply = data.choices?.[0]?.message?.content 
               || data.choices?.[0]?.text 
               || 'Sem resposta gerada pelo agente.';

    responseCache.set(cacheKey, reply);

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Erro interno no servidor:', error);
    return NextResponse.json({ error: `Erro ao processar: ${error.message}` }, { status: 500 });
  }
}