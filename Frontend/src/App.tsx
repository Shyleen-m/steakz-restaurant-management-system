import {
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { useEffect } from 'react';

import HomePage from './pages/public/HomePage';
import MenuPage from './pages/public/MenuPage';
import BranchSelectionPage from './pages/public/BranchSelectionPage';
import BranchPage from './pages/public/BranchPage';
import PromotionsPage from './pages/public/PromotionsPage';
import ReservationPage from './pages/public/ReservationPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AccountPage from './pages/public/AccountPage';
import CartPage from './pages/public/CartPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import KitchenPage from './pages/dashboard/KitchenPage';
import OrdersPage from './pages/dashboard/OrdersPage';
import InventoryPage from './pages/dashboard/InventoryPage';
import TablesPage from './pages/dashboard/TablesPage';
import AnalyticsPage from './pages/dashboard/AnalyticsPage';
import StaffPage from './pages/dashboard/StaffPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ReservationsDashboard from './pages/dashboard/ReservationsDashboard';
import CreateOrderPage from './pages/dashboard/CreateOrderPage';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import StaffRedirect from './components/StaffRedirect';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* ========================================= */}
        {/* PUBLIC ROUTES                             */}
        {/* ========================================= */}

        <Route
          path='/'
          element={<HomePage />}
        />

        {/* Staff are redirected to /dashboard on these three */}
        <Route
          path='/branches'
          element={
            <StaffRedirect>
              <BranchSelectionPage />
            </StaffRedirect>
          }
        />

        <Route
          path='/branches/:id'
          element={
            <StaffRedirect>
              <BranchPage />
            </StaffRedirect>
          }
        />

        <Route
  path="/menu/:branchId"
  element={<MenuPage />}
/>

        <Route
          path='/promotions'
          element={<PromotionsPage />}
        />

        <Route
          path='/reservations'
          element={<ReservationPage />}
        />

        <Route
          path='/about'
          element={<AboutPage />}
        />

        <Route
          path='/contact'
          element={<ContactPage />}
        />

        {/* ========================================= */}
        {/* AUTH ROUTES                               */}
        {/* ========================================= */}

        <Route
          path='/login'
          element={<LoginPage />}
        />

        <Route
          path='/register'
          element={<RegisterPage />}
        />

        {/* ========================================= */}
        {/* CUSTOMER ROUTES                           */}
        {/* ========================================= */}

        <Route
          path='/account'
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route
  path="/cart"
  element={<CartPage />}
/>

        {/* ========================================= */}
        {/* CREATE ORDER                              */}
        {/* ========================================= */}

        <Route
          path='/dashboard/orders/create'
          element={
            <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'WAITER']}>
              <CreateOrderPage />
            </ProtectedRoute>
          }
        />

        {/* ========================================= */}
        {/* DASHBOARD ROUTES                          */}
        {/* ========================================= */}

        <Route
          path='/dashboard'
          element={
            <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'KITCHEN_STAFF', 'WAITER', 'INVENTORY_MANAGER', 'HEADQUARTERS_MANAGER', 'ADMIN']}  >
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />

          {/* <ORDERS /> */}
          <Route
            path='orders'
            element={
              <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'WAITER','KITCHEN_STAFF']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          {/* KITCHEN — kitchen staff only */}
          <Route
            path='kitchen'
            element={
              <ProtectedRoute allowedRoles={['KITCHEN_STAFF']}>
                <KitchenPage />
              </ProtectedRoute>
            }
          />

          {/* INVENTORY */}
          <Route
            path='inventory'
            element={
              <ProtectedRoute allowedRoles={['INVENTORY_MANAGER', 'BRANCH_MANAGER']}>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          {/* TABLES */}
          <Route
            path='tables'
            element={
              <ProtectedRoute allowedRoles={['KITCHEN_STAFF', 'BRANCH_MANAGER', 'WAITER']}>
                <TablesPage />
              </ProtectedRoute>
            }
          />

          {/* ANALYTICS */}
          <Route
            path='analytics'
            element={
              <ProtectedRoute allowedRoles={['HEADQUARTERS_MANAGER', 'ADMIN']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* STAFF */}
          <Route
            path='staff'
            element={
              <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'HEADQUARTERS_MANAGER', 'ADMIN']}>
                <StaffPage />
              </ProtectedRoute>
            }
          />

          {/* RESERVATIONS */}
          <Route
            path='reservations'
            element={
              <ProtectedRoute allowedRoles={['KITCHEN_STAFF', 'BRANCH_MANAGER', 'WAITER']}>
                <ReservationsDashboard />
              </ProtectedRoute>
            }
          />

          {/* SETTINGS */}
          <Route
            path='settings'
            element={
              <ProtectedRoute allowedRoles={['BRANCH_MANAGER', 'HEADQUARTERS_MANAGER', 'ADMIN']}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* DASHBOARD FALLBACK */}
          <Route path='*' element={<DashboardPage />} />
        </Route>

        {/* ========================================= */}
        {/* GLOBAL FALLBACK                           */}
        {/* ========================================= */}

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  );
}

export default App;