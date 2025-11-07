'use client';

import React, { useState } from 'react';
import SurveyQuiz from './components/SurveyQuiz';
import SurveyResults from './components/SurveyResults';
import { SurveyResponse } from './types';

export default function Home() {
  const [result, setResult] = useState<SurveyResponse | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [customId, setCustomId] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; customId?: string }>({});

  const handleComplete = async (responses: { questionId: number; score: number }[]) => {
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, name: userName, email: userEmail }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (e) {
      console.error('Erro ao enviar respostas', e);
    }
  };

  const handleNewSurvey = () => setResult(null);

  const validateAndStart = () => {
    const newErrors: { name?: string; email?: string; customId?: string } = {};
    if (!userName.trim()) newErrors.name = 'Informe seu nome';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail.trim()) newErrors.email = 'Informe seu e-mail';
    else if (!emailRegex.test(userEmail)) newErrors.email = 'E-mail inválido';
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Se houver ID customizado, redirecionar para a página de pesquisa customizada
      if (customId.trim()) {
        window.location.href = `/survey/${customId.trim()}?name=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`;
        return;
      }
      setHasStarted(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">Pesquisa de Satisfação</h1>
          <p className="text-slate-300 mb-4">Avalie seu ambiente de trabalho de forma rápida e anônima.</p>
          <div className="flex gap-2 justify-center items-center mb-4">
            <a 
              href="/builder" 
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              🛠️ Builder de Pesquisas
            </a>
          </div>
        </header>

        {!hasStarted && !result && (
          <div className="w-full max-w-xl mx-auto">
            <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
              <h2 className="text-2xl font-semibold text-slate-100 mb-6">Seus dados</h2>
              <div className="space-y-5">
                <div>
                  <label htmlFor="customId" className="block text-sm font-medium text-slate-200 mb-2">
                    ID da Pesquisa (opcional)
                  </label>
                  <input
                    id="customId"
                    type="text"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                    placeholder="Digite o ID da pesquisa customizada (deixe vazio para pesquisa padrão)"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Se você recebeu um ID de pesquisa customizada, digite-o aqui
                  </p>
                  {errors.customId && <p className="mt-1 text-sm text-red-400">{errors.customId}</p>}
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">Nome</label>
                  <input
                    id="name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                    placeholder="Seu nome completo"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                    placeholder="voce@exemplo.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>
                <button
                  onClick={validateAndStart}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {customId.trim() ? 'Acessar Pesquisa Customizada' : 'Começar pesquisa'}
                </button>
              </div>
            </div>
          </div>
        )}

        {hasStarted && !result ? (
          <SurveyQuiz onComplete={handleComplete} />
        ) : null}

        {result ? (
          <SurveyResults response={result} onNewSurvey={handleNewSurvey} />
        ) : null}
      </div>
    </main>
  );
}