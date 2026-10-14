import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { DesktopSidebar } from './components/common/DesktopSidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { InvoiceModal } from './components/common/InvoiceModal';

// Pages & Views
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { LogoutPage } from './components/auth/LogoutPage';
import { RegisterWizard } from './components/auth/RegisterWizard';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { ProfileView } from './components/dashboard/ProfileView';
import { CustomersView } from './components/dashboard/CustomersView';
import { AddCustomerView } from './components/dashboard/AddCustomerView';
import { NewRepairView } from './components/dashboard/NewRepairView';
import { RepairHistoryView } from './components/dashboard/RepairHistoryView';
import { WarrantyView } from './components/dashboard/WarrantyView';
import { WarrantyPartsUploadView } from './components/dashboard/WarrantyPartsUploadView';
import { PaymentsView } from './components/dashboard/PaymentsView';
import { PartsMarketplaceView } from './components/dashboard/PartsMarketplaceView';
import { ToolsSharingView } from './components/dashboard/ToolsSharingView';
import { TechHelpView } from './components/dashboard/TechHelpView';
import { WhatsAppHubView } from './components/dashboard/WhatsAppHubView';
import { NotificationsView } from './components/dashboard/NotificationsView';
import { ReportsView } from './components/dashboard/ReportsView';
import { AdminVerificationView } from './components/admin/AdminVerificationView';
import { QrCodeScannerView } from './components/dashboard/QrCodeScannerView';
import { InventoryView } from './components/dashboard/InventoryView';
import { EmployeesView } from './components/dashboard/EmployeesView';

const MainContent: React.FC = () => {
  const { activeTab, activeInvoiceTicket, setActiveInvoiceTicket, userRole } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Full-width non-dashboard pages
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1">
          <LandingPage />
        </main>
      </div>
    );
  }

  if (activeTab === 'login') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <LoginPage />
        </main>
      </div>
    );
  }

  if (activeTab === 'logout') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <LogoutPage />
        </main>
      </div>
    );
  }

  if (activeTab === 'register') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header onToggleSidebar={() => setIsSidebarOpen(true)} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <RegisterWizard />
        </main>
      </div>
    );
  }

  // Dashboard & Management Layout
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'qr_scanner':
        return <QrCodeScannerView />;
      case 'inventory':
        return <InventoryView />;
      case 'employees':
        return <EmployeesView />;
      case 'profile':
        return <ProfileView />;
      case 'customers':
        return <CustomersView />;
      case 'add_customer':
        return <AddCustomerView />;
      case 'new_repair':
        return <NewRepairView />;
      case 'repair_history':
        return <RepairHistoryView />;
      case 'warranty':
        return <WarrantyView />;
      case 'warranty_upload':
      case 'warranty_parts_upload':
        return <WarrantyPartsUploadView />;
      case 'payments':
        return <PaymentsView />;
      case 'parts_sharing':
        return <PartsMarketplaceView />;
      case 'tools_sharing':
        return <ToolsSharingView />;
      case 'tech_help':
        return <TechHelpView />;
      case 'whatsapp_group':
        return <WhatsAppHubView />;
      case 'notifications':
        return <NotificationsView />;
      case 'reports':
        return <ReportsView />;
      case 'admin_verify':
      case 'admin_verification':
        return <AdminVerificationView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Top Header */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar & Mobile Offcanvas */}
        <DesktopSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Scrollable Workspace Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-200">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Printable Invoice Modal */}
      {activeInvoiceTicket && (
        <InvoiceModal 
          ticket={activeInvoiceTicket} 
          onClose={() => setActiveInvoiceTicket(null)} 
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
