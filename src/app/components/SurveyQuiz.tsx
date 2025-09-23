'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '../types';

const scaleLabels = [
  "Discordo completamente",
  "Discordo",
  "Concordo",
  "Concordo completamente"
];

interface SurveyQuizProps {
  onComplete: (responses: { questionId: number; score: number }[]) => void;
}

export default function SurveyQuiz({ onComplete }: SurveyQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{ questionId: number; score: number }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar perguntas do banco de dados
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        if (response.ok) {
          const questionsData = await response.json();
          setQuestions(questionsData);
          // Inicializar respostas com -1 para cada pergunta
          setResponses(questionsData.map((q: Question) => ({ questionId: q.id, score: -1 })));
        }
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = { ...newResponses[currentQuestion], score: value };
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
      onComplete(responses);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const canProceed = responses[currentQuestion]?.score !== -1;
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-300">Carregando perguntas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="text-center py-12">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Pesquisa Concluída!</h2>
          <p className="text-slate-300">Obrigado por participar da nossa pesquisa de ambiente corporativo.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          <div className="text-center py-12">
            <p className="text-slate-300">Erro ao carregar perguntas. Tente novamente.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-300">
              Pergunta {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-slate-300">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="mb-4">
            <span className="inline-block bg-blue-900 text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {currentQ.category}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            {currentQ.text}
          </h2>
        </div>

        {/* Response Scale */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {scaleLabels.map((label, index) => (
              <button
                key={index}
                onClick={() => handleResponse(index)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  responses[currentQuestion]?.score === index
                    ? 'border-blue-500 bg-blue-900 text-blue-100'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <div className="text-2xl font-bold mb-2">{index}</div>
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
          </button>
        </div>
      </div>
    </div>
  );
}
