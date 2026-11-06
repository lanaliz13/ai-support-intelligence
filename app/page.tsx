'use client';
import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendQuery = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: '❌ Erro de comunicação com o agente.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendQuery(input);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-xl p-6 flex flex-col h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Painel de Inteligência de Atendimento - Gocase & GoBeauté</h1>
          <p className="text-sm text-gray-500 mt-1">
            Agente AI-First dedicado a identificar problemas, categorizar contatos e propor ações com base nos dados operacionais.
          </p>
        </div>

        {/* Ações Rápidas do Agente (Foco do Desafio da Gogroup) */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Ações Rápidas do Agente de IA:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => sendQuery("Por que os clientes nos procuram, e qual o peso real de cada motivo para o negócio com base nos dados?")}
              className="text-xs bg-blue-50 text-blue-700 border border-blue-200 p-2.5 rounded-lg hover:bg-blue-100 transition text-left font-medium"
            >
              📊 Principais Motivos e Peso Real
            </button>
            <button
              onClick={() => sendQuery("Quais contatos poderiam simplesmente não existir e como eliminá-los da operação?")}
              className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 p-2.5 rounded-lg hover:bg-emerald-100 transition text-left font-medium"
            >
              ✂️ Contatos Desnecessários
            </button>
            <button
              onClick={() => sendQuery("O que o time de atendimento deveria atacar primeiro, e com que critério financeiro ou operacional?")}
              className="text-xs bg-amber-50 text-amber-700 border border-amber-200 p-2.5 rounded-lg hover:bg-amber-100 transition text-left font-medium"
            >
              🎯 Prioridades do Time
            </button>
            <button
              onClick={() => sendQuery("Que ações o sistema pode tomar sozinho de forma automatizada, e quais exigem intervenção humana?")}
              className="text-xs bg-purple-50 text-purple-700 border border-purple-200 p-2.5 rounded-lg hover:bg-purple-100 transition text-left font-medium"
            >
              🤖 Automação vs Humano
            </button>
          </div>
        </div>

        {/* Janela de Conversa / Análise */}
        <div className="flex-1 overflow-y-auto border rounded-xl p-4 mb-4 bg-gray-50 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-2">
              <p className="text-base font-medium">O agente de IA está pronto para analisar os dados.</p>
              <p className="text-xs">Clica num dos botões acima ou digita a tua pergunta na barra inferior para começar.</p>
            </div>
          )}
          {messages.map((m, idx) => (
            <div key={idx} className={`p-4 rounded-xl max-w-[85%] leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto shadow-sm' : 'bg-white text-gray-800 mr-auto border shadow-sm'}`}>
              <div className="text-xs font-semibold mb-1 opacity-75">{m.role === 'user' ? 'Tu' : 'Agente AI-First'}</div>
              <div className="text-sm whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
          {loading && (
            <div className="bg-white border p-4 rounded-xl max-w-[85%] mr-auto shadow-sm flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600 italic">O agente está a cruzar os dados dos ficheiros e parâmetros...</p>
            </div>
          )}
        </div>

        {/* Input de Envio Livre */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ou digita outra questão específica sobre o atendimento..."
            className="flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition text-sm font-medium shadow-sm">
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}