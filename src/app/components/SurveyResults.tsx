'use client';

import React from 'react';
import { SurveyResponse } from '../types';

interface SurveyResultsProps {
  response: SurveyResponse;
  onNewSurvey: () => void;
}

export default function SurveyResults({ response, onNewSurvey }: SurveyResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 25) return 'text-green-600 bg-green-100';
    if (score >= 20) return 'text-yellow-600 bg-yellow-100';
    if (score >= 15) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 25) return 'Excelente';
    if (score >= 20) return 'Bom';
    if (score >= 15) return 'Regular';
    return 'Precisa melhorar';
  };

  const getScorePercentage = (score: number) => {
    return Math.round((score / 30) * 100);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Resultados da Pesquisa
          </h2>
          <p className="text-slate-300">
            Obrigado por participar da nossa pesquisa de ambiente corporativo!
          </p>
        </div>

        {/* Score Summary */}
        <div className="mb-8">
          <div className="bg-slate-700 rounded-xl p-6 border border-slate-600">
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold mb-4 ${getScoreColor(response.totalScore)}`}>
                {getScoreLabel(response.totalScore)}
              </div>
              <div className="text-4xl font-bold text-slate-100 mb-2">
                {response.totalScore}/30
              </div>
              <div className="text-slate-300 mb-4">
                {getScorePercentage(response.totalScore)}% de satisfação
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-600 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    response.totalScore >= 25 ? 'bg-green-500' :
                    response.totalScore >= 20 ? 'bg-yellow-500' :
                    response.totalScore >= 15 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${getScorePercentage(response.totalScore)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-slate-100 mb-4">
            Detalhamento das Respostas
          </h3>
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              As respostas detalhadas serão exibidas quando a API retornar os dados completos.
            </p>
          </div>
        </div>

        {/* Feedback */}
        <div className="mb-8">
          <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
            <h4 className="font-semibold text-blue-100 mb-2">
              Sua opinião é importante para nós!
            </h4>
            <p className="text-blue-200 text-sm">
              {response.totalScore >= 25 
                ? "Ficamos muito felizes com sua avaliação! Continuaremos trabalhando para manter esse excelente ambiente corporativo."
                : response.totalScore >= 20
                ? "Obrigado pelo feedback positivo! Estamos sempre buscando melhorar o ambiente de trabalho."
                : response.totalScore >= 15
                ? "Agradecemos sua participação. Vamos analisar seus comentários para melhorar o ambiente corporativo."
                : "Sua opinião é muito valiosa. Vamos trabalhar para melhorar significativamente o ambiente de trabalho."
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onNewSurvey}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nova Pesquisa
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
          >
            Imprimir Resultados
          </button>
        </div>

        {/* Completion Info */}
        <div className="mt-6 text-center text-sm text-slate-400">
          Pesquisa concluída em {new Date(response.completedAt).toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}
