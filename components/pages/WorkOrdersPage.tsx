import React, { useEffect, useState } from 'react';
import { WorkOrder, WorkOrderStatus, Customer, UserRole, Service } from '../../types';
import { getWorkOrders, getCustomers, getServices, addWorkOrder, updateWorkOrder, deleteWorkOrder } from '../../services/apiService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ICONS } from '../../constants';

const getStatusClass = (status: WorkOrderStatus) => {
    switch (status) {
        case WorkOrderStatus.Waiting:
            return 'bg-gray-200 text-gray-800';
        case WorkOrderStatus.InProgress:
            return 'bg-blue-200 text-blue-800';
        case WorkOrderStatus.Finished:
            return 'bg-yellow-200 text-yellow-800';
        case WorkOrderStatus.Delivered:
            return 'bg-green-200 text-green-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
}

interface WorkOrdersPageProps {
    currentUserRole: UserRole;
}

const WorkOrdersPage: React.FC<WorkOrdersPageProps> = ({ currentUserRole }) => {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [orders, customerData, servicesData] = await Promise.all([getWorkOrders(), getCustomers(), getServices()]);
                setWorkOrders(orders);
                setCustomers(customerData);
                setServices(servicesData);
            } catch (error) {
                console.error("Failed to fetch work orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const getCustomerName = (customerId: number) => {
        return customers.find(c => c.id === customerId)?.name || 'Cliente Desconhecido';
    }

    const handleEdit = async (wo: WorkOrder) => {
        const newStatus = prompt(`Novo status para OS #${wo.id}:`, wo.status);
        if (newStatus && Object.values(WorkOrderStatus).includes(newStatus as WorkOrderStatus)) {
            try {
                const updated = await updateWorkOrder(wo.id, { status: newStatus as WorkOrderStatus });
                setWorkOrders(prev => prev.map(order => order.id === wo.id ? updated : order));
                alert("Ordem de serviço atualizada!");
            } catch (error) {
                alert("Erro ao atualizar ordem de serviço.");
            }
        } else if (newStatus) {
            alert("Status inválido. Use um dos seguintes: " + Object.values(WorkOrderStatus).join(', '));
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
            try {
                await deleteWorkOrder(id);
                setWorkOrders(prev => prev.filter(wo => wo.id !== id));
                alert("Ordem de serviço excluída!");
            } catch (error) {
                alert("Erro ao excluir ordem de serviço.");
            }
        }
    };

    const handleAdd = async () => {
        const customerIdStr = prompt("ID do Cliente:");
        const serviceIdStr = prompt("ID do Serviço:");
        const customerId = parseInt(customerIdStr || '');
        const serviceId = parseInt(serviceIdStr || '');
    
        const customer = customers.find(c => c.id === customerId);
        const service = services.find(s => s.id === serviceId);
    
        if (customer && service) {
            try {
                const newWorkOrderData: Omit<WorkOrder, 'id'> = {
                    customerId: customer.id,
                    vehicleId: customer.vehicles[0].id,
                    services: [service],
                    status: WorkOrderStatus.Waiting,
                    checkinTime: new Date().toISOString(),
                    total: service.price,
                    isPaid: false,
                };
                const newWorkOrder = await addWorkOrder(newWorkOrderData);
                setWorkOrders(prev => [...prev, newWorkOrder]);
                alert("Nova ordem de serviço criada!");
            } catch (error) {
                alert("Erro ao criar ordem de serviço.");
            }
        } else {
            alert("Cliente ou Serviço não encontrado. Verifique os IDs.");
        }
    };

    if (loading) return <div>Carregando ordens de serviço...</div>;

    return (
        <Card title="Ordens de Serviço" action={currentUserRole === 'admin' && <Button onClick={handleAdd}>{ICONS.plus} Nova OS</Button>}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">OS #</th>
                            <th scope="col" className="px-6 py-3">Cliente</th>
                            <th scope="col" className="px-6 py-3">Serviços</th>
                            <th scope="col" className="px-6 py-3">Total</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workOrders.map(wo => (
                            <tr key={wo.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{wo.id}</td>
                                <td className="px-6 py-4">{getCustomerName(wo.customerId)}</td>
                                <td className="px-6 py-4">{wo.services.map(s => s.name).join(', ')}</td>
                                <td className="px-6 py-4">R$ {wo.total.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(wo.status)}`}>
                                        {wo.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" className="py-1 px-3 text-sm">Detalhes</Button>
                                        {currentUserRole === 'admin' && (
                                            <>
                                                <Button onClick={() => handleEdit(wo)} variant="secondary" className="py-1 px-3 text-sm">Editar</Button>
                                                <Button onClick={() => handleDelete(wo.id)} variant="danger" className="py-1 px-3 text-sm">Excluir</Button>
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

export default WorkOrdersPage;