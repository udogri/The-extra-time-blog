import React, { lazy, Suspense, useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navbar from './Navigation';
import NewsletterModal from './Newsletter';

const Footer = lazy(() => import('./Footer'));

const Layout = ({ isAuthenticated }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // NEW: newsletter modal control
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const openNewsletter = () => setIsNewsletterOpen(true);
  const closeNewsletter = () => setIsNewsletterOpen(false);

  return (
    <Box minH="100vh" display="flex" flexDirection="column">

      {!isLoginPage && (
        <Box position="fixed" top="0" left="0" width="100%" zIndex="1000">
          <Navbar 
            isAuthenticated={isAuthenticated}
            onOpenNewsletter={openNewsletter}   // << PASS THIS DOWN
          />
        </Box>
      )}

      {/* PAGE CONTENT */}
      <Box flex="1" mt={!isLoginPage ? "70px" : "0"}>
        <Outlet />
      </Box>

      {/* FOOTER */}
      {!isLoginPage && (
        <Suspense
          fallback={
            <Box textAlign="center" py="20px" height="150px">
              Loading Footer...
            </Box>
          }
        >
          <Footer />
        </Suspense>
      )}

      {/* NEWSLETTER MODAL — MUST BE RENDERED IN LAYOUT */}
      <NewsletterModal
        isOpen={isNewsletterOpen}
        onClose={closeNewsletter}
      />

    </Box>
  );
};

export default Layout;
