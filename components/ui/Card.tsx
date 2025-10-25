
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
        {(title || action) && (
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
                {action && <div>{action}</div>}
            </div>
        )}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
