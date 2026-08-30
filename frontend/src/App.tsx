import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { HomeRedirect } from "./components/layout/HomeRedirect";
import { LoginPage } from "./pages/Login";
import { PosPage } from "./pages/Pos";
import { DashboardPage } from "./pages/Dashboard";
import { ProductsPage } from "./pages/Products";
import { TransactionsPage } from "./pages/Transactions";
import { InventoryPage } from "./pages/Inventory";
import { CustomersPage } from "./pages/Customers";
import { ReportsPage } from "./pages/Reports";
import { MessagesPage } from "./pages/Messages";
import { SettingsPage } from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<HomeRedirect />} />
          <Route path="/pos" element={<ProtectedRoute screen="pos"><PosPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute screen="dashboard"><DashboardPage /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute screen="products"><ProductsPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute screen="transactions"><TransactionsPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute screen="inventory"><InventoryPage /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute screen="customers"><CustomersPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute screen="reports"><ReportsPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute screen="messages"><MessagesPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute screen="settings"><SettingsPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
