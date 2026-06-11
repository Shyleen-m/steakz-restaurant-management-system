import { useAuth } from "../../context/AuthContext";
import HQDashboard from "./roles/HQDashboard";
import BranchDashboard from "./roles/BranchDashboard";
import KitchenDashboard from "./roles/KitchenDashboard";
import InventoryDashboard from "./roles/InventoryDashboard";
import AdminDashboard from "./roles/AdminDashboard";
import WaiterDashboard from "./roles/WaiterDashboard";

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'HEADQUARTERS_MANAGER':
      return <HQDashboard />;
    case 'BRANCH_MANAGER':
      return <BranchDashboard />;
    case 'KITCHEN_STAFF':
      return <KitchenDashboard />;
    case 'INVENTORY_MANAGER':
      return <InventoryDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'WAITER':
  return <WaiterDashboard />;
    default:
      return (
        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-text">Dashboard Unavailable</h2>
          <p className="text-muted mt-2">Your role ({user.role}) does not have a specialized dashboard yet.</p>
        </div>
      );
  }
};

export default DashboardPage;
