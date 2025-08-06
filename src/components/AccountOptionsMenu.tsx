import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Account } from '../types';

interface AccountOptionsMenuProps {
  account: Account;
  onEdit: () => void;
  onDelete: () => void;
  onViewTransactions: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AccountOptionsMenu: React.FC<AccountOptionsMenuProps> = ({
  account,
  onEdit,
  onDelete,
  onViewTransactions,
  isOpen,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    {
      icon: Eye,
      label: 'View Transactions',
      onClick: () => {
        onViewTransactions();
        onClose();
      },
      className: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
    },
    {
      icon: Edit,
      label: 'Edit Account',
      onClick: () => {
        onEdit();
        onClose();
      },
      className: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
    },
    {
      icon: Trash2,
      label: 'Delete Account',
      onClick: () => {
        onDelete();
        onClose();
      },
      className: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
    }
  ];

  console.log('AccountOptionsMenu rendering with', menuItems.length, 'items');
  console.log('Menu items:', menuItems.map(item => item.label));

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[9999]"
      style={{ minHeight: '120px' }}
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        console.log('Rendering menu item:', item.label);
        return (
          <button
            key={index}
            onClick={item.onClick}
            className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${item.className}`}
          >
            <Icon className="h-4 w-4 mr-3" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};
