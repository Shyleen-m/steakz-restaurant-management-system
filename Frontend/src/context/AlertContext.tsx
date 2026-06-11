import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
  id: string;
  type: AlertType;
  message: string;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const getIcon = (type: AlertType) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'error': return <AlertCircle className="text-red-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getColor = (type: AlertType) => {
    switch (type) {
      case 'success': return 'border-emerald-100 bg-white shadow-emerald-100/20';
      case 'error': return 'border-red-100 bg-white shadow-red-100/20';
      case 'warning': return 'border-amber-100 bg-white shadow-amber-100/20';
      default: return 'border-blue-100 bg-white shadow-blue-100/20';
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      
      {/* Global Alert Container */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 max-w-md w-full">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border shadow-lg animate-slide-in ${getColor(alert.type)}`}
          >
            <div className="shrink-0">{getIcon(alert.type)}</div>
            <p className="flex-1 text-sm font-bold text-text">{alert.message}</p>
            <button
              onClick={() => removeAlert(alert.id)}
              className="text-muted hover:text-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within AlertProvider');
  return context;
};
