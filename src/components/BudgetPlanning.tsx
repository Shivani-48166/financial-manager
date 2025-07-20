import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Budget } from '../types';
import { AddBudgetModal } from './AddBudgetModal';

export const BudgetPlanning: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const getBudgetProgress = (budget: Budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    return Math.min(percentage, 100);
  };

  const getBudgetStatus = (budget: Budget) => {
    const percentage = getBudgetProgress(budget);
    if (percentage >= 100) return 'exceeded';
    if (percentage >= budget.alertThreshold) return 'warning';
    return 'good';
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setShowAddBudget(true);
  };

  const handleDeleteBudget = (budgetId: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
    }
  };

  return (
    <div className="p-2 lg:p-6">
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Budget Planning
        </h2>
        <button
          onClick={() => setShowAddBudget(true)}
          className="mt-4 sm:mt-0 btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </button>
      </div>

      <div className="grid gap-4">
        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Plus className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Budgets Created Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first budget to start tracking your spending by category.
            </p>
            <button
              onClick={() => setShowAddBudget(true)}
              className="btn-primary text-sm sm:text-base py-2 sm:py-2 px-3 sm:px-4"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Budget</span>
            </button>
          </div>
        ) : (
          budgets.map((budget) => {
            const progress = getBudgetProgress(budget);
            const status = getBudgetStatus(budget);
            
            return (
              <div key={budget.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {budget.categoryId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {budget.period} budget
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {status === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    {status === 'exceeded' && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>${budget.spent.toFixed(2)} spent</span>
                    <span>${budget.amount.toFixed(2)} budget</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'exceeded' ? 'bg-red-500' :
                        status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    status === 'exceeded' ? 'text-red-600' :
                    status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {progress.toFixed(1)}% used
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditBudget(budget)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Budget Modal */}
      {showAddBudget && (
        <AddBudgetModal 
          budget={editingBudget}
          onClose={() => {
            setShowAddBudget(false);
            setEditingBudget(null);
          }}
          onSuccess={(budget) => {
            if (editingBudget) {
              setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
            } else {
              setBudgets(prev => [...prev, budget]);
            }
            setShowAddBudget(false);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
};



















