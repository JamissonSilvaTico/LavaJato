
import React, { useState } from 'react';
import { UserRole } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { ICONS } from '../../constants';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
  getStoredPassword: (role: 'admin' | 'funcionario') => string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, getStoredPassword }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const adminPassword = getStoredPassword('admin');
    const funcionarioPassword = getStoredPassword('funcionario');

    if (username.toLowerCase() === 'admin' && password === adminPassword) {
      onLogin('admin');
    } else if (username.toLowerCase() === 'funcionario' && password === funcionarioPassword) {
      onLogin('funcionario');
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-2xl">
          <div className="text-center p-6">
            <div className="flex justify-center items-center gap-2 mb-4">
               <span className="text-brand-blue text-3xl">{ICONS.car}</span>
               <h1 className="text-3xl font-bold text-brand-dark">SGLJ</h1>
            </div>
            <h2 className="text-xl text-gray-600 mb-6">Acesse seu painel</h2>
          </div>
          <form onSubmit={handleLogin} className="p-6 pt-0">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-blue"
                placeholder="admin ou funcionario"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-brand-blue"
                placeholder="********"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
            <div className="flex items-center justify-center">
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
