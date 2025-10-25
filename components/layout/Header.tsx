
import React from 'react';
import { ICONS } from '../../constants';
import { UserRole } from '../../types';
import Button from '../ui/Button';

interface HeaderProps {
    toggleSidebar: () => void;
    currentUserRole: UserRole;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, currentUserRole, onLogout }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
      <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none md:hidden">
        {ICONS.menu}
      </button>
      <h2 className="text-xl font-semibold text-gray-700 hidden md:block">Bem-vindo ao seu painel!</h2>
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-4">
          <div className="flex items-center text-sm">
            <img 
              className="w-8 h-8 rounded-full object-cover" 
              src="https://picsum.photos/100" 
              alt="User avatar" 
            />
            <span className="hidden md:inline-block ml-2 text-gray-600">
                Perfil: <span className="font-semibold capitalize">{currentUserRole}</span>
            </span>
          </div>
          <Button onClick={onLogout} variant="secondary" className="py-1 px-3 text-sm">Sair</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
