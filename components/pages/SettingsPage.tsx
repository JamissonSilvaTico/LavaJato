
import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface SettingsPageProps {
  getStoredPassword: (role: 'admin' | 'funcionario') => string;
  setStoredPassword: (role: 'admin' | 'funcionario', newPass: string) => void;
}

const PasswordForm: React.FC<{ title: string; onSave: (pass: string) => void }> = ({ title, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (newPassword.length < 4) {
             setMessage({ type: 'error', text: 'A senha deve ter pelo menos 4 caracteres.' });
             return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não conferem.' });
            return;
        }
        onSave(newPassword);
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <Card title={title}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`new-pass-${title}`}>
                        Nova Senha
                    </label>
                    <input
                        id={`new-pass-${title}`}
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                 <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`confirm-pass-${title}`}>
                        Confirmar Nova Senha
                    </label>
                    <input
                        id={`confirm-pass-${title}`}
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    />
                </div>
                {message && (
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </p>
                )}
                <div className="flex justify-end">
                    <Button type="submit">Salvar Alterações</Button>
                </div>
            </form>
        </Card>
    );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ getStoredPassword, setStoredPassword }) => {
  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Configurações de Segurança</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <PasswordForm 
                title="Alterar Senha do Administrador" 
                onSave={(newPass) => setStoredPassword('admin', newPass)} 
            />
             <PasswordForm 
                title="Alterar Senha do Funcionário" 
                onSave={(newPass) => setStoredPassword('funcionario', newPass)}
            />
        </div>
    </div>
  );
};

export default SettingsPage;
