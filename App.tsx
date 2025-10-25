
import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './components/pages/DashboardPage';
import CustomersPage from './components/pages/CustomersPage';
import WorkOrdersPage from './components/pages/WorkOrdersPage';
import ServicesPage from './components/pages/ServicesPage';
import FinancePage from './components/pages/FinancePage';
import InventoryPage from './components/pages/InventoryPage';
import SettingsPage from './components/pages/SettingsPage';
import LoginPage from './components/pages/LoginPage';
import { Page, UserRole } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [authenticatedRole, setAuthenticatedRole] = useState<UserRole | null>(null);

  // Initialize passwords in localStorage if they don't exist
  useEffect(() => {
    if (!localStorage.getItem('admin-password')) {
      localStorage.setItem('admin-password', 'comamor');
    }
    if (!localStorage.getItem('funcionario-password')) {
      localStorage.setItem('funcionario-password', 'lavajato');
    }

    // Check for a logged-in user in session storage
    const storedRole = sessionStorage.getItem('userRole') as UserRole;
    if (storedRole) {
      setAuthenticatedRole(storedRole);
    }
  }, []);

  const getStoredPassword = (role: 'admin' | 'funcionario'): string => {
    return localStorage.getItem(`${role}-password`) || '';
  };

  const setStoredPassword = (role: 'admin' | 'funcionario', newPass: string) => {
    localStorage.setItem(`${role}-password`, newPass);
  };

  const handleLogin = (role: UserRole) => {
    setAuthenticatedRole(role);
    sessionStorage.setItem('userRole', role);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setAuthenticatedRole(null);
    sessionStorage.removeItem('userRole');
  };

  if (!authenticatedRole) {
    return <LoginPage onLogin={handleLogin} getStoredPassword={getStoredPassword} />;
  }

  const renderPage = () => {
    const pageProps = { currentUserRole: authenticatedRole };

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage {...pageProps} />;
      case 'customers':
        return <CustomersPage {...pageProps} />;
      case 'work-orders':
        return <WorkOrdersPage {...pageProps} />;
      case 'services':
        return <ServicesPage {...pageProps} />;
      case 'inventory':
        return <InventoryPage {...pageProps} />;
      case 'finance':
        if (authenticatedRole !== 'admin') {
            return (
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600">Acesso Negado</h2>
                    <p className="mt-2 text-gray-600">Você não tem permissão para visualizar esta página.</p>
                </div>
            );
        }
        return <FinancePage />;
      case 'settings':
         if (authenticatedRole !== 'admin') {
            return (
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-red-600">Acesso Negado</h2>
                    <p className="mt-2 text-gray-600">Você não tem permissão para visualizar esta página.</p>
                </div>
            );
        }
        return <SettingsPage getStoredPassword={getStoredPassword} setStoredPassword={setStoredPassword} />;
      default:
        return <DashboardPage {...pageProps}/>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isOpen={isSidebarOpen} 
        setOpen={setSidebarOpen}
        currentUserRole={authenticatedRole}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
            currentUserRole={authenticatedRole}
            onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
