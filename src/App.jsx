import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Layout from './components/Layout';
import HomePage from './Pages/Home';
import AddArticle from './Pages/AddArticle';
import About from './Pages/About';
import ArticleDetails from './components/ArticleDetails';
import ContactUs from './Pages/ContactUs';
import LoginSignup from './Pages/LoginSignup';
import ScrollToTop from './components/ScrollToTop';
import { auth } from './firebaseConfig';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ChakraProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout isAuthenticated={isAuthenticated} />}>
            <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} />} />
            <Route path="/add-article" element={<AddArticle />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<About />} />
            <Route path="/articledetails/:articleId" element={<ArticleDetails isAuthenticated={isAuthenticated} />} />
          </Route>
          <Route path="/login" element={<LoginSignup />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
};

export default App;
