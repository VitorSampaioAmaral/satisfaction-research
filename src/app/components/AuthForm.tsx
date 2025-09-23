'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

export default function AuthForm({ mode, onToggleMode }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let success = false;
      
      if (mode === 'login') {
        success = await login(formData.email, formData.password);
        if (!success) {
          setError('Email ou senha incorretos');
        }
      } else {
        if (!formData.name.trim()) {
          setError('Nome é obrigatório');
          return;
        }
        success = await register(formData.name, formData.email, formData.password);
        if (!success) {
          setError('Email já está em uso');
        }
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">
            {mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </h1>
          <p className="text-slate-300">
            {mode === 'login' 
              ? 'Acesse sua conta para continuar' 
              : 'Crie sua conta para começar'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                Nome completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400"
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors placeholder-slate-400"
              placeholder="Sua senha"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Carregando...' : (mode === 'login' ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-300">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            <button
              type="button"
              onClick={onToggleMode}
              className="ml-2 text-blue-400 hover:text-blue-300 font-medium"
            >
              {mode === 'login' ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
