// components/Layout.jsx
import React, { lazy, Suspense } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Navbar from './Navigation';

const Footer = lazy(() => import('./Footer'));

const Layout = ({ isAuthenticated }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      {!isLoginPage && <Navbar isAuthenticated={isAuthenticated} />}
      <main style={{ minHeight: 'calc(100vh - 150px)' }}>
        <Outlet />
      </main>
      {!isLoginPage && (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px', height: '150px' }}>Loading Footer...</div>}>
          <Footer />
        </Suspense>
      )}
    </>
  );
};

export default Layout;
