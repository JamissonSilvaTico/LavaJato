import React, { useEffect, useState } from 'react';
import { Service, UserRole } from '../../types';
import { getServices, addService, updateService, deleteService } from '../../services/apiService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ICONS } from '../../constants';

interface ServicesPageProps {
    currentUserRole: UserRole;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ currentUserRole }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getServices()
            .then(data => setServices(data))
            .catch(err => console.error("Failed to fetch services:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
            try {
                await deleteService(id);
                setServices(prev => prev.filter(service => service.id !== id));
                alert('Serviço excluído com sucesso!');
            } catch (error) {
                alert('Erro ao excluir serviço.');
            }
        }
    };
    
    const handleEdit = async (service: Service) => {
        const name = prompt("Novo nome do serviço:", service.name);
        const priceStr = prompt("Novo preço:", service.price.toString());
        const price = parseFloat(priceStr || '');

        if (name && !isNaN(price)) {
            try {
                const updated = await updateService(service.id, { name, price });
                setServices(prev => prev.map(s => s.id === service.id ? updated : s));
                alert('Serviço atualizado com sucesso!');
            } catch (error) {
                alert('Erro ao atualizar serviço.');
            }
        }
    };

    const handleAdd = async () => {
        const name = prompt("Nome do novo serviço:");
        const priceStr = prompt("Preço do serviço:");
        const price = parseFloat(priceStr || '');

        if (name && !isNaN(price)) {
            try {
                const newService = await addService({ name, price, productsConsumed: [] }); // Simple version
                setServices(prev => [...prev, newService]);
                alert('Serviço adicionado com sucesso!');
            } catch (error) {
                alert('Erro ao adicionar serviço.');
            }
        } else {
            alert('Nome e preço são obrigatórios.');
        }
    };

    if (loading) return <div>Carregando serviços...</div>;

    return (
        <Card title="Catálogo de Serviços" action={currentUserRole === 'admin' && <Button onClick={handleAdd}>{ICONS.plus} Novo Serviço</Button>}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome do Serviço</th>
                            <th scope="col" className="px-6 py-3">Preço</th>
                            {currentUserRole === 'admin' && <th scope="col" className="px-6 py-3">Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{service.name}</td>
                                <td className="px-6 py-4">R$ {service.price.toFixed(2)}</td>
                                {currentUserRole === 'admin' && (
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Button onClick={() => handleEdit(service)} variant="secondary" className="py-1 px-3 text-sm">Editar</Button>
                                            <Button onClick={() => handleDelete(service.id)} variant="danger" className="py-1 px-3 text-sm">Excluir</Button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ServicesPage;