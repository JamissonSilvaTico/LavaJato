import React, { useEffect, useState } from 'react';
import { Product, UserRole } from '../../types';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/apiService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ICONS } from '../../constants';

interface InventoryPageProps {
    currentUserRole: UserRole;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ currentUserRole }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getProducts()
            .then(data => setProducts(data))
            .catch(err => console.error("Failed to fetch products:", err))
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = async (product: Product) => {
        const stockStr = prompt(`Novo estoque para ${product.name}:`, product.stock.toString());
        const stock = parseFloat(stockStr || '');
        if (!isNaN(stock)) {
            try {
                const updated = await updateProduct(product.id, { stock });
                setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
                alert("Estoque atualizado!");
            } catch (error) {
                alert("Erro ao atualizar estoque.");
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await deleteProduct(id);
                setProducts(prev => prev.filter(product => product.id !== id));
                alert("Produto excluído!");
            } catch (error) {
                alert("Erro ao excluir produto.");
            }
        }
    };

    const handleAdd = async () => {
        const name = prompt("Nome do produto:");
        const supplier = prompt("Fornecedor:");
        const costStr = prompt("Custo unitário:");
        const stockStr = prompt("Estoque inicial:");
        const minStockStr = prompt("Estoque mínimo:");

        const cost = parseFloat(costStr || '');
        const stock = parseFloat(stockStr || '');
        const minStock = parseFloat(minStockStr || '');

        if(name && supplier && !isNaN(cost) && !isNaN(stock) && !isNaN(minStock)) {
            try {
                const newProduct = await addProduct({ name, supplier, cost, stock, minStock });
                setProducts(prev => [...prev, newProduct]);
                alert("Produto adicionado com sucesso!");
            } catch(error) {
                alert("Erro ao adicionar produto.");
            }
        } else {
            alert("Todos os campos são obrigatórios e devem ser números válidos.");
        }
    };
    
    if (loading) return <div>Carregando estoque...</div>;

    return (
        <Card title="Controle de Estoque" action={currentUserRole === 'admin' && <Button onClick={handleAdd}>{ICONS.plus} Novo Produto</Button>}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Produto</th>
                            <th scope="col" className="px-6 py-3">Fornecedor</th>
                            <th scope="col" className="px-6 py-3">Custo Unit.</th>
                            <th scope="col" className="px-6 py-3">Estoque Atual</th>
                            <th scope="col" className="px-6 py-3">Estoque Mín.</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            {currentUserRole === 'admin' && <th scope="col" className="px-6 py-3">Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const isLowStock = product.stock < product.minStock;
                            return (
                                <tr key={product.id} className={`bg-white border-b hover:bg-gray-50 ${isLowStock ? 'bg-red-50' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4">{product.supplier}</td>
                                    <td className="px-6 py-4">R$ {product.cost.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-bold">{product.stock.toFixed(2)}</td>
                                    <td className="px-6 py-4">{product.minStock.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        {isLowStock ? (
                                            <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-200 rounded-full">Baixo</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-200 rounded-full">OK</span>
                                        )}
                                    </td>
                                    {currentUserRole === 'admin' && (
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Button onClick={() => handleEdit(product)} variant="secondary" className="py-1 px-3 text-sm">
                                                    Editar
                                                </Button>
                                                <Button onClick={() => handleDelete(product.id)} variant="danger" className="py-1 px-3 text-sm">
                                                    Excluir
                                                </Button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default InventoryPage;