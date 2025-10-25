
import React from 'react';
import { Page, UserRole } from '../../types';
import { ICONS } from '../../constants';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  currentUserRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setOpen, currentUserRole }) => {
  const navItems: { id: Page; name: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'dashboard', name: 'Dashboard', icon: ICONS.dashboard },
    { id: 'customers', name: 'Clientes', icon: ICONS.customers },
    { id: 'work-orders', name: 'Ordens de Serviço', icon: ICONS.workOrders },
    { id: 'services', name: 'Serviços', icon: ICONS.services },
    { id: 'inventory', name: 'Estoque', icon: ICONS.inventory },
    { id: 'finance', name: 'Financeiro', icon: ICONS.finance, adminOnly: true },
    { id: 'settings', name: 'Configurações', icon: ICONS.settings, adminOnly: true },
  ];

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    if(window.innerWidth < 768) {
      setOpen(false);
    }
  }

  const visibleNavItems = navItems.filter(item => 
    !item.adminOnly || currentUserRole === 'admin'
  );


  return (
    <>
      <div className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setOpen(false)}></div>
      <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-brand-dark text-white flex-shrink-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-brand-blue">{ICONS.car}</span>
            SGLJ
          </h1>
           <button onClick={() => setOpen(false)} className="md:hidden text-white p-1 rounded-full hover:bg-gray-700">
                {ICONS.close}
           </button>
        </div>
        <nav className="mt-6 flex-1">
          <ul>
            {visibleNavItems.map((item) => (
              <li key={item.id} className="px-4 mb-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.id);
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    currentPage === item.id
                      ? 'bg-brand-blue text-white'
                      : 'text-gray-300 hover:bg-brand-secondary hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-700 text-center text-xs text-gray-400">
            <p>&copy; 2024 SGLJ. Todos os direitos reservados.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
