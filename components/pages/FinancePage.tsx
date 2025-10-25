import React, { useEffect, useState } from 'react';
import { Expense } from '../../types';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../../services/apiService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ICONS } from '../../constants';

const FinancePage: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getExpenses()
            .then(data => setExpenses(data))
            .catch(err => console.error("Failed to fetch expenses:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = async (expense: Expense) => {
        const description = prompt("Nova descrição:", expense.description);
        const amountStr = prompt("Novo valor:", expense.amount.toString());
        const amount = parseFloat(amountStr || '');

        if (description && !isNaN(amount)) {
            try {
                const updated = await updateExpense(expense.id, { description, amount });
                setExpenses(prev => prev.map(e => e.id === expense.id ? updated : e));
                alert("Despesa atualizada!");
            } catch (error) {
                alert("Erro ao atualizar despesa.");
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
            try {
                await deleteExpense(id);
                setExpenses(prev => prev.filter(expense => expense.id !== id));
                alert("Despesa excluída!");
            } catch (error) {
                alert("Erro ao excluir despesa.");
            }
        }
    };
    
    const handleAdd = async () => {
        const description = prompt("Descrição da despesa:");
        const category = prompt("Categoria (Produtos, Salários, Aluguel, Marketing, Outros):") as Expense['category'];
        const amountStr = prompt("Valor da despesa:");
        const date = new Date().toISOString().split('T')[0]; // Today's date YYYY-MM-DD
        const amount = parseFloat(amountStr || '');

        if (description && category && !isNaN(amount)) {
             if(!['Produtos', 'Salários', 'Aluguel', 'Marketing', 'Outros'].includes(category)){
                alert("Categoria inválida.");
                return;
            }
            try {
                const newExpense = await addExpense({ description, category, amount, date });
                setExpenses(prev => [...prev, newExpense]);
                alert("Despesa adicionada!");
            } catch(error) {
                alert("Erro ao adicionar despesa.");
            }
        } else {
            alert("Descrição, categoria e valor são obrigatórios.");
        }
    };

    if (loading) return <div>Carregando dados financeiros...</div>;

    return (
        <div className="space-y-6">
             <Card title="Relatório de Despesas" action={<Button onClick={handleAdd}>{ICONS.plus} Nova Despesa</Button>}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Descrição</th>
                                <th scope="col" className="px-6 py-3">Categoria</th>
                                <th scope="col" className="px-6 py-3">Valor</th>
                                <th scope="col" className="px-6 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                <tr key={expense.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{expense.description}</td>
                                    <td className="px-6 py-4">{expense.category}</td>
                                    <td className="px-6 py-4 text-red-600 font-semibold">- R$ {expense.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Button onClick={() => handleEdit(expense)} variant="secondary" className="py-1 px-3 text-sm">
                                                Editar
                                            </Button>
                                            <Button onClick={() => handleDelete(expense.id)} variant="danger" className="py-1 px-3 text-sm">
                                                Excluir
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FinancePage;