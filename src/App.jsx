import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navigation';
import HomePage from './Pages/Home';
import AddArticle from './Pages/AddArticle';
import About from './Pages/About';
import ArticleDetails from './components/ArticleDetails';
import ContactUs from './Pages/ContactUs';
import LoginSignup from './Pages/LoginSignup';
import { auth } from './firebaseConfig'; // Import Firebase auth
import ScrollToTop from './components/ScrollToTop';

const Footer = lazy(() => import('./components/Footer'));

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user); // Set to true if user exists, false otherwise
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  return (
    <ChakraProvider>
      <Router>
        <ScrollToTop />
        <Navbar isAuthenticated={isAuthenticated} />
        <main style={{ minHeight: 'calc(100vh - 150px)' }}>
          <Routes>
            <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} />} />
            <Route path="/add-article" element={<AddArticle />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<About />} />
            <Route path="/articledetails/:articleId" element={<ArticleDetails isAuthenticated={isAuthenticated} />} />
            <Route path="/login" element={<LoginSignup />} />
          </Routes>
        </main>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px', height: '150px' }}>Loading Footer...</div>}>
          <Footer />
        </Suspense>
      </Router>
    </ChakraProvider>
  );
};

export default App;
