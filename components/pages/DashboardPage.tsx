
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../ui/Card';
import { getDashboardData, getFinancialChartData } from '../../services/apiService';
import { ICONS } from '../../constants';
import { UserRole } from '../../types';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  activeWorkOrders: number;
  totalCustomers: number;
}

interface FinancialData {
    name: string;
    Receitas: number;
    Custos: number;
}

interface DashboardPageProps {
    currentUserRole: UserRole;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <Card className="flex items-center p-4">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
    </Card>
);


const DashboardPage: React.FC<DashboardPageProps> = ({ currentUserRole }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [financialData, setFinancialData] = useState<FinancialData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, financialChartData] = await Promise.all([
                    getDashboardData(),
                    getFinancialChartData()
                ]);
                setStats(statsData);
                setFinancialData(financialChartData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full">Carregando...</div>;
    }

    if (!stats) {
        return <div className="text-center text-red-500">Falha ao carregar os dados.</div>;
    }

    const expenseCategories = [
        { name: 'Produtos', value: 400, color: '#0088FE' },
        { name: 'Salários', value: 300, color: '#00C49F' },
        { name: 'Aluguel', value: 300, color: '#FFBB28' },
        { name: 'Outros', value: 200, color: '#FF8042' },
    ];


  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {currentUserRole === 'admin' && (
                <>
                    <StatCard title="Receita Total" value={`R$ ${stats.totalRevenue.toFixed(2)}`} icon={ICONS.finance} color="bg-green-100 text-green-600" />
                    <StatCard title="Custos Totais" value={`R$ ${stats.totalExpenses.toFixed(2)}`} icon={ICONS.finance} color="bg-red-100 text-red-600" />
                </>
            )}
            <StatCard title="Ordens Ativas" value={stats.activeWorkOrders} icon={ICONS.workOrders} color="bg-yellow-100 text-yellow-600" />
            <StatCard title="Total de Clientes" value={stats.totalCustomers} icon={ICONS.customers} color="bg-blue-100 text-blue-600" />
        </div>

        {currentUserRole === 'admin' && (
          <>
            <Card title="Visão Geral Financeira (Mensal)">
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`}/>
                    <Legend />
                    <Bar dataKey="Receitas" fill="#22c55e" />
                    <Bar dataKey="Custos" fill="#ef4444" />
                </BarChart>
                </ResponsiveContainer>
            </Card>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card title="Despesas por Categoria">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {expenseCategories.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Serviços Mais Vendidos">
                    {/* Placeholder for top services */}
                    <ul className="space-y-3">
                        <li className="flex justify-between"><span>Lavagem Completa</span> <span className="font-semibold">120</span></li>
                        <li className="flex justify-between"><span>Lavagem Simples</span> <span className="font-semibold">95</span></li>
                        <li className="flex justify-between"><span>Polimento Básico</span> <span className="font-semibold">40</span></li>
                    </ul>
                </Card>
            </div>
          </>
        )}
    </div>
  );
};

export default DashboardPage;
