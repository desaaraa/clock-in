// app/dashboard/layout.tsx

import React from 'react';
import Navbar from './components/Navbar';
import estilos from './dashboard.module.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={estilos.contenedorPrincipal}>

      <Navbar />
      
      {children}

    </div>
  );
}
