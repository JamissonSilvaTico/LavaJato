import React, { useEffect, useState } from 'react';
import { Customer, Service, WorkOrder, UserRole } from '../../types';
import { getCustomers, getServices, addCustomer, updateCustomer, deleteCustomer } from '../../services/apiService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ICONS } from '../../constants';

interface CustomersPageProps {
    currentUserRole: UserRole;
}

const LoyaltyStatus: React.FC<{ customer: Customer; services: Service[] }> = ({ customer, services }) => {
    const WASH_SERVICE_NAME = 'Lavagem Simples';
    const REWARD_SERVICE_NAME = 'Polimento de Fidelidade';
    const GOAL = 10;
    
    const lavagemService = services.find(s => s.name === WASH_SERVICE_NAME);
    const rewardService = services.find(s => s.name === REWARD_SERVICE_NAME);

    if (!lavagemService || !rewardService) {
        return <div className="text-red-500">Serviços de lavagem/recompensa não configurados.</div>;
    }

    const paidWashes = customer.serviceHistory.filter(wo => 
        wo.isPaid && wo.services.some(s => s.id === lavagemService.id) && wo.total > 0
    );

    const rewardRedemptions = customer.serviceHistory.filter(wo =>
        wo.services.some(s => s.id === rewardService.id)
    ).length;

    const washCountSinceLastReward = (paidWashes.length - (rewardRedemptions * GOAL)) % GOAL;
    const progress = (washCountSinceLastReward / GOAL) * 100;
    const hasReward = washCountSinceLastReward >= GOAL;
    const washesToGo = GOAL - washCountSinceLastReward;

    return (
        <Card title="Programa de Fidelidade" className="bg-brand-blue-light border-brand-blue border">
            {hasReward ? (
                 <div className="text-center">
                    <div className="text-green-600 text-5xl mb-4 animate-bounce">{ICONS.gift}</div>
                    <h4 className="text-xl font-bold text-green-700">Recompensa Disponível!</h4>
                    <p className="text-gray-600 mt-2">O cliente ganhou um <strong>{rewardService.name}</strong> grátis!</p>
                    <p className="text-sm text-gray-500">Avise no checkout para resgatar.</p>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-brand-dark">Progresso para Próxima Recompensa</span>
                        <span className="font-bold text-brand-blue">{washCountSinceLastReward}/{GOAL}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-brand-blue h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-center mt-3 text-sm text-gray-600">
                        Faltam <strong>{washesToGo}</strong> lavagens para ganhar um <strong>{rewardService.name}</strong> grátis.
                    </p>
                </div>
            )}
        </Card>
    );
};


const CustomerDetails: React.FC<{ customer: Customer; services: Service[]; onBack: () => void }> = ({ customer, services, onBack }) => {
    return (
        <div className="space-y-4">
            <Button onClick={onBack} variant="secondary">Voltar para a Lista</Button>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-4">
                        <h3 className="text-2xl font-bold text-brand-dark">{customer.name}</h3>
                        <p><strong>Email:</strong> {customer.email}</p>
                        <p><strong>Telefone:</strong> {customer.phone}</p>
                        <p><strong>Aniversário:</strong> {new Date(customer.birthday).toLocaleDateString('pt-BR')}</p>
                        
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Veículos:</h4>
                            {customer.vehicles.map(v => (
                                <div key={v.id} className="p-3 bg-gray-100 rounded-lg">
                                    <p className="font-bold">{v.plate}</p>
                                    <p className="text-sm text-gray-600">{v.model} - {v.color}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
                         <LoyaltyStatus customer={customer} services={services} />
                    </div>
                </div>
            </Card>

            <Card title="Histórico de Serviços">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Data</th>
                                <th scope="col" className="px-6 py-3">Serviços</th>
                                <th scope="col" className="px-6 py-3">Total</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customer.serviceHistory.slice(0, 5).map(wo => (
                                <tr key={wo.id} className="bg-white border-b">
                                    <td className="px-6 py-4">{new Date(wo.checkinTime).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4">{wo.services.map(s => s.name).join(', ')}</td>
                                    <td className="px-6 py-4">R$ {wo.total.toFixed(2)}</td>
                                    <td className="px-6 py-4">{wo.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

const CustomersPage: React.FC<CustomersPageProps> = ({ currentUserRole }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetData = async () => {
    setLoading(true);
    try {
        const [customersData, servicesData] = await Promise.all([
            getCustomers(),
            getServices()
        ]);
        setCustomers(customersData);
        setAllServices(servicesData);
    } catch (error) {
        console.error("Failed to fetch customers data:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetData();
  }, []);
  
  const handleEdit = async (customer: Customer) => {
    const name = prompt("Novo nome do cliente:", customer.name);
    const phone = prompt("Novo telefone do cliente:", customer.phone);
    if (name && phone) {
      try {
        const updated = await updateCustomer(customer.id, { name, phone });
        setCustomers(prev => prev.map(c => c.id === customer.id ? updated : c));
        alert("Cliente atualizado com sucesso!");
      } catch (error) {
        alert("Erro ao atualizar cliente.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente? Isso removerá também suas ordens de serviço.')) {
        try {
            await deleteCustomer(id);
            setCustomers(prev => prev.filter(c => c.id !== id));
            alert("Cliente excluído com sucesso!");
        } catch(error) {
            alert("Erro ao excluir cliente.");
        }
    }
  };

  const handleAdd = async () => {
    const name = prompt("Nome do cliente:");
    const phone = prompt("Telefone:");
    const email = prompt("Email:");
    const birthday = prompt("Data de Nascimento (YYYY-MM-DD):");
    const plate = prompt("Placa do veículo:");
    const model = prompt("Modelo do veículo:");
    const color = prompt("Cor do veículo:");

    if (name && phone && email && birthday && plate && model && color) {
        try {
            const newCustomer = await addCustomer({ 
                name, phone, email, birthday, 
                vehicles: [{ plate, model, color }]
            });
            setCustomers(prev => [...prev, newCustomer]);
            alert("Cliente adicionado com sucesso!");
        } catch(error) {
            alert("Erro ao adicionar cliente.");
        }
    }
  };

  if (loading) return <div>Carregando clientes...</div>;

  if (selectedCustomer) {
    return <CustomerDetails customer={selectedCustomer} services={allServices} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <Card title="Lista de Clientes" action={currentUserRole === 'admin' && <Button onClick={handleAdd}>{ICONS.plus} Novo Cliente</Button>}>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Nome</th>
                        <th scope="col" className="px-6 py-3">Telefone</th>
                        <th scope="col" className="px-6 py-3">Veículo Principal</th>
                        <th scope="col" className="px-6 py-3">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(customer => (
                        <tr key={customer.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                            <td className="px-6 py-4">{customer.phone}</td>
                            <td className="px-6 py-4">{customer.vehicles[0]?.model || 'N/A'} ({customer.vehicles[0]?.plate || 'N/A'})</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <Button onClick={() => setSelectedCustomer(customer)} variant="secondary" className="py-1 px-3 text-sm">Detalhes</Button>
                                    {currentUserRole === 'admin' && (
                                      <>
                                        <Button onClick={() => handleEdit(customer)} variant="secondary" className="py-1 px-3 text-sm">Editar</Button>
                                        <Button onClick={() => handleDelete(customer.id)} variant="danger" className="py-1 px-3 text-sm">Excluir</Button>
                                      </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
  );
};

export default CustomersPage;