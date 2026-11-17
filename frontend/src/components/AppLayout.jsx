import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import CustomerPortalModal from './CustomerPortalModal';
import CreateOrderModal from './CreateOrderModal';
import StyleGuideModal from './StyleGuideModal';
import NotificationsDrawer from './NotificationsDrawer';
import WorkflowActionModal from './WorkflowActionModal';

const AppLayout = () => {
  return (
    <div className="damaco-app-layout">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="damaco-main-viewport">
        {/* Top Navigation & Search Bar */}
        <Topbar />

        {/* Dynamic Page Outlet */}
        <main className="damaco-page-container">
          <Outlet />
        </main>
      </div>

      {/* Global Interactive Modals & Drawers */}
      <CustomerPortalModal />
      <CreateOrderModal />
      <StyleGuideModal />
      <NotificationsDrawer />
      <WorkflowActionModal />
    </div>
  );
};

export default AppLayout;
